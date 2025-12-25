import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Trophy, Users, Coins, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";

export const revalidate = 60;

const features = [
  {
    icon: Trophy,
    title: "Win Amazing Items",
    description:
      "Enter lotteries for pre-loved treasures. The more points you spend, the higher your chances!",
  },
  {
    icon: Users,
    title: "Fair & Transparent",
    description:
      "Our probability-based system ensures everyone has a fair shot. See your odds in real-time.",
  },
  {
    icon: Gift,
    title: "Give Items New Life",
    description:
      "List items you no longer need. Earn points when someone wins your lottery.",
  },
  {
    icon: Coins,
    title: "Free to Start",
    description:
      "Get 100 bonus points when you sign up. No purchases required to play!",
  },
];

const categoryIcons: Record<string, string> = {
  electronics: "💻",
  clothing: "👕",
  "home-garden": "🏠",
  sports: "⚽",
  books: "📚",
  "toys-games": "🎮",
  collectibles: "🏆",
  jewelry: "💎",
  music: "🎸",
  other: "📦",
};

async function getRecentLotteries() {
  try {
    const lotteries = await db.lottery.findMany({
      where: {
        status: { in: ["ACTIVE", "SCHEDULED"] },
      },
      include: {
        creator: {
          select: { id: true, name: true, image: true },
        },
        _count: {
          select: { entries: true },
        },
      },
      orderBy: { endDate: "asc" },
      take: 6,
    });
    return lotteries;
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: "asc" },
    });
    return categories;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [lotteries, categories] = await Promise.all([
    getRecentLotteries(),
    getCategories(),
  ]);

  return (
    <div className="page-enter">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 bg-glow" />
        <div className="absolute inset-0 bg-glow-teal" />

        <div className="container relative px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center animate-in-stagger">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm">
              <Gift className="h-4 w-4 text-primary" />
              <span>New users get 100 free points</span>
            </div>

            <h1 className="heading-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Win{" "}
              <span className="text-gradient">treasures</span>,<br />
              share joy
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Enter lotteries for amazing pre-loved items. Spend points to
              increase your odds. Give your unused items a new home and earn
              points in return.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild className="gap-2 btn-glow">
                <Link href="/lotteries">
                  Start exploring
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/how-it-works">How it works</Link>
              </Button>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-8 border-t border-border/40 pt-8">
              <div>
                <p className="heading-display text-3xl font-bold text-gold">100+</p>
                <p className="mt-1 text-sm text-muted-foreground">Active lotteries</p>
              </div>
              <div>
                <p className="heading-display text-3xl font-bold text-teal">500+</p>
                <p className="mt-1 text-sm text-muted-foreground">Happy winners</p>
              </div>
              <div>
                <p className="heading-display text-3xl font-bold text-coral">10k+</p>
                <p className="mt-1 text-sm text-muted-foreground">Points awarded</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="border-y border-border/40 bg-card/30">
          <div className="container px-4 py-8">
            <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
              <span className="shrink-0 text-sm font-medium text-muted-foreground">
                Browse:
              </span>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/lotteries?category=${category.slug}`}
                  className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <span>{categoryIcons[category.slug] || "📦"}</span>
                  <span>{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Lotteries */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="heading-display text-2xl font-bold md:text-3xl">
                Ending soon
              </h2>
              <p className="mt-2 text-muted-foreground">
                Don&apos;t miss your chance to win these items
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/lotteries">View all</Link>
            </Button>
          </div>

          {lotteries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
              <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No lotteries yet</h3>
              <p className="mt-2 text-muted-foreground">
                Be the first to create a lottery!
              </p>
              <Button asChild className="mt-6">
                <Link href="/lotteries/create">Create lottery</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {lotteries.map((lottery) => (
                <Link
                  key={lottery.id}
                  href={`/lotteries/${lottery.id}`}
                  className="lottery-card group p-4"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                    {lottery.images[0] ? (
                      <Image
                        src={lottery.images[0]}
                        alt={lottery.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Sparkles className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="absolute left-2 top-2 rounded-full bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur-sm">
                      {lottery.status === "SCHEDULED" ? "Coming soon" : "Active"}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <h3 className="font-semibold line-clamp-1">{lottery.title}</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{lottery._count.entries} entries</span>
                      <span className="font-medium text-gold">
                        {lottery.pointsPerEntry} pts to enter
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border/40 bg-card/30 py-16 md:py-24">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="heading-display text-2xl font-bold md:text-3xl">
              Why GoMiGoMi?
            </h2>
            <p className="mt-4 text-muted-foreground">
              A sustainable way to find treasures and give items new life
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-border bg-background p-6 transition-all hover:border-primary/30 hover:shadow-lg"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-coral/10 to-teal/20 p-8 md:p-12">
            <div className="absolute inset-0 bg-grid opacity-30" />

            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="heading-display text-2xl font-bold md:text-3xl">
                Ready to start winning?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                Join thousands of treasure hunters. Get 100 free points when you
                sign up — no credit card required.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" asChild className="gap-2 btn-glow">
                  <Link href="/register">
                    Create free account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
