import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { createErrorResponse } from "@/lib/errors";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id: lotteryId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db.$transaction(
      async (tx) => {
        const lottery = await tx.lottery.findUnique({
          where: { id: lotteryId },
          include: { entries: true },
        });

        if (!lottery) {
          throw new Error("Lottery not found");
        }

        if (lottery.creatorId !== session.user.id) {
          throw new Error("Only the lottery creator can draw a winner");
        }

        if (lottery.status === "COMPLETED") {
          throw new Error("Lottery already has a winner");
        }

        if (lottery.status !== "ACTIVE") {
          throw new Error("Lottery is not active");
        }

        if (lottery.entries.length === 0) {
          throw new Error("No entries in this lottery");
        }

        const totalPoints = lottery.entries.reduce((sum, e) => sum + e.points, 0);
        const random = Math.random() * totalPoints;

        let cumulative = 0;
        let winnerId = lottery.entries[0].userId;

        for (const entry of lottery.entries) {
          cumulative += entry.points;
          if (random < cumulative) {
            winnerId = entry.userId;
            break;
          }
        }

        await tx.user.update({
          where: { id: lottery.creatorId },
          data: { points: { increment: totalPoints } },
        });

        await tx.pointTransaction.create({
          data: {
            userId: lottery.creatorId,
            amount: totalPoints,
            type: "LOTTERY_CREATED",
            description: `Lottery completed: ${lottery.title}`,
            lotteryId: lottery.id,
          },
        });

        const updated = await tx.lottery.update({
          where: { id: lotteryId },
          data: {
            status: "COMPLETED",
            winnerId,
          },
          include: {
            winner: { select: { id: true, name: true, image: true } },
          },
        });

        return { lottery: updated, totalPoints, winnerId };
      },
      {
        isolationLevel: "Serializable",
        timeout: 30000,
      }
    );

    const lottery = result.lottery;

    await db.notification.create({
      data: {
        userId: result.winnerId,
        type: "LOTTERY_WON",
        title: "Congratulations! You Won!",
        message: `You won the lottery "${lottery.title}"!`,
        data: { lotteryId: lottery.id },
      },
    }).catch(console.error);

    await db.notification.create({
      data: {
        userId: lottery.creatorId,
        type: "POINTS_EARNED",
        title: "Lottery Completed",
        message: `Your lottery "${lottery.title}" has completed. You earned ${result.totalPoints} points!`,
        data: { lotteryId: lottery.id, points: result.totalPoints },
      },
    }).catch(console.error);

    console.log(`Lottery ${lottery.id} completed. Winner: ${result.winnerId}, Points: ${result.totalPoints}`);

    return Response.json({
      success: true,
      winner: lottery.winner,
      totalPoints: result.totalPoints,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}