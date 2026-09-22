"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CategoryGridSectionConfig, Category } from "@/lib/types/api";
import { api } from "@/lib/api-client";
import { ArrowRight } from "lucide-react";

interface CategoryGridProps {
  config: CategoryGridSectionConfig;
}

export function CategoryGrid({ config }: CategoryGridProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const all = await api.categories.list();
        if (config.category_slugs && config.category_slugs.length > 0) {
          const filtered = all.filter((c) =>
            config.category_slugs.includes(c.slug)
          );
          setCategories(filtered.length > 0 ? filtered : all);
        } else {
          setCategories(all);
        }
      } catch {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [config.category_slugs]);

  if (!loading && categories.length === 0) return null;

  const colsClass =
    config.columns === 3
      ? "grid-cols-2 md:grid-cols-3"
      : config.columns === 2
      ? "grid-cols-2"
      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {config.title || "Shop by Category"}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Browse our curated collections
          </p>
        </div>
        <Link
          href="/products"
          className="flex items-center text-xs font-semibold text-primary hover:underline"
        >
          View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      </div>

      <div className={`grid gap-4 sm:gap-6 ${colsClass}`}>
        {loading
          ? Array.from({ length: config.columns || 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] animate-pulse rounded-lg bg-muted"
              />
            ))
          : categories.map((cat) => (
              <Link
                key={cat.public_id}
                href={`/products?category=${cat.slug}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-muted shadow-sm transition hover:shadow-md"
              >
                {cat.image_url ? (
                  <Image
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60" />
                )}

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity group-hover:opacity-90" />

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <h3 className="text-base font-bold sm:text-lg">{cat.name}</h3>
                  {cat.description && (
                    <p className="mt-0.5 text-xs text-gray-300 line-clamp-1">
                      {cat.description}
                    </p>
                  )}
                  <span className="mt-2 inline-flex items-center text-xs font-medium text-white/90 group-hover:underline">
                    Explore <ArrowRight className="ml-1 h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}
