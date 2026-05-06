import { query } from '../../config/database.js';
import { getCache, setCache } from '../../config/redis.js';
import { requireAuth } from '../../middleware/auth.js';

export const courseResolvers = {
  Query: {
    courses: async (_, { difficultyLevel, limit = 20, offset = 0 }) => {
      const cacheKey = `courses:${difficultyLevel || 'all'}:${limit}:${offset}`;
      const cached = await getCache(cacheKey);
      if (cached) return cached;

      const params = [limit, offset];
      let sql = `
        SELECT c.*, COUNT(l.id) AS total_lessons
        FROM courses c
        LEFT JOIN lessons l ON l.course_id = c.id
      `;
      if (difficultyLevel) {
        sql += ` WHERE c.difficulty_level = $3`;
        params.push(difficultyLevel);
      }
      sql += ` GROUP BY c.id ORDER BY c.created_at DESC LIMIT $1 OFFSET $2`;

      const result = await query(sql, params);
      const courses = result.rows.map(formatCourse);
      await setCache(cacheKey, courses, 120);
      return courses;
    },

    course: async (_, { id }) => {
      const cacheKey = `course:${id}`;
      const cached = await getCache(cacheKey);
      if (cached) return cached;

      const result = await query(
        `SELECT c.*, COUNT(l.id) AS total_lessons
         FROM courses c
         LEFT JOIN lessons l ON l.course_id = c.id
         WHERE c.id = $1
         GROUP BY c.id`,
        [id]
      );
      if (!result.rows[0]) return null;
      const course = formatCourse(result.rows[0]);
      await setCache(cacheKey, course, 120);
      return course;
    },

    lesson: async (_, { id }) => {
      const result = await query('SELECT * FROM lessons WHERE id = $1', [id]);
      return result.rows[0] ? formatLesson(result.rows[0]) : null;
    },

    myProgress: async (_, __, context) => {
      const user = requireAuth(context);
      const result = await query(
        `SELECT up.*, l.title AS lesson_title
         FROM user_progress up
         JOIN lessons l ON l.id = up.lesson_id
         WHERE up.user_id = $1
         ORDER BY up.completed_at DESC`,
        [user.id]
      );
      return result.rows.map(formatProgress);
    },
  },

  Course: {
    lessons: async (parent) => {
      const result = await query(
        'SELECT * FROM lessons WHERE course_id = $1 ORDER BY "order" ASC',
        [parent.id]
      );
      return result.rows.map(formatLesson);
    },
  },

  UserProgress: {
    lesson: async (parent) => {
      const result = await query('SELECT * FROM lessons WHERE id = $1', [parent.lessonId]);
      return result.rows[0] ? formatLesson(result.rows[0]) : null;
    },
  },
};

const formatCourse = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  difficultyLevel: row.difficulty_level,
  thumbnailUrl: row.thumbnail_url,
  totalLessons: parseInt(row.total_lessons, 10) || 0,
  estimatedMinutes: row.estimated_minutes,
  createdAt: row.created_at,
});

const formatLesson = (row) => ({
  id: row.id,
  courseId: row.course_id,
  title: row.title,
  description: row.description,
  videoUrl: row.video_url,
  tabUrl: row.tab_url,
  durationSeconds: row.duration_seconds,
  xpReward: row.xp_reward,
  order: row.order,
});

const formatProgress = (row) => ({
  id: row.id,
  lessonId: row.lesson_id,
  completed: row.completed,
  completedAt: row.completed_at,
});
