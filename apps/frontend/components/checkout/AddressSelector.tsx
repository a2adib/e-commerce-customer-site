"use client";

import React, { useState, useEffect } from "react";
import { Address } from "@/lib/types/api";
import { api } from "@/lib/api-client";
import { AddressForm, AddressFormData } from "./AddressForm";
import { MapPin, Plus, CheckCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface AddressSelectorProps {
  selectedAddressId: string | null;
  onSelectAddress: (addressId: string) => void;
  onAddressCreated: (address: Address) => void;
}

export function AddressSelector({
  selectedAddressId,
  onSelectAddress,
  onAddressCreated,
}: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const list = await api.addresses.list();
        setAddresses(list);
        if (list.length > 0 && !selectedAddressId) {
          // Select default address or first address
          const def = list.find((a) => a.is_default) || list[0];
          onSelectAddress(def.public_id);
        } else if (list.length === 0) {
          setIsAddingNew(true);
        }
      } catch {
        setAddresses([]);
        setIsAddingNew(true);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [selectedAddressId, onSelectAddress]);

  const handleCreateAddress = async (data: AddressFormData) => {
    setIsSubmitting(true);
    try {
      const created = await api.addresses.create(data);
      setAddresses((prev) => [created, ...prev]);
      onSelectAddress(created.public_id);
      onAddressCreated(created);
      setIsAddingNew(false);
      toast.success("Delivery address saved");
    } catch (err: any) {
      toast.error(err.detail || err.message || "Failed to save address");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.length > 0 && !isAddingNew && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {addresses.map((addr) => {
            const isSelected = selectedAddressId === addr.public_id;
            return (
              <div
                key={addr.public_id}
                onClick={() => onSelectAddress(addr.public_id)}
                className={`relative flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-input bg-card hover:border-foreground/30"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span>{addr.full_name}</span>
                    </div>
                    {isSelected ? (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-input" />
                    )}
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {addr.address_line}, {addr.city}, {addr.district}
                    {addr.postal_code ? ` - ${addr.postal_code}` : ""}
                  </p>
                  <p className="mt-1 text-xs font-medium text-foreground">
                    Phone: {addr.phone}
                  </p>
                </div>

                {addr.is_default && (
                  <div className="mt-3">
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      Default
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Address Button or Inline Form */}
      {isAddingNew ? (
        <div className="rounded-xl border bg-muted/20 p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Add New Delivery Address
            </h4>
            {addresses.length > 0 && (
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-xs text-muted-foreground hover:underline"
              >
                Use Saved Address
              </button>
            )}
          </div>
          <AddressForm
            onSubmit={handleCreateAddress}
            onCancel={addresses.length > 0 ? () => setIsAddingNew(false) : undefined}
            submitButtonText="Save and Use This Address"
            isSubmitting={isSubmitting}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAddingNew(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-input py-3 text-xs font-semibold text-foreground hover:bg-muted transition"
        >
          <Plus className="h-4 w-4" /> Add Another Address
        </button>
      )}
    </div>
  );
}
