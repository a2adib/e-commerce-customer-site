"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/hooks/useCart";
import { useAuth } from "@/lib/auth-context";
import { formatPrice } from "@/lib/utils";
import { QuantityInput } from "@/components/product/QuantityInput";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ShoppingBag,
  Trash2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Truck,
} from "lucide-react";

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const {
    items,
    subtotal,
    itemCount,
    updateQuantity,
    removeItem,
    clearCart,
    hasUnavailableItems,
    unavailableItems,
    isLoading,
  } = useCart();

  const estimatedDelivery = items.length > 0 ? 60 : 0;
  const estimatedTotal = subtotal + estimatedDelivery;

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={<ShoppingBag className="h-10 w-10 text-muted-foreground" />}
          title="Sign in to view your shopping cart"
          description="Log in to access your saved items, synchronize your cart, and proceed to checkout."
          actionText="Sign In"
          actionHref="/auth/login?returnUrl=/cart"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 rounded-lg border bg-muted/40 animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-lg border bg-muted/40 animate-pulse" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={<ShoppingBag className="h-10 w-10 text-muted-foreground" />}
          title="Your shopping cart is empty"
          description="Looks like you haven't added any items yet. Explore our top products and start filling it up."
          actionText="Start Shopping"
          actionHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Shopping Cart
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-medium text-muted-foreground hover:text-destructive transition self-start sm:self-auto"
        >
          Clear All Items
        </button>
      </div>

      {/* Warning banner for unavailable or out of stock items */}
      {hasUnavailableItems && (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-xs space-y-1">
            <p className="font-semibold">Items Require Attention</p>
            <p>
              Some items in your cart are currently out of stock or inactive. You must remove them or adjust quantities before you can proceed to checkout.
            </p>
          </div>
        </div>
      )}

      {/* Main Cart Content */}
      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Items Table / List */}
        <div className="lg:col-span-2">
          <ul className="divide-y divide-border rounded-xl border bg-card">
            {items.map((item) => {
              const isItemUnavailable =
                !item.is_available ||
                item.stock_qty <= 0 ||
                item.quantity > item.stock_qty;

              return (
                <li
                  key={item.public_id}
                  className={`flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6 ${
                    isItemUnavailable ? "bg-destructive/5" : ""
                  }`}
                >
                  {/* Product Info */}
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
                      {item.product_image ? (
                        <Image
                          src={item.product_image}
                          alt={item.product_name}
                          fill
                          sizes="80px"
                          className="object-cover object-center"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                          No img
                        </div>
                      )}
                    </div>

                    <div>
                      <Link
                        href={`/products/${item.product_slug}`}
                        className="font-medium text-foreground hover:underline text-sm sm:text-base line-clamp-1"
                      >
                        {item.product_name}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatPrice(item.product_price)} each
                      </p>

                      {isItemUnavailable && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-destructive">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>
                            {item.stock_qty <= 0
                              ? "Out of stock"
                              : !item.is_available
                              ? "Item no longer available"
                              : `Only ${item.stock_qty} in stock`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex items-center justify-between sm:gap-6">
                    <QuantityInput
                      value={item.quantity}
                      onChange={(newQty) =>
                        updateQuantity(item.public_id, newQty)
                      }
                      min={1}
                      max={Math.max(item.stock_qty, 1)}
                    />

                    <div className="text-right">
                      <p className="text-base font-bold text-foreground">
                        {formatPrice(item.line_total)}
                      </p>
                    </div>

                    <button
                      onClick={() => removeItem(item.public_id)}
                      className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
                      aria-label="Remove item"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex justify-between items-center">
            <Link
              href="/products"
              className="text-xs font-medium text-primary hover:underline"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Card */}
        <div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold text-card-foreground">
              Order Summary
            </h2>

            <div className="mt-6 space-y-3 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-semibold text-foreground">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Delivery</span>
                <span className="font-semibold text-foreground">
                  {formatPrice(estimatedDelivery)}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between text-sm font-bold text-foreground">
                <span>Total</span>
                <span>{formatPrice(estimatedTotal)}</span>
              </div>
            </div>

            <div className="mt-6">
              {hasUnavailableItems ? (
                <div className="space-y-2">
                  <button
                    disabled
                    className="btn-primary w-full py-3 text-sm cursor-not-allowed opacity-50"
                  >
                    Proceed to Checkout
                  </button>
                  <p className="text-[11px] text-destructive text-center">
                    Please resolve out-of-stock items above to checkout.
                  </p>
                </div>
              ) : (
                <Link
                  href="/checkout"
                  className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 shadow-md"
                >
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>

            <div className="mt-6 border-t pt-6 space-y-3 text-muted-foreground text-xs">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <span>Cash on Delivery available nationwide</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Verified secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
