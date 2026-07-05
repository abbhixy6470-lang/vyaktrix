import Redis from 'ioredis';
import { config } from '../config';

let redis: Redis | null = null;

const getRedis = (): Redis => {
  if (!redis) {
    redis = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
  }
  return redis;
};

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  const client = getRedis();
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
};

export const cacheSet = async (key: string, value: any, ttl = 300): Promise<void> => {
  const client = getRedis();
  await client.set(key, JSON.stringify(value), 'EX', ttl);
};

export const cacheDel = async (key: string): Promise<void> => {
  const client = getRedis();
  await client.del(key);
};

export const cacheKeys = async (pattern: string): Promise<string[]> => {
  const client = getRedis();
  return client.keys(pattern);
};

export default getRedis;
