/**
 * Single Lottery API - Get, Update, Delete
 *
 * TODO: BACKEND_2 - Implement single lottery operations
 *
 * GET /api/lotteries/[id]
 * - Get lottery details with entries and creator
 * - Calculate total points in pool
 * - Include entry stats and probabilities
 *
 * PUT /api/lotteries/[id]
 * - Update lottery (creator only, DRAFT status only)
 * - Validate with updateLotterySchema
 *
 * DELETE /api/lotteries/[id]
 * - Cancel lottery (creator only)
 * - Refund all entries (calls BACKEND_3 refund logic)
 *
 * See: team-guides/BACKEND_2_API_AUTH_LOTTERY.md
 */

import { NextResponse } from "next/server";

export async function GET() {
  // TODO: BACKEND_2 - Fetch lottery with entries
  // const lottery = await db.lottery.findUnique({
  //   where: { id },
  //   include: {
  //     creator: { select: { id: true, name: true, image: true } },
  //     entries: { include: { user: { select: { id: true, name: true, image: true } } } },
  //   },
  // });
  return NextResponse.json(
    { error: "Lottery API not implemented - BACKEND_2 TODO" },
    { status: 501 }
  );
}

export async function PUT() {
  // TODO: BACKEND_2 - Update lottery
  // 1. Check auth
  // 2. Verify caller is creator
  // 3. Verify lottery is DRAFT
  // 4. Validate body with updateLotterySchema
  // 5. Update with db.lottery.update()
  return NextResponse.json(
    { error: "Lottery API not implemented - BACKEND_2 TODO" },
    { status: 501 }
  );
}

export async function DELETE() {
  // TODO: BACKEND_2 - Cancel lottery with refunds
  // 1. Check auth
  // 2. Verify caller is creator
  // 3. Call cancelLottery from lib/lottery.ts (BACKEND_3)
  return NextResponse.json(
    { error: "Lottery API not implemented - BACKEND_2 TODO" },
    { status: 501 }
  );
}
