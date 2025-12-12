/**
 * Addresses API - List & Create
 *
 * TODO: BACKEND_2 - Implement address management
 *
 * GET /api/addresses
 * - List user's shipping addresses (requires auth)
 * - Order by isDefault desc, createdAt desc
 *
 * POST /api/addresses
 * - Create new address (requires auth)
 * - Validate with addressSchema from @/types
 * - Handle isDefault flag (unset other defaults)
 *
 * See: team-guides/BACKEND_2_API_AUTH_LOTTERY.md
 */

import { NextResponse } from "next/server";

export async function GET() {
  // TODO: BACKEND_2 - List addresses
  // 1. Check auth: auth.api.getSession({ headers: await headers() })
  // 2. Query: db.address.findMany({ where: { userId: session.user.id } })
  return NextResponse.json(
    { error: "Addresses API not implemented - BACKEND_2 TODO" },
    { status: 501 }
  );
}

export async function POST() {
  // TODO: BACKEND_2 - Create address
  // 1. Check auth
  // 2. Validate body with addressSchema.parse(body)
  // 3. If isDefault, unset other defaults first
  // 4. Create with db.address.create()
  return NextResponse.json(
    { error: "Addresses API not implemented - BACKEND_2 TODO" },
    { status: 501 }
  );
}
