"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MarkReadButtonProps {
  notificationId: string;
}

export function MarkReadButton({ notificationId }: MarkReadButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    try {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to mark as read");
      }

      router.refresh();
    } catch (error) {
      toast.error("Failed to mark as read");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleMarkRead}
      disabled={isLoading}
      title="Mark as read"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Check className="h-4 w-4" />
      )}
    </Button>
  );
}
