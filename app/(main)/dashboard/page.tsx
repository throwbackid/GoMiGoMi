import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PointBadge } from "@/components/shared/point-badge";
import Link from "next/link";
import { Coins, Ticket, Trophy, Package } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          entries: true,
          lotteries: true,
          wonLotteries: true,
        },
      },
    },
  });

  if (!user) redirect("/login");

  const stats = [
    {
      title: "Points Balance",
      value: user.points,
      icon: Coins,
      color: "text-amber-500",
    },
    {
      title: "Active Entries",
      value: user._count.entries,
      icon: Ticket,
      color: "text-blue-500",
    },
    {
      title: "Lotteries Won",
      value: user._count.wonLotteries,
      icon: Trophy,
      color: "text-green-500",
    },
    {
      title: "Lotteries Created",
      value: user._count.lotteries,
      icon: Package,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}!
          </p>
        </div>
        <Button asChild>
          <Link href="/lotteries/create">Create Lottery</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:border-primary transition-colors">
          <Link href="/dashboard/my-lotteries">
            <CardHeader>
              <CardTitle>My Lotteries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Manage lotteries you've created
              </p>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:border-primary transition-colors">
          <Link href="/dashboard/my-entries">
            <CardHeader>
              <CardTitle>My Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Track lotteries you've entered
              </p>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:border-primary transition-colors">
          <Link href="/dashboard/points">
            <CardHeader>
              <CardTitle>Points History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                View your points transactions
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}