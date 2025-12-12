/**
 * Header Component
 *
 * Main navigation header for the application.
 *
 * @owner Frontend Team
 *
 * Features:
 * - [ ] Logo/Brand link to home
 * - [ ] Navigation links (Browse, Create Lottery)
 * - [ ] Search input (optional)
 * - [ ] Point balance display (PointBadge)
 * - [ ] Notification bell (NotificationBell)
 * - [ ] User avatar/menu dropdown
 * - [ ] Login/Register buttons (if not authenticated)
 * - [ ] Mobile responsive menu
 */

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function Header() {
  const session = await auth.api.getSession({ headers: await headers() });

  // TODO: Implement header UI with shadcn components
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="font-bold text-xl">gomigomi</div>
        <nav className="flex items-center gap-4">
          {session ? (
            <span className="text-sm">Welcome, {session.user?.name}</span>
          ) : (
            <span className="text-sm">Guest</span>
          )}
          {/* TODO: Add navigation, point badge, notifications, user menu */}
        </nav>
      </div>
    </header>
  );
}
