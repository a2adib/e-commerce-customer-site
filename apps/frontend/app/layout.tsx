import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Suspense } from "react";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "STOREFRONT — Curated Modern Apparel & Goods",
    template: "%s | STOREFRONT",
  },
  description: "Modern, clean, and high-performance e-commerce platform.",
  openGraph: {
    title: "STOREFRONT — Curated Modern Apparel & Goods",
    description: "Modern, clean, and high-performance e-commerce platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Providers>
          <Suspense fallback={<div className="h-16 border-b" />}>
            <Header />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
