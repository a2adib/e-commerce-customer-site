import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Product, Category } from "@/lib/types/api";
import { ProductCard } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Search, SlidersHorizontal } from "lucide-react";

export const revalidate = 60;

interface ProductsPageProps {
  searchParams: {
    search?: string;
    category?: string;
    price_sort?: "asc" | "desc";
    page?: string;
    min_price?: string;
    max_price?: string;
  };
}

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const categoryName = searchParams.category
    ? `in ${searchParams.category.replace("-", " ")}`
    : "All Products";
  const searchPart = searchParams.search ? `for "${searchParams.search}"` : "";

  return {
    title: `Products ${categoryName} ${searchPart}`,
    description:
      "Explore our collection of premium lifestyle, streetwear, and essentials.",
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const currentPage = parseInt(searchParams.page || "1", 10);
  const pageSize = 12;

  let products: Product[] = [];
  let categories: Category[] = [];

  try {
    const [fetchedProducts, fetchedCategories] = await Promise.all([
      api.products.list({
        search: searchParams.search,
        category: searchParams.category,
        price_sort: searchParams.price_sort,
        min_price: searchParams.min_price ? Number(searchParams.min_price) : undefined,
        max_price: searchParams.max_price ? Number(searchParams.max_price) : undefined,
        page: currentPage,
        page_size: pageSize,
      }),
      api.categories.list(),
    ]);

    // Backend ensures is_active=true; also safeguard on frontend
    products = fetchedProducts.filter((p) => p.is_active);
    categories = fetchedCategories.filter((c) => c.is_active);
  } catch {
    products = [];
    categories = [];
  }

  // Active category lookup
  const currentCategory = categories.find((c) => c.slug === searchParams.category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl capitalize">
          {currentCategory ? currentCategory.name : "All Products"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {currentCategory?.description ||
            "Discover handcrafted streetwear, elevated essentials, and modern lifestyle items."}
        </p>

        {/* Categories Bar */}
        <div className="mt-6 flex flex-wrap gap-2 overflow-x-auto pb-2">
          <Link
            href="/products"
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              !searchParams.category
                ? "bg-primary text-primary-foreground shadow"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All Categories
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.public_id}
              href={`/products?category=${cat.slug}${
                searchParams.price_sort ? `&price_sort=${searchParams.price_sort}` : ""
              }`}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                searchParams.category === cat.slug
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            Showing <strong className="text-foreground">{products.length}</strong> products
          </span>
          {searchParams.search && (
            <span>
              matching &quot;<strong>{searchParams.search}</strong>&quot;
            </span>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">Sort by:</span>
          <div className="flex rounded-md border border-input bg-background p-0.5 text-xs">
            <Link
              href={`/products?${new URLSearchParams({
                ...(searchParams.category ? { category: searchParams.category } : {}),
                ...(searchParams.search ? { search: searchParams.search } : {}),
                price_sort: "asc",
              }).toString()}`}
              className={`rounded px-2.5 py-1 transition ${
                searchParams.price_sort === "asc"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Price: Low to High
            </Link>
            <Link
              href={`/products?${new URLSearchParams({
                ...(searchParams.category ? { category: searchParams.category } : {}),
                ...(searchParams.search ? { search: searchParams.search } : {}),
                price_sort: "desc",
              }).toString()}`}
              className={`rounded px-2.5 py-1 transition ${
                searchParams.price_sort === "desc"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Price: High to Low
            </Link>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="mt-8">
        {products.length === 0 ? (
          <EmptyState
            title="No products found"
            description="We couldn't find any active products matching your criteria. Try adjusting your filters or search keywords."
            actionText="Clear All Filters"
            actionHref="/products"
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.public_id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {products.length >= pageSize && (
        <div className="mt-12 flex justify-center gap-3">
          {currentPage > 1 && (
            <Link
              href={`/products?${new URLSearchParams({
                ...searchParams,
                page: (currentPage - 1).toString(),
              }).toString()}`}
              className="btn-outline text-xs"
            >
              Previous Page
            </Link>
          )}
          <Link
            href={`/products?${new URLSearchParams({
              ...searchParams,
              page: (currentPage + 1).toString(),
            }).toString()}`}
            className="btn-primary text-xs"
          >
            Next Page
          </Link>
        </div>
      )}
    </div>
  );
}
