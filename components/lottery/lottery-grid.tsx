/**
 * LotteryGrid Component
 *
 * Displays a grid of lottery cards with optional filtering.
 *
 * @owner Frontend Team
 *
 * Props:
 * - lotteries: Lottery[]
 * - isLoading: boolean
 * - emptyMessage?: string
 *
 * Features:
 * - [ ] Responsive grid layout (1-4 columns)
 * - [ ] Loading skeleton state
 * - [ ] Empty state message
 * - [ ] Infinite scroll or pagination
 */

import { Lottery } from "@/types";
import { LotteryCard } from "./lottery-card";

interface LotteryGridProps {
  lotteries: Lottery[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function LotteryGrid({
  lotteries,
  isLoading = false,
  emptyMessage = "No lotteries found",
}: LotteryGridProps) {
  if (isLoading) {
    // TODO: Return skeleton loading state
    return <div>Loading...</div>;
  }

  if (lotteries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {lotteries.map((lottery) => (
        <LotteryCard key={lottery.id} lottery={lottery} />
      ))}
    </div>
  );
}
