/**
 * Lottery Entry API - Enter or Boost
 *
 * TODO: BACKEND_3 - Implement entry/boost endpoint
 *
 * POST /api/lotteries/[id]/enter - Enter lottery or boost existing entry
 *
 * BUSINESS RULES:
 * - User must have a shipping address
 * - User cannot enter their own lottery
 * - Points must be >= lottery's pointsPerEntry
 * - User must have sufficient point balance
 * - If user already has entry, this boosts it
 *
 * Implementation:
 * 1. Check auth
 * 2. Check if user already has entry
 * 3. If existing: validate with boostEntrySchema, call boostEntry()
 * 4. If new: validate with enterLotterySchema, call enterLottery()
 *
 * See: team-guides/BACKEND_3_BUSINESS_LOGIC.md
 */

import { NextResponse } from "next/server";

export async function POST() {
  // TODO: BACKEND_3 - Implement entry/boost logic
  // 1. Check auth: auth.api.getSession({ headers: await headers() })
  // 2. Check existing entry: db.lotteryEntry.findUnique()
  // 3. If existing: boostEntry() from lib/lottery.ts
  // 4. If new: enterLottery() from lib/lottery.ts
  return NextResponse.json(
    { error: "Entry API not implemented - BACKEND_3 TODO" },
    { status: 501 }
  );
}
