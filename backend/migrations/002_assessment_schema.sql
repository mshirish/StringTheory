-- Extend users with placement fields
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS skill_level      difficulty_level,
  ADD COLUMN IF NOT EXISTS assessment_completed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS goals            TEXT[]  NOT NULL DEFAULT '{}';

-- Adaptive question bank
CREATE TABLE IF NOT EXISTS assessment_questions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_key     VARCHAR(50) UNIQUE NOT NULL,
  text             TEXT        NOT NULL,
  type             VARCHAR(20) NOT NULL CHECK (type IN ('SINGLE_CHOICE','MULTI_SELECT')),
  options          JSONB       NOT NULL,
  default_next_key VARCHAR(50),
  display_order    INT         NOT NULL DEFAULT 0
);

-- One session per user; upserted on retake
CREATE TABLE IF NOT EXISTS assessment_sessions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status       VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS','COMPLETED')),
  total_score  INT  NOT NULL DEFAULT 0,
  placement    difficulty_level,
  goals        TEXT[] NOT NULL DEFAULT '{}',
  started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS assessment_responses (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id    UUID        NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  question_key  VARCHAR(50) NOT NULL,
  answer_keys   TEXT[]      NOT NULL,
  points_earned INT         NOT NULL DEFAULT 0,
  answered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================
-- SEED: Question bank
-- =====================
INSERT INTO assessment_questions (question_key, text, type, options, default_next_key, display_order) VALUES

('Q1', 'How long have you been playing guitar?', 'SINGLE_CHOICE',
 '[
   {"key":"never",        "label":"Never played",       "points":0,  "nextQuestionKey":"Q_GOALS"},
   {"key":"under_1_year", "label":"Less than 1 year",   "points":10, "nextQuestionKey":"Q2A"},
   {"key":"1_to_3_years", "label":"1 to 3 years",       "points":30, "nextQuestionKey":"Q2B"},
   {"key":"over_3_years", "label":"3+ years",            "points":60, "nextQuestionKey":"Q2C"}
 ]'::jsonb, NULL, 1),

('Q2A', 'Which of these have you tried? (select all that apply)', 'MULTI_SELECT',
 '[
   {"key":"open_chords",      "label":"Basic open chords (G, C, D, Em)", "points":15, "nextQuestionKey":null},
   {"key":"basic_strumming",  "label":"Simple strumming patterns",        "points":10, "nextQuestionKey":null},
   {"key":"simple_songs",     "label":"A few simple songs",               "points":10, "nextQuestionKey":null}
 ]'::jsonb, 'Q_GOALS', 2),

('Q2B', 'Which of these can you play? (select all that apply)', 'MULTI_SELECT',
 '[
   {"key":"barre_chords",    "label":"Barre chords (F, Bm)",    "points":15, "nextQuestionKey":null},
   {"key":"pentatonic_scale","label":"Pentatonic scale",         "points":15, "nextQuestionKey":null},
   {"key":"fingerpicking",   "label":"Basic fingerpicking",      "points":10, "nextQuestionKey":null},
   {"key":"rhythm_patterns", "label":"Various rhythm patterns",  "points":10, "nextQuestionKey":null}
 ]'::jsonb, 'Q_GOALS', 3),

('Q2C', 'Which of these do you regularly use? (select all that apply)', 'MULTI_SELECT',
 '[
   {"key":"soloing",               "label":"Lead guitar / soloing",               "points":10, "nextQuestionKey":null},
   {"key":"music_theory",          "label":"Music theory understanding",           "points":10, "nextQuestionKey":null},
   {"key":"alternate_tunings",     "label":"Alternate tunings",                   "points":10, "nextQuestionKey":null},
   {"key":"improvisation",         "label":"Improvisation",                       "points":10, "nextQuestionKey":null},
   {"key":"complex_fingerpicking", "label":"Complex fingerpicking / fingerstyle", "points":10, "nextQuestionKey":null}
 ]'::jsonb, 'Q_GOALS', 4),

('Q_GOALS', 'What is your main goal with guitar?', 'SINGLE_CHOICE',
 '[
   {"key":"learn_songs",       "label":"Learn my favorite songs",      "points":0, "nextQuestionKey":null},
   {"key":"improve_technique", "label":"Improve my technique",         "points":0, "nextQuestionKey":null},
   {"key":"understand_theory", "label":"Understand music theory",      "points":0, "nextQuestionKey":null},
   {"key":"play_with_others",  "label":"Play with others / in a band", "points":0, "nextQuestionKey":null},
   {"key":"write_music",       "label":"Write my own music",           "points":0, "nextQuestionKey":null}
 ]'::jsonb, NULL, 5)

ON CONFLICT (question_key) DO NOTHING;
