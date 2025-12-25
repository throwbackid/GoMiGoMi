"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Categories for filter
const categories = [
  { name: "All Categories", slug: "all" },
  { name: "Electronics", slug: "electronics" },
  { name: "Clothing", slug: "clothing" },
  { name: "Home & Garden", slug: "home-garden" },
  { name: "Sports", slug: "sports" },
  { name: "Books", slug: "books" },
  { name: "Toys & Games", slug: "toys-games" },
  { name: "Collectibles", slug: "collectibles" },
  { name: "Jewelry", slug: "jewelry" },
  { name: "Music", slug: "music" },
  { name: "Other", slug: "other" },
];

// Conditions for filter
const conditions = [
  { name: "All Conditions", value: "all" },
  { name: "New", value: "NEW" },
  { name: "Like New", value: "LIKE_NEW" },
  { name: "Good", value: "GOOD" },
  { name: "Fair", value: "FAIR" },
  { name: "Poor", value: "POOR" },
];

// Sort options
const sortOptions = [
  { name: "Ending Soon", value: "endDate-asc" },
  { name: "Newest First", value: "createdAt-desc" },
  { name: "Most Entries", value: "entries-desc" },
  { name: "Lowest Entry Cost", value: "pointsPerEntry-asc" },
  { name: "Highest Entry Cost", value: "pointsPerEntry-desc" },
];

interface LotteryFiltersProps {
  category?: string;
  condition?: string;
  search?: string;
  sort?: string;
}

export function LotteryFilters({ category, condition, search, sort }: LotteryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(search || "");

  // Debounced search - updates URL after 300ms of no typing
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (searchValue) {
        params.set("search", searchValue);
      } else {
        params.delete("search");
      }
      params.delete("page");

      const newUrl = `/lotteries?${params.toString()}`;
      const currentUrl = `/lotteries?${searchParams.toString()}`;

      // Only navigate if the URL actually changed
      if (newUrl !== currentUrl) {
        router.push(newUrl);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, searchParams, router]);

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset page when filter changes
    params.delete("page");

    router.push(`/lotteries?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search lotteries..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {/* Category Filter */}
        <Select
          value={category || "all"}
          onValueChange={(value) => updateFilter("category", value)}
        >
          <SelectTrigger className="w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.slug} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Condition Filter */}
        <Select
          value={condition || "all"}
          onValueChange={(value) => updateFilter("condition", value)}
        >
          <SelectTrigger className="w-[140px]">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent>
            {conditions.map((cond) => (
              <SelectItem key={cond.value} value={cond.value}>
                {cond.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={sort || "endDate-asc"}
          onValueChange={(value) => updateFilter("sort", value)}
        >
          <SelectTrigger className="w-[160px]">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
