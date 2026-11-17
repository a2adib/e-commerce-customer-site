"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Search,
  Menu,
  X,
  LogOut,
  Package,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/hooks/useCart";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { MiniCartDrawer } from "../cart/MiniCartDrawer";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.settings.get(),
  });

  useEffect(() => {
    const q = searchParams.get("search");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Mobile Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-md p-2 text-foreground hover:bg-muted lg:hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <Link href="/" className="flex items-center gap-2">
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt={settings?.brand_name || "Storefront"} className="h-8 object-contain" />
              ) : (
                <span className="text-xl font-black tracking-wider uppercase text-foreground">
                  {settings?.brand_name || "STOREFRONT"}
                </span>
              )}
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex lg:items-center lg:gap-6 ml-6">
              <Link
                href="/"
                className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
              >
                Home
              </Link>
              <Link
                href="/products"
                className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
              >
                All Products
              </Link>
              <Link
                href="/products?featured=true"
                className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
              >
                Featured
              </Link>
              <Link
                href="/track-order"
                className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
              >
                Track Order
              </Link>
            </nav>
          </div>

          {/* Center: Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-sm mx-6 relative"
          >
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-input bg-muted/40 py-2 pl-4 pr-10 text-sm outline-none transition focus:border-primary focus:bg-background"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Submit search"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist Icon */}
            <Link
              href="/wishlist"
              className="relative rounded-full p-2 text-foreground hover:bg-muted transition"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon & Badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative rounded-full p-2 text-foreground hover:bg-muted transition"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Dropdown */}
            <div className="relative">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 rounded-full p-1.5 sm:px-3 sm:py-1.5 text-sm font-medium hover:bg-muted transition"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted font-semibold text-xs uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <span className="hidden sm:inline-block max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 rounded-md border bg-popover py-1 shadow-lg z-40 text-popover-foreground">
                        <div className="border-b px-4 py-2">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {user.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                        <Link
                          href="/account"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                        >
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                          My Profile
                        </Link>
                        <Link
                          href="/account/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                        >
                          <Package className="h-4 w-4 text-muted-foreground" />
                          Orders
                        </Link>
                        <Link
                          href="/account#addresses"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                        >
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          Addresses
                        </Link>
                        <div className="border-t">
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              logout();
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link
                    href="/auth/login"
                    className="rounded-md px-3 py-1.5 text-sm font-medium hover:bg-muted transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="hidden sm:inline-flex btn-primary text-xs py-1.5 px-3"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search & Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="border-t bg-background px-4 py-4 lg:hidden">
            <form onSubmit={handleSearchSubmit} className="mb-4 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-input bg-muted/30 py-2 pl-4 pr-10 text-sm outline-none"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>

            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                Home
              </Link>
              <Link
                href="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                All Products
              </Link>
              <Link
                href="/track-order"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                Track Order
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                Wishlist ({wishlistCount})
              </Link>
              <Link
                href="/cart"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                Cart ({cartCount})
              </Link>
              {isAuthenticated && (
                <Link
                  href="/account/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  My Orders
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Mini Cart Drawer Component */}
      <MiniCartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
