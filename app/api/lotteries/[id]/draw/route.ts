/**
 * Lottery Draw API - Select Winner
 *
 * TODO: BACKEND_2 - Implement winner selection endpoint
 *
 * POST /api/lotteries/[id]/draw
 * - Manually draw winner (creator only)
 * - Calls completeLottery from lib/lottery.ts (BACKEND_3)
 * - Updates lottery status to COMPLETED
 * - Creates notifications for winner and participants
 *
 * BUSINESS RULES:
 * - Only creator can manually trigger draw
 * - Lottery must be ACTIVE
 * - Lottery must have at least 1 entry
 * - If 1 entry, that person automatically wins
 * - Otherwise, use PPS algorithm (BACKEND_3)
 *
 * See: team-guides/BACKEND_2_API_AUTH_LOTTERY.md
 */

import { NextResponse } from "next/server";

export async function POST() {
  // TODO: BACKEND_2 - Draw winner
  // 1. Check auth
  // 2. Verify caller is creator
  // 3. Verify lottery is ACTIVE
  // 4. Call completeLottery(lotteryId) from lib/lottery.ts (BACKEND_3)
  return NextResponse.json(
    { error: "Draw API not implemented - BACKEND_2 TODO" },
    { status: 501 }
  );
}
