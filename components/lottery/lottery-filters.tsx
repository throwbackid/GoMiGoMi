"use client";

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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get("search") as string;
    updateFilter("search", searchValue || undefined);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Search */}
      <form className="relative flex-1" onSubmit={handleSearch}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          name="search"
          placeholder="Search lotteries..."
          defaultValue={search}
          className="pl-10"
        />
      </form>

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
