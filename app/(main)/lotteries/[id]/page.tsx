import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PointBadge } from "@/components/shared/point-badge";
import { LotteryActions } from "@/components/lottery/lottery-actions";
import { formatDate, formatTimeRemaining } from "@/lib/utils";
import { Clock, Users, Trophy, Calendar } from "lucide-react";

interface PageProps {
  params: { id: string };
}

export default async function LotteryDetailPage({ params }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const lottery = await db.lottery.findUnique({
    where: { id: params.id },
    include: {
      creator: { select: { id: true, name: true, image: true } },
      winner: { select: { id: true, name: true, image: true } },
      entries: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
    },
  });

  if (!lottery) {
    notFound();
  }

  // Calculate stats
  const totalPoints = lottery.entries.reduce((sum, e) => sum + e.points, 0);
  const participantCount = lottery.entries.length;
  const isOwner = session?.user?.id === lottery.creatorId;
  const userEntry = session?.user
    ? lottery.entries.find((e) => e.userId === session.user.id)
    : null;

  // Check if user has address
  const userAddress = session?.user
    ? await db.address.findFirst({ where: { userId: session.user.id } })
    : null;

  // Calculate probabilities
  const entriesWithProbability = lottery.entries.map((entry) => ({
    ...entry,
    probability: totalPoints > 0 ? (entry.points / totalPoints) * 100 : 0,
  }));

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-xl overflow-hidden">
            <Image
              src={lottery.images[0] || "/placeholder.jpg"}
              alt={lottery.title}
              fill
              className="object-cover"
            />
            {lottery.status === "COMPLETED" && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="text-center text-white">
                  <Trophy className="h-12 w-12 mx-auto mb-2 text-amber-400" />
                  <p className="text-xl font-bold">
                    Won by {lottery.winner?.name}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {lottery.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {lottery.images.map((img, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge>{lottery.condition.replace("_", " ")}</Badge>
              <Badge variant="outline">{lottery.category}</Badge>
            </div>
            <h1 className="text-3xl font-bold">{lottery.title}</h1>
          </div>

          {/* Creator */}
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={lottery.creator.image || ""} />
              <AvatarFallback>
                {lottery.creator.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Listed by</p>
              <p className="font-medium">{lottery.creator.name}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <PointBadge points={lottery.pointsPerEntry} size="sm" />
                </div>
                <p className="text-sm text-muted-foreground">Entry Cost</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4" />
                  <span className="font-bold">{participantCount}</span>
                </div>
                <p className="text-sm text-muted-foreground">Participants</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <span className="font-bold">{totalPoints}</span>
                </div>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="font-bold">
                    {formatTimeRemaining(lottery.endDate)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Time Left</p>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <LotteryActions
            lottery={lottery}
            isOwner={isOwner}
            userEntry={userEntry}
            hasAddress={!!userAddress}
            totalPoints={totalPoints}
            userId={session?.user?.id}
          />

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{lottery.description}</p>
            </CardContent>
          </Card>

          {/* Participants */}
          {participantCount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Participants ({participantCount})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {entriesWithProbability.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={entry.user.image || ""} />
                          <AvatarFallback>
                            {entry.user.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{entry.user.name}</span>
                        {entry.userId === lottery.winnerId && (
                          <Trophy className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{entry.points} pts</p>
                        <p className="text-sm text-muted-foreground">
                          {entry.probability.toFixed(1)}% chance
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}