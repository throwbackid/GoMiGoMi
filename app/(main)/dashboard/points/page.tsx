import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PointBadge } from "@/components/shared/point-badge";
import { formatDate } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Gift, Ticket, RefreshCw, ChevronLeft } from "lucide-react";

const typeConfig = {
  SIGNUP_BONUS: { label: "Signup Bonus", icon: Gift, positive: true },
  LOTTERY_CREATED: { label: "Lottery Earnings", icon: ArrowUpRight, positive: true },
  LOTTERY_ENTRY: { label: "Lottery Entry", icon: Ticket, positive: false },
  LOTTERY_BOOST: { label: "Entry Boost", icon: ArrowUpRight, positive: false },
  LOTTERY_REFUND: { label: "Refund", icon: RefreshCw, positive: true },
  REFERRAL_BONUS: { label: "Referral Bonus", icon: Gift, positive: true },
};

export default async function PointsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  const transactions = await db.pointTransaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const earned = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const spent = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/30">
        <div className="container px-4 py-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Points History</h1>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PointBadge points={user?.points || 0} size="lg" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-green-500">
              +{earned.toLocaleString()}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-red-500">
              -{spent.toLocaleString()}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const config = typeConfig[transaction.type];
              const Icon = config.icon;

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      config.positive ? "bg-green-500/10" : "bg-red-500/10"
                    }`}>
                      <Icon className={`h-4 w-4 ${
                        config.positive ? "text-green-500" : "text-red-500"
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">{config.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.description || formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold ${
                    transaction.amount > 0 ? "text-green-500" : "text-red-500"
                  }`}>
                    {transaction.amount > 0 ? "+" : ""}
                    {transaction.amount.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}