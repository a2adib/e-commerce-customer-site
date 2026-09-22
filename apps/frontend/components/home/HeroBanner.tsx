"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HeroBannerSectionConfig } from "@/lib/types/api";

interface HeroBannerProps {
  config: HeroBannerSectionConfig;
}

export function HeroBanner({ config }: HeroBannerProps) {
  const slides = config.slides || [];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1 || isPaused || config.autoplay === false) return;
    const interval = (config.interval_seconds || 5) * 1000;
    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [slides.length, isPaused, config.autoplay, config.interval_seconds, nextSlide]);

  if (slides.length === 0) return null;

  const slide = slides[currentSlide];

  return (
    <section
      className="relative w-full overflow-hidden bg-muted"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Hero Carousel"
    >
      <div className="relative h-[65vh] min-h-[450px] max-h-[700px] w-full">
        {/* Background Image */}
        <Image
          src={slide.image_url}
          alt={slide.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center transition-opacity duration-700"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Slide Content */}
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 text-center text-white sm:px-6 lg:px-8">
          <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl drop-shadow-sm">
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="mt-4 max-w-xl text-base text-gray-200 sm:text-lg">
              {slide.subtitle}
            </p>
          )}
          {slide.cta_link && (
            <Link
              href={slide.cta_link}
              className="mt-8 inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-black shadow-lg transition-transform hover:scale-105 hover:bg-gray-100"
            >
              {slide.cta_text || "Shop Now"}
            </Link>
          )}
        </div>

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/70 sm:left-8"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/70 sm:right-8"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Slide Indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 inset-x-0 z-20 flex justify-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-8 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
