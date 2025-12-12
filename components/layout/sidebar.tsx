/**
 * Sidebar Component
 *
 * Dashboard/Settings sidebar navigation.
 *
 * @owner Frontend Team
 *
 * Props:
 * - items: SidebarItem[]
 * - activeItem?: string
 *
 * Features:
 * - [ ] Vertical nav links
 * - [ ] Active state highlighting
 * - [ ] Icons for each item
 * - [ ] Collapsible on mobile
 */

"use client";

interface SidebarItem {
  label: string;
  href: string;
  icon?: string;
}

interface SidebarProps {
  items: SidebarItem[];
  activeItem?: string;
}

export function Sidebar({ items, activeItem }: SidebarProps) {
  // TODO: Implement sidebar UI
  return (
    <aside className="w-64 border-r p-4">
      <nav className="space-y-2">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`block px-3 py-2 rounded-md ${
              activeItem === item.href
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
