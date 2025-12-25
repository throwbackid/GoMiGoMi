import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { Plus, ChevronLeft, Sparkles, Users, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-muted text-muted-foreground" },
  SCHEDULED: { label: "Scheduled", className: "bg-primary/20 text-primary" },
  ACTIVE: { label: "Active", className: "bg-teal/20 text-teal" },
  COMPLETED: { label: "Completed", className: "bg-gold/20 text-gold" },
  CANCELLED: { label: "Cancelled", className: "bg-destructive/20 text-destructive" },
};

async function getMyLotteries(userId: string) {
  return db.lottery.findMany({
    where: { creatorId: userId },
    include: {
      _count: { select: { entries: true } },
      entries: {
        select: { points: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function MyLotteriesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/my-lotteries");
  }

  const lotteries = await getMyLotteries(session.user.id);

  type Lottery = (typeof lotteries)[number];

  const activeLotteries = lotteries.filter(
    (l: Lottery) => l.status === "ACTIVE" || l.status === "SCHEDULED"
  );
  const completedLotteries = lotteries.filter((l: Lottery) => l.status === "COMPLETED");
  const cancelledLotteries = lotteries.filter((l: Lottery) => l.status === "CANCELLED");

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/30">
        <div className="container px-4 py-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="heading-display text-2xl font-bold">My Lotteries</h1>
            <p className="text-muted-foreground mt-1">
              Manage lotteries you've created
            </p>
          </div>
          <Button asChild className="btn-glow">
            <Link href="/lotteries/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Lottery
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">
              Active ({activeLotteries.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedLotteries.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({cancelledLotteries.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeLotteries.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card/50 py-12 text-center">
                <Sparkles className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-4 font-medium">No active lotteries</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a lottery to get started
                </p>
                <Button asChild className="mt-4">
                  <Link href="/lotteries/create">Create lottery</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {activeLotteries.map((lottery: Lottery) => (
                  <LotteryRow key={lottery.id} lottery={lottery} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedLotteries.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card/50 py-12 text-center">
                <Sparkles className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-4 font-medium">No completed lotteries</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {completedLotteries.map((lottery: Lottery) => (
                  <LotteryRow key={lottery.id} lottery={lottery} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {cancelledLotteries.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card/50 py-12 text-center">
                <Sparkles className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-4 font-medium">No cancelled lotteries</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {cancelledLotteries.map((lottery: Lottery) => (
                  <LotteryRow key={lottery.id} lottery={lottery} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function LotteryRow({
  lottery,
}: {
  lottery: {
    id: string;
    title: string;
    status: string;
    endDate: Date;
    pointsPerEntry: number;
    images: string[];
    _count: { entries: number };
    entries: { points: number }[];
  };
}) {
  const status = statusConfig[lottery.status] || statusConfig.ACTIVE;
  const totalPoints = lottery.entries.reduce((sum, e) => sum + e.points, 0);

  return (
    <Link
      href={`/lotteries/${lottery.id}`}
      className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
    >
      {/* Image */}
      {lottery.images[0] ? (
        <div className="relative h-16 w-16 shrink-0">
          <Image
            src={lottery.images[0]}
            alt={lottery.title}
            fill
            sizes="64px"
            className="rounded-lg object-cover"
          />
        </div>
      ) : (
        <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Sparkles className="h-6 w-6 text-muted-foreground" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium truncate">{lottery.title}</h3>
          <Badge className={status.className}>{status.label}</Badge>
        </div>
        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {lottery._count.entries} entries
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            {totalPoints} pts pool
          </span>
          {(lottery.status === "ACTIVE" || lottery.status === "SCHEDULED") && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(lottery.endDate), { addSuffix: true })}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
