/**
 * LotteryForm Component
 *
 * Form for creating or editing a lottery.
 *
 * @owner Frontend Team
 *
 * Props:
 * - lottery?: Lottery - If provided, edit mode
 * - onSubmit: (data) => void
 * - onCancel: () => void
 *
 * Features:
 * - [ ] Title input
 * - [ ] Description textarea
 * - [ ] Image upload (up to 5 images)
 * - [ ] Condition select (ItemCondition enum)
 * - [ ] Category select
 * - [ ] Points per entry input (min 1)
 * - [ ] Max participants input (optional)
 * - [ ] Start date picker (for scheduled lotteries)
 * - [ ] End date picker (required)
 * - [ ] Form validation with Zod
 */

"use client";

import { Lottery } from "@/types";

interface LotteryFormProps {
  lottery?: Lottery;
  onSubmit: (data: unknown) => void;
  onCancel: () => void;
}

export function LotteryForm({ lottery, onSubmit, onCancel }: LotteryFormProps) {
  // TODO: Implement lottery form with react-hook-form + zod
  return (
    <form className="space-y-4">
      <p className="text-muted-foreground">
        Lottery form placeholder - implement with shadcn form components
      </p>
      {/* TODO: Add form fields */}
    </form>
  );
}
