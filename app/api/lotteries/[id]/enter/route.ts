import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { enterLottery, boostEntry, calculateProbabilities } from "@/lib/lottery";
import { enterLotterySchema } from "@/types";
import { createErrorResponse } from "@/lib/errors";

interface Params {
  params: { id: string };
}

// POST /api/lotteries/[id]/enter
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { points } = enterLotterySchema.parse(body);

    // Check if user already has entry (to determine enter vs boost)
    const existingEntry = await db.lotteryEntry.findUnique({
      where: {
        userId_lotteryId: {
          userId: session.user.id,
          lotteryId: params.id,
        },
      },
    });

    let entry;
    if (existingEntry) {
      // Boost existing entry
      entry = await boostEntry(params.id, session.user.id, points);
    } else {
      // New entry
      entry = await enterLottery(params.id, session.user.id, points);
    }

    // Calculate new probability
    const probabilities = await calculateProbabilities(params.id);
    const userProb = probabilities.find((p) => p.userId === session.user.id);
    const totalPoints = probabilities.reduce((sum, p) => sum + p.points, 0);

    return Response.json({
      entry,
      probability: userProb?.probability || 0,
      totalPoints,
      message: existingEntry
        ? `Added ${points} points to your entry!`
        : `Entered with ${points} points!`,
    });
  } catch (error) {
    return createErrorResponse(error, 400);
  }
}
