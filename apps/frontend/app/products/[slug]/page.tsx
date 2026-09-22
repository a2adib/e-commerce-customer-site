import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api-client";
import { Product } from "@/lib/types/api";
import { ProductDetailView } from "./ProductDetailView";

export const revalidate = 60;

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  try {
    const product = await api.products.getBySlug(params.slug);
    if (!product || !product.is_active) {
      return { title: "Product Not Found" };
    }

    const primaryImage = product.images?.[0];

    return {
      title: `${product.name} — Buy Online`,
      description:
        product.description?.slice(0, 160) ||
        `Buy ${product.name} at the best price online.`,
      openGraph: {
        title: product.name,
        description:
          product.description?.slice(0, 160) ||
          `Buy ${product.name} at the best price online.`,
        images: primaryImage ? [{ url: primaryImage }] : [],
      },
    };
  } catch {
    return { title: "Product Not Found" };
  }
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  let product: Product | null = null;
  let relatedProducts: Product[] = [];

  try {
    product = await api.products.getBySlug(params.slug);
  } catch (error) {
    product = null;
  }

  // Requirement: Inactive or missing products show a friendly 404
  if (!product || !product.is_active) {
    notFound();
  }

  // Fetch related products (e.g. same category)
  try {
    const items = await api.products.list({
      category: product.category_public_id,
      page_size: 5,
    });
    relatedProducts = items
      .filter((p) => p.public_id !== product!.public_id && p.is_active)
      .slice(0, 4);
  } catch {
    relatedProducts = [];
  }

  return (
    <ProductDetailView
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
