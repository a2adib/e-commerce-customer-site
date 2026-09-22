import { MetadataRoute } from "next";
import { api } from "@/lib/api-client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await api.products.list({ page_size: 100 });
    productEntries = products
      .filter((p) => p.is_active)
      .map((p) => ({
        url: `${baseUrl}/products/${p.slug}`,
        lastModified: new Date(p.created_at),
        changeFrequency: "daily",
        priority: 0.8,
      }));
  } catch {
    productEntries = [];
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...productEntries,
  ];
}
