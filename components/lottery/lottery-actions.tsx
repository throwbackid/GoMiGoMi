"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EntryDialog } from "./entry-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2, Edit, Trash2, LogIn, MapPin } from "lucide-react";
import Link from "next/link";

interface LotteryActionsProps {
  lottery: any;
  isOwner: boolean;
  userEntry: any;
  hasAddress: boolean;
  totalPoints: number;
  userId?: string;
}

export function LotteryActions({
  lottery,
  isOwner,
  userEntry,
  hasAddress,
  totalPoints,
  userId,
}: LotteryActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);

  const isActive = lottery.status === "ACTIVE";
  const isScheduled = lottery.status === "SCHEDULED";
  const isCompleted = lottery.status === "COMPLETED";
  const hasEntries = lottery.entries.length > 0;

  // Allow cancellation for active or scheduled lotteries
  const canCancel = isActive || isScheduled;

  // Handle cancel
  const handleCancel = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/lotteries/${lottery.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to cancel lottery");
      }

      toast.success("Lottery cancelled. All participants have been refunded.");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Not logged in
  if (!userId) {
    return (
      <Button asChild className="w-full" size="lg">
        <Link href="/login">
          <LogIn className="mr-2 h-4 w-4" />
          Sign in to Enter
        </Link>
      </Button>
    );
  }

  // Owner actions
  if (isOwner) {
    return (
      <div className="space-y-3">
        {isActive && !hasEntries && (
          <p className="text-center text-muted-foreground py-4">
            No entries yet. Wait for participants to enter.
          </p>
        )}

        <div className="flex gap-2">
          {!isCompleted && (
            <Button variant="outline" asChild className="flex-1">
              <Link href={`/lotteries/${lottery.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}

          {/* Cancel button for active or scheduled lotteries */}
          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={isLoading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Lottery?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will cancel the lottery and refund all{" "}
                    {lottery.entries.length} participants.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Lottery</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    className="bg-destructive"
                  >
                    Cancel Lottery
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

        </div>
      </div>
    );
  }

  // Completed lottery
  if (isCompleted) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">This lottery has ended</p>
      </div>
    );
  }

  // Scheduled lottery
  if (isScheduled) {
    return (
      <Button disabled className="w-full" size="lg">
        Coming Soon
      </Button>
    );
  }

  // No address
  if (!hasAddress) {
    return (
      <div className="space-y-3">
        <p className="text-center text-muted-foreground">
          You need to add a shipping address before entering lotteries
        </p>
        <Button asChild className="w-full" size="lg">
          <Link href="/settings/addresses">
            <MapPin className="mr-2 h-4 w-4" />
            Add Address
          </Link>
        </Button>
      </div>
    );
  }

  // User actions
  return (
    <>
      <Button
        onClick={() => setEntryDialogOpen(true)}
        className="w-full"
        size="lg"
      >
        {userEntry ? "Boost Entry" : "Enter Lottery"}
      </Button>

      <EntryDialog
        open={entryDialogOpen}
        onOpenChange={setEntryDialogOpen}
        lottery={lottery}
        userEntry={userEntry}
        totalPoints={totalPoints}
      />
    </>
  );
}
