"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/hooks/useCart";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { Loader2, ArrowRight } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const { login, pendingAction, clearPendingAction } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist } = useWishlist();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      await login(data, returnUrl);

      // If there was a pending action from a guest click, execute it
      if (pendingAction) {
        if (pendingAction.type === "add_to_cart") {
          addToCart(pendingAction.productId, pendingAction.quantity || 1);
        } else if (pendingAction.type === "add_to_wishlist") {
          toggleWishlist(pendingAction.productId);
        }
        clearPendingAction();
      }
    } catch (err: any) {
      setServerError(
        err.detail || err.message || "Failed to sign in. Please verify your credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 rounded-xl border bg-card p-8 shadow-sm">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-card-foreground">
          Sign in to your account
        </h1>
        <p className="mt-2 text-xs text-muted-foreground">
          Or{" "}
          <Link
            href={`/auth/register?returnUrl=${encodeURIComponent(returnUrl)}`}
            className="font-medium text-primary hover:underline"
          >
            create a new account
          </Link>
        </p>
      </div>

      {pendingAction && (
        <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground border border-dashed">
          💡 Sign in to complete adding <strong>{pendingAction.productName || "item"}</strong> to your {pendingAction.type === "add_to_cart" ? "cart" : "wishlist"}.
        </div>
      )}

      {serverError && (
        <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div>
          <label className="block text-xs font-medium text-foreground">
            Email Address
          </label>
          <input
            type="email"
            autoComplete="email"
            {...register("email")}
            className="mt-1.5 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-ring"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-foreground">
              Password
            </label>
          </div>
          <input
            type="password"
            autoComplete="current-password"
            {...register("password")}
            className="mt-1.5 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-ring"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-2.5 text-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign In <ArrowRight className="ml-1.5 h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="flex w-full max-w-md items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
