/**
 * Next.js Middleware
 *
 * TODO: BACKEND_2 - Implement route protection
 *
 * Protected routes to handle:
 * - /dashboard/* - User dashboard
 * - /lotteries/create - Create lottery
 * - /settings/* - User settings
 *
 * Auth routes (redirect to dashboard if logged in):
 * - /login
 * - /register
 *
 * See: team-guides/BACKEND_2_API_AUTH_LOTTERY.md
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Placeholder middleware - BACKEND_2 will implement with Better Auth
export function middleware(_request: NextRequest) {
  // TODO: Check session cookie and protect routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
