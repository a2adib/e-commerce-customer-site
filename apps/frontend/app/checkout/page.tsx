"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/hooks/useCart";
import { api } from "@/lib/api-client";
import { formatPrice } from "@/lib/utils";
import { AddressSelector } from "@/components/checkout/AddressSelector";
import { EmptyState } from "@/components/ui/EmptyState";
import { CouponValidateResponse } from "@/lib/types/api";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  AlertTriangle,
  Loader2,
  Lock,
  ArrowRight,
  Tag,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { items, subtotal, clearCart, hasUnavailableItems } = useCart();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [orderNote, setOrderNote] = useState("");
  const [stockError, setStockError] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidateResponse | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Protected route check
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/auth/login?returnUrl=/checkout");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const deliveryCharge = items.length > 0 ? 60 : 0;
  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryCharge);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    try {
      const res = await api.coupons.validate({
        code: couponCode.trim(),
        subtotal,
      });
      if (res.valid) {
        setAppliedCoupon(res);
        toast.success(res.message || "Coupon applied successfully!");
      } else {
        toast.error(res.message || "Invalid coupon");
        setAppliedCoupon(null);
      }
    } catch (err: any) {
      toast.error(err.detail || err.message || "Failed to validate coupon");
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handlePlaceOrder = async () => {
    setStockError(null);

    if (!selectedAddressId) {
      toast.error("Please choose or create a delivery address");
      return;
    }

    if (hasUnavailableItems) {
      toast.error("Please remove unavailable or out-of-stock items before checking out");
      return;
    }

    setIsPlacingOrder(true);

    try {
      const order = await api.orders.checkout({
        address_id: selectedAddressId,
        note: orderNote.trim() || undefined,
        payment_method: "cod",
        coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
      });

      // Clear the local cart state since backend checkout clears it
      clearCart();

      toast.success("Order placed successfully!");
      router.push(`/checkout/success/${order.order_number}`);
    } catch (err: any) {
      const errorMsg =
        err.detail || err.message || "Failed to place order. Please try again.";
      setStockError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          title="Your cart is empty"
          description="You don't have any items to checkout. Add some items to your cart first."
          actionText="Browse Catalog"
          actionHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Checkout Header */}
      <div className="border-b pb-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Lock className="h-3.5 w-3.5 text-primary" />
          <span>Secure Checkout</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Complete Your Order
        </h1>
      </div>

      {/* Stock error banner */}
      {stockError && (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <h4 className="text-xs font-semibold">Stock Verification Issue</h4>
            <p className="mt-1 text-xs">{stockError}</p>
            <Link
              href="/cart"
              className="mt-2 inline-block text-xs font-semibold underline hover:no-underline"
            >
              Return to Cart to adjust quantities
            </Link>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Left: Address, Delivery & Payment */}
        <div className="space-y-8 lg:col-span-7">
          {/* Step 1: Delivery Address */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-base font-bold text-card-foreground mb-4">
              1. Delivery Address
            </h2>
            <AddressSelector
              selectedAddressId={selectedAddressId}
              onSelectAddress={(id) => setSelectedAddressId(id)}
              onAddressCreated={(addr) => setSelectedAddressId(addr.public_id)}
            />
          </div>

          {/* Step 2: Payment Method */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-base font-bold text-card-foreground mb-4">
              2. Payment Method
            </h2>

            <div className="rounded-lg border-2 border-primary bg-primary/5 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Cash on Delivery (COD)
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Pay with cash upon physical parcel delivery at your doorstep
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                Default
              </span>
            </div>
          </div>

          {/* Step 3: Optional Order Note */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-base font-bold text-card-foreground mb-2">
              3. Delivery Instructions (Optional)
            </h2>
            <textarea
              rows={2}
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder="e.g. Leave with security guard, call before arriving..."
              className="w-full rounded-md border border-input bg-background p-3 text-xs outline-none transition focus:border-primary"
            />
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-base font-bold text-card-foreground mb-4">
              Order Summary
            </h2>

            {/* Item list */}
            <div className="max-h-60 overflow-y-auto divide-y divide-border pr-2">
              {items.map((item) => (
                <div key={item.public_id} className="flex gap-3 py-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted">
                    {item.product_image ? (
                      <Image
                        src={item.product_image}
                        alt={item.product_name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                        No img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-medium text-foreground line-clamp-1">
                      {item.product_name}
                    </p>
                    <p className="text-muted-foreground mt-0.5">
                      Qty: {item.quantity} × {formatPrice(item.product_price)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {formatPrice(item.line_total)}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo / Coupon Box */}
            <div className="mt-4 border-t pt-4">
              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="font-bold text-emerald-800 dark:text-emerald-300">
                        {appliedCoupon.code} Applied
                      </p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                        {appliedCoupon.discount_type === "percentage"
                          ? `${appliedCoupon.discount_value}% OFF`
                          : `${formatPrice(appliedCoupon.discount_value)} OFF`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="rounded p-1 text-muted-foreground hover:text-foreground transition"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Coupon / Promo Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-xs uppercase outline-none transition focus:border-primary"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponCode.trim()}
                    className="rounded-md border bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 transition"
                  >
                    {isValidatingCoupon ? "Checking..." : "Apply"}
                  </button>
                </div>
              )}
            </div>

            {/* Calculations */}
            <div className="mt-4 space-y-2 border-t pt-4 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">
                  {formatPrice(subtotal)}
                </span>
              </div>
              {appliedCoupon && discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Charge</span>
                <span className="font-semibold text-foreground">
                  {formatPrice(deliveryCharge)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-foreground border-t pt-3">
                <span>Total Due (COD)</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-6">
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || hasUnavailableItems || !selectedAddressId}
                className="btn-primary w-full py-3 text-sm font-semibold shadow-md flex items-center justify-center gap-2"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    Place Order (Cash on Delivery)
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 space-y-2 border-t pt-4 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span>Orders are backed by 7-day hassle-free replacement</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-primary" />
                <span>Standard delivery in 2-3 business days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
