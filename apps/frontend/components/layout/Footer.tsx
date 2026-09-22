"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, Headphones } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/20">
      {/* Features Bar */}
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-muted p-2.5">
                <Truck className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-xs font-semibold">Fast Delivery</p>
                <p className="text-[11px] text-muted-foreground">Nationwide shipping</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-muted p-2.5">
                <ShieldCheck className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-xs font-semibold">Secure Payment</p>
                <p className="text-[11px] text-muted-foreground">Cash on Delivery</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-muted p-2.5">
                <RotateCcw className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-xs font-semibold">Easy Returns</p>
                <p className="text-[11px] text-muted-foreground">7-day replacement</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-muted p-2.5">
                <Headphones className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-xs font-semibold">24/7 Support</p>
                <p className="text-[11px] text-muted-foreground">Dedicated helpline</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <span className="text-lg font-black tracking-wider uppercase">
              STORE<span className="text-muted-foreground">FRONT</span>
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Curated premium lifestyle and streetwear apparel designed for comfort, style, and everyday expression.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Shop
            </h3>
            <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/products" className="hover:text-foreground transition">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?featured=true" className="hover:text-foreground transition">
                  Featured Items
                </Link>
              </li>
              <li>
                <Link href="/products?price_sort=desc" className="hover:text-foreground transition">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-foreground transition">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Account
            </h3>
            <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/account" className="hover:text-foreground transition">
                  My Profile
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-foreground transition">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-foreground transition">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/account#addresses" className="hover:text-foreground transition">
                  Saved Addresses
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Newsletter
            </h3>
            <p className="mt-4 text-xs text-muted-foreground">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="mt-4 flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="btn-primary text-xs px-3 py-2 shrink-0"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} STOREFRONT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
