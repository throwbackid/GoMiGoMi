"use client";

import { useState, useEffect } from "react";
import { LotteryFilters } from "./lottery-filters";
import { Skeleton } from "@/components/ui/skeleton";

interface LotteryFiltersWrapperProps {
  category?: string;
  condition?: string;
  search?: string;
  sort?: string;
}

export function LotteryFiltersWrapper(props: LotteryFiltersWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show skeleton until client-side hydration is complete
  // This prevents Radix UI aria-controls ID mismatch
  if (!mounted) {
    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Skeleton className="h-10 flex-1" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[160px]" />
          <Skeleton className="h-10 w-[140px]" />
          <Skeleton className="h-10 w-[160px]" />
        </div>
      </div>
    );
  }

  return <LotteryFilters {...props} />;
}
