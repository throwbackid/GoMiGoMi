/**
 * EntryDialog Component
 *
 * Modal dialog for entering a lottery.
 *
 * @owner Frontend Team
 *
 * Props:
 * - lottery: Lottery
 * - userBalance: number
 * - hasAddress: boolean
 * - open: boolean
 * - onOpenChange: (open: boolean) => void
 * - onConfirm: (points: number) => void
 *
 * Features:
 * - [ ] Show lottery details summary
 * - [ ] Display minimum entry points required
 * - [ ] Show user's current point balance
 * - [ ] Points input (>= pointsPerEntry)
 * - [ ] Calculate and display win probability
 * - [ ] Warning if no shipping address
 * - [ ] Confirm/Cancel buttons
 * - [ ] Disable confirm if insufficient balance
 */

"use client";

import { Lottery } from "@/types";

interface EntryDialogProps {
  lottery: Lottery;
  userBalance: number;
  hasAddress: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (points: number) => void;
}

export function EntryDialog({
  lottery,
  userBalance,
  hasAddress,
  open,
  onOpenChange,
  onConfirm,
}: EntryDialogProps) {
  // TODO: Implement with shadcn Dialog component
  return (
    <div>
      {/* TODO: Implement entry dialog UI */}
      <p>Entry dialog placeholder</p>
    </div>
  );
}
