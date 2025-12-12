/**
 * NotificationBell Component
 *
 * Notification icon with dropdown for in-app notifications.
 *
 * @owner Frontend Team
 *
 * Features:
 * - [ ] Bell icon
 * - [ ] Unread count badge
 * - [ ] Dropdown with notification list
 * - [ ] Mark as read on click
 * - [ ] Link to full notifications page
 * - [ ] Polling or real-time updates
 */

"use client";

import { useState } from "react";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // TODO: Fetch notifications, implement dropdown
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-muted rounded-full relative"
      >
        {/* TODO: Add bell icon */}
        <span>🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      {/* TODO: Add dropdown menu */}
    </div>
  );
}
