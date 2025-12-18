import { db } from "@/lib/db";
import { LotteryGrid } from "@/components/lottery/lottery-grid";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

interface PageProps {
  searchParams: {
    search?: string;
    category?: string;
    condition?: string;
    status?: string;
    page?: string;
  };
}

const conditions = ["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"];

export default async function LotteriesPage({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page || "1");
  const limit = 20;

  // Build where clause
  const where: any = {
    status: searchParams.status || "ACTIVE",
  };

  if (searchParams.search) {
    where.OR = [
      { title: { contains: searchParams.search, mode: "insensitive" } },
      { description: { contains: searchParams.search, mode: "insensitive" } },
    ];
  }

  if (searchParams.category) {
    where.category = searchParams.category;
  }

  if (searchParams.condition) {
    where.condition = searchParams.condition;
  }

  const [lotteries, total, categories] = await Promise.all([
    db.lottery.findMany({
      where,
      include: {
        creator: { select: { name: true, image: true } },
        winner: { select: { name: true } },
        _count: { select: { entries: true } },
      },
      orderBy: { endDate: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.lottery.count({ where }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Browse Lotteries</h1>
          <p className="text-muted-foreground">
            {total} lotteries available
          </p>
        </div>

        {/* Search */}
        <form className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              name="search"
              placeholder="Search lotteries..."
              defaultValue={searchParams.search}
              className="pl-9 w-64"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Select defaultValue={searchParams.category || "all"}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select defaultValue={searchParams.condition || "all"}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Condition</SelectItem>
            {conditions.map((cond) => (
              <SelectItem key={cond} value={cond}>
                {cond.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select defaultValue={searchParams.status || "ACTIVE"}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lottery Grid */}
      <LotteryGrid lotteries={lotteries} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              asChild
            >
              <a
                href={`/lotteries?page=${p}${
                  searchParams.search ? `&search=${searchParams.search}` : ""
                }${
                  searchParams.category ? `&category=${searchParams.category}` : ""
                }`}
              >
                {p}
              </a>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}