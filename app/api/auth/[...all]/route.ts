/**
 * Better Auth API Route Handler
 *
 * TODO: BACKEND_2 - Implement auth endpoints
 *
 * This catch-all route handles all Better Auth endpoints:
 * - POST /api/auth/sign-in/email
 * - POST /api/auth/sign-up/email
 * - POST /api/auth/sign-in/social
 * - POST /api/auth/sign-out
 * - GET /api/auth/session
 *
 * Implementation:
 * - Import auth from @/lib/auth
 * - Use toNextJsHandler from better-auth/next-js
 * - Export { GET, POST } = toNextJsHandler(auth)
 *
 * See: team-guides/BACKEND_2_API_AUTH_LOTTERY.md
 */

import { NextResponse } from "next/server";

// Placeholder - BACKEND_2 will implement with auth.handler
export async function GET() {
  return NextResponse.json(
    { error: "Auth not implemented - BACKEND_2 TODO" },
    { status: 501 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "Auth not implemented - BACKEND_2 TODO" },
    { status: 501 }
  );
}
