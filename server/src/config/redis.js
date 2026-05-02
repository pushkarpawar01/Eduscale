import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

let client = null;
let redisDisabled = false;  // Permanently disabled after repeated failures
let failCount = 0;
const MAX_FAILS = 3;

const getRedisClient = () => {
  if (redisDisabled) return null;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl || redisUrl.trim() === '') return null;

  if (!client) {
    client = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,      // Fail fast — don't retry per command
      connectTimeout: 3000,         // 3s connection timeout
      commandTimeout: 2000,         // 2s per command
      lazyConnect: false,
      retryStrategy: (times) => {
        if (times >= MAX_FAILS) {
          console.warn('[Redis] Max connection attempts reached. Disabling Redis for this session.');
          redisDisabled = true;
          client = null;
          return null; // Stop retrying
        }
        return Math.min(times * 500, 2000); // Backoff: 500ms, 1000ms, 2000ms
      },
    });

    client.on('connect', () => {
      failCount = 0;
      console.log('[Redis] ✅ Connected successfully.');
    });

    client.on('error', (err) => {
      failCount++;
      // Only log first error, not every retry flood
      if (failCount === 1) {
        console.warn(`[Redis] ⚠️  Cannot connect: ${err.message}`);
        console.warn('[Redis] Caching is disabled. App continues without Redis.');
      }
      if (failCount >= MAX_FAILS) {
        redisDisabled = true;
        client = null;
      }
    });
  }

  return client;
};

// --- Cache Helpers (all fail silently if Redis is down) ---

export const cacheGet = async (key) => {
  try {
    const redis = getRedisClient();
    if (!redis) return null;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const cacheSet = async (key, value, ttlSeconds = 300) => {
  try {
    const redis = getRedisClient();
    if (!redis) return;
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // Silently skip — app works fine without caching
  }
};

export const cacheDel = async (...keys) => {
  try {
    const redis = getRedisClient();
    if (!redis) return;
    await redis.del(...keys);
  } catch {
    // Silently skip
  }
};

export const cacheDelPattern = async (pattern) => {
  try {
    const redis = getRedisClient();
    if (!redis) return;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  } catch {
    // Silently skip
  }
};

// Token blacklist helpers
export const blacklistToken = async (jti, ttlSeconds) => {
  try {
    const redis = getRedisClient();
    if (!redis) return;
    await redis.setex(`bl:${jti}`, ttlSeconds, '1');
  } catch {
    // Silently skip — token will naturally expire via JWT expiry time
  }
};

export const isTokenBlacklisted = async (jti) => {
  try {
    const redis = getRedisClient();
    if (!redis) return false; // If Redis is down, allow the request (fail open)
    const result = await redis.get(`bl:${jti}`);
    return result === '1';
  } catch {
    return false; // Always fail open on Redis errors — never block a valid user
  }
};

export default getRedisClient;
