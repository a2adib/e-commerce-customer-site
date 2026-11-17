"use client";

import React, { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Order, OrderStatus } from "@/lib/types/api";
import { formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Loader2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

const ORDER_STEPS: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: "pending", label: "Order Placed", icon: Clock },
  { status: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { status: "processing", label: "Processing", icon: Package },
  { status: "shipped", label: "Out for Delivery", icon: Truck },
  { status: "delivered", label: "Delivered", icon: CheckCircle2 },
];

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      toast.error("Please enter both Order Number and Phone Number");
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const data = await api.orders.track(orderNumber.trim(), phone.trim());
      setOrder(data);
    } catch (err: any) {
      const msg = err.detail || err.message || "Order not found. Please check your details.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    if (status === "cancelled") return -1;
    const idx = ORDER_STEPS.findIndex((s) => s.status === status);
    return idx === -1 ? 0 : idx;
  };

  const currentStep = order ? getStepIndex(order.status) : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          Track Your Order
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
          Enter your Order Number and checkout Phone Number to see real-time shipment updates.
        </p>
      </div>

      {/* Lookup Card */}
      <div className="mt-8 rounded-2xl border bg-card p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleTrack} className="grid grid-cols-1 gap-4 sm:grid-cols-12">
          <div className="sm:col-span-6">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Order Number
            </label>
            <input
              type="text"
              placeholder="e.g. ORD-20261116-XXXX"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="e.g. 01711000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm font-semibold rounded-lg shadow-sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Track
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Order Status Display */}
      {order && (
        <div className="mt-8 space-y-6">
          {/* Status Header */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Order Details</p>
                <h2 className="text-xl font-black text-foreground mt-0.5">{order.order_number}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Placed on {new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: "long" })}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            {/* Timeline Stepper */}
            {order.status === "cancelled" ? (
              <div className="mt-6 rounded-xl bg-destructive/10 p-4 text-center text-sm font-semibold text-destructive">
                This order was cancelled.
              </div>
            ) : (
              <div className="mt-8">
                <div className="relative flex items-center justify-between">
                  <div className="absolute left-0 top-1/2 -z-0 h-1 w-full -translate-y-1/2 bg-muted" />
                  <div
                    className="absolute left-0 top-1/2 -z-0 h-1 -translate-y-1/2 bg-primary transition-all duration-500"
                    style={{
                      width: `${(Math.max(0, currentStep) / (ORDER_STEPS.length - 1)) * 100}%`,
                    }}
                  />

                  {ORDER_STEPS.map((step, idx) => {
                    const isDone = idx <= currentStep;
                    const isCurrent = idx === currentStep;
                    const IconComponent = step.icon;
                    return (
                      <div key={step.status} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                            isDone
                              ? "border-primary bg-primary text-primary-foreground shadow"
                              : "border-muted bg-background text-muted-foreground"
                          } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                        >
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <span
                          className={`mt-2 text-[11px] font-semibold tracking-tight text-center hidden sm:block ${
                            isDone ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Delivery Snapshot */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground mb-4">
                <MapPin className="h-4 w-4 text-primary" />
                Shipping Destination
              </h3>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground text-sm">{order.shipping_snapshot.full_name}</p>
                <p>{order.shipping_snapshot.address_line}</p>
                <p>
                  {order.shipping_snapshot.city}, {order.shipping_snapshot.district}{" "}
                  {order.shipping_snapshot.postal_code || ""}
                </p>
                <p className="pt-2 text-foreground font-medium">Contact: {order.shipping_snapshot.phone}</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-4">Payment & Totals</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Payment Method</span>
                  <span className="font-semibold uppercase text-foreground">{order.payment_method}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ""}</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-foreground">{formatPrice(order.delivery_charge)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-sm font-extrabold text-foreground">
                  <span>Total Amount</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-bold text-foreground mb-4">Items in Shipment</h3>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.public_id} className="flex items-center justify-between py-3 text-xs">
                  <div>
                    <p className="font-semibold text-foreground">{item.product_name}</p>
                    <p className="text-muted-foreground">Qty: {item.quantity} × {formatPrice(item.unit_price)}</p>
                  </div>
                  <span className="font-bold text-foreground">{formatPrice(item.line_total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
