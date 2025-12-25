import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { LotteryEditForm } from "@/components/lottery/lottery-edit-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLotteryPage({ params }: PageProps) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const lottery = await db.lottery.findUnique({
    where: { id },
    include: {
      _count: { select: { entries: true } },
    },
  });

  if (!lottery) {
    notFound();
  }

  // Only the creator can edit
  if (lottery.creatorId !== session.user.id) {
    redirect(`/lotteries/${id}`);
  }

  // Cannot edit completed or cancelled lotteries
  if (lottery.status === "COMPLETED" || lottery.status === "CANCELLED") {
    redirect(`/lotteries/${id}`);
  }

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Edit Lottery</h1>
      <LotteryEditForm lottery={lottery} categories={categories} />
    </div>
  );
}
