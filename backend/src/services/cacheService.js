import redis, { setCache, getCache, invalidateCache } from '../config/redis.js';

export const get    = (key)                  => getCache(key);
export const set    = (key, value, ttl = 300) => setCache(key, value, ttl);
export const del    = (key)                  => invalidateCache(key);

export const delPattern = async (prefix) => {
  const keys = await redis.keys(`${prefix}*`);
  if (keys.length) await redis.del(...keys);
};
