import { db } from "./db";
import { NotificationType, Prisma } from "@prisma/client";

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Prisma.InputJsonValue
) {
  return db.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      data: data ?? Prisma.JsonNull,
    },
  });
}

export async function getNotifications(
  userId: string,
  unreadOnly: boolean = false,
  limit: number = 50
) {
  return db.notification.findMany({
    where: {
      userId,
      ...(unreadOnly ? { read: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return db.notification.count({
    where: { userId, read: false },
  });
}

export async function markAsRead(notificationId: string, userId: string) {
  // Verify ownership
  const notification = await db.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.userId !== userId) {
    throw new Error("Notification not found");
  }

  return db.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

export async function markAllAsRead(userId: string): Promise<number> {
  const result = await db.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
  return result.count;
}

// Notification templates
export async function notifyLotteryWon(userId: string, lotteryId: string, lotteryTitle: string) {
  return createNotification(
    userId,
    "LOTTERY_WON",
    "Congratulations! You Won!",
    `You won the lottery "${lotteryTitle}"!`,
    { lotteryId }
  );
}

export async function notifyLotteryEnded(
  userId: string,
  lotteryId: string,
  lotteryTitle: string,
  won: boolean
) {
  return createNotification(
    userId,
    "LOTTERY_ENDED",
    won ? "You Won!" : "Lottery Ended",
    won
      ? `Congratulations! You won "${lotteryTitle}"!`
      : `The lottery "${lotteryTitle}" has ended. Better luck next time!`,
    { lotteryId, won }
  );
}

export async function notifyLotteryCancelled(
  userId: string,
  lotteryId: string,
  lotteryTitle: string,
  refundedPoints: number
) {
  return createNotification(
    userId,
    "LOTTERY_CANCELLED",
    "Lottery Cancelled",
    `The lottery "${lotteryTitle}" was cancelled. Your ${refundedPoints} points have been refunded.`,
    { lotteryId, refundedPoints }
  );
}

export async function notifyNewEntry(
  sellerId: string,
  lotteryId: string,
  lotteryTitle: string,
  entryCount: number
) {
  return createNotification(
    sellerId,
    "NEW_ENTRY",
    "New Entry!",
    `Someone entered your lottery "${lotteryTitle}". Total entries: ${entryCount}`,
    { lotteryId, entryCount }
  );
}

export async function notifyPointsEarned(
  userId: string,
  points: number,
  reason: string,
  lotteryId?: string
) {
  return createNotification(
    userId,
    "POINTS_EARNED",
    "Points Earned!",
    `You earned ${points} points: ${reason}`,
    { points, lotteryId }
  );
}
