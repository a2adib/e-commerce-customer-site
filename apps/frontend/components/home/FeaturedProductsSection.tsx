"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FeaturedProductsSectionConfig, Product } from "@/lib/types/api";
import { api } from "@/lib/api-client";
import { ProductCard } from "../product/ProductCard";
import { ArrowRight } from "lucide-react";

interface FeaturedProductsSectionProps {
  config: FeaturedProductsSectionConfig;
}

export function FeaturedProductsSection({
  config,
}: FeaturedProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const items = await api.products.list({
          page_size: config.limit || 8,
        });
        setProducts(items);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [config.limit]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {config.title || "Featured Products"}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Handpicked streetwear and everyday essentials
          </p>
        </div>
        <Link
          href="/products"
          className="flex items-center text-xs font-semibold text-primary hover:underline"
        >
          View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: config.limit || 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border bg-card p-4 space-y-3 animate-pulse"
              >
                <div className="aspect-square w-full rounded-md bg-muted" />
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-4 w-1/2 rounded bg-muted" />
              </div>
            ))
          : products.map((product) => (
              <ProductCard key={product.public_id} product={product} />
            ))}
      </div>
    </section>
  );
}
