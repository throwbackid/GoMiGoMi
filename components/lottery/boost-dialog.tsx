/**
 * BoostDialog Component
 *
 * Modal dialog for boosting an existing lottery entry.
 * NOTE: This component is currently not used in the UI.
 * The boost API endpoint is implemented - this UI component
 * can be completed when the feature is needed.
 *
 * @owner Frontend Team
 *
 * Props:
 * - lottery: Lottery
 * - currentEntry: { points: number }
 * - userBalance: number
 * - open: boolean
 * - onOpenChange: (open: boolean) => void
 * - onConfirm: (additionalPoints: number) => void
 */

"use client";

import { Lottery } from "@/types";

interface BoostDialogProps {
  lottery: Lottery;
  currentEntry: { points: number };
  userBalance: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (additionalPoints: number) => void;
}

/**
 * Placeholder component - not currently used in production.
 * The boost functionality is available via the API.
 */
export function BoostDialog({
  lottery,
  currentEntry,
  userBalance,
  open,
  onOpenChange,
  onConfirm,
}: BoostDialogProps) {
  // Placeholder - implement with shadcn Dialog when needed
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-semibold mb-4">Boost Entry</h2>
        <p className="text-muted-foreground mb-4">
          Current entry: {currentEntry.points} points
        </p>
        <p className="text-sm text-muted-foreground">
          This feature UI is coming soon. Use the API endpoint directly for now.
        </p>
        <button
          onClick={() => onOpenChange(false)}
          className="mt-4 w-full py-2 bg-primary text-primary-foreground rounded-md"
        >
          Close
        </button>
      </div>
    </div>
  );
}
