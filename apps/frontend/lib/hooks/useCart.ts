"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api-client";
import { Cart } from "../types/api";
import { useAuth } from "../auth-context";
import toast from "react-hot-toast";

export const CART_QUERY_KEY = ["cart"];

export function useCart() {
  const { isAuthenticated, requireAuth } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: cart,
    isLoading,
    isError,
    refetch,
  } = useQuery<Cart>({
    queryKey: CART_QUERY_KEY,
    queryFn: () => api.cart.get(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 mins
  });

  // Add Item Mutation
  const addMutation = useMutation({
    mutationFn: ({
      productId,
      quantity = 1,
    }: {
      productId: string;
      quantity?: number;
    }) => api.cart.addItem(productId, quantity),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(CART_QUERY_KEY, updatedCart);
      toast.success("Added to cart");
    },
    onError: (err: any) => {
      toast.error(err.detail || err.message || "Failed to add item to cart");
    },
  });

  // Update Item Mutation with optimistic update
  const updateMutation = useMutation({
    mutationFn: ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => api.cart.updateItem(itemId, quantity),
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previousCart = queryClient.getQueryData<Cart>(CART_QUERY_KEY);

      if (previousCart) {
        const newItems = previousCart.items.map((item) =>
          item.public_id === itemId
            ? {
                ...item,
                quantity,
                line_total: item.product_price * quantity,
              }
            : item
        );
        const subtotal = newItems.reduce((acc, curr) => acc + curr.line_total, 0);
        const totalItems = newItems.reduce((acc, curr) => acc + curr.quantity, 0);

        queryClient.setQueryData<Cart>(CART_QUERY_KEY, {
          ...previousCart,
          items: newItems,
          subtotal,
          total_items: totalItems,
        });
      }

      return { previousCart };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      }
      toast.error(err.detail || err.message || "Could not update quantity");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });

  // Remove Item Mutation
  const removeMutation = useMutation({
    mutationFn: (itemId: string) => api.cart.removeItem(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previousCart = queryClient.getQueryData<Cart>(CART_QUERY_KEY);

      if (previousCart) {
        const newItems = previousCart.items.filter(
          (item) => item.public_id !== itemId
        );
        const subtotal = newItems.reduce((acc, curr) => acc + curr.line_total, 0);
        const totalItems = newItems.reduce((acc, curr) => acc + curr.quantity, 0);

        queryClient.setQueryData<Cart>(CART_QUERY_KEY, {
          ...previousCart,
          items: newItems,
          subtotal,
          total_items: totalItems,
        });
      }

      return { previousCart };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      }
      toast.error(err.detail || err.message || "Failed to remove item");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });

  // Clear Cart Mutation
  const clearMutation = useMutation({
    mutationFn: () => api.cart.clear(),
    onSuccess: (emptyCart) => {
      queryClient.setQueryData(CART_QUERY_KEY, emptyCart);
      toast.success("Cart cleared");
    },
    onError: (err: any) => {
      toast.error(err.detail || err.message || "Failed to clear cart");
    },
  });

  // Helper with guest login prompt
  const addToCart = (productId: string, quantity = 1, productName?: string) => {
    requireAuth(
      () => addMutation.mutate({ productId, quantity }),
      { type: "add_to_cart", productId, quantity, productName }
    );
  };

  // Check for out-of-stock or inactive items that block checkout
  const unavailableItems = cart?.items.filter(
    (item) => !item.is_available || item.stock_qty <= 0 || item.quantity > item.stock_qty
  ) || [];

  const hasUnavailableItems = unavailableItems.length > 0;
  const itemCount = cart?.total_items || 0;
  const subtotal = cart?.subtotal || 0;

  return {
    cart,
    items: cart?.items || [],
    itemCount,
    subtotal,
    isLoading: isAuthenticated ? isLoading : false,
    isError,
    refetch,
    addToCart,
    updateQuantity: (itemId: string, quantity: number) =>
      updateMutation.mutate({ itemId, quantity }),
    removeItem: (itemId: string) => removeMutation.mutate(itemId),
    clearCart: () => clearMutation.mutate(),
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
    hasUnavailableItems,
    unavailableItems,
  };
}
