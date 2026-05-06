import { query, getClient } from '../../config/database.js';
import { updateLeaderboard, getLeaderboard, getCache, setCache } from '../../config/redis.js';
import { requireAuth } from '../../middleware/auth.js';
import {
  xpToLevel,
  xpForNextLevel,
  calculateStreakBonus,
  updateStreak,
} from '../../utils/gamification.js';
import { getDownloadUrl } from '../../config/aws.js';
import { getUploadUrl, buildPublicUrl } from '../../config/aws.js';
import { v4 as uuidv4 } from 'uuid';

export const gamificationResolvers = {
  Mutation: {
    completeLesson: async (_, { lessonId }, context) => {
      const authUser = requireAuth(context);
      const client = await getClient();

      try {
        await client.query('BEGIN');

        // Fetch lesson
        const lessonResult = await client.query(
          'SELECT * FROM lessons WHERE id = $1',
          [lessonId]
        );
        const lesson = lessonResult.rows[0];
        if (!lesson) throw new Error('Lesson not found.');

        // Check if already completed
        const progressResult = await client.query(
          'SELECT id FROM user_progress WHERE user_id = $1 AND lesson_id = $2 AND completed = true',
          [authUser.id, lessonId]
        );
        if (progressResult.rows.length > 0) {
          throw new Error('Lesson already completed.');
        }

        // Fetch current user state
        const userResult = await client.query('SELECT * FROM users WHERE id = $1', [authUser.id]);
        const user = userResult.rows[0];

        // Calculate streak
        const streakUpdate = updateStreak(user.last_activity_date);
        let newStreakCount = user.streak_count;
        let streakBroken = false;

        if (streakUpdate.streakCount === 1) {
          newStreakCount = 1;
          streakBroken = streakUpdate.reset;
        } else if (streakUpdate.streakCount === 'increment') {
          newStreakCount = user.streak_count + 1;
        }

        // Apply streak XP bonus
        const bonus = calculateStreakBonus(newStreakCount);
        const xpEarned = Math.round(lesson.xp_reward * bonus);
        const newXp = user.xp + xpEarned;

        const oldLevel = xpToLevel(user.xp);
        const newLevel = xpToLevel(newXp);
        const leveledUp = newLevel > oldLevel;

        // Update user XP and streak
        await client.query(
          `UPDATE users
           SET xp = $1, streak_count = $2, last_activity_date = NOW(), updated_at = NOW()
           WHERE id = $3`,
          [newXp, newStreakCount, authUser.id]
        );

        // Mark lesson complete
        await client.query(
          `INSERT INTO user_progress (user_id, lesson_id, completed, completed_at)
           VALUES ($1, $2, true, NOW())
           ON CONFLICT (user_id, lesson_id) DO UPDATE SET completed = true, completed_at = NOW()`,
          [authUser.id, lessonId]
        );

        // Check and award achievements
        const newAchievements = await checkAchievements(client, authUser.id, {
          newXp,
          newLevel,
          newStreakCount,
        });

        await client.query('COMMIT');

        // Update leaderboard in Redis
        await updateLeaderboard(authUser.id, newXp);

        return {
          xpEarned,
          totalXp: newXp,
          newLevel: leveledUp ? newLevel : null,
          leveledUp,
          newAchievements,
          streakCount: newStreakCount,
          streakBroken,
        };
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    },

    getUploadUrl: async (_, { filename, contentType }, context) => {
      requireAuth(context);
      const ext = filename.split('.').pop();
      const key = `uploads/${uuidv4()}.${ext}`;
      const uploadUrl = await getUploadUrl(key, contentType);
      return {
        uploadUrl,
        key,
        publicUrl: buildPublicUrl(key),
      };
    },
  },

  Query: {
    leaderboard: async (_, { limit = 10 }) => {
      const cacheKey = `leaderboard:${limit}`;
      const cached = await getCache(cacheKey);
      if (cached) return cached;

      const raw = await getLeaderboard(limit);
      // raw = [userId, score, userId, score, ...]
      const entries = [];
      for (let i = 0; i < raw.length; i += 2) {
        const userId = raw[i];
        const xp = parseInt(raw[i + 1], 10);
        const userResult = await query(
          'SELECT id, username, avatar_url FROM users WHERE id = $1',
          [userId]
        );
        const u = userResult.rows[0];
        if (u) {
          entries.push({
            rank: entries.length + 1,
            userId: u.id,
            username: u.username,
            avatarUrl: u.avatar_url,
            xp,
            level: xpToLevel(xp),
          });
        }
      }

      await setCache(cacheKey, entries, 30);
      return entries;
    },
  },
};

async function checkAchievements(client, userId, { newXp, newLevel, newStreakCount }) {
  const allAchievements = await client.query('SELECT * FROM achievements');
  const earned = await client.query(
    'SELECT achievement_id FROM user_achievements WHERE user_id = $1',
    [userId]
  );
  const earnedIds = new Set(earned.rows.map((r) => r.achievement_id));

  const newlyEarned = [];

  for (const achievement of allAchievements.rows) {
    if (earnedIds.has(achievement.id)) continue;

    const condition = achievement.condition_type;
    let qualifies = false;

    if (condition === 'MIN_XP' && newXp >= achievement.condition_value) qualifies = true;
    if (condition === 'MIN_LEVEL' && newLevel >= achievement.condition_value) qualifies = true;
    if (condition === 'MIN_STREAK' && newStreakCount >= achievement.condition_value) qualifies = true;

    if (qualifies) {
      await client.query(
        'INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2)',
        [userId, achievement.id]
      );
      // Award bonus XP
      await client.query(
        'UPDATE users SET xp = xp + $1 WHERE id = $2',
        [achievement.xp_reward, userId]
      );
      newlyEarned.push({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        iconUrl: achievement.icon_url,
        xpReward: achievement.xp_reward,
        earnedAt: new Date().toISOString(),
      });
    }
  }

  return newlyEarned;
}
