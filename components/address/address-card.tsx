/**
 * AddressCard Component
 *
 * Displays a shipping address in a card format.
 *
 * @owner Frontend Team
 *
 * Props:
 * - address: Address
 * - onEdit: () => void
 * - onDelete: () => void
 * - onSetDefault: () => void
 *
 * Features:
 * - [ ] Display formatted address
 * - [ ] Show "Default" badge if isDefault
 * - [ ] Edit button
 * - [ ] Delete button (with confirmation)
 * - [ ] Set as default button (if not default)
 */

import { Address } from "@/types";

interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressCardProps) {
  // TODO: Implement address card UI
  return (
    <div className="border rounded-lg p-4">
      <p className="font-medium">{address.name}</p>
      <p className="text-sm text-muted-foreground">{address.street}</p>
      <p className="text-sm text-muted-foreground">
        {address.city}, {address.state} {address.postalCode}
      </p>
      {/* TODO: Add badges and action buttons */}
    </div>
  );
}
