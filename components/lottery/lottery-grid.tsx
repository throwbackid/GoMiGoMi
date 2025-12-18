import { LotteryCard } from "./lottery-card";

interface LotteryGridProps {
  lotteries: any[];
  emptyMessage?: string;
}

export function LotteryGrid({ lotteries, emptyMessage = "No lotteries found" }: LotteryGridProps) {
  if (lotteries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {lotteries.map((lottery) => (
        <LotteryCard key={lottery.id} lottery={lottery} />
      ))}
    </div>
  );
}