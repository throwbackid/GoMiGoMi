/**
 * Notifications API - List
 *
 * TODO: BACKEND_3 - Implement notifications list endpoint
 *
 * GET /api/notifications - List user's notifications
 *
 * Query params:
 * - unreadOnly: boolean - Only return unread
 * - limit: number - Max to return (default 50)
 *
 * Implementation:
 * 1. Check auth
 * 2. Parse query params
 * 3. Call getNotifications() and getUnreadCount() from lib/notifications.ts
 *
 * See: team-guides/BACKEND_3_BUSINESS_LOGIC.md
 */

import { NextResponse } from "next/server";

export async function GET() {
  // TODO: BACKEND_3 - Implement notifications list
  // 1. Check auth: auth.api.getSession({ headers: await headers() })
  // 2. Parse query params (unreadOnly, limit)
  // 3. Call getNotifications() and getUnreadCount()
  return NextResponse.json(
    { error: "Notifications API not implemented - BACKEND_3 TODO" },
    { status: 501 }
  );
}
