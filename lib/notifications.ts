/**
 * Notifications System
 *
 * TODO: BACKEND_3 - Implement notification operations
 *
 * NOTIFICATION TYPES:
 * - LOTTERY_WON: You won a lottery!
 * - LOTTERY_ENDED: A lottery you entered has ended
 * - LOTTERY_CANCELLED: Lottery cancelled, points refunded
 * - NEW_ENTRY: Someone entered your lottery
 * - POINTS_EARNED: You earned points
 *
 * See: team-guides/BACKEND_3_BUSINESS_LOGIC.md
 */

import { Prisma } from "@prisma/client";
import type { Notification, NotificationType } from "@prisma/client";

/**
 * Create a notification for a user
 *
 * TODO: BACKEND_3 - Implement
 *
 * @param userId - The user to notify
 * @param type - Notification type
 * @param title - Notification title
 * @param message - Notification message
 * @param data - Optional extra data (JSON)
 */
export async function createNotification(
  _userId: string,
  _type: NotificationType,
  _title: string,
  _message: string,
  _data?: Prisma.InputJsonValue
): Promise<Notification> {
  throw new Error("createNotification not implemented - BACKEND_3 TODO");
}

/**
 * Get all notifications for a user
 *
 * TODO: BACKEND_3 - Implement
 *
 * @param userId - The user's ID
 * @param unreadOnly - Only return unread notifications
 * @param limit - Max notifications to return
 */
export async function getNotifications(
  _userId: string,
  _unreadOnly?: boolean,
  _limit?: number
): Promise<Notification[]> {
  throw new Error("getNotifications not implemented - BACKEND_3 TODO");
}

/**
 * Get unread notification count for a user
 *
 * TODO: BACKEND_3 - Implement
 *
 * @param userId - The user's ID
 */
export async function getUnreadCount(_userId: string): Promise<number> {
  throw new Error("getUnreadCount not implemented - BACKEND_3 TODO");
}

/**
 * Mark a notification as read
 *
 * TODO: BACKEND_3 - Implement
 *
 * @param notificationId - The notification ID
 * @param userId - The user's ID (for authorization)
 */
export async function markAsRead(
  _notificationId: string,
  _userId: string
): Promise<Notification> {
  throw new Error("markAsRead not implemented - BACKEND_3 TODO");
}

/**
 * Mark all notifications as read for a user
 *
 * TODO: BACKEND_3 - Implement
 *
 * @param userId - The user's ID
 */
export async function markAllAsRead(_userId: string): Promise<number> {
  throw new Error("markAllAsRead not implemented - BACKEND_3 TODO");
}

// ============================================
// Notification Templates (use these helpers)
// ============================================

/**
 * Notify user they won a lottery
 *
 * TODO: BACKEND_3 - Implement using createNotification
 */
export async function notifyLotteryWon(
  _userId: string,
  _lotteryId: string,
  _lotteryTitle: string
): Promise<void> {
  throw new Error("notifyLotteryWon not implemented - BACKEND_3 TODO");
}

/**
 * Notify user a lottery they entered has ended
 *
 * TODO: BACKEND_3 - Implement using createNotification
 */
export async function notifyLotteryEnded(
  _userId: string,
  _lotteryId: string,
  _lotteryTitle: string,
  _won: boolean
): Promise<void> {
  throw new Error("notifyLotteryEnded not implemented - BACKEND_3 TODO");
}

/**
 * Notify user a lottery was cancelled and points refunded
 *
 * TODO: BACKEND_3 - Implement using createNotification
 */
export async function notifyLotteryCancelled(
  _userId: string,
  _lotteryId: string,
  _lotteryTitle: string,
  _refundedPoints: number
): Promise<void> {
  throw new Error("notifyLotteryCancelled not implemented - BACKEND_3 TODO");
}

/**
 * Notify seller someone entered their lottery
 *
 * TODO: BACKEND_3 - Implement using createNotification
 */
export async function notifyNewEntry(
  _sellerId: string,
  _lotteryId: string,
  _lotteryTitle: string,
  _entryCount: number
): Promise<void> {
  throw new Error("notifyNewEntry not implemented - BACKEND_3 TODO");
}

/**
 * Notify seller they received points from lottery
 *
 * TODO: BACKEND_3 - Implement using createNotification
 */
export async function notifyPointsEarned(
  _userId: string,
  _points: number,
  _reason: string,
  _lotteryId?: string
): Promise<void> {
  throw new Error("notifyPointsEarned not implemented - BACKEND_3 TODO");
}
