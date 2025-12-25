import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { completeLottery } from "@/lib/lottery";
import { withCronLock } from "@/lib/cron-lock";
import { cronLogger, lotteryLogger } from "@/lib/logger";
import { timingSafeEqual } from "crypto";

const CRON_SECRET = process.env.CRON_SECRET;

function verifySecret(providedSecret: string | null): boolean {
  if (!CRON_SECRET) {
    // In development without secret, allow all
    return process.env.NODE_ENV !== "production";
  }

  if (!providedSecret) return false;

  try {
    const secretBuffer = Buffer.from(CRON_SECRET);
    const providedBuffer = Buffer.from(providedSecret);

    if (secretBuffer.length !== providedBuffer.length) {
      return false;
    }

    return timingSafeEqual(secretBuffer, providedBuffer);
  } catch {
    return false;
  }
}

// GET /api/cron/complete-lotteries
export async function GET(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  const secret = authHeader?.replace("Bearer ", "");

  if (!verifySecret(secret)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  cronLogger.started("complete-lotteries");

  // Use distributed lock to prevent concurrent runs
  const lockResult = await withCronLock(
    "complete-lotteries",
    async () => {
      const now = new Date();

      // 1. Activate scheduled lotteries
      const scheduledLotteries = await db.lottery.findMany({
        where: {
          status: "SCHEDULED",
          startDate: { lte: now },
        },
      });

      const activationResults = [];
      for (const lottery of scheduledLotteries) {
        try {
          await db.lottery.update({
            where: { id: lottery.id },
            data: { status: "ACTIVE" },
          });
          lotteryLogger.activated(lottery.id, lottery.title);
          activationResults.push({ id: lottery.id, success: true });
        } catch (error) {
          activationResults.push({ id: lottery.id, success: false, error: String(error) });
        }
      }

      // 2. Complete expired lotteries
      const expiredLotteries = await db.lottery.findMany({
        where: {
          status: "ACTIVE",
          endDate: { lte: now },
        },
      });

      const completionResults = [];
      for (const lottery of expiredLotteries) {
        try {
          const result = await completeLottery(lottery.id);
          completionResults.push({
            id: lottery.id,
            success: true,
            winnerId: result.winnerId,
            skipped: result.skipped,
          });
        } catch (error) {
          completionResults.push({ id: lottery.id, success: false, error: String(error) });
        }
      }

      return {
        activated: {
          total: scheduledLotteries.length,
          successful: activationResults.filter((r) => r.success).length,
          failed: activationResults.filter((r) => !r.success).length,
        },
        completed: {
          total: expiredLotteries.length,
          successful: completionResults.filter((r) => r.success).length,
          failed: completionResults.filter((r) => !r.success).length,
        },
        results: {
          activations: activationResults,
          completions: completionResults,
        },
      };
    },
    90 // 90 second TTL (1.5x expected duration)
  );

  if (!lockResult.executed) {
    cronLogger.skipped("complete-lotteries", "Another instance is running");
    return Response.json({
      success: true,
      skipped: true,
      message: "Another instance is already processing",
    });
  }

  if (lockResult.error) {
    cronLogger.failed("complete-lotteries", lockResult.error);
    return Response.json(
      { success: false, error: lockResult.error.message },
      { status: 500 }
    );
  }

  const stats = lockResult.result!;
  cronLogger.completed("complete-lotteries", stats);

  return Response.json({
    success: true,
    message: `Activated ${stats.activated.successful}/${stats.activated.total} scheduled, completed ${stats.completed.successful}/${stats.completed.total} expired`,
    ...stats,
  });
}

// Also support POST for some cron services
export { GET as POST };
