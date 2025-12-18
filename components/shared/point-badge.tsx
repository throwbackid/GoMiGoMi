import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface PointBadgeProps {
  points: number;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export function PointBadge({
  points,
  size = "md",
  showIcon = true,
  className
}: PointBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-500 font-medium",
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        size === "lg" && "px-4 py-1.5 text-base",
        className
      )}
    >
      {showIcon && <Coins className={cn(
        size === "sm" && "h-3 w-3",
        size === "md" && "h-4 w-4",
        size === "lg" && "h-5 w-5",
      )} />}
      {points.toLocaleString()}
    </div>
  );
}