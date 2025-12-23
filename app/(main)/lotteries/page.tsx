import { Suspense } from "react";
import Link from "next/link";
import { Search, Filter, Plus, Sparkles, SlidersHorizontal } from "lucide-react";

import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LotteryCard } from "@/components/lottery/lottery-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Revalidate every 60 seconds for fresh lottery data
export const revalidate = 60;

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

interface LotteriesPageProps {
  searchParams: Promise<{
    category?: string;
    condition?: string;
    search?: string;
    sort?: string;
    page?: string;
  }>;
}

async function getRecentlyEndedLotteries() {
  return db.lottery.findMany({
    where: { status: "COMPLETED" },
    include: {
      creator: { select: { id: true, name: true, image: true } },
      winner: { select: { id: true, name: true, image: true } },
      _count: { select: { entries: true } },
    },
    orderBy: { endDate: "desc" },
    take: 8,
  });
}

async function getLotteries(params: {
  category?: string;
  condition?: string;
  search?: string;
  sort?: string;
  page?: string;
}) {
  const { category, condition, search, sort = "endDate-asc", page = "1" } = params;
  const [sortBy, sortOrder] = sort.split("-") as [string, "asc" | "desc"];
  const pageNum = parseInt(page) || 1;
  const limit = 12;

  // Build where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    status: { in: ["SCHEDULED", "ACTIVE"] },
  };

  if (category && category !== "all") {
    where.category = category;
  }

  if (condition && condition !== "all") {
    where.condition = condition;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Build orderBy
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any = {};
  switch (sortBy) {
    case "createdAt":
      orderBy = { createdAt: sortOrder };
      break;
    case "entries":
      orderBy = { entries: { _count: sortOrder } };
      break;
    case "pointsPerEntry":
      orderBy = { pointsPerEntry: sortOrder };
      break;
    case "endDate":
    default:
      orderBy = { endDate: sortOrder };
      break;
  }

  const [lotteries, total] = await Promise.all([
    db.lottery.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, image: true },
        },
        _count: {
          select: { entries: true },
        },
      },
      orderBy,
      skip: (pageNum - 1) * limit,
      take: limit,
    }),
    db.lottery.count({ where }),
  ]);

  return {
    lotteries,
    pagination: {
      page: pageNum,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

function LotteryCardSkeleton() {
  return (
    <div className="lottery-card">
      <Skeleton className="aspect-[4/3] rounded-t-xl" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

function LotteryGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <LotteryCardSkeleton key={i} />
      ))}
    </div>
  );
}

async function LotteryGrid({ params }: { params: LotteriesPageProps["searchParams"] }) {
  let lotteries: Awaited<ReturnType<typeof getLotteries>>["lotteries"] = [];
  let pagination = { page: 1, limit: 12, total: 0, totalPages: 0 };
  let resolvedParams: Awaited<LotteriesPageProps["searchParams"]> = {};

  try {
    resolvedParams = await params;
    const result = await getLotteries(resolvedParams);
    lotteries = result.lotteries;
    pagination = result.pagination;
  } catch (error) {
    console.error("Failed to load lotteries:", error);
  }

  if (lotteries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
        <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">No lotteries found</h3>
        <p className="mt-2 text-muted-foreground">
          {resolvedParams.search
            ? `No results for "${resolvedParams.search}"`
            : "Try adjusting your filters or check back later"}
        </p>
        <Button asChild className="mt-6">
          <Link href="/lotteries/create">Create the first lottery</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {lotteries.map((lottery) => (
          <LotteryCard key={lottery.id} lottery={lottery} />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {pagination.page > 1 && (
            <Button variant="outline" asChild>
              <Link
                href={{
                  pathname: "/lotteries",
                  query: {
                    ...resolvedParams,
                    page: pagination.page - 1,
                  },
                }}
              >
                Previous
              </Link>
            </Button>
          )}

          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          {pagination.page < pagination.totalPages && (
            <Button variant="outline" asChild>
              <Link
                href={{
                  pathname: "/lotteries",
                  query: {
                    ...resolvedParams,
                    page: pagination.page + 1,
                  },
                }}
              >
                Next
              </Link>
            </Button>
          )}
        </div>
      )}
    </>
  );
}

async function RecentlyEndedGrid() {
  try {
    const lotteries = await getRecentlyEndedLotteries();

    if (lotteries.length === 0) {
      return null;
    }

    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {lotteries.map((lottery) => (
          <LotteryCard key={lottery.id} lottery={lottery} showActions={false} />
        ))}
      </div>
    );
  } catch (error) {
    console.error("Failed to load recently ended lotteries:", error);
    return null;
  }
}

export default async function LotteriesPage({ searchParams }: LotteriesPageProps) {
  const params = await searchParams;

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute inset-0 bg-glow opacity-50" />

        <div className="container relative px-4 py-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="heading-display text-3xl font-bold md:text-4xl">
                Discover{" "}
                <span className="text-gradient">treasures</span>
              </h1>
              <p className="mt-2 text-muted-foreground">
                Browse lotteries and enter for a chance to win
              </p>
            </div>
            <Button asChild className="btn-glow">
              <Link href="/lotteries/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Lottery
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Filters & Content */}
      <section className="py-8">
        <div className="container px-4">
          {/* Filter Bar */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <form className="relative flex-1" action="/lotteries" method="get">
              {/* Preserve other params */}
              {params.category && (
                <input type="hidden" name="category" value={params.category} />
              )}
              {params.condition && (
                <input type="hidden" name="condition" value={params.condition} />
              )}
              {params.sort && (
                <input type="hidden" name="sort" value={params.sort} />
              )}

              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                name="search"
                placeholder="Search lotteries..."
                defaultValue={params.search}
                className="pl-10"
              />
            </form>

            {/* Filters */}
            <div className="flex gap-2">
              {/* Category Filter */}
              <Select defaultValue={params.category || "all"}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.slug} value={cat.slug}>
                      <Link
                        href={{
                          pathname: "/lotteries",
                          query: {
                            ...params,
                            category: cat.slug === "all" ? undefined : cat.slug,
                            page: undefined,
                          },
                        }}
                        className="block w-full"
                      >
                        {cat.name}
                      </Link>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Condition Filter */}
              <Select defaultValue={params.condition || "all"}>
                <SelectTrigger className="w-[140px]">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((cond) => (
                    <SelectItem key={cond.value} value={cond.value}>
                      <Link
                        href={{
                          pathname: "/lotteries",
                          query: {
                            ...params,
                            condition: cond.value === "all" ? undefined : cond.value,
                            page: undefined,
                          },
                        }}
                        className="block w-full"
                      >
                        {cond.name}
                      </Link>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select defaultValue={params.sort || "endDate-asc"}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <Link
                        href={{
                          pathname: "/lotteries",
                          query: {
                            ...params,
                            sort: opt.value,
                            page: undefined,
                          },
                        }}
                        className="block w-full"
                      >
                        {opt.name}
                      </Link>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {(params.category || params.condition || params.search) && (
            <div className="mb-6 flex flex-wrap gap-2">
              {params.search && (
                <Badge variant="secondary" className="gap-1">
                  Search: {params.search}
                  <Link
                    href={{
                      pathname: "/lotteries",
                      query: { ...params, search: undefined, page: undefined },
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </Link>
                </Badge>
              )}
              {params.category && (
                <Badge variant="secondary" className="gap-1">
                  {categories.find((c) => c.slug === params.category)?.name}
                  <Link
                    href={{
                      pathname: "/lotteries",
                      query: { ...params, category: undefined, page: undefined },
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </Link>
                </Badge>
              )}
              {params.condition && (
                <Badge variant="secondary" className="gap-1">
                  {conditions.find((c) => c.value === params.condition)?.name}
                  <Link
                    href={{
                      pathname: "/lotteries",
                      query: { ...params, condition: undefined, page: undefined },
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </Link>
                </Badge>
              )}
              <Link
                href="/lotteries"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Clear all
              </Link>
            </div>
          )}

          {/* Lottery Grid */}
          <Suspense fallback={<LotteryGridSkeleton />}>
            <LotteryGrid params={searchParams} />
          </Suspense>
        </div>
      </section>

      {/* Recently Ended Section */}
      <section className="border-t border-border/40 py-8">
        <div className="container px-4">
          <h2 className="heading-display mb-6 text-2xl font-bold">
            Recently <span className="text-muted-foreground">Ended</span>
          </h2>
          <Suspense fallback={<LotteryGridSkeleton />}>
            <RecentlyEndedGrid />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
