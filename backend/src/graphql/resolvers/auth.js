import bcrypt from 'bcryptjs';
import { query } from '../../config/database.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { xpToLevel, xpForNextLevel } from '../../utils/gamification.js';
import { updateLeaderboard } from '../../config/redis.js';

const formatUser = (row) => ({
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

export const authResolvers = {
  Mutation: {
    register: async (_, { input }) => {
      const { username, email, password } = input;

      const existing = await query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );
      if (existing.rows.length > 0) {
        throw new Error('Email or username already in use.');
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const result = await query(
        `INSERT INTO users (username, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [username, email, passwordHash]
      );

      const user = result.rows[0];
      await updateLeaderboard(user.id, user.xp);

      const payload = { id: user.id, email: user.email };
      return {
        accessToken: signAccessToken(payload),
        refreshToken: signRefreshToken(payload),
        user: formatUser(user),
      };
    },

    login: async (_, { input }) => {
      const { email, password } = input;

      const result = await query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];
      if (!user) throw new Error('Invalid email or password.');

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) throw new Error('Invalid email or password.');

      const payload = { id: user.id, email: user.email };
      return {
        accessToken: signAccessToken(payload),
        refreshToken: signRefreshToken(payload),
        user: formatUser(user),
      };
    },

    refreshToken: async (_, { token }) => {
      let decoded;
      try {
        decoded = verifyRefreshToken(token);
      } catch {
        throw new Error('Invalid or expired refresh token.');
      }

      const result = await query('SELECT * FROM users WHERE id = $1', [decoded.id]);
      const user = result.rows[0];
      if (!user) throw new Error('User not found.');

      const payload = { id: user.id, email: user.email };
      return {
        accessToken: signAccessToken(payload),
        refreshToken: signRefreshToken(payload),
        user: formatUser(user),
      };
    },
  },

  Query: {
    me: async (_, __, context) => {
      if (!context.user) return null;
      const result = await query('SELECT * FROM users WHERE id = $1', [context.user.id]);
      const user = result.rows[0];
      if (!user) return null;
      return formatUser(user);
    },
  },
};
