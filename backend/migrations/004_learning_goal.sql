-- Learning goal chosen during onboarding step 3
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS learning_goal VARCHAR(20)
    CHECK (learning_goal IN ('SONGS','TECHNIQUE','THEORY','SOCIAL'));
