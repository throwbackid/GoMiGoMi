type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  fatal: 50,
};

const MIN_LEVEL = process.env.NODE_ENV === "production" ? "info" : "debug";

interface LogContext {
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, context?: LogContext) {
  if (LOG_LEVELS[level] < LOG_LEVELS[MIN_LEVEL as LogLevel]) {
    return;
  }

  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    message,
    ...context,
  };

  if (process.env.NODE_ENV === "production") {
    // JSON format for log aggregators
    console.log(JSON.stringify(logData));
  } else {
    // Human-readable format for development
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`);
  }
}

// Specialized loggers
export const lotteryLogger = {
  created: (lotteryId: string, creatorId: string, title: string) =>
    log("info", "Lottery created", { lotteryId, creatorId, title }),

  activated: (lotteryId: string, title: string) =>
    log("info", "Lottery activated", { lotteryId, title }),

  completed: (lotteryId: string, winnerId: string, totalEntries: number, totalPoints: number) =>
    log("info", "Lottery completed", { lotteryId, winnerId, totalEntries, totalPoints }),

  cancelled: (lotteryId: string, refundedCount: number) =>
    log("info", "Lottery cancelled", { lotteryId, refundedCount }),

  entryAdded: (lotteryId: string, userId: string, points: number, isBoost: boolean) =>
    log("info", isBoost ? "Entry boosted" : "Entry added", { lotteryId, userId, points }),

  winnerSelected: (lotteryId: string, winnerId: string, totalEntries: number, probability: number) =>
    log("info", "Winner selected", { lotteryId, winnerId, totalEntries, probability }),
};

export const pointsLogger = {
  transferred: (type: string, toUserId: string, amount: number, lotteryId?: string) =>
    log("info", "Points transferred", { type, toUserId, amount, lotteryId }),

  deducted: (userId: string, amount: number, reason: string, lotteryId?: string) =>
    log("info", "Points deducted", { userId, amount, reason, lotteryId }),

  refunded: (userId: string, amount: number, lotteryId: string) =>
    log("info", "Points refunded", { userId, amount, lotteryId }),

  signupBonus: (userId: string, amount: number) =>
    log("info", "Signup bonus awarded", { userId, amount }),
};

export const cronLogger = {
  started: (jobName: string) =>
    log("info", "Cron job started", { jobName }),

  completed: (jobName: string, stats: object) =>
    log("info", "Cron job completed", { jobName, ...stats }),

  failed: (jobName: string, error: unknown) =>
    log("error", "Cron job failed", { jobName, error: String(error) }),

  skipped: (jobName: string, reason: string) =>
    log("info", "Cron job skipped", { jobName, reason }),
};

// Generic logger for ad-hoc logging
export const logger = {
  debug: (context: LogContext, message: string) => log("debug", message, context),
  info: (context: LogContext, message: string) => log("info", message, context),
  warn: (context: LogContext, message: string) => log("warn", message, context),
  error: (context: LogContext, message: string) => log("error", message, context),
  fatal: (context: LogContext, message: string) => log("fatal", message, context),
};

export const authLogger = {
  signIn: (userId: string, method: string) =>
    log("info", "User signed in", { userId, method }),

  signUp: (userId: string, method: string) =>
    log("info", "User signed up", { userId, method }),

  signOut: (userId: string) =>
    log("info", "User signed out", { userId }),

  rateLimited: (ip: string, endpoint: string) =>
    log("warn", "Rate limit exceeded", { ip, endpoint }),
};

export function logRequest(
  requestId: string,
  method: string,
  path: string,
  statusCode: number,
  durationMs: number,
  userId?: string
) {
  log("info", "Request completed", {
    requestId,
    method,
    path,
    statusCode,
    durationMs,
    userId,
  });
}

export default { log, logger, lotteryLogger, pointsLogger, cronLogger, authLogger, logRequest };
