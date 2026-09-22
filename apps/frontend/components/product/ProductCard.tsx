"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { Product } from "@/lib/types/api";
import { formatPrice } from "@/lib/utils";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { useCart } from "@/lib/hooks/useCart";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { isInWishlist, toggleWishlist, isToggling } = useWishlist();
  const { addToCart, isAdding } = useCart();

  const isFavorited = isInWishlist(product.public_id);
  const isOutOfStock = product.stock_qty <= 0;

  // Calculate discount percentage if compare_at_price exists
  const discountPercent =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(
          ((product.compare_at_price - product.price) / product.compare_at_price) * 100
        )
      : null;

  const primaryImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.public_id, product.name);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product.public_id, 1, product.name);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
      {/* Thumbnail & Badges Container */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square w-full overflow-hidden bg-muted"
      >
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {discountPercent && !isOutOfStock && (
            <span className="rounded bg-destructive px-2 py-0.5 text-[11px] font-bold text-destructive-foreground">
              -{discountPercent}%
            </span>
          )}
          {isOutOfStock && (
            <span className="rounded bg-muted-foreground/80 px-2 py-0.5 text-[11px] font-semibold text-white">
              Out of Stock
            </span>
          )}
          {product.is_featured && !isOutOfStock && (
            <span className="rounded bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          disabled={isToggling}
          aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm text-foreground shadow transition hover:scale-110 hover:bg-background"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isFavorited ? "fill-destructive text-destructive" : "text-muted-foreground"
            }`}
          />
        </button>

        {/* Quick Add to Cart overlay button */}
        <div className="absolute inset-x-2 bottom-2 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hidden sm:block">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className="btn-primary w-full py-2 text-xs font-semibold shadow-lg backdrop-blur"
          >
            <ShoppingBag className="h-3.5 w-3.5 mr-1" />
            {isOutOfStock ? "Out of Stock" : "Quick Add"}
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {product.category_name && (
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            {product.category_name}
          </p>
        )}

        <Link
          href={`/products/${product.slug}`}
          className="mt-1 text-sm font-medium line-clamp-1 hover:underline"
        >
          {product.name}
        </Link>

        {/* Price row */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>

        {/* Mobile-only Add to Cart button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          className="btn-outline mt-3 w-full py-2 text-xs sm:hidden"
        >
          <ShoppingBag className="h-3.5 w-3.5 mr-1" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
