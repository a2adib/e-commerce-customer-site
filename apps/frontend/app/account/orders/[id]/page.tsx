"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { Order, OrderStatus } from "@/lib/types/api";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import {
  Package,
  ArrowLeft,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  AlertCircle,
  XCircle,
  Loader2,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

const ORDER_STEPS = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push(`/auth/login?returnUrl=/account/orders/${orderId}`);
    }
  }, [isAuthenticated, isAuthLoading, router, orderId]);

  const loadOrder = async () => {
    try {
      const data = await api.orders.getMyOrder(orderId);
      setOrder(data);
    } catch (err: any) {
      toast.error(err.detail || err.message || "Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && orderId) {
      loadOrder();
    }
  }, [isAuthenticated, orderId]);

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    try {
      const updated = await api.orders.cancelMyOrder(
        orderId,
        cancelReason.trim() || undefined
      );
      setOrder(updated);
      setShowCancelModal(false);
      toast.success("Order has been cancelled and stock was restored");
    } catch (err: any) {
      toast.error(err.detail || err.message || "Could not cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg font-bold">Order not found</p>
        <Link href="/account/orders" className="btn-primary mt-4 text-xs inline-flex">
          Back to Orders
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === "cancelled";
  const canCancel = order.status === "pending";

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return 0;
      case "confirmed":
        return 1;
      case "processing":
        return 2;
      case "shipped":
        return 3;
      case "delivered":
        return 4;
      default:
        return -1;
    }
  };

  const currentStepIndex = getStepIndex(order.status);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back button & Header */}
      <div className="border-b pb-6">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to All Orders
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Order #{order.order_number}
              </h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Placed on {formatDateTime(order.created_at)}
            </p>
          </div>

          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="btn-outline text-xs text-destructive hover:bg-destructive/10 hover:text-destructive self-start sm:self-auto"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-destructive">
          <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h3 className="font-bold text-sm">This order has been cancelled</h3>
            <p className="mt-0.5">
              Items from this order have been returned to stock. No payment will be collected.
            </p>
          </div>
        </div>
      )}

      {/* Visual Status Timeline (for non-cancelled orders) */}
      {!isCancelled && (
        <div className="mt-8 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">
            Order Progress
          </h2>

          <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-0">
            {/* Progress line (desktop) */}
            <div className="hidden md:block absolute top-1/2 left-8 right-8 h-1 -translate-y-1/2 bg-muted -z-0">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{
                  width: `${(currentStepIndex / (ORDER_STEPS.length - 1)) * 100}%`,
                }}
              />
            </div>

            {ORDER_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isPassed = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step.key}
                  className="flex md:flex-col items-center gap-3 md:gap-2 z-10"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all shadow-sm ${
                      isPassed
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="md:text-center">
                    <p
                      className={`text-xs font-semibold ${
                        isCurrent
                          ? "text-primary"
                          : isPassed
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <span className="text-[10px] text-primary/80 font-medium">
                        Current Status
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Ordered Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-base font-bold text-card-foreground mb-4">
              Items in Order ({order.items.length})
            </h2>

            <ul className="divide-y divide-border">
              {order.items.map((item) => (
                <li
                  key={item.public_id}
                  className="flex items-center justify-between py-4"
                >
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Quantity: {item.quantity} × {formatPrice(item.unit_price)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {formatPrice(item.line_total)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Charge</span>
                <span className="font-medium text-foreground">
                  {formatPrice(order.delivery_charge)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between text-base font-bold text-foreground">
                <span>Total Amount (COD)</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Status History Logs */}
          {order.status_history && order.status_history.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-base font-bold text-card-foreground mb-4">
                Activity & Status Logs
              </h2>
              <ul className="space-y-4 text-xs">
                {order.status_history.map((hist) => (
                  <li key={hist.public_id} className="flex items-start gap-3">
                    <div className="mt-1 flex h-2 w-2 rounded-full bg-primary shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground capitalize">
                        Status changed to: {hist.to_status}
                      </p>
                      {hist.note && (
                        <p className="text-muted-foreground mt-0.5">{hist.note}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                        {formatDateTime(hist.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Delivery Address & Details */}
        <div className="space-y-6">
          {/* Shipping snapshot */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-base font-bold text-card-foreground mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Delivery Information
            </h2>
            <div className="text-xs space-y-2 text-muted-foreground">
              <p className="font-semibold text-foreground text-sm">
                {order.shipping_snapshot?.full_name}
              </p>
              <p>{order.shipping_snapshot?.address_line}</p>
              <p>
                {order.shipping_snapshot?.city}, {order.shipping_snapshot?.district}
                {order.shipping_snapshot?.postal_code
                  ? ` - ${order.shipping_snapshot.postal_code}`
                  : ""}
              </p>
              <p className="font-medium text-foreground pt-1">
                Phone: {order.shipping_snapshot?.phone}
              </p>
            </div>
          </div>

          {/* Payment info */}
          <div className="rounded-xl border bg-card p-6 shadow-sm text-xs space-y-3">
            <h2 className="text-base font-bold text-card-foreground">
              Payment Details
            </h2>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Method</span>
              <span className="font-semibold text-foreground uppercase">
                {order.payment_method}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Status</span>
              <span className="font-semibold text-foreground uppercase">
                {order.payment_status}
              </span>
            </div>
            {order.note && (
              <div className="border-t pt-3">
                <span className="text-muted-foreground font-semibold">
                  Customer Note:
                </span>
                <p className="mt-1 italic text-foreground">{order.note}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl">
            <div className="flex items-center gap-2 text-destructive font-bold text-base mb-2">
              <AlertCircle className="h-5 w-5" /> Cancel Order #{order.order_number}
            </div>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to cancel this order? Stock reserved for this order will be released back to the inventory immediately.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-foreground mb-1">
                Reason for cancellation (optional)
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Changed my mind, duplicate order..."
                className="w-full rounded-md border border-input bg-background p-2.5 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="btn-outline px-4 py-2 text-xs"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="btn-primary px-4 py-2 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Cancelling...
                  </>
                ) : (
                  "Confirm Cancellation"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
