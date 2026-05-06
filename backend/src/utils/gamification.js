// Level thresholds: XP needed = level * (level - 1) * 50
// Level 1: 0 XP, Level 2: 100, Level 3: 300, Level 4: 600, Level 5: 1000...
export const xpToLevel = (xp) => {
  let level = 1;
  while (xp >= level * (level - 1) * 50 + 100) {
    level++;
  }
  return level;
};

export const xpForNextLevel = (currentLevel) => currentLevel * (currentLevel - 1) * 50 + 100;

export const xpForLevel = (level) => (level <= 1 ? 0 : (level - 1) * (level - 2) * 50 + 100);

export const calculateStreakBonus = (streakCount) => {
  if (streakCount >= 30) return 1.5;
  if (streakCount >= 14) return 1.3;
  if (streakCount >= 7)  return 1.2;
  if (streakCount >= 3)  return 1.1;
  return 1.0;
};

// Returns updated streak and whether it's a new day
export const updateStreak = (lastActivityDate) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!lastActivityDate) return { streakCount: 1, reset: false };

  const last = new Date(lastActivityDate);
  const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
  const diffDays = Math.floor((today - lastDay) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { streakCount: null, reset: false }; // already active today
  if (diffDays === 1) return { streakCount: 'increment', reset: false };
  return { streakCount: 1, reset: true }; // streak broken
};
