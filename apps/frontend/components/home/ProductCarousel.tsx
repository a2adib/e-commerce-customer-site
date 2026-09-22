"use client";

import React, { useEffect, useState, useRef } from "react";
import { ProductCarouselSectionConfig, Product } from "@/lib/types/api";
import { api } from "@/lib/api-client";
import { ProductCard } from "../product/ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductCarouselProps {
  config: ProductCarouselSectionConfig;
}

export function ProductCarousel({ config }: ProductCarouselProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        let items: Product[] = [];
        if (config.source === "category" && config.category_slug) {
          items = await api.products.list({
            category: config.category_slug,
            page_size: config.limit || 10,
          });
        } else {
          // latest or manual
          items = await api.products.list({
            page_size: config.limit || 10,
            price_sort: "desc",
          });
          if (
            config.source === "manual" &&
            config.product_ids &&
            config.product_ids.length > 0
          ) {
            items = items.filter((p) =>
              config.product_ids!.includes(p.public_id)
            );
          }
        }
        setProducts(items);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [config.source, config.category_slug, config.limit, config.product_ids]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth } = scrollContainerRef.current;
    const offset = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
    scrollContainerRef.current.scrollTo({
      left: scrollLeft + offset,
      behavior: "smooth",
    });
  };

  if (!loading && products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {config.title}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-input bg-background shadow-sm transition hover:bg-accent"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-input bg-background shadow-sm transition hover:bg-accent"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-64 shrink-0 snap-start rounded-lg border bg-card p-4 space-y-3 animate-pulse"
              >
                <div className="aspect-square w-full rounded-md bg-muted" />
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-4 w-1/2 rounded bg-muted" />
              </div>
            ))
          : products.map((product) => (
              <div
                key={product.public_id}
                className="w-64 sm:w-72 shrink-0 snap-start"
              >
                <ProductCard product={product} />
              </div>
            ))}
      </div>
    </section>
  );
}
