"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { Order } from "@/lib/types/api";
import { formatPrice, formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { Package, ArrowRight, Loader2 } from "lucide-react";

export default function MyOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/auth/login?returnUrl=/account/orders");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    async function load() {
      if (!isAuthenticated) return;
      try {
        const list = await api.orders.listMyOrders();
        setOrders(list);
      } catch {
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [isAuthenticated]);

  if (isAuthLoading || (isLoading && isAuthenticated)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b pb-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <Link href="/account" className="hover:text-foreground">
            Account
          </Link>
          <span>/</span>
          <span>Orders</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          My Order History
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Track current orders, inspect past purchases, and manage cancellations
        </p>
      </div>

      {/* Orders List */}
      <div className="mt-8">
        {orders.length === 0 ? (
          <EmptyState
            icon={<Package className="h-10 w-10 text-muted-foreground" />}
            title="No orders yet"
            description="You haven't placed any orders with us. When you make a purchase, it will appear here."
            actionText="Start Shopping"
            actionHref="/products"
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const itemCount = order.items?.reduce(
                (acc, curr) => acc + curr.quantity,
                0
              ) || 0;

              return (
                <div
                  key={order.public_id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border bg-card p-6 shadow-sm transition hover:shadow-md gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-foreground">
                        Order #{order.order_number}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Placed on {formatDate(order.created_at)} • {itemCount}{" "}
                      {itemCount === 1 ? "item" : "items"} • Payment:{" "}
                      <strong className="uppercase font-semibold text-foreground">
                        {order.payment_method}
                      </strong>
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-base font-bold text-foreground">
                        {formatPrice(order.total)}
                      </p>
                    </div>

                    <Link
                      href={`/account/orders/${order.public_id}`}
                      className="btn-outline py-2 px-4 text-xs font-semibold flex items-center gap-1.5"
                    >
                      View Details <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
