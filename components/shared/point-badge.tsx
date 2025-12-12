/**
 * PointBadge Component
 *
 * Displays user's point balance as a badge.
 *
 * @owner Frontend Team
 *
 * Props:
 * - points: number
 * - size?: "sm" | "md" | "lg"
 * - showIcon?: boolean
 *
 * Features:
 * - [ ] Coin/point icon
 * - [ ] Formatted number display
 * - [ ] Size variants
 * - [ ] Animation on change (optional)
 */

interface PointBadgeProps {
  points: number;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function PointBadge({
  points,
  size = "md",
  showIcon = true,
}: PointBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <div
      className={`inline-flex items-center gap-1 bg-amber-100 text-amber-800 rounded-full ${sizeClasses[size]}`}
    >
      {showIcon && <span>🪙</span>}
      <span className="font-medium">{points.toLocaleString()}</span>
    </div>
  );
}
