import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { addressSchema } from "@/types";
import { createErrorResponse } from "@/lib/errors";

interface Params {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const address = await db.address.findUnique({
      where: { id: params.id },
    });

    if (!address) {
      return Response.json({ error: "Address not found" }, { status: 404 });
    }

    if (address.userId !== session.user.id) {
      return Response.json({ error: "Address does not belong to you" }, { status: 403 });
    }

    return Response.json(address);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const address = await db.address.findUnique({
      where: { id: params.id },
    });

    if (!address) {
      return Response.json({ error: "Address not found" }, { status: 404 });
    }

    if (address.userId !== session.user.id) {
      return Response.json({ error: "Address does not belong to you" }, { status: 403 });
    }

    const body = await request.json();
    const data = addressSchema.partial().parse(body);

    if (data.isDefault) {
      await db.address.updateMany({
        where: { userId: session.user.id, isDefault: true, id: { not: params.id } },
        data: { isDefault: false },
      });
    }

    const updated = await db.address.update({
      where: { id: params.id },
      data,
    });

    return Response.json(updated);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const address = await db.address.findUnique({
      where: { id: params.id },
    });

    if (!address) {
      return Response.json({ error: "Address not found" }, { status: 404 });
    }

    if (address.userId !== session.user.id) {
      return Response.json({ error: "Address does not belong to you" }, { status: 403 });
    }

    await db.address.delete({ where: { id: params.id } });

    return Response.json({ success: true });
  } catch (error) {
    return createErrorResponse(error);
  }
}