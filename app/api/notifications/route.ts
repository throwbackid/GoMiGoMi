import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getNotifications, getUnreadCount } from "@/lib/notifications";
import { createErrorResponse } from "@/lib/errors";

// GET /api/notifications
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [notifications, unreadCount] = await Promise.all([
      getNotifications(session.user.id, false, 50),
      getUnreadCount(session.user.id),
    ]);

    return Response.json({ notifications, unreadCount });
  } catch (error) {
    return createErrorResponse(error);
  }
}
