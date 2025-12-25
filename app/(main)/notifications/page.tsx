import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MarkAllReadButton } from "@/components/notifications/mark-all-read-button";
import { MarkReadButton } from "@/components/notifications/mark-read-button";

export default async function NotificationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "LOTTERY_WON":
        return "🎉";
      case "LOTTERY_ENDED":
        return "🏁";
      case "LOTTERY_CANCELLED":
        return "❌";
      case "NEW_ENTRY":
        return "👤";
      case "POINTS_EARNED":
        return "💰";
      default:
        return "🔔";
    }
  };

  const getNotificationLink = (notification: typeof notifications[0]) => {
    const data = notification.data as { lotteryId?: string } | null;
    if (data?.lotteryId) {
      return `/lotteries/${data.lotteryId}`;
    }
    return null;
  };

  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bell className="h-8 w-8" />
            Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No notifications yet</h3>
            <p className="text-muted-foreground mt-2">
              When something happens, you'll see it here
            </p>
            <Button asChild className="mt-6">
              <Link href="/lotteries">Browse Lotteries</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const link = getNotificationLink(notification);
            const content = (
              <Card
                className={`transition-colors ${
                  !notification.read
                    ? "border-primary/50 bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{notification.title}</h3>
                        {!notification.read && (
                          <Badge variant="default" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    {!notification.read && (
                      <MarkReadButton notificationId={notification.id} />
                    )}
                  </div>
                </CardContent>
              </Card>
            );

            if (link) {
              return (
                <Link key={notification.id} href={link} className="block">
                  {content}
                </Link>
              );
            }

            return <div key={notification.id}>{content}</div>;
          })}
        </div>
      )}
    </div>
  );
}
