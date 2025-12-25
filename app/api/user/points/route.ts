import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

// GET /api/user/points - Get current user's points balance
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { points: true },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ points: user.points });
  } catch (error) {
    console.error("Failed to fetch user points:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
