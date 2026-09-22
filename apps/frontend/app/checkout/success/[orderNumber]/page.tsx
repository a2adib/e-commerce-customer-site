import React from "react";
import Link from "next/link";
import { CheckCircle2, Package, ArrowRight, ShoppingBag, Truck } from "lucide-react";

interface SuccessPageProps {
  params: {
    orderNumber: string;
  };
}

export default function CheckoutSuccessPage({ params }: SuccessPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 text-center">
      <div className="flex flex-col items-center">
        {/* Success Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-6 animate-bounce">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Order Confirmed
        </span>

        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          Thank you for your purchase!
        </h1>

        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          Your order has been received and is now being processed. You will pay with{" "}
          <strong>Cash on Delivery</strong> once your parcel arrives.
        </p>

        {/* Order Info Card */}
        <div className="mt-8 w-full rounded-xl border bg-card p-6 shadow-sm text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Order Reference</p>
              <p className="text-lg font-bold tracking-wider text-primary">
                #{params.orderNumber}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-full self-start">
              <Package className="h-3.5 w-3.5" /> Order Received (Pending)
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div className="space-y-1">
              <p className="text-muted-foreground font-semibold">Payment Method</p>
              <p className="font-medium text-foreground">Cash on Delivery (COD)</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground font-semibold">Estimated Delivery</p>
              <p className="font-medium text-foreground flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-muted-foreground" /> 2 - 4 Business Days
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/account/orders"
            className="btn-primary py-2.5 px-6 text-xs flex items-center justify-center gap-2"
          >
            <Package className="h-4 w-4" /> View My Orders
          </Link>
          <Link
            href="/products"
            className="btn-outline py-2.5 px-6 text-xs flex items-center justify-center gap-2"
          >
            <ShoppingBag className="h-4 w-4" /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
