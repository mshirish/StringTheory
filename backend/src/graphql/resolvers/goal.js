// Goal resolver — handles setLearningGoal mutation that finalises
// the onboarding funnel and persists the user's primary learning goal.

import { query } from '../../config/database.js';
import { requireAuth } from '../../middleware/auth.js';
import { xpToLevel, xpForNextLevel } from '../../utils/gamification.js';

const fmt = (row) => ({
  ...row,
  level:               xpToLevel(row.xp),
  xpToNextLevel:       xpForNextLevel(xpToLevel(row.xp)),
  createdAt:           row.created_at,
  avatarUrl:           row.avatar_url,
  streakCount:         row.streak_count,
  lastActivityDate:    row.last_activity_date,
  skillLevel:          row.skill_level          ?? null,
  assessmentCompleted: row.assessment_completed ?? false,
  goals:               row.goals               ?? [],
  displayName:         row.display_name         ?? null,
  guitarType:          row.guitar_type          ?? null,
  motivation:          row.motivation           ?? null,
  profileCompleted:    row.profile_completed    ?? false,
  learningGoal:        row.learning_goal        ?? null,
});

export const goalResolvers = {
  Mutation: {
    setLearningGoal: async (_, { goal }, context) => {
      const authUser = requireAuth(context);
      const result = await query(
        `UPDATE users SET learning_goal = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [goal, authUser.id]
      );
      if (!result.rows[0]) throw new Error('User not found.');
      return fmt(result.rows[0]);
    },
  },
};
