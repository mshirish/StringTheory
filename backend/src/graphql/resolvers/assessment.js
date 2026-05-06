import { query, getClient } from '../../config/database.js';
import { requireAuth } from '../../middleware/auth.js';

export const assessmentResolvers = {
  Query: {
    assessmentQuestions: async () => {
      const result = await query(
        'SELECT * FROM assessment_questions ORDER BY display_order ASC'
      );
      return result.rows.map(formatQuestion);
    },

    myAssessment: async (_, __, context) => {
      const user = requireAuth(context);
      const result = await query(
        `SELECT * FROM assessment_sessions WHERE user_id = $1 AND status = 'COMPLETED'`,
        [user.id]
      );
      return result.rows[0] ? formatResult(result.rows[0]) : null;
    },
  },

  Mutation: {
    submitAssessment: async (_, { responses }, context) => {
      const authUser = requireAuth(context);
      const client = await getClient();

      try {
        await client.query('BEGIN');

        const questionsResult = await client.query('SELECT * FROM assessment_questions');
        const questionsMap = new Map(questionsResult.rows.map((q) => [q.question_key, q]));

        let totalScore = 0;
        const goals = [];
        const scoredResponses = [];

        for (const response of responses) {
          const question = questionsMap.get(response.questionKey);
          if (!question) continue;

          let pointsEarned = 0;
          for (const answerKey of response.answerKeys) {
            const opt = question.options.find((o) => o.key === answerKey);
            if (opt) {
              pointsEarned += opt.points;
              if (response.questionKey === 'Q_GOALS') goals.push(answerKey);
            }
          }
          totalScore += pointsEarned;
          scoredResponses.push({ ...response, pointsEarned });
        }

        const placement =
          totalScore <= 20 ? 'BEGINNER' : totalScore <= 55 ? 'INTERMEDIATE' : 'ADVANCED';

        const sessionResult = await client.query(
          `INSERT INTO assessment_sessions (user_id, status, total_score, placement, goals, completed_at)
           VALUES ($1, 'COMPLETED', $2, $3, $4, NOW())
           ON CONFLICT (user_id) DO UPDATE SET
             status       = 'COMPLETED',
             total_score  = EXCLUDED.total_score,
             placement    = EXCLUDED.placement,
             goals        = EXCLUDED.goals,
             completed_at = NOW()
           RETURNING *`,
          [authUser.id, totalScore, placement, goals]
        );
        const session = sessionResult.rows[0];

        await client.query('DELETE FROM assessment_responses WHERE session_id = $1', [session.id]);
        for (const r of scoredResponses) {
          await client.query(
            `INSERT INTO assessment_responses (session_id, question_key, answer_keys, points_earned)
             VALUES ($1, $2, $3, $4)`,
            [session.id, r.questionKey, r.answerKeys, r.pointsEarned]
          );
        }

        await client.query(
          `UPDATE users SET skill_level = $1, assessment_completed = true, goals = $2, updated_at = NOW()
           WHERE id = $3`,
          [placement, goals, authUser.id]
        );

        await client.query('COMMIT');
        return formatResult(session);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    },

    retakeAssessment: async (_, __, context) => {
      const authUser = requireAuth(context);
      await query(
        `UPDATE users SET assessment_completed = false, skill_level = NULL, goals = '{}' WHERE id = $1`,
        [authUser.id]
      );
      return true;
    },
  },
};

const formatQuestion = (row) => ({
  key: row.question_key,
  text: row.text,
  type: row.type,
  options: row.options,
  defaultNextKey: row.default_next_key,
  displayOrder: row.display_order,
});

const placementDescriptions = {
  BEGINNER:
    "You're starting your guitar journey! We'll take you from zero to playing your first songs with structured, friendly lessons.",
  INTERMEDIATE:
    "You've got the fundamentals down. Time to expand with barre chords, scales, and more complex techniques.",
  ADVANCED:
    "You're an experienced player. We'll challenge you with advanced techniques, music theory, and help you reach mastery.",
};

const formatResult = (row) => ({
  placement: row.placement,
  score: row.total_score,
  goals: row.goals || [],
  description: placementDescriptions[row.placement] || '',
});
