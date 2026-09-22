"use client";

import React from "react";
import { useCart } from "@/lib/hooks/useCart";
import { ShoppingBag, Loader2 } from "lucide-react";

interface AddToCartButtonProps {
  productId: string;
  name: string;
  quantity?: number;
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "outline" | "secondary";
  showIcon?: boolean;
}

export function AddToCartButton({
  productId,
  name,
  quantity = 1,
  disabled = false,
  className = "",
  variant = "primary",
  showIcon = true,
}: AddToCartButtonProps) {
  const { addToCart, isAdding } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || isAdding) return;
    addToCart(productId, quantity, name);
  };

  const baseStyles =
    variant === "primary"
      ? "btn-primary"
      : variant === "outline"
      ? "btn-outline"
      : "btn-secondary";

  return (
    <button
      onClick={handleAdd}
      disabled={disabled || isAdding}
      className={`${baseStyles} ${className}`}
      aria-label={`Add ${name} to cart`}
    >
      {isAdding ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Adding...</span>
        </>
      ) : (
        <>
          {showIcon && <ShoppingBag className="h-4 w-4" />}
          <span>{disabled ? "Out of Stock" : "Add to Cart"}</span>
        </>
      )}
    </button>
  );
}
