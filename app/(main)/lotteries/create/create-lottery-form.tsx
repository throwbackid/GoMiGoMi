"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { LotteryForm } from "@/components/lottery/lottery-form";
import type { CreateLotteryInput } from "@/types";

export function CreateLotteryForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateLotteryInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/lotteries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create lottery");
      }

      toast.success("Lottery created!", {
        description: "Your lottery is now live.",
      });

      // Redirect to the new lottery
      router.push(`/lotteries/${result.data.id}`);
    } catch (error) {
      toast.error("Failed to create lottery", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <LotteryForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isSubmitting={isSubmitting}
    />
  );
}
