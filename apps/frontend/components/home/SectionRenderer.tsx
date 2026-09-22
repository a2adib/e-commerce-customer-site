"use client";

import React from "react";
import { HomeSection } from "@/lib/types/api";
import { HeroBanner } from "./HeroBanner";
import { CategoryGrid } from "./CategoryGrid";
import { ProductCarousel } from "./ProductCarousel";
import { PromoBanner } from "./PromoBanner";
import { RichTextSection } from "./RichTextSection";
import { FeaturedProductsSection } from "./FeaturedProductsSection";

// Section Registry mapping
const SECTION_COMPONENTS: Record<string, React.ComponentType<{ config: any }>> = {
  hero_banner: HeroBanner,
  category_grid: CategoryGrid,
  product_carousel: ProductCarousel,
  promo_banner: PromoBanner,
  rich_text: RichTextSection,
  featured_products: FeaturedProductsSection,
};

interface SectionRendererProps {
  sections?: HomeSection[];
}

export function SectionRenderer({ sections = [] }: SectionRendererProps) {
  if (!sections || sections.length === 0) return null;

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        // Requirement: Hidden sections are never rendered
        if (!section.is_visible) {
          return null;
        }

        const Component = SECTION_COMPONENTS[section.type];

        // Requirement: Unknown section types are skipped safely
        if (!Component) {
          if (process.env.NODE_ENV !== "production") {
            console.warn(`[SectionRenderer] Unknown section type: "${section.type}" skipped safely.`);
          }
          return null;
        }

        return <Component key={section.id} config={section.config} />;
      })}
    </div>
  );
}
