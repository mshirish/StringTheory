-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- USERS
-- =====================
CREATE TABLE IF NOT EXISTS users (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username         VARCHAR(50)  UNIQUE NOT NULL,
  email            VARCHAR(255) UNIQUE NOT NULL,
  password_hash    TEXT         NOT NULL,
  avatar_url       TEXT,
  xp               INT          NOT NULL DEFAULT 0,
  streak_count     INT          NOT NULL DEFAULT 0,
  last_activity_date TIMESTAMPTZ,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_xp       ON users(xp DESC);

-- =====================
-- COURSES
-- =====================
CREATE TYPE difficulty_level AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

CREATE TABLE IF NOT EXISTS courses (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             VARCHAR(200)     NOT NULL,
  description       TEXT,
  difficulty_level  difficulty_level NOT NULL DEFAULT 'BEGINNER',
  thumbnail_url     TEXT,
  estimated_minutes INT,
  created_at        TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_difficulty ON courses(difficulty_level);

-- =====================
-- LESSONS
-- =====================
CREATE TABLE IF NOT EXISTS lessons (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id        UUID         NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title            VARCHAR(200) NOT NULL,
  description      TEXT,
  video_url        TEXT,
  tab_url          TEXT,
  duration_seconds INT,
  xp_reward        INT          NOT NULL DEFAULT 10,
  "order"          INT          NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lessons_course_id ON lessons(course_id);
CREATE INDEX idx_lessons_order     ON lessons(course_id, "order");

-- =====================
-- USER PROGRESS
-- =====================
CREATE TABLE IF NOT EXISTS user_progress (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id    UUID        NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed    BOOLEAN     NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_progress_user_id   ON user_progress(user_id);
CREATE INDEX idx_progress_lesson_id ON user_progress(lesson_id);

-- =====================
-- ACHIEVEMENTS
-- =====================
CREATE TYPE achievement_condition AS ENUM ('MIN_XP', 'MIN_LEVEL', 'MIN_STREAK', 'LESSONS_COMPLETED');

CREATE TABLE IF NOT EXISTS achievements (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             VARCHAR(100) UNIQUE NOT NULL,
  description      TEXT         NOT NULL,
  icon_url         TEXT,
  xp_reward        INT          NOT NULL DEFAULT 0,
  condition_type   achievement_condition NOT NULL,
  condition_value  INT          NOT NULL,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =====================
-- USER ACHIEVEMENTS
-- =====================
CREATE TABLE IF NOT EXISTS user_achievements (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID        NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);

-- =====================
-- SEED: ACHIEVEMENTS
-- =====================
INSERT INTO achievements (name, description, icon_url, xp_reward, condition_type, condition_value) VALUES
  ('First Strum',       'Complete your first lesson',             NULL, 50,   'MIN_XP',      10),
  ('On Fire',           'Reach a 7-day streak',                   NULL, 100,  'MIN_STREAK',  7),
  ('Unstoppable',       'Reach a 30-day streak',                  NULL, 500,  'MIN_STREAK',  30),
  ('Level 5',           'Reach level 5',                          NULL, 200,  'MIN_LEVEL',   5),
  ('Level 10',          'Reach level 10',                         NULL, 500,  'MIN_LEVEL',   10),
  ('XP Milestone 500',  'Earn 500 total XP',                      NULL, 50,   'MIN_XP',      500),
  ('XP Milestone 1000', 'Earn 1000 total XP',                     NULL, 100,  'MIN_XP',      1000),
  ('XP Milestone 5000', 'Earn 5000 total XP — you are a shredder!', NULL, 300, 'MIN_XP',    5000)
ON CONFLICT (name) DO NOTHING;
