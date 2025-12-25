/**
 * Single Lottery API - Get, Update, Delete
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { updateLotterySchema } from "@/types";
import { cancelLottery } from "@/lib/lottery";
import { createErrorResponse } from "@/lib/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const lottery = await db.lottery.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, image: true } },
        winner: { select: { id: true, name: true, image: true } },
        entries: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
          orderBy: { points: "desc" },
        },
        _count: { select: { entries: true } },
      },
    });

    if (!lottery) {
      return NextResponse.json({ error: "Lottery not found" }, { status: 404 });
    }

    // Calculate total points
    const totalPoints = lottery.entries.reduce((sum, e) => sum + e.points, 0);

    // Add probability to each entry
    const entriesWithProbability = lottery.entries.map((entry) => ({
      ...entry,
      probability: totalPoints > 0 ? entry.points / totalPoints : 0,
    }));

    return NextResponse.json({
      ...lottery,
      entries: entriesWithProbability,
      totalPoints,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lottery = await db.lottery.findUnique({
      where: { id },
      include: { _count: { select: { entries: true } } },
    });

    if (!lottery) {
      return NextResponse.json({ error: "Lottery not found" }, { status: 404 });
    }

    if (lottery.creatorId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized to edit this lottery" }, { status: 403 });
    }

    if (lottery.status === "COMPLETED" || lottery.status === "CANCELLED") {
      return NextResponse.json({ error: "Cannot edit a completed or cancelled lottery" }, { status: 400 });
    }

    const body = await request.json();
    const data = updateLotterySchema.parse(body);

    // If there are entries, don't allow changing pointsPerEntry
    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.images) updateData.images = data.images;
    if (data.condition) updateData.condition = data.condition;
    if (data.category) updateData.category = data.category;
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.maxParticipants !== undefined) updateData.maxParticipants = data.maxParticipants;

    // Only update pointsPerEntry if no entries exist
    if (data.pointsPerEntry !== undefined && lottery._count.entries === 0) {
      updateData.pointsPerEntry = data.pointsPerEntry;
    }

    const updated = await db.lottery.update({
      where: { id },
      data: updateData,
      include: {
        creator: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await cancelLottery(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return createErrorResponse(error);
  }
}
