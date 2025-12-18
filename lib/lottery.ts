/**
 * Lottery Business Logic
 *
 * Contains core lottery operations including winner selection,
 * entry management, and lottery lifecycle functions.
 *
 * IMPORTANT BUSINESS RULES:
 * - No minimum participants: 1 person can win
 * - Seller receives ALL points from pool (not a fixed amount)
 * - Winner selection uses Probability Proportional to Size (PPS)
 * - Users must have shipping address to enter
 */

import { db } from "./db";
import { refundLotteryParticipants } from "./points";
import { createNotification } from "./notifications";
import { lotteryLogger, pointsLogger, logger } from "./logger";
import type { Lottery, LotteryEntry } from "@prisma/client";

/**
 * Select a winner using Probability Proportional to Size (PPS)
 *
 * Each participant's chance of winning is proportional to their points.
 * Example: User with 30 points in a 100-point pool has 30% chance.
 *
 * Note: Uses < instead of <= for proper boundary handling to avoid
 * bias toward later entries in the list.
 */
export function selectWinnerFromEntries(
  entries: { userId: string; points: number }[]
): string | null {
  if (entries.length === 0) {
    return null;
  }

  // If only one entry, they automatically win
  if (entries.length === 1) {
    return entries[0].userId;
  }

  const totalPoints = entries.reduce((sum, e) => sum + e.points, 0);
  const random = Math.random() * totalPoints;

  let cumulative = 0;
  for (const entry of entries) {
    cumulative += entry.points;
    // Use < for proper interval handling: [0, entry1), [entry1, entry2), etc.
    if (random < cumulative) {
      return entry.userId;
    }
  }

  // Fallback to last entry (handles random === totalPoints edge case)
  return entries[entries.length - 1].userId;
}

/**
 * Select a winner using Probability Proportional to Size (PPS)
 * Fetches entries from database.
 *
 * @deprecated Use selectWinnerFromEntries with pre-fetched entries inside a transaction
 */
export async function selectWinner(lotteryId: string): Promise<string> {
  const entries = await db.lotteryEntry.findMany({
    where: { lotteryId },
    select: { userId: true, points: true },
  });

  const winnerId = selectWinnerFromEntries(entries);
  if (!winnerId) {
    throw new Error("No entries found for lottery");
  }
  return winnerId;
}

/**
 * Calculate win probability for each participant
 */
export async function calculateProbabilities(
  lotteryId: string
): Promise<Map<string, number>> {
  const entries = await db.lotteryEntry.findMany({
    where: { lotteryId },
    select: { userId: true, points: true },
  });

  const totalPoints = entries.reduce((sum, e) => sum + e.points, 0);
  const probabilities = new Map<string, number>();

  for (const entry of entries) {
    probabilities.set(entry.userId, totalPoints > 0 ? entry.points / totalPoints : 0);
  }

  return probabilities;
}

/**
 * Enter a lottery
 *
 * @param lotteryId - The lottery to enter
 * @param userId - The user entering
 * @param points - Points to spend
 * @returns The created entry
 */
export async function enterLottery(
  lotteryId: string,
  userId: string,
  points: number
): Promise<LotteryEntry> {
  // Get lottery with validation checks
  const lottery = await db.lottery.findUnique({
    where: { id: lotteryId },
    include: {
      _count: { select: { entries: true } },
    },
  });

  if (!lottery) {
    throw new Error("Lottery not found");
  }

  // Validate lottery status
  if (lottery.status !== "ACTIVE") {
    throw new Error("Lottery is not active");
  }

  // Check if lottery has ended
  if (new Date(lottery.endDate) < new Date()) {
    throw new Error("Lottery has ended");
  }

  // Check user is not the creator
  if (lottery.creatorId === userId) {
    throw new Error("You cannot enter your own lottery");
  }

  // Check max participants
  if (lottery.maxParticipants && lottery._count.entries >= lottery.maxParticipants) {
    throw new Error("Lottery has reached maximum participants");
  }

  // Check points >= pointsPerEntry
  if (points < lottery.pointsPerEntry) {
    throw new Error(`Minimum entry is ${lottery.pointsPerEntry} points`);
  }

  // Check user hasn't already entered
  const existingEntry = await db.lotteryEntry.findUnique({
    where: {
      userId_lotteryId: { userId, lotteryId },
    },
  });

  if (existingEntry) {
    throw new Error("You have already entered this lottery. Use boost to add more points.");
  }

  // Check user has shipping address
  const address = await db.address.findFirst({
    where: { userId },
  });

  if (!address) {
    throw new Error("You must add a shipping address before entering lotteries");
  }

  // Create entry and deduct points atomically
  // ALL balance checks must be inside transaction to prevent race conditions
  const entry = await db.$transaction(async (tx) => {
    // Check user has enough points (INSIDE transaction to prevent TOCTOU)
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    if (!user || user.points < points) {
      throw new Error("Insufficient points");
    }

    // Deduct points
    await tx.user.update({
      where: { id: userId },
      data: { points: { decrement: points } },
    });

    // Create point transaction
    await tx.pointTransaction.create({
      data: {
        userId,
        amount: -points,
        type: "LOTTERY_ENTRY",
        description: `Entered lottery: ${lottery.title}`,
        lotteryId,
      },
    });

    // Create entry
    const newEntry = await tx.lotteryEntry.create({
      data: {
        userId,
        lotteryId,
        points,
      },
    });

    return newEntry;
  });

  // Notify lottery creator (non-blocking)
  createNotification(
    lottery.creatorId,
    "NEW_ENTRY",
    "New entry in your lottery!",
    `Someone entered your lottery "${lottery.title}" with ${points} points.`,
    { lotteryId }
  ).catch((err) => logger.error({ error: String(err), lotteryId }, "Failed to send new entry notification"));

  return entry;
}

/**
 * Boost an existing entry with more points
 */
export async function boostEntry(
  lotteryId: string,
  userId: string,
  additionalPoints: number
): Promise<LotteryEntry> {
  if (additionalPoints < 1) {
    throw new Error("Must add at least 1 point");
  }

  // Get lottery
  const lottery = await db.lottery.findUnique({
    where: { id: lotteryId },
  });

  if (!lottery) {
    throw new Error("Lottery not found");
  }

  if (lottery.status !== "ACTIVE") {
    throw new Error("Lottery is not active");
  }

  if (new Date(lottery.endDate) < new Date()) {
    throw new Error("Lottery has ended");
  }

  // Get existing entry
  const existingEntry = await db.lotteryEntry.findUnique({
    where: {
      userId_lotteryId: { userId, lotteryId },
    },
  });

  if (!existingEntry) {
    throw new Error("You have not entered this lottery yet");
  }

  // Update entry and deduct points atomically
  // ALL balance checks must be inside transaction to prevent race conditions
  const entry = await db.$transaction(async (tx) => {
    // Check user has enough points (INSIDE transaction to prevent TOCTOU)
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    if (!user || user.points < additionalPoints) {
      throw new Error("Insufficient points");
    }

    // Deduct points
    await tx.user.update({
      where: { id: userId },
      data: { points: { decrement: additionalPoints } },
    });

    // Create point transaction
    await tx.pointTransaction.create({
      data: {
        userId,
        amount: -additionalPoints,
        type: "LOTTERY_BOOST",
        description: `Boosted entry in lottery: ${lottery.title}`,
        lotteryId,
      },
    });

    // Update entry
    const updatedEntry = await tx.lotteryEntry.update({
      where: { id: existingEntry.id },
      data: {
        points: { increment: additionalPoints },
      },
    });

    return updatedEntry;
  });

  return entry;
}

/**
 * Complete a lottery and transfer points to seller
 *
 * IMPORTANT: This function is ATOMIC. It uses a single database transaction
 * with Serializable isolation to prevent race conditions where:
 * - New entries are added during winner selection
 * - Multiple cron instances try to complete the same lottery
 * - Point transfers are duplicated
 *
 * The entire operation either succeeds completely or fails completely.
 */
export async function completeLottery(lotteryId: string): Promise<void> {
  // Run entire completion in a single atomic transaction
  const result = await db.$transaction(
    async (tx) => {
      // Fetch lottery with entries - this creates a snapshot in Serializable mode
      const lottery = await tx.lottery.findUnique({
        where: { id: lotteryId },
        include: {
          entries: {
            include: {
              user: { select: { id: true, name: true } },
            },
          },
        },
      });

      if (!lottery) {
        throw new Error("Lottery not found");
      }

      // Check status INSIDE transaction to prevent race conditions
      if (lottery.status === "COMPLETED") {
        // Already completed by another process - this is idempotent, not an error
        return { alreadyCompleted: true, lottery, winnerId: lottery.winnerId, totalPoints: 0 };
      }

      if (lottery.status === "CANCELLED") {
        throw new Error("Lottery was cancelled");
      }

      if (lottery.status !== "ACTIVE") {
        throw new Error(`Cannot complete lottery with status: ${lottery.status}`);
      }

      // Handle zero entries case
      if (lottery.entries.length === 0) {
        await tx.lottery.update({
          where: { id: lotteryId },
          data: { status: "COMPLETED" },
        });
        return { alreadyCompleted: false, lottery, winnerId: null, totalPoints: 0, noEntries: true };
      }

      // Select winner from the SAME entries snapshot
      const winnerId = selectWinnerFromEntries(
        lottery.entries.map((e) => ({ userId: e.userId, points: e.points }))
      );

      if (!winnerId) {
        throw new Error("Failed to select winner");
      }

      // Calculate total points from entries
      const totalPoints = lottery.entries.reduce((sum, e) => sum + e.points, 0);

      // Transfer points to seller (INSIDE same transaction)
      if (totalPoints > 0) {
        await tx.user.update({
          where: { id: lottery.creatorId },
          data: { points: { increment: totalPoints } },
        });

        await tx.pointTransaction.create({
          data: {
            userId: lottery.creatorId,
            amount: totalPoints,
            type: "LOTTERY_CREATED", // TODO: Consider renaming to LOTTERY_EARNINGS
            description: `Lottery completed: ${lottery.title}`,
            lotteryId,
          },
        });
      }

      // Update lottery status and winner (INSIDE same transaction)
      await tx.lottery.update({
        where: { id: lotteryId },
        data: {
          status: "COMPLETED",
          winnerId,
        },
      });

      return { alreadyCompleted: false, lottery, winnerId, totalPoints };
    },
    {
      // Use Serializable isolation to prevent phantom reads
      // This ensures the entries we read are the same when we update
      isolationLevel: "Serializable",
      // Longer timeout for complex transaction
      timeout: 30000,
    }
  );

  // If already completed, nothing more to do
  if (result.alreadyCompleted) {
    lotteryLogger.completed(lotteryId, result.winnerId, 0, 0);
    return;
  }

  // Log successful completion
  const { lottery, winnerId, totalPoints } = result;
  lotteryLogger.completed(lotteryId, winnerId, lottery.entries.length, totalPoints);

  if (winnerId && totalPoints > 0) {
    pointsLogger.transferred("lottery_pool", lottery.creatorId, totalPoints, lotteryId);

    // Calculate and log winner probability
    const winnerEntry = lottery.entries.find((e) => e.userId === winnerId);
    if (winnerEntry) {
      const winningProbability = totalPoints > 0 ? winnerEntry.points / totalPoints : 1;
      lotteryLogger.winnerSelected(lotteryId, winnerId, lottery.entries.length, winningProbability);
    }
  }

  // Handle zero entries - notify creator
  if (!winnerId) {
    // Send notification for zero entries (non-blocking)
    createNotification(
      lottery.creatorId,
      "LOTTERY_ENDED",
      "Your lottery ended with no entries",
      `Your lottery "${lottery.title}" has ended without any participants.`,
      { lotteryId }
    ).catch((err) => logger.error({ error: String(err), lotteryId }, "Failed to send lottery ended notification"));
    return;
  }

  // Get winner info for notifications
  const winner = lottery.entries.find((e) => e.userId === winnerId)?.user;

  // Send notifications (non-blocking, outside transaction)
  // These are fire-and-forget - lottery completion is already done
  const notificationPromises: Promise<void>[] = [];

  // Notify winner
  notificationPromises.push(
    createNotification(
      winnerId,
      "LOTTERY_WON",
      "Congratulations! You won!",
      `You won the lottery "${lottery.title}"! The seller will contact you for shipping.`,
      { lotteryId }
    ).catch((err) => logger.error({ error: String(err), lotteryId, winnerId }, "Failed to send winner notification")) as Promise<void>
  );

  // Notify seller
  notificationPromises.push(
    createNotification(
      lottery.creatorId,
      "POINTS_EARNED",
      `Your lottery ended! +${totalPoints} points`,
      `"${lottery.title}" has ended. Winner: ${winner?.name || "Unknown"}. You earned ${totalPoints} points!`,
      { lotteryId, winnerId }
    ).catch((err) => logger.error({ error: String(err), lotteryId, creatorId: lottery.creatorId }, "Failed to send seller notification")) as Promise<void>
  );

  // Notify other participants
  for (const entry of lottery.entries) {
    if (entry.userId !== winnerId) {
      notificationPromises.push(
        createNotification(
          entry.userId,
          "LOTTERY_ENDED",
          "Lottery ended",
          `The lottery "${lottery.title}" has ended. Unfortunately, you didn't win this time.`,
          { lotteryId }
        ).catch((err) => logger.error({ error: String(err), lotteryId, userId: entry.userId }, "Failed to send participant notification")) as Promise<void>
      );
    }
  }

  // Wait for all notifications (best-effort, failures logged but not thrown)
  await Promise.allSettled(notificationPromises);
}

/**
 * Cancel a lottery and refund all participants
 */
export async function cancelLottery(
  lotteryId: string,
  userId: string
): Promise<void> {
  const lottery = await db.lottery.findUnique({
    where: { id: lotteryId },
    include: {
      entries: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!lottery) {
    throw new Error("Lottery not found");
  }

  // Check user is the creator
  if (lottery.creatorId !== userId) {
    throw new Error("Only the lottery creator can cancel");
  }

  // Check lottery is not already completed
  if (lottery.status === "COMPLETED") {
    throw new Error("Cannot cancel a completed lottery");
  }

  if (lottery.status === "CANCELLED") {
    throw new Error("Lottery is already cancelled");
  }

  // Refund all participants
  if (lottery.entries.length > 0) {
    await refundLotteryParticipants(lotteryId);
  }

  // Update lottery status
  await db.lottery.update({
    where: { id: lotteryId },
    data: { status: "CANCELLED" },
  });

  // Notify all participants
  for (const entry of lottery.entries) {
    await createNotification(
      entry.userId,
      "LOTTERY_CANCELLED",
      "Lottery cancelled - Points refunded",
      `The lottery "${lottery.title}" was cancelled. Your ${entry.points} points have been refunded.`,
      { lotteryId }
    );
  }
}

/**
 * Get lottery with entry statistics
 */
export async function getLotteryWithStats(lotteryId: string) {
  const lottery = await db.lottery.findUnique({
    where: { id: lotteryId },
    include: {
      creator: {
        select: { id: true, name: true, image: true },
      },
      winner: {
        select: { id: true, name: true, image: true },
      },
      entries: {
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { points: "desc" },
      },
      _count: {
        select: { entries: true },
      },
    },
  });

  if (!lottery) {
    return null;
  }

  // Calculate total points and probabilities
  const totalPoints = lottery.entries.reduce((sum, e) => sum + e.points, 0);
  const entriesWithProbability = lottery.entries.map((entry) => ({
    ...entry,
    probability: totalPoints > 0 ? entry.points / totalPoints : 0,
  }));

  return {
    ...lottery,
    totalPoints,
    entries: entriesWithProbability,
  };
}
