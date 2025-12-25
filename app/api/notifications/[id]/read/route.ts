import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { markAsRead } from "@/lib/notifications";
import { createErrorResponse } from "@/lib/errors";

interface Params {
  params: { id: string };
}

// POST /api/notifications/[id]/read
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notification = await markAsRead(params.id, session.user.id);

    return Response.json(notification);
  } catch (error) {
    return createErrorResponse(error, 400);
  }
}
