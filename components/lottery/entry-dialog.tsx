"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface EntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lottery: any;
  userEntry: any;
  totalPoints: number;
}

export function EntryDialog({
  open,
  onOpenChange,
  lottery,
  userEntry,
  totalPoints,
}: EntryDialogProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [points, setPoints] = useState(
    userEntry ? 10 : lottery.pointsPerEntry
  );
  const [isLoading, setIsLoading] = useState(false);

  const user = session?.user as { id: string; name: string; email: string; image?: string | null; points?: number } | undefined;
  const userBalance = user?.points || 0;
  const minPoints = userEntry ? 1 : lottery.pointsPerEntry;
  const maxPoints = userBalance;

  // Calculate new probability
  const currentUserPoints = userEntry?.points || 0;
  const newTotalPoints = totalPoints + points;
  const newUserPoints = currentUserPoints + points;
  const newProbability = newTotalPoints > 0
    ? ((newUserPoints / newTotalPoints) * 100).toFixed(1)
    : "100";

  const handleSubmit = async () => {
    if (points < minPoints) {
      toast.error(`Minimum entry is ${minPoints} points`);
      return;
    }
    if (points > maxPoints) {
      toast.error("Insufficient points");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/lotteries/${lottery.id}/enter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to enter lottery");
      }

      toast.success(
        userEntry
          ? `Added ${points} points to your entry!`
          : `Entered with ${points} points!`
      );
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const quickAmounts = [10, 25, 50, 100].filter((a) => a <= maxPoints);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {userEntry ? "Boost Your Entry" : "Enter Lottery"}
          </DialogTitle>
          <DialogDescription>
            {userEntry
              ? `Add more points to increase your winning chance. Current entry: ${userEntry.points} points.`
              : `Enter this lottery for a chance to win. Minimum: ${lottery.pointsPerEntry} points.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Points Input */}
          <div className="space-y-2">
            <Label htmlFor="points">Points to {userEntry ? "add" : "enter with"}</Label>
            <Input
              id="points"
              type="number"
              min={minPoints}
              max={maxPoints}
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
            />
            <p className="text-sm text-muted-foreground">
              Your balance: {userBalance} points
            </p>
          </div>

          {/* Quick Add Buttons */}
          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setPoints(amount)}
              >
                +{amount}
              </Button>
            ))}
            {maxPoints > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPoints(maxPoints)}
              >
                Max ({maxPoints})
              </Button>
            )}
          </div>

          {/* Probability Preview */}
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground mb-1">
              Win Probability After Entry
            </p>
            <p className="text-2xl font-bold text-primary">
              {newProbability}%
            </p>
            <p className="text-sm text-muted-foreground">
              {newUserPoints} of {newTotalPoints} total points
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || points < minPoints || points > maxPoints}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {userEntry ? "Boost Entry" : "Enter Lottery"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}