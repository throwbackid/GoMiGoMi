/**
 * AddressForm Component
 *
 * Form for creating or editing a shipping address.
 *
 * @owner Frontend Team
 *
 * Props:
 * - address?: Address - If provided, edit mode
 * - onSubmit: (data) => void
 * - onCancel: () => void
 *
 * Features:
 * - [ ] Recipient name input
 * - [ ] Street address input
 * - [ ] City input
 * - [ ] State/Province input
 * - [ ] Postal code input
 * - [ ] Country select (default US)
 * - [ ] Phone number input (optional)
 * - [ ] Set as default checkbox
 * - [ ] Form validation with Zod
 */

"use client";

import { Address } from "@/types";

interface AddressFormProps {
  address?: Address;
  onSubmit: (data: unknown) => void;
  onCancel: () => void;
}

export function AddressForm({ address, onSubmit, onCancel }: AddressFormProps) {
  // TODO: Implement address form with react-hook-form + zod
  return (
    <form className="space-y-4">
      <p className="text-muted-foreground">
        Address form placeholder - implement with shadcn form components
      </p>
      {/* TODO: Add form fields */}
    </form>
  );
}
