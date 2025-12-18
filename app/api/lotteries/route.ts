import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { createLotterySchema, paginationSchema, lotteryFilterSchema } from "@/types";
import { createErrorResponse } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const pagination = paginationSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    const filters = lotteryFilterSchema.parse({
      status: searchParams.get("status"),
      category: searchParams.get("category"),
      condition: searchParams.get("condition"),
      search: searchParams.get("search"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    });

    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    } else {
      where.status = "ACTIVE";
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.condition) {
      where.condition = filters.condition;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const orderBy: any = {};
    orderBy[filters.sortBy] = filters.sortOrder;

    const [lotteries, total] = await Promise.all([
      db.lottery.findMany({
        where,
        include: {
          creator: { select: { id: true, name: true, image: true } },
          winner: { select: { id: true, name: true } },
          _count: { select: { entries: true } },
        },
        orderBy,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      db.lottery.count({ where }),
    ]);

    return Response.json({
      lotteries,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createLotterySchema.parse(body);

    const startDate = new Date(data.startDate);
    const now = new Date();
    const status = startDate > now ? "SCHEDULED" : "ACTIVE";

    const lottery = await db.lottery.create({
      data: {
        title: data.title,
        description: data.description,
        images: data.images,
        condition: data.condition,
        category: data.category,
        pointsPerEntry: data.pointsPerEntry,
        maxParticipants: data.maxParticipants,
        startDate,
        endDate: new Date(data.endDate),
        status,
        creatorId: session.user.id,
      },
      include: {
        creator: { select: { id: true, name: true, image: true } },
      },
    });

    console.log(`Lottery created: ${lottery.id} by ${session.user.id}`);

    return Response.json(lottery, { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}