import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => Math.min(times * 50, 2000),
  lazyConnect: true,
});

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err));

// Leaderboard helpers (sorted sets)
export const updateLeaderboard = (userId, xp) =>
  redis.zadd('leaderboard:global', xp, userId);

export const getLeaderboard = (limit = 10) =>
  redis.zrevrangebyscore('leaderboard:global', '+inf', '-inf', 'WITHSCORES', 'LIMIT', 0, limit);

// Cache helpers
export const setCache = (key, value, ttlSeconds = 300) =>
  redis.setex(key, ttlSeconds, JSON.stringify(value));

export const getCache = async (key) => {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

export const invalidateCache = (key) => redis.del(key);

export default redis;
