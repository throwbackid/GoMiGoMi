import { db } from "./db";
import { PointTransactionType } from "@prisma/client";
import { pointsLogger } from "./logger";

export async function getPointBalance(userId: string): Promise<number> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { points: true },
  });
  return user?.points || 0;
}

export async function addPoints(
  userId: string,
  amount: number,
  type: PointTransactionType,
  description?: string,
  lotteryId?: string
) {
  if (amount <= 0) {
    throw new Error("Amount must be positive");
  }

  const result = await db.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { points: { increment: amount } },
    });

    const transaction = await tx.pointTransaction.create({
      data: {
        userId,
        amount,
        type,
        description,
        lotteryId,
      },
    });

    return { user, transaction };
  });

  pointsLogger.transferred(type, userId, amount, lotteryId);

  return result.transaction;
}

export async function deductPoints(
  userId: string,
  amount: number,
  type: PointTransactionType,
  description?: string,
  lotteryId?: string
) {
  if (amount <= 0) {
    throw new Error("Amount must be positive");
  }

  const result = await db.$transaction(async (tx) => {
    // Check balance inside transaction to prevent race conditions
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    if (!user || user.points < amount) {
      throw new Error("Insufficient points");
    }

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { points: { decrement: amount } },
    });

    const transaction = await tx.pointTransaction.create({
      data: {
        userId,
        amount: -amount, // Negative for deductions
        type,
        description,
        lotteryId,
      },
    });

    return { user: updatedUser, transaction };
  });

  pointsLogger.deducted(userId, amount, type, lotteryId);

  return result.transaction;
}

export async function refundLotteryParticipants(lotteryId: string): Promise<number> {
  return db.$transaction(async (tx) => {
    const entries = await tx.lotteryEntry.findMany({
      where: { lotteryId },
    });

    for (const entry of entries) {
      await tx.user.update({
        where: { id: entry.userId },
        data: { points: { increment: entry.points } },
      });

      await tx.pointTransaction.create({
        data: {
          userId: entry.userId,
          amount: entry.points,
          type: "LOTTERY_REFUND",
          lotteryId,
        },
      });

      pointsLogger.refunded(entry.userId, entry.points, lotteryId);
    }

    return entries.length;
  });
}

export async function getPointHistory(
  userId: string,
  limit: number = 20,
  offset: number = 0
) {
  return db.pointTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}

export async function createSignupBonus(userId: string) {
  return addPoints(userId, 100, "SIGNUP_BONUS", "Welcome bonus for signing up!");
}

export async function createReferralBonus(userId: string) {
  return addPoints(userId, 25, "REFERRAL_BONUS", "Referral bonus");
}
