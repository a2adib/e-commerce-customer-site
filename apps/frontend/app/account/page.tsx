"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { Address } from "@/lib/types/api";
import { formatDate } from "@/lib/utils";
import { AddressForm, AddressFormData } from "@/components/checkout/AddressForm";
import {
  User,
  MapPin,
  Package,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/auth/login?returnUrl=/account");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const loadAddresses = async () => {
    try {
      const list = await api.addresses.list();
      setAddresses(list);
    } catch {
      setAddresses([]);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAddresses();
    }
  }, [isAuthenticated]);

  const handleCreateAddress = async (data: AddressFormData) => {
    setIsSubmitting(true);
    try {
      await api.addresses.create(data);
      toast.success("Address created successfully");
      setIsAddingNew(false);
      loadAddresses();
    } catch (err: any) {
      toast.error(err.detail || err.message || "Failed to create address");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAddress = async (data: AddressFormData) => {
    if (!editingAddress) return;
    setIsSubmitting(true);
    try {
      await api.addresses.update(editingAddress.public_id, data);
      toast.success("Address updated successfully");
      setEditingAddress(null);
      loadAddresses();
    } catch (err: any) {
      toast.error(err.detail || err.message || "Failed to update address");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await api.addresses.delete(id);
      toast.success("Address removed");
      setAddresses((prev) => prev.filter((a) => a.public_id !== id));
    } catch (err: any) {
      toast.error(err.detail || err.message || "Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await api.addresses.update(id, { is_default: true });
      toast.success("Default address updated");
      loadAddresses();
    } catch (err: any) {
      toast.error(err.detail || err.message || "Failed to update default address");
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          My Account
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Manage your personal information, delivery addresses, and preferences
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground font-black text-xl uppercase">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-base font-bold text-card-foreground">
                  {user.name}
                </h2>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <span className="mt-1 inline-block rounded bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {user.role}
                </span>
              </div>
            </div>

            <div className="mt-6 border-t pt-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium text-foreground">
                  {user.phone || "Not set"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-medium text-foreground">
                  {formatDate(user.created_at)}
                </span>
              </div>
            </div>

            <div className="mt-6 border-t pt-4 space-y-2">
              <Link
                href="/account/orders"
                className="btn-outline w-full justify-start text-xs"
              >
                <Package className="mr-2 h-4 w-4" /> View My Orders
              </Link>
              <button
                onClick={logout}
                className="btn-outline w-full justify-start text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Address Book CRUD */}
        <div className="lg:col-span-8 space-y-6" id="addresses">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Saved Delivery Addresses
              </h2>
              <p className="text-xs text-muted-foreground">
                Addresses used for checkout and deliveries
              </p>
            </div>
            {!isAddingNew && !editingAddress && (
              <button
                onClick={() => setIsAddingNew(true)}
                className="btn-primary text-xs"
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add New Address
              </button>
            )}
          </div>

          {/* Add Form */}
          {isAddingNew && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-4">
                Add New Delivery Address
              </h3>
              <AddressForm
                onSubmit={handleCreateAddress}
                onCancel={() => setIsAddingNew(false)}
                submitButtonText="Save Address"
                isSubmitting={isSubmitting}
              />
            </div>
          )}

          {/* Edit Form */}
          {editingAddress && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-4">
                Edit Delivery Address
              </h3>
              <AddressForm
                initialValues={{
                  full_name: editingAddress.full_name,
                  phone: editingAddress.phone,
                  address_line: editingAddress.address_line,
                  city: editingAddress.city,
                  district: editingAddress.district,
                  postal_code: editingAddress.postal_code || undefined,
                  is_default: editingAddress.is_default,
                }}
                onSubmit={handleUpdateAddress}
                onCancel={() => setEditingAddress(null)}
                submitButtonText="Update Address"
                isSubmitting={isSubmitting}
              />
            </div>
          )}

          {/* Addresses List */}
          {isLoadingAddresses ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-32 rounded-xl border bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : addresses.length === 0 && !isAddingNew ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-foreground">
                No saved addresses
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add an address to speed up your checkout process.
              </p>
              <button
                onClick={() => setIsAddingNew(true)}
                className="btn-primary mt-4 text-xs"
              >
                Add Your First Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {addresses.map((addr) => (
                <div
                  key={addr.public_id}
                  className="relative flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold text-foreground">
                          {addr.full_name}
                        </span>
                      </div>
                      {addr.is_default ? (
                        <span className="flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          <CheckCircle className="h-3 w-3" /> Default
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetDefaultAddress(addr.public_id)}
                          className="text-[10px] font-semibold text-muted-foreground hover:text-primary transition"
                        >
                          Make Default
                        </button>
                      )}
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                      {addr.address_line}, {addr.city}, {addr.district}
                      {addr.postal_code ? ` - ${addr.postal_code}` : ""}
                    </p>
                    <p className="mt-1 text-xs font-medium text-foreground">
                      Phone: {addr.phone}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-3 border-t pt-3">
                    <button
                      onClick={() => setEditingAddress(addr)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
                    >
                      <Edit2 className="h-3 w-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr.public_id)}
                      className="flex items-center gap-1 text-xs text-destructive hover:underline transition"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
