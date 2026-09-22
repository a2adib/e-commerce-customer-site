"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api-client";
import { WishlistItem } from "../types/api";
import { useAuth } from "../auth-context";
import toast from "react-hot-toast";

export const WISHLIST_QUERY_KEY = ["wishlist"];

export function useWishlist() {
  const { isAuthenticated, requireAuth } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: items = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<WishlistItem[]>({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: () => api.wishlist.list(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  // Add to Wishlist Mutation
  const addMutation = useMutation({
    mutationFn: (productId: string) => api.wishlist.add(productId),
    onSuccess: (newItem) => {
      queryClient.setQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY, (old = []) => [
        newItem,
        ...old.filter((i) => i.product_public_id !== newItem.product_public_id),
      ]);
      toast.success("Added to wishlist", { icon: "❤️" });
    },
    onError: (err: any) => {
      toast.error(err.detail || err.message || "Failed to add to wishlist");
    },
  });

  // Remove from Wishlist Mutation
  const removeMutation = useMutation({
    mutationFn: (productId: string) => api.wishlist.remove(productId),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_QUERY_KEY });
      const previous = queryClient.getQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY);

      if (previous) {
        queryClient.setQueryData<WishlistItem[]>(
          WISHLIST_QUERY_KEY,
          previous.filter((i) => i.product_public_id !== productId)
        );
      }
      return { previous };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(WISHLIST_QUERY_KEY, context.previous);
      }
      toast.error(err.detail || err.message || "Failed to remove from wishlist");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
    },
  });

  const isInWishlist = (productId: string): boolean => {
    return items.some((item) => item.product_public_id === productId);
  };

  const toggleWishlist = (productId: string, productName?: string) => {
    requireAuth(
      () => {
        if (isInWishlist(productId)) {
          removeMutation.mutate(productId);
          toast("Removed from wishlist", { icon: "💔" });
        } else {
          addMutation.mutate(productId);
        }
      },
      { type: "add_to_wishlist", productId, productName }
    );
  };

  const removeFromWishlist = (productId: string) => {
    removeMutation.mutate(productId);
  };

  return {
    items,
    itemCount: items.length,
    isLoading: isAuthenticated ? isLoading : false,
    isError,
    refetch,
    isInWishlist,
    toggleWishlist,
    removeFromWishlist,
    isToggling: addMutation.isPending || removeMutation.isPending,
  };
}
