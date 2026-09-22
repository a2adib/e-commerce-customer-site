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

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^01[3-9]\d{8}$/.test(val),
        "Must be a valid Bangladesh phone number (e.g. 01712345678)"
      ),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

function RegisterForm() {
  const { register: registerUser, pendingAction, clearPendingAction } = useAuth();
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
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      await registerUser(
        {
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone || null,
        },
        returnUrl
      );

      // Execute pending action if any
      if (pendingAction) {
        if (pendingAction.type === "add_to_cart") {
          addToCart(pendingAction.productId, pendingAction.quantity || 1);
        } else if (pendingAction.type === "add_to_wishlist") {
          toggleWishlist(pendingAction.productId);
        }
        clearPendingAction();
      }
    } catch (err: any) {
      setServerError(err.detail || err.message || "Failed to create account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 rounded-xl border bg-card p-8 shadow-sm">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-card-foreground">
          Create an account
        </h1>
        <p className="mt-2 text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`}
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      {serverError && (
        <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <label className="block text-xs font-medium text-foreground">
            Full Name
          </label>
          <input
            type="text"
            autoComplete="name"
            {...register("name")}
            className="mt-1.5 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-ring"
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>

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
          <label className="block text-xs font-medium text-foreground">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            autoComplete="tel"
            {...register("phone")}
            className="mt-1.5 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-ring"
            placeholder="01712345678"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-destructive">
              {errors.phone.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground">
            Password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            {...register("password")}
            className="mt-1.5 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-ring"
            placeholder="At least 8 characters"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground">
            Confirm Password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            className="mt-1.5 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-ring"
            placeholder="Repeat your password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-2.5 text-sm mt-6"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create Account <ArrowRight className="ml-1.5 h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="flex w-full max-w-md items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
