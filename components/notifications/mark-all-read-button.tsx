"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function MarkAllReadButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAllRead = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to mark all as read");
      }

      const data = await res.json();
      toast.success(`Marked ${data.count} notifications as read`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to mark notifications as read");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleMarkAllRead} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <CheckCheck className="h-4 w-4 mr-2" />
      )}
      Mark all read
    </Button>
  );
}
