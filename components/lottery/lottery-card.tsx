"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PointBadge } from "@/components/shared/point-badge";
import { formatTimeRemaining } from "@/lib/utils";
import { Clock, Users, Trophy } from "lucide-react";

interface LotteryCardProps {
  lottery: {
    id: string;
    title: string;
    images: string[];
    condition: string;
    status: string;
    pointsPerEntry: number;
    endDate: string;
    startDate: string;
    creator: {
      name: string;
      image?: string;
    };
    _count?: {
      entries: number;
    };
    winner?: {
      name: string;
    };
  };
}

const conditionColors = {
  NEW: "bg-green-500",
  LIKE_NEW: "bg-emerald-500",
  GOOD: "bg-blue-500",
  FAIR: "bg-amber-500",
  POOR: "bg-red-500",
};

export function LotteryCard({ lottery }: LotteryCardProps) {
  const isEnded = lottery.status === "COMPLETED" || lottery.status === "CANCELLED";
  const isScheduled = lottery.status === "SCHEDULED";
  const entryCount = lottery._count?.entries || 0;

  return (
    <Link href={`/lotteries/${lottery.id}`}>
      <div className="group relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg hover:border-primary/50">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={lottery.images[0] || "/placeholder.jpg"}
            alt={lottery.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />

          {/* Condition Badge */}
          <Badge
            className={`absolute top-2 left-2 ${conditionColors[lottery.condition as keyof typeof conditionColors]}`}
          >
            {lottery.condition.replace("_", " ")}
          </Badge>

          {/* Status Overlay */}
          {isEnded && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="text-center text-white">
                <Trophy className="h-8 w-8 mx-auto mb-2" />
                <p className="font-semibold">
                  {lottery.winner ? `Won by ${lottery.winner.name}` : "Ended"}
                </p>
              </div>
            </div>
          )}

          {isScheduled && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Coming Soon
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold line-clamp-1 mb-2">{lottery.title}</h3>

          <div className="flex items-center justify-between mb-3">
            <PointBadge points={lottery.pointsPerEntry} size="sm" />

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{entryCount}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* Creator */}
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={lottery.creator.image} />
                <AvatarFallback>
                  {lottery.creator.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground truncate max-w-[100px]">
                {lottery.creator.name}
              </span>
            </div>

            {/* Time Remaining */}
            {!isEnded && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatTimeRemaining(lottery.endDate)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}