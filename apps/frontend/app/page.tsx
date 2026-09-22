import React from "react";
import { api } from "@/lib/api-client";
import { HomePageData, HomeSection } from "@/lib/types/api";
import { SectionRenderer } from "@/components/home/SectionRenderer";

// ISR periodic revalidation
export const revalidate = 60;

// Default fallback sections when published home page has not been configured yet by admin
const DEFAULT_FALLBACK_SECTIONS: HomeSection[] = [
  {
    id: "default-hero",
    type: "hero_banner",
    is_visible: true,
    config: {
      slides: [
        {
          image_url:
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80",
          title: "Curated for Culture, Built for Everyday",
          subtitle:
            "Discover premium essentials and contemporary streetwear crafted with modern aesthetics.",
          cta_text: "Explore Collection",
          cta_link: "/products",
        },
        {
          image_url:
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop&q=80",
          title: "New Season Arrivals",
          subtitle: "Explore minimalistic silhouettes and effortless style.",
          cta_text: "Shop New Arrivals",
          cta_link: "/products?price_sort=desc",
        },
      ],
      autoplay: true,
      interval_seconds: 6,
    },
  },
  {
    id: "default-categories",
    type: "category_grid",
    is_visible: true,
    config: {
      title: "Featured Categories",
      columns: 4,
      category_slugs: [],
    },
  },
  {
    id: "default-featured",
    type: "featured_products",
    is_visible: true,
    config: {
      title: "Trending Products",
      limit: 8,
    },
  },
  {
    id: "default-promo",
    type: "promo_banner",
    is_visible: true,
    config: {
      image_url:
        "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1600&auto=format&fit=crop&q=80",
      title: "Limited Edition Release",
      subtitle: "Elevate your wardrobe with our latest capsule drop.",
      link: "/products",
    },
  },
];

async function getHomeData(): Promise<HomePageData | null> {
  try {
    const data = await api.home.getPublished();
    return data;
  } catch (error) {
    return null;
  }
}

export default async function HomePage() {
  const homeData = await getHomeData();

  const sectionsToRender =
    homeData && homeData.sections && homeData.sections.length > 0
      ? homeData.sections
      : DEFAULT_FALLBACK_SECTIONS;

  return (
    <div className="flex flex-col min-h-screen">
      <SectionRenderer sections={sectionsToRender} />
    </div>
  );
}
