import React from "react";
import { CheckCircle2, Truck, Package, XCircle, Clock } from "lucide-react";

export function OrderStatusBadge({ status }: { status: string }) {
  switch (status.toLowerCase()) {
    case "delivered":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <CheckCircle2 className="h-3 w-3" /> Delivered
        </span>
      );
    case "shipped":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
          <Truck className="h-3 w-3" /> Shipped
        </span>
      );
    case "processing":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
          <Package className="h-3 w-3" /> Processing
        </span>
      );
    case "confirmed":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
          <CheckCircle2 className="h-3 w-3" /> Confirmed
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
          <XCircle className="h-3 w-3" /> Cancelled
        </span>
      );
    case "pending":
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <Clock className="h-3 w-3" /> Pending
        </span>
      );
  }
}
