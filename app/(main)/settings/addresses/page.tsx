"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddressForm } from "@/components/address/address-form";
import { AddressCard } from "@/components/address/address-card";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (error) {
      toast.error("Failed to load addresses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleCreate = async (data: any) => {
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create address");

      toast.success("Address added");
      setDialogOpen(false);
      fetchAddresses();
    } catch (error) {
      toast.error("Failed to create address");
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update address");

      toast.success("Address updated");
      setEditingAddress(null);
      fetchAddresses();
    } catch (error) {
      toast.error("Failed to update address");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete address");

      toast.success("Address deleted");
      fetchAddresses();
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });

      if (!res.ok) throw new Error("Failed to set default");

      toast.success("Default address updated");
      fetchAddresses();
    } catch (error) {
      toast.error("Failed to set default address");
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Addresses</h1>
          <p className="text-muted-foreground">
            Manage your shipping addresses
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
            </DialogHeader>
            <AddressForm onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No addresses yet. Add one to enter lotteries.
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => setEditingAddress(address)}
              onDelete={() => handleDelete(address.id)}
              onSetDefault={() => handleSetDefault(address.id)}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editingAddress}
        onOpenChange={(open) => !open && setEditingAddress(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
          </DialogHeader>
          {editingAddress && (
            <AddressForm
              defaultValues={editingAddress}
              onSubmit={(data) => handleUpdate(editingAddress.id, data)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}