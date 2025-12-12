/**
 * Lottery Business Logic
 *
 * TODO: BACKEND_3 - Implement core lottery operations
 *
 * IMPORTANT BUSINESS RULES:
 * - No minimum participants: 1 person can win
 * - Seller receives ALL points from pool (not a fixed amount)
 * - Winner selection uses Probability Proportional to Size (PPS)
 * - Users must have shipping address to enter
 *
 * See: team-guides/BACKEND_3_BUSINESS_LOGIC.md
 */

import type { LotteryEntry } from "@prisma/client";

/**
 * Select a winner using Probability Proportional to Size (PPS)
 *
 * Each participant's chance of winning is proportional to their points.
 * Example: User with 30 points in a 100-point pool has 30% chance.
 *
 * TODO: BACKEND_3 - Implement winner selection
 * 1. Get all entries for the lottery
 * 2. Calculate total points
 * 3. Generate random number between 0 and totalPoints
 * 4. Iterate through entries, accumulating points
 * 5. Return userId when cumulative exceeds random number
 *
 * @param lotteryId - The lottery to select a winner for
 * @returns The winning user's ID
 */
export async function selectWinner(_lotteryId: string): Promise<string> {
  throw new Error("selectWinner not implemented - BACKEND_3 TODO");
}

/**
 * Calculate win probability for each participant
 *
 * TODO: BACKEND_3 - Implement probability calculation
 *
 * @param lotteryId - The lottery to calculate probabilities for
 * @returns Map of userId to probability (0-1)
 */
export async function calculateProbabilities(
  _lotteryId: string
): Promise<Map<string, number>> {
  throw new Error("calculateProbabilities not implemented - BACKEND_3 TODO");
}

/**
 * Enter a lottery
 *
 * TODO: BACKEND_3 - Implement entry logic
 * 1. Check lottery is ACTIVE
 * 2. Check user has enough points
 * 3. Check user has shipping address
 * 4. Check user is not the creator
 * 5. Check points >= pointsPerEntry
 * 6. Create entry and deduct points (in transaction)
 * 7. Notify seller of new entry
 *
 * @param lotteryId - The lottery to enter
 * @param userId - The user entering
 * @param points - Points to spend
 * @returns The created entry
 */
export async function enterLottery(
  _lotteryId: string,
  _userId: string,
  _points: number
): Promise<LotteryEntry> {
  throw new Error("enterLottery not implemented - BACKEND_3 TODO");
}

/**
 * Boost an existing entry with more points
 *
 * TODO: BACKEND_3 - Implement boost logic
 * 1. Check lottery is ACTIVE
 * 2. Check user has existing entry
 * 3. Check user has enough points
 * 4. Update entry and deduct points (in transaction)
 *
 * @param lotteryId - The lottery
 * @param userId - The user boosting
 * @param additionalPoints - Points to add
 * @returns The updated entry
 */
export async function boostEntry(
  _lotteryId: string,
  _userId: string,
  _additionalPoints: number
): Promise<LotteryEntry> {
  throw new Error("boostEntry not implemented - BACKEND_3 TODO");
}

/**
 * Complete a lottery and transfer points to seller
 *
 * TODO: BACKEND_3 - Implement completion logic
 * 1. Select winner using PPS
 * 2. Update lottery status to COMPLETED
 * 3. Set winnerId on lottery
 * 4. Transfer ALL points to seller (use points.ts)
 * 5. Create notifications for winner and participants
 *
 * @param lotteryId - The lottery to complete
 */
export async function completeLottery(_lotteryId: string): Promise<void> {
  throw new Error("completeLottery not implemented - BACKEND_3 TODO");
}

/**
 * Cancel a lottery and refund all participants
 *
 * TODO: BACKEND_3 - Implement cancellation logic
 * 1. Check user is the creator
 * 2. Check lottery is not already COMPLETED
 * 3. Refund all participants (use points.ts)
 * 4. Update lottery status to CANCELLED
 * 5. Create notifications for all participants
 *
 * @param lotteryId - The lottery to cancel
 * @param userId - The user cancelling (must be creator)
 */
export async function cancelLottery(
  _lotteryId: string,
  _userId: string
): Promise<void> {
  throw new Error("cancelLottery not implemented - BACKEND_3 TODO");
}

/**
 * Get lottery with entry statistics
 *
 * TODO: BACKEND_3 - Implement
 * Returns lottery with:
 * - Total entries
 * - Total points in pool
 * - Each participant's probability
 *
 * @param lotteryId - The lottery ID
 */
export async function getLotteryWithStats(_lotteryId: string) {
  throw new Error("getLotteryWithStats not implemented - BACKEND_3 TODO");
}
