import pool from '../config/database.js';
import { xpToLevel } from './gamification.js';

export const awardXP = async (userId, amount) => {
  const { rows } = await pool.query(
    `UPDATE users SET xp = xp + $1 WHERE id = $2 RETURNING xp`,
    [amount, userId],
  );
  if (rows[0]) {
    const newLevel = xpToLevel(rows[0].xp);
    await pool.query(`UPDATE users SET level = $1 WHERE id = $2`, [newLevel, userId]);
  }
  return amount;
};
