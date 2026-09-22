"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { useCart } from "@/lib/hooks/useCart";
import { useAuth } from "@/lib/auth-context";
import { formatPrice } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const { items, removeFromWishlist, isLoading } = useWishlist();
  const { addToCart, isAdding } = useCart();

  const handleMoveToCart = (item: {
    product_public_id: string;
    product_name: string;
  }) => {
    addToCart(item.product_public_id, 1, item.product_name);
    removeFromWishlist(item.product_public_id);
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={<Heart className="h-10 w-10 text-muted-foreground" />}
          title="Sign in to view your wishlist"
          description="Keep track of your favorite items, get notified of sales, and save for later."
          actionText="Sign In"
          actionHref="/auth/login?returnUrl=/wishlist"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page Title */}
      <div className="border-b pb-6">
        <div className="flex items-center gap-3">
          <Heart className="h-7 w-7 fill-destructive text-destructive" />
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            My Wishlist
          </h1>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"} saved for later
        </p>
      </div>

      {isLoading ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-4 rounded-lg border p-4 animate-pulse"
            >
              <div className="h-24 w-24 rounded bg-muted shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-4 w-1/3 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            icon={<Heart className="h-10 w-10 text-muted-foreground" />}
            title="Your wishlist is empty"
            description="Explore our latest collection and tap the heart icon on any product to save it here."
            actionText="Explore Products"
            actionHref="/products"
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.public_id}
              className="group flex flex-col justify-between overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-muted">
                {item.product_image ? (
                  <Image
                    src={item.product_image}
                    alt={item.product_name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    No image available
                  </div>
                )}
                <button
                  onClick={() => removeFromWishlist(item.product_public_id)}
                  aria-label="Remove from wishlist"
                  className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur text-muted-foreground hover:bg-destructive hover:text-white transition shadow"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <Link
                    href={`/products/${item.product_slug}`}
                    className="text-base font-semibold text-foreground hover:underline line-clamp-1"
                  >
                    {item.product_name}
                  </Link>
                  <p className="mt-1 text-base font-bold text-foreground">
                    {formatPrice(item.product_price)}
                  </p>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => handleMoveToCart(item)}
                    disabled={isAdding}
                    className="btn-primary flex-1 py-2 text-xs"
                  >
                    <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                    Move to Cart
                  </button>
                  <Link
                    href={`/products/${item.product_slug}`}
                    className="btn-outline px-3 py-2 text-xs"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
