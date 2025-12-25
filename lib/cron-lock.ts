import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const LOCK_PREFIX = "cron-lock:";

export async function acquireCronLock(
  jobName: string,
  ttlSeconds: number = 60
): Promise<boolean> {
  if (!redis) {
    // No Redis = single instance, always acquire
    return true;
  }

  const lockKey = `${LOCK_PREFIX}${jobName}`;
  const lockValue = `${Date.now()}-${crypto.randomUUID()}`;

  // SET NX with TTL
  const result = await redis.set(lockKey, lockValue, {
    nx: true,
    ex: ttlSeconds,
  });

  return result === "OK";
}

export async function releaseCronLock(jobName: string): Promise<void> {
  if (!redis) return;

  const lockKey = `${LOCK_PREFIX}${jobName}`;
  await redis.del(lockKey);
}

export async function withCronLock<T>(
  jobName: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 60
): Promise<{ executed: boolean; result?: T; error?: Error }> {
  const acquired = await acquireCronLock(jobName, ttlSeconds);

  if (!acquired) {
    return { executed: false };
  }

  try {
    const result = await fn();
    return { executed: true, result };
  } catch (error) {
    return { executed: true, error: error as Error };
  } finally {
    await releaseCronLock(jobName);
  }
}
