import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { markAllAsRead } from "@/lib/notifications";
import { createErrorResponse } from "@/lib/errors";

// POST /api/notifications/mark-all-read
export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await markAllAsRead(session.user.id);

    return Response.json({ success: true, count });
  } catch (error) {
    return createErrorResponse(error, 400);
  }
}
