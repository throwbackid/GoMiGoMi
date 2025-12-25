"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, User, Bell, Shield } from "lucide-react";

import { cn } from "@/lib/utils";

const settingsNav = [
  {
    title: "Profile",
    href: "/settings/profile",
    icon: User,
    description: "Update your name and profile picture",
  },
  {
    title: "Addresses",
    href: "/settings/addresses",
    icon: MapPin,
    description: "Manage your shipping addresses",
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="page-enter">
      {/* Header */}
      <section className="border-b border-border/40 bg-card/30">
        <div className="container px-4 py-8">
          <h1 className="heading-display text-2xl font-bold md:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="container px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 lg:shrink-0">
            <nav className="flex flex-row gap-2 overflow-x-auto pb-4 lg:flex-col lg:gap-1 lg:pb-0">
              {settingsNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
