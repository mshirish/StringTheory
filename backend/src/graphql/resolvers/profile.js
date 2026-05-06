// Profile setup resolver — handles the updateProfile mutation that completes
// a user's personalisation after the skill assessment.

import { query } from '../../config/database.js';
import { requireAuth } from '../../middleware/auth.js';
import { xpToLevel, xpForNextLevel } from '../../utils/gamification.js';

// Shared formatter — duplicated here to keep each resolver self-contained.
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
});

export const profileResolvers = {
  Mutation: {
    updateProfile: async (_, { input }, context) => {
      const authUser = requireAuth(context);
      const { displayName, avatarUrl, guitarType, motivation } = input;

      const result = await query(
        `UPDATE users SET
           display_name      = $1,
           avatar_url        = $2,
           guitar_type       = $3,
           motivation        = $4,
           profile_completed = true,
           updated_at        = NOW()
         WHERE id = $5
         RETURNING *`,
        [displayName, avatarUrl, guitarType, motivation, authUser.id]
      );

      if (!result.rows[0]) throw new Error('User not found.');
      return fmt(result.rows[0]);
    },
  },
};
