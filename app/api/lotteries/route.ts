/**
 * Lotteries API - List & Create
 *
 * TODO: BACKEND_2 - Implement lottery CRUD
 *
 * GET /api/lotteries
 * - List active lotteries with pagination
 * - Filter by category, status
 * - Include creator info and entry count
 * - Parse query params with lotteryFilterSchema and paginationSchema
 *
 * POST /api/lotteries
 * - Create new lottery (requires auth)
 * - Validate with createLotterySchema from @/types
 * - Set initial status to DRAFT or SCHEDULED based on startDate
 * - Check user is authenticated via auth.api.getSession
 *
 * See: team-guides/BACKEND_2_API_AUTH_LOTTERY.md
 */

import { NextResponse } from "next/server";

export async function GET() {
  // TODO: BACKEND_2 - Query database with filters
  // const lotteries = await db.lottery.findMany({
  //   where: { status: { in: ["SCHEDULED", "ACTIVE"] } },
  //   include: {
  //     creator: { select: { id: true, name: true, image: true } },
  //     _count: { select: { entries: true } },
  //   },
  //   orderBy: { endDate: "asc" },
  // });
  return NextResponse.json(
    { error: "Lotteries API not implemented - BACKEND_2 TODO" },
    { status: 501 }
  );
}

export async function POST() {
  // TODO: BACKEND_2 - Create lottery
  // 1. Check auth: auth.api.getSession({ headers: await headers() })
  // 2. Validate body with createLotterySchema.parse(body)
  // 3. Create lottery with db.lottery.create()
  return NextResponse.json(
    { error: "Lotteries API not implemented - BACKEND_2 TODO" },
    { status: 501 }
  );
}
