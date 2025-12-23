"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, Users, Sparkles, Trophy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PointBadge } from "@/components/shared/point-badge";
import type { Lottery, User } from "@/types";

// Condition labels and colors
const conditionConfig: Record<string, { label: string; className: string }> = {
  NEW: { label: "New", className: "bg-teal/20 text-teal border-teal/30" },
  LIKE_NEW: { label: "Like New", className: "bg-teal/15 text-teal border-teal/20" },
  GOOD: { label: "Good", className: "bg-gold/20 text-gold border-gold/30" },
  FAIR: { label: "Fair", className: "bg-coral/20 text-coral border-coral/30" },
  POOR: { label: "Poor", className: "bg-muted text-muted-foreground border-border" },
};

interface LotteryCardProps {
  lottery: Lottery & {
    creator: Pick<User, "id" | "name" | "image">;
    winner?: Pick<User, "id" | "name" | "image"> | null;
    _count: { entries: number };
  };
  showActions?: boolean;
  className?: string;
}

export function LotteryCard({
  lottery,
  showActions = true,
  className,
}: LotteryCardProps) {
  const condition = conditionConfig[lottery.condition] || conditionConfig.GOOD;
  const isEnding = lottery.endDate && new Date(lottery.endDate) < new Date(Date.now() + 24 * 60 * 60 * 1000);
  const isScheduled = lottery.status === "SCHEDULED";
  const isCompleted = lottery.status === "COMPLETED";
  const timeRemaining = lottery.endDate
    ? formatDistanceToNow(new Date(lottery.endDate), { addSuffix: true })
    : null;

  return (
    <Link
      href={`/lotteries/${lottery.id}`}
      className={cn(
        "lottery-card group block",
        isCompleted && "opacity-75 grayscale-[30%]",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-muted">
        {lottery.images[0] ? (
          <Image
            src={lottery.images[0]}
            alt={lottery.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Sparkles className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Condition badge */}
        <Badge
          variant="outline"
          className={cn(
            "absolute left-3 top-3 border",
            condition.className
          )}
        >
          {condition.label}
        </Badge>

        {/* Status overlay for scheduled */}
        {isScheduled && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <Badge variant="secondary" className="text-sm">
              Coming soon
            </Badge>
          </div>
        )}

        {/* Ending soon indicator */}
        {isEnding && !isScheduled && !isCompleted && (
          <div className="absolute right-3 top-3">
            <Badge variant="destructive" className="animate-pulse">
              Ending soon
            </Badge>
          </div>
        )}

        {/* Ended indicator */}
        {isCompleted && (
          <div className="absolute right-3 top-3">
            <Badge variant="secondary" className="bg-muted/90">
              Ended
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
          {lottery.title}
        </h3>

        {/* Description */}
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {lottery.description}
        </p>

        {/* Stats */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {/* Entries */}
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{lottery._count.entries}</span>
            </div>

            {/* Time remaining / Ended */}
            {timeRemaining && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{isCompleted ? `Ended ${timeRemaining}` : timeRemaining}</span>
              </div>
            )}
          </div>

          {/* Entry cost (only for active) */}
          {showActions && !isCompleted && (
            <PointBadge points={lottery.pointsPerEntry} size="sm" />
          )}
        </div>

        {/* Winner (for completed lotteries) */}
        {isCompleted && lottery.winner && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-gold/10 px-3 py-2">
            <Trophy className="h-4 w-4 text-gold" />
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/20 text-xs font-medium text-gold">
              {lottery.winner.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <span className="text-xs font-medium text-gold">
              Won by {lottery.winner.name || "Anonymous"}
            </span>
          </div>
        )}

        {/* No winner (completed but no entries) */}
        {isCompleted && !lottery.winner && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">
              No entries - lottery expired
            </span>
          </div>
        )}

        {/* Creator */}
        <div className="mt-3 flex items-center gap-2 border-t border-border/40 pt-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
            {lottery.creator.name?.charAt(0).toUpperCase() || "?"}
          </div>
          <span className="text-xs text-muted-foreground">
            by {lottery.creator.name || "Anonymous"}
          </span>
        </div>
      </div>
    </Link>
  );
}
