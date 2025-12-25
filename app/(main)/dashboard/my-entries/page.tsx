import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Ticket, Trophy, Clock, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function getMyEntries(userId: string) {
  return db.lotteryEntry.findMany({
    where: { userId },
    include: {
      lottery: {
        include: {
          winner: { select: { id: true, name: true } },
          entries: { select: { points: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function MyEntriesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/my-entries");
  }

  const entries = await getMyEntries(session.user.id);

  type Entry = (typeof entries)[number];

  // Categorize entries
  const activeEntries = entries.filter(
    (e: Entry) => e.lottery.status === "ACTIVE" || e.lottery.status === "SCHEDULED"
  );
  const wonEntries = entries.filter(
    (e: Entry) => e.lottery.winnerId === session.user.id
  );
  const lostEntries = entries.filter(
    (e: Entry) =>
      e.lottery.status === "COMPLETED" &&
      e.lottery.winnerId !== session.user.id
  );

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
            <h1 className="heading-display text-2xl font-bold">My Entries</h1>
            <p className="text-muted-foreground mt-1">
              Track all lotteries you've entered
            </p>
          </div>
          <Button asChild>
            <Link href="/lotteries">Browse lotteries</Link>
          </Button>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">
              Active ({activeEntries.length})
            </TabsTrigger>
            <TabsTrigger value="won">
              Won ({wonEntries.length})
            </TabsTrigger>
            <TabsTrigger value="lost">
              Ended ({lostEntries.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeEntries.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card/50 py-12 text-center">
                <Ticket className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-4 font-medium">No active entries</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter a lottery for a chance to win
                </p>
                <Button asChild className="mt-4">
                  <Link href="/lotteries">Browse lotteries</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {activeEntries.map((entry: Entry) => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    userId={session.user.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="won" className="space-y-4">
            {wonEntries.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card/50 py-12 text-center">
                <Trophy className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-4 font-medium">No wins yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Keep entering lotteries to increase your chances
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {wonEntries.map((entry: Entry) => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    userId={session.user.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="lost" className="space-y-4">
            {lostEntries.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card/50 py-12 text-center">
                <Ticket className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-4 font-medium">No ended entries</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {lostEntries.map((entry: Entry) => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    userId={session.user.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EntryRow({
  entry,
  userId,
}: {
  entry: {
    id: string;
    points: number;
    lottery: {
      id: string;
      title: string;
      status: string;
      endDate: Date;
      images: string[];
      winnerId: string | null;
      winner: { id: string; name: string | null } | null;
      entries: { points: number }[];
    };
  };
  userId: string;
}) {
  const totalPoints = entry.lottery.entries.reduce((sum, e) => sum + e.points, 0);
  const probability = totalPoints > 0 ? (entry.points / totalPoints) * 100 : 0;
  const isWinner = entry.lottery.winnerId === userId;
  const isEnded = entry.lottery.status === "COMPLETED" || entry.lottery.status === "CANCELLED";

  return (
    <Link
      href={`/lotteries/${entry.lottery.id}`}
      className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
    >
      {/* Image */}
      {entry.lottery.images[0] ? (
        <div className="relative h-16 w-16 shrink-0">
          <Image
            src={entry.lottery.images[0]}
            alt={entry.lottery.title}
            fill
            sizes="64px"
            className="rounded-lg object-cover"
          />
        </div>
      ) : (
        <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-muted-foreground" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium truncate">{entry.lottery.title}</h3>
          {isWinner && (
            <Badge className="bg-gold text-gold-foreground">
              <Trophy className="mr-1 h-3 w-3" />
              Won
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-gold" />
            {entry.points} pts
          </span>
          <span className="text-teal">
            {probability.toFixed(1)}% chance
          </span>
          {!isEnded && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(entry.lottery.endDate), { addSuffix: true })}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
