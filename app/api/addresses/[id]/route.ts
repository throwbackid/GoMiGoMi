/**
 * Single Address API - Get, Update, Delete
 *
 * TODO: BACKEND_2 - Implement single address operations
 *
 * GET /api/addresses/[id]
 * - Get address details (owner only)
 *
 * PUT /api/addresses/[id]
 * - Update address (owner only)
 * - Validate with addressSchema.partial()
 * - Handle default address changes
 *
 * DELETE /api/addresses/[id]
 * - Delete address (owner only)
 * - Consider preventing delete if it's the only address
 *
 * See: team-guides/BACKEND_2_API_AUTH_LOTTERY.md
 */

import { NextResponse } from "next/server";

export async function GET() {
  // TODO: BACKEND_2 - Get address
  // 1. Check auth
  // 2. Verify ownership: db.address.findFirst({ where: { id, userId } })
  return NextResponse.json(
    { error: "Address API not implemented - BACKEND_2 TODO" },
    { status: 501 }
  );
}

export async function PUT() {
  // TODO: BACKEND_2 - Update address
  // 1. Check auth
  // 2. Verify ownership
  // 3. Validate body with addressSchema.partial().parse(body)
  // 4. Handle isDefault flag changes
  // 5. Update with db.address.update()
  return NextResponse.json(
    { error: "Address API not implemented - BACKEND_2 TODO" },
    { status: 501 }
  );
}

export async function DELETE() {
  // TODO: BACKEND_2 - Delete address
  // 1. Check auth
  // 2. Verify ownership
  // 3. Delete with db.address.delete()
  return NextResponse.json(
    { error: "Address API not implemented - BACKEND_2 TODO" },
    { status: 501 }
  );
}
