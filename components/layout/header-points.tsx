"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { PointBadge } from "@/components/shared/point-badge";
import { Skeleton } from "@/components/ui/skeleton";

export function HeaderPoints() {
  const [points, setPoints] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // Fetch points on mount and when pathname changes (navigation)
  useEffect(() => {
    async function fetchPoints() {
      try {
        const res = await fetch("/api/user/points");
        if (res.ok) {
          const data = await res.json();
          setPoints(data.points);
        }
      } catch (error) {
        console.error("Failed to fetch points:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPoints();
  }, [pathname]); // Re-fetch when user navigates

  if (isLoading) {
    return <Skeleton className="h-7 w-16 rounded-full" />;
  }

  if (points === null) {
    return null;
  }

  return <PointBadge points={points} size="md" />;
}
