import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create Redis client (if env vars exist)
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Rate limit configurations
const rateLimiters = {
  // Standard API calls: 20 requests per 10 seconds
  standard: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, "10 s"),
        prefix: "ratelimit:standard",
      })
    : null,

  // Strict for resource-intensive operations: 5 per minute
  strict: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "60 s"),
        prefix: "ratelimit:strict",
      })
    : null,

  // Auth operations: 10 per minute
  auth: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "60 s"),
        prefix: "ratelimit:auth",
      })
    : null,
};

// In-memory fallback for development
const inMemoryLimits = new Map<string, { count: number; resetAt: number }>();

function checkInMemoryLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const record = inMemoryLimits.get(key);

  if (!record || now > record.resetAt) {
    inMemoryLimits.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxRequests - 1, reset: now + windowMs };
  }

  if (record.count >= maxRequests) {
    return { success: false, remaining: 0, reset: record.resetAt };
  }

  record.count++;
  return { success: true, remaining: maxRequests - record.count, reset: record.resetAt };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of inMemoryLimits.entries()) {
    if (now > record.resetAt) {
      inMemoryLimits.delete(key);
    }
  }
}, 60000);

export type RateLimitType = keyof typeof rateLimiters;

export async function rateLimit(
  identifier: string,
  type: RateLimitType = "standard"
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const limiter = rateLimiters[type];

  if (limiter) {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining,
      reset: result.reset,
    };
  }

  // Fallback to in-memory
  const limits: Record<RateLimitType, { max: number; window: number }> = {
    standard: { max: 20, window: 10000 },
    strict: { max: 5, window: 60000 },
    auth: { max: 10, window: 60000 },
  };

  const { max, window } = limits[type];
  return checkInMemoryLimit(`${type}:${identifier}`, max, window);
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

export function rateLimitResponse(reset: number) {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000);
  return Response.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
      },
    }
  );
}
