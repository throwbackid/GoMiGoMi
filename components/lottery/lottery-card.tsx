/**
 * LotteryCard Component
 *
 * Displays a lottery item in a card format for grids/lists.
 *
 * @owner Frontend Team
 *
 * Props:
 * - lottery: Lottery object
 * - showActions: boolean - Show enter/edit buttons
 *
 * Features:
 * - [ ] Display item image (first image)
 * - [ ] Show title, condition badge
 * - [ ] Show entry count and time remaining
 * - [ ] Show minimum entry points
 * - [ ] Link to lottery detail page
 */

import { Lottery } from "@/types";

interface LotteryCardProps {
  lottery: Lottery;
  showActions?: boolean;
}

export function LotteryCard({ lottery, showActions = true }: LotteryCardProps) {
  // TODO: Implement lottery card UI
  return (
    <div className="border rounded-lg p-4">
      <p className="font-medium">{lottery.title}</p>
      <p className="text-sm text-muted-foreground">
        {lottery.pointsPerEntry} points to enter
      </p>
      {/* TODO: Add image, badges, timer, actions */}
    </div>
  );
}
