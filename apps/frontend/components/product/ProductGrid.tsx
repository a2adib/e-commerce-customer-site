import React from "react";
import { Product } from "@/lib/types/api";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "../ui/EmptyState";

interface ProductGridProps {
  products: Product[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ProductGrid({
  products,
  emptyTitle = "No products found",
  emptyDescription = "Check back soon for new arrivals.",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionText="Browse All"
        actionHref="/products"
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.public_id} product={product} />
      ))}
    </div>
  );
}
