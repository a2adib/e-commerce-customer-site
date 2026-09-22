"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/types/api";
import { formatPrice } from "@/lib/utils";
import { ProductGallery } from "@/components/product/ProductGallery";
import { QuantityInput } from "@/components/product/QuantityInput";
import { useCart } from "@/lib/hooks/useCart";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { ProductCard } from "@/components/product/ProductCard";
import {
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailView({
  product,
  relatedProducts,
}: ProductDetailViewProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, isAdding } = useCart();
  const { isInWishlist, toggleWishlist, isToggling } = useWishlist();

  const isFavorited = isInWishlist(product.public_id);
  const isOutOfStock = product.stock_qty <= 0;
  const maxAvailable = Math.min(product.stock_qty, 10);

  const discountPercent =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(
          ((product.compare_at_price - product.price) / product.compare_at_price) * 100
        )
      : null;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product.public_id, quantity, product.name);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        {product.category_name && (
          <>
            <span>/</span>
            <span className="text-foreground">{product.category_name}</span>
          </>
        )}
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Left: Gallery */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Right: Product Details & Actions */}
        <div className="flex flex-col">
          {product.category_name && (
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {product.category_name}
            </p>
          )}

          <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {product.name}
          </h1>

          {product.sku && (
            <p className="mt-1 text-xs text-muted-foreground">SKU: {product.sku}</p>
          )}

          {/* Pricing */}
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
                <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive">
                  Save {discountPercent}%
                </span>
              </>
            )}
          </div>

          {/* Stock Status Badge */}
          <div className="mt-4 flex items-center gap-2">
            {isOutOfStock ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                <XCircle className="h-4 w-4" /> Out of Stock
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> In Stock ({product.stock_qty} units available)
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Description
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Quantity & Action Buttons */}
          <div className="mt-8 border-t pt-8 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Quantity:
              </span>
              <QuantityInput
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={maxAvailable || 1}
                disabled={isOutOfStock}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className="btn-primary flex-1 py-3 text-sm font-semibold shadow-md"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </>
                )}
              </button>

              <button
                onClick={() => toggleWishlist(product.public_id, product.name)}
                disabled={isToggling}
                className={`flex h-12 w-12 items-center justify-center rounded-lg border transition ${
                  isFavorited
                    ? "border-destructive/30 bg-destructive/10 text-destructive"
                    : "border-input bg-background text-foreground hover:bg-muted"
                }`}
                aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  className={`h-5 w-5 ${isFavorited ? "fill-destructive" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Assurances */}
          <div className="mt-8 grid grid-cols-3 gap-4 border-t pt-6 text-center">
            <div className="flex flex-col items-center">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <span className="mt-1 text-[11px] font-medium text-foreground">
                Fast Delivery
              </span>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              <span className="mt-1 text-[11px] font-medium text-foreground">
                100% Authentic
              </span>
            </div>
            <div className="flex flex-col items-center">
              <RotateCcw className="h-5 w-5 text-muted-foreground" />
              <span className="mt-1 text-[11px] font-medium text-foreground">
                7 Days Return
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 border-t pt-12">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            You Might Also Like
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            More items from our collection
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.public_id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
