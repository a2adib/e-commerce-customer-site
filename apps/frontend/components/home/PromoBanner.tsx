import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PromoBannerSectionConfig } from "@/lib/types/api";

interface PromoBannerProps {
  config: PromoBannerSectionConfig;
}

export function PromoBanner({ config }: PromoBannerProps) {
  const content = (
    <div className="relative overflow-hidden rounded-2xl bg-muted text-white">
      <div className="relative h-64 sm:h-80 md:h-96 w-full">
        <Image
          src={config.image_url}
          alt={config.title || "Promotional Banner"}
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

        <div className="relative z-10 flex h-full max-w-xl flex-col justify-center px-6 sm:px-12">
          {config.title && (
            <h3 className="text-2xl font-black tracking-tight sm:text-4xl md:text-5xl">
              {config.title}
            </h3>
          )}
          {config.subtitle && (
            <p className="mt-3 text-sm sm:text-base text-gray-200">
              {config.subtitle}
            </p>
          )}
          {config.link && (
            <div className="mt-6">
              <span className="inline-flex items-center rounded-md bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-black shadow transition hover:bg-gray-100">
                Discover Collection
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {config.link ? (
        <Link href={config.link} className="block group">
          {content}
        </Link>
      ) : (
        content
      )}
    </section>
  );
}
