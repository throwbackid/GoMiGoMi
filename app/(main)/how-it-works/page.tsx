import Link from "next/link";
import { Metadata } from "next";
import {
  Sparkles,
  Search,
  MousePointerClick,
  Trophy,
  Camera,
  Clock,
  Coins,
  Gift,
  Users,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  Target,
  Shield,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "How It Works | GoMiGoMi",
  description:
    "Learn how GoMiGoMi works - enter lotteries with points, win amazing pre-loved items, and give your unused treasures a new home.",
};

// Steps for buyers
const buyerSteps = [
  {
    icon: Search,
    title: "Browse Treasures",
    description:
      "Explore lotteries for unique pre-loved items across categories like electronics, collectibles, fashion, and more. Each listing shows the item condition, entry cost, and current odds.",
    color: "text-teal",
    bgColor: "bg-teal/10",
    borderColor: "border-teal/20",
  },
  {
    icon: MousePointerClick,
    title: "Enter with Points",
    description:
      "Spend points to enter lotteries. The more points you spend, the higher your chances of winning. You can even boost your entry later to increase your odds!",
    color: "text-coral",
    bgColor: "bg-coral/10",
    borderColor: "border-coral/20",
  },
  {
    icon: Trophy,
    title: "Win & Receive",
    description:
      "When the lottery ends, a winner is selected based on probability. If you win, the seller ships the item directly to you. It's that simple!",
    color: "text-gold",
    bgColor: "bg-gold/10",
    borderColor: "border-gold/20",
  },
];

// Steps for sellers
const sellerSteps = [
  {
    icon: Camera,
    title: "List Your Item",
    description:
      "Upload photos, write a description, set the condition, and choose your entry price. Your item becomes a lottery that others can enter.",
    color: "text-teal",
    bgColor: "bg-teal/10",
    borderColor: "border-teal/20",
  },
  {
    icon: Clock,
    title: "Wait for Entries",
    description:
      "Set your lottery duration and watch as participants enter. You'll get notified as people join. Even one entry means your item will find a new home!",
    color: "text-coral",
    bgColor: "bg-coral/10",
    borderColor: "border-coral/20",
  },
  {
    icon: Coins,
    title: "Earn All Points",
    description:
      "When the lottery ends, you receive ALL points from the pool - not a fixed amount. More entries means more points for you. Ship the item to the winner and you're done!",
    color: "text-gold",
    bgColor: "bg-gold/10",
    borderColor: "border-gold/20",
  },
];

// Points earning methods
const pointsInfo = [
  {
    icon: Gift,
    title: "Sign Up Bonus",
    points: "+100",
    description: "Get 100 free points when you create an account",
  },
  {
    icon: Trophy,
    title: "Lottery Sales",
    points: "+All",
    description: "Receive the entire point pool when your lottery ends",
  },
  {
    icon: Users,
    title: "Referrals",
    points: "+25",
    description: "Earn 25 points for each friend you invite",
  },
];

// FAQ items
const faqItems = [
  {
    question: "How is the winner selected?",
    answer:
      "Winners are selected using a Probability Proportional to Size (PPS) algorithm. Your chance of winning equals your points divided by the total pool. For example, if you spent 30 points in a lottery with 100 total points, you have a 30% chance of winning.",
  },
  {
    question: "What happens if only one person enters?",
    answer:
      "They win automatically! There's no minimum number of participants. Even with a single entry, the lottery will complete and the item will find a new home.",
  },
  {
    question: "Can I increase my chances after entering?",
    answer:
      "Yes! You can 'boost' your entry by adding more points at any time before the lottery ends. This increases your share of the pool and improves your odds.",
  },
  {
    question: "What if a lottery is cancelled?",
    answer:
      "If a seller cancels their lottery before it ends, all participants receive a full refund of their points. No points are ever lost to cancellations.",
  },
  {
    question: "Do I need a shipping address to enter?",
    answer:
      "Yes, you'll need to add a shipping address before entering your first lottery. This ensures winners can receive their items promptly. Your address is only shared with sellers after you win.",
  },
  {
    question: "Are the items verified?",
    answer:
      "Sellers describe item conditions honestly using our rating system (New, Like New, Good, Fair, Poor). Photos show the actual item. We encourage clear, detailed descriptions to set proper expectations.",
  },
  {
    question: "How long do lotteries run?",
    answer:
      "Sellers can set durations from 1 day to 2 weeks. The end date and time are clearly shown on each listing so you know exactly when the winner will be selected.",
  },
  {
    question: "Can I enter my own lottery?",
    answer:
      "No, sellers cannot enter their own lotteries. This ensures fair play for all participants.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="page-enter">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 bg-glow" />

        <div className="container relative px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center animate-in-stagger">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm">
              <HelpCircle className="h-4 w-4 text-primary" />
              <span>Everything you need to know</span>
            </div>

            <h1 className="heading-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              How{" "}
              <span className="text-gradient">GoMiGoMi</span>{" "}
              Works
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              A simple, fair, and fun way to win amazing pre-loved items or give
              your unused treasures a new home. Here's everything you need to
              get started.
            </p>
          </div>
        </div>
      </section>

      {/* For Buyers Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="mb-12 text-center">
            <span className="inline-block rounded-full bg-teal/10 px-4 py-1 text-sm font-medium text-teal">
              For Treasure Hunters
            </span>
            <h2 className="heading-display mt-4 text-3xl font-bold md:text-4xl">
              Win Unique Items
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Finding your next treasure is just three steps away
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {buyerSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="group relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Step number */}
                  <div className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background font-bold text-muted-foreground ring-2 ring-border">
                    {index + 1}
                  </div>

                  <div
                    className={`h-full rounded-xl border ${step.borderColor} ${step.bgColor} p-6 transition-all hover:shadow-lg`}
                  >
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-xl ${step.bgColor} ${step.color}`}
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                    <p className="mt-2 text-muted-foreground">
                      {step.description}
                    </p>
                  </div>

                  {/* Connector arrow */}
                  {index < buyerSteps.length - 1 && (
                    <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-muted-foreground/30 md:block">
                      <ArrowRight className="h-8 w-8" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Probability Visualization */}
      <section className="border-y border-border/40 bg-card/30 py-16 md:py-24">
        <div className="container px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <span className="inline-block rounded-full bg-gold/10 px-4 py-1 text-sm font-medium text-gold">
                Fair Odds
              </span>
              <h2 className="heading-display mt-4 text-3xl font-bold md:text-4xl">
                Your Points = Your Odds
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                The more points you spend, the higher your chances. It's simple
                math, completely transparent.
              </p>
            </div>

            {/* Visual probability example */}
            <div className="mt-12 rounded-2xl border border-border bg-background p-6 md:p-8">
              <h3 className="text-center text-lg font-semibold">
                Example: Vintage Camera Lottery
              </h3>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Total Pool: 100 points
              </p>

              <div className="mt-8 space-y-4">
                {/* Participant 1 */}
                <div className="flex items-center gap-4">
                  <div className="w-24 shrink-0 text-right text-sm">
                    <span className="font-medium">Alice</span>
                    <br />
                    <span className="text-muted-foreground">50 pts</span>
                  </div>
                  <div className="flex-1">
                    <div className="h-8 w-[50%] rounded-lg bg-gradient-to-r from-coral to-coral/70 transition-all" />
                  </div>
                  <div className="w-16 text-right font-bold text-coral">50%</div>
                </div>

                {/* Participant 2 */}
                <div className="flex items-center gap-4">
                  <div className="w-24 shrink-0 text-right text-sm">
                    <span className="font-medium">Bob</span>
                    <br />
                    <span className="text-muted-foreground">30 pts</span>
                  </div>
                  <div className="flex-1">
                    <div className="h-8 w-[30%] rounded-lg bg-gradient-to-r from-teal to-teal/70 transition-all" />
                  </div>
                  <div className="w-16 text-right font-bold text-teal">30%</div>
                </div>

                {/* Participant 3 */}
                <div className="flex items-center gap-4">
                  <div className="w-24 shrink-0 text-right text-sm">
                    <span className="font-medium">Carol</span>
                    <br />
                    <span className="text-muted-foreground">20 pts</span>
                  </div>
                  <div className="flex-1">
                    <div className="h-8 w-[20%] rounded-lg bg-gradient-to-r from-gold to-gold/70 transition-all" />
                  </div>
                  <div className="w-16 text-right font-bold text-gold">20%</div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                <span>
                  Formula: Your Points ÷ Total Pool = Your Win Probability
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Sellers Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="mb-12 text-center">
            <span className="inline-block rounded-full bg-coral/10 px-4 py-1 text-sm font-medium text-coral">
              For Item Owners
            </span>
            <h2 className="heading-display mt-4 text-3xl font-bold md:text-4xl">
              Give Items New Life
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Turn unused items into points while making someone's day
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {sellerSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="group relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background font-bold text-muted-foreground ring-2 ring-border">
                    {index + 1}
                  </div>

                  <div
                    className={`h-full rounded-xl border ${step.borderColor} ${step.bgColor} p-6 transition-all hover:shadow-lg`}
                  >
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-xl ${step.bgColor} ${step.color}`}
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                    <p className="mt-2 text-muted-foreground">
                      {step.description}
                    </p>
                  </div>

                  {index < sellerSteps.length - 1 && (
                    <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-muted-foreground/30 md:block">
                      <ArrowRight className="h-8 w-8" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Points System */}
      <section className="border-y border-border/40 bg-card/30 py-16 md:py-24">
        <div className="container px-4">
          <div className="mb-12 text-center">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
              Points Economy
            </span>
            <h2 className="heading-display mt-4 text-3xl font-bold md:text-4xl">
              Earn & Spend Points
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Points are the currency of GoMiGoMi. Here's how to get them.
            </p>
          </div>

          <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-3">
            {pointsInfo.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-border bg-background p-6 text-center transition-all hover:border-primary/30 hover:shadow-lg"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="mt-4 text-2xl font-bold text-gold">
                    {item.points}
                  </div>
                  <h3 className="mt-2 font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-teal" />
              <span>Points never expire</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-coral" />
              <span>Instant transactions</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-gold" />
              <span>No real money required</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="mb-12 text-center">
            <span className="inline-block rounded-full bg-teal/10 px-4 py-1 text-sm font-medium text-teal">
              FAQ
            </span>
            <h2 className="heading-display mt-4 text-3xl font-bold md:text-4xl">
              Common Questions
            </h2>
          </div>

          <div className="mx-auto max-w-2xl">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-coral/10 to-teal/20 p-8 md:p-12">
            <div className="absolute inset-0 bg-grid opacity-30" />

            <div className="relative mx-auto max-w-2xl text-center">
              <Sparkles className="mx-auto h-12 w-12 text-gold" />
              <h2 className="heading-display mt-4 text-2xl font-bold md:text-3xl">
                Ready to Start?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                Create your free account and get 100 bonus points. Start
                exploring lotteries or list your first item today!
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" asChild className="gap-2 btn-glow">
                  <Link href="/register">
                    Create free account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/lotteries">Browse lotteries</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
