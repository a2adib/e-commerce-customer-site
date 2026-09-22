"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ShoppingBag, Trash2, ArrowRight, AlertTriangle } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { formatPrice } from "@/lib/utils";

interface MiniCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MiniCartDrawer({ isOpen, onClose }: MiniCartDrawerProps) {
  const { items, subtotal, removeItem, updateQuantity, hasUnavailableItems, itemCount } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="relative z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl transition-all duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
              {itemCount}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Unavailable items alert */}
        {hasUnavailableItems && (
          <div className="flex items-start gap-3 border-b bg-amber-50 px-6 py-3 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs leading-relaxed">
              Some items are out of stock or unavailable and cannot be checked out. Please adjust quantities or remove them.
            </p>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="rounded-full bg-muted p-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 text-base font-medium">Your cart is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Discover our latest collection and start shopping.
              </p>
              <button
                onClick={onClose}
                className="btn-primary mt-6 text-sm"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => {
                const isItemUnavailable =
                  !item.is_available || item.stock_qty <= 0 || item.quantity > item.stock_qty;

                return (
                  <li key={item.public_id} className="flex gap-4 py-4">
                    {/* Thumbnail */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-muted">
                      {item.product_image ? (
                        <Image
                          src={item.product_image}
                          alt={item.product_name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex justify-between">
                          <Link
                            href={`/products/${item.product_slug}`}
                            onClick={onClose}
                            className="font-medium text-foreground hover:underline line-clamp-1"
                          >
                            {item.product_name}
                          </Link>
                          <button
                            onClick={() => removeItem(item.public_id)}
                            className="ml-2 text-muted-foreground hover:text-destructive transition"
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="mt-1 text-sm font-semibold">
                          {formatPrice(item.product_price)}
                        </p>
                        {isItemUnavailable && (
                          <span className="mt-1 inline-block text-xs font-semibold text-destructive">
                            {item.stock_qty <= 0
                              ? "Out of stock"
                              : `Only ${item.stock_qty} left`}
                          </span>
                        )}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-md border border-input">
                          <button
                            onClick={() =>
                              item.quantity > 1
                                ? updateQuantity(item.public_id, item.quantity - 1)
                                : removeItem(item.public_id)
                            }
                            className="px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.public_id, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.stock_qty}
                            className="px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted disabled:opacity-40"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm font-semibold">
                          {formatPrice(item.line_total)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t bg-muted/40 p-6">
            <div className="flex justify-between text-base font-semibold">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Delivery fees calculated at checkout.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                href="/cart"
                onClick={onClose}
                className="btn-outline justify-center text-center"
              >
                View Full Cart
              </Link>
              <Link
                href={hasUnavailableItems ? "#" : "/checkout"}
                onClick={(e) => {
                  if (hasUnavailableItems) {
                    e.preventDefault();
                  } else {
                    onClose();
                  }
                }}
                className={`btn-primary justify-center text-center ${
                  hasUnavailableItems ? "cursor-not-allowed opacity-50" : ""
                }`}
                aria-disabled={hasUnavailableItems}
              >
                Checkout <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
