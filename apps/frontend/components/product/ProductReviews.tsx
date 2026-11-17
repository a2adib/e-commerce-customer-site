"use client";

import React, { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { Review, ProductReviewsSummary } from "@/lib/types/api";
import { useAuth } from "@/lib/auth-context";
import { Star, CheckCircle2, MessageSquare, Loader2, User } from "lucide-react";
import toast from "react-hot-toast";

interface ProductReviewsProps {
  productId: string;
  productSlug: string;
}

export function ProductReviews({ productId, productSlug }: ProductReviewsProps) {
  const { user, isAuthenticated } = useAuth();
  const [summary, setSummary] = useState<ProductReviewsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const data = await api.reviews.getForProduct(productSlug);
      setSummary(data);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [productSlug]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please enter your review comments");
      return;
    }

    setSubmitting(true);
    try {
      await api.reviews.submit(productId, {
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
      });
      toast.success("Review submitted! Thank you for your feedback.");
      setTitle("");
      setComment("");
      setShowForm(false);
      fetchReviews();
    } catch (err: any) {
      toast.error(err.detail || err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-16 border-t pt-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-8 border-b">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">
            Customer Reviews
          </h2>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(summary?.avg_rating || 0)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-bold text-foreground">
              {summary ? summary.avg_rating.toFixed(1) : "0.0"}
            </span>
            <span className="text-xs text-muted-foreground">
              based on {summary?.total_reviews || 0} {summary?.total_reviews === 1 ? "review" : "reviews"}
            </span>
          </div>
        </div>

        {isAuthenticated ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary self-start text-xs font-semibold py-2.5 px-5"
          >
            {showForm ? "Cancel Review" : "Write a Review"}
          </button>
        ) : (
          <p className="text-xs text-muted-foreground">
            Please log in to leave a verified review.
          </p>
        )}
      </div>

      {/* Review Submission Form */}
      {showForm && (
        <form
          onSubmit={handleSubmitReview}
          className="mt-6 rounded-xl border bg-card p-6 shadow-sm space-y-4 max-w-xl"
        >
          <h3 className="text-sm font-bold text-foreground">Write Your Review</h3>

          {/* Star selector */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Rating
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating !== null ? hoverRating : rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 focus:outline-none transition transform hover:scale-110"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        active ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                );
              })}
              <span className="ml-2 text-xs font-semibold text-muted-foreground">
                {rating} of 5 stars
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Review Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Great fit and premium quality!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs outline-none transition focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Your Feedback *
            </label>
            <textarea
              rows={4}
              placeholder="Share what you liked or disliked about this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              className="w-full rounded-md border border-input bg-background p-3 text-xs outline-none transition focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary text-xs font-semibold py-2 px-6 flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </button>
        </form>
      )}

      {/* Reviews List */}
      <div className="mt-8 space-y-6">
        {loading ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
            Loading reviews...
          </div>
        ) : !summary || summary.reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center text-xs text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="font-semibold text-foreground text-sm">No reviews yet</p>
            <p className="mt-1">Be the first to share your thoughts on this product.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {summary.reviews.map((rev) => (
              <div key={rev.public_id} className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-bold text-xs">
                      {rev.user_name ? rev.user_name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{rev.user_name}</p>
                      {rev.is_verified_purchase && (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Verified Purchase</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(rev.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3.5 w-3.5 ${
                        star <= rev.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/20"
                      }`}
                    />
                  ))}
                </div>

                {rev.title && (
                  <h4 className="mt-2 text-xs font-bold text-foreground">{rev.title}</h4>
                )}

                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
