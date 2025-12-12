/**
 * ProbabilityIndicator Component
 *
 * Displays win probability for a lottery entry.
 *
 * @owner Frontend Team
 *
 * Props:
 * - probability: number (0-1)
 * - showPercentage?: boolean
 * - size?: "sm" | "md" | "lg"
 *
 * Features:
 * - [ ] Progress bar visualization
 * - [ ] Percentage label
 * - [ ] Color coding (green for high, red for low)
 * - [ ] Size variants
 */

interface ProbabilityIndicatorProps {
  probability: number;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ProbabilityIndicator({
  probability,
  showPercentage = true,
  size = "md",
}: ProbabilityIndicatorProps) {
  const percentage = Math.round(probability * 100);

  const getColor = () => {
    if (percentage >= 50) return "bg-green-500";
    if (percentage >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 bg-muted rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full ${getColor()} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <span className="text-sm font-medium">{percentage}%</span>
      )}
    </div>
  );
}
