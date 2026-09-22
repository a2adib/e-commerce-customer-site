"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AddressCreatePayload } from "@/lib/types/api";
import { Loader2 } from "lucide-react";

export const addressSchema = z.object({
  full_name: z.string().min(2, "Full name is required (at least 2 characters)"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^01[3-9]\d{8}$/,
      "Must be a valid Bangladesh phone number (11 digits, e.g. 017XXXXXXXX)"
    ),
  address_line: z
    .string()
    .min(5, "Address line is required (at least 5 characters)"),
  city: z.string().min(2, "City is required"),
  district: z.string().min(2, "District is required"),
  postal_code: z.string().optional(),
  is_default: z.boolean(),
});

export type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
  initialValues?: Partial<AddressFormData>;
  onSubmit: (data: AddressFormData) => Promise<void>;
  onCancel?: () => void;
  submitButtonText?: string;
  isSubmitting?: boolean;
}

export function AddressForm({
  initialValues,
  onSubmit,
  onCancel,
  submitButtonText = "Save Address",
  isSubmitting = false,
}: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      full_name: initialValues?.full_name || "",
      phone: initialValues?.phone || "",
      address_line: initialValues?.address_line || "",
      city: initialValues?.city || "",
      district: initialValues?.district || "",
      postal_code: initialValues?.postal_code || "",
      is_default: initialValues?.is_default || false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-foreground">
            Full Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            {...register("full_name")}
            className="mt-1.5 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs outline-none transition focus:border-primary focus:ring-1 focus:ring-ring"
            placeholder="e.g. Tanvir Ahmed"
          />
          {errors.full_name && (
            <p className="mt-1 text-[11px] text-destructive">
              {errors.full_name.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-foreground">
            Phone Number (Bangladesh 01XXXXXXXXX) <span className="text-destructive">*</span>
          </label>
          <input
            type="tel"
            {...register("phone")}
            className="mt-1.5 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs outline-none transition focus:border-primary focus:ring-1 focus:ring-ring"
            placeholder="01712345678"
          />
          {errors.phone && (
            <p className="mt-1 text-[11px] text-destructive">
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      {/* Address Line */}
      <div>
        <label className="block text-xs font-semibold text-foreground">
          Street / Delivery Address <span className="text-destructive">*</span>
        </label>
        <textarea
          rows={2}
          {...register("address_line")}
          className="mt-1.5 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs outline-none transition focus:border-primary focus:ring-1 focus:ring-ring"
          placeholder="House #, Road #, Area / Block"
        />
        {errors.address_line && (
          <p className="mt-1 text-[11px] text-destructive">
            {errors.address_line.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* City */}
        <div>
          <label className="block text-xs font-semibold text-foreground">
            City <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            {...register("city")}
            className="mt-1.5 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs outline-none transition focus:border-primary focus:ring-1 focus:ring-ring"
            placeholder="e.g. Dhaka"
          />
          {errors.city && (
            <p className="mt-1 text-[11px] text-destructive">
              {errors.city.message}
            </p>
          )}
        </div>

        {/* District */}
        <div>
          <label className="block text-xs font-semibold text-foreground">
            District <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            {...register("district")}
            className="mt-1.5 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs outline-none transition focus:border-primary focus:ring-1 focus:ring-ring"
            placeholder="e.g. Dhaka"
          />
          {errors.district && (
            <p className="mt-1 text-[11px] text-destructive">
              {errors.district.message}
            </p>
          )}
        </div>

        {/* Postal Code */}
        <div>
          <label className="block text-xs font-semibold text-foreground">
            Postal Code
          </label>
          <input
            type="text"
            {...register("postal_code")}
            className="mt-1.5 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs outline-none transition focus:border-primary focus:ring-1 focus:ring-ring"
            placeholder="e.g. 1212"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="is_default"
          {...register("is_default")}
          className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
        />
        <label htmlFor="is_default" className="text-xs text-foreground select-none">
          Set as default delivery address
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-outline px-4 py-2 text-xs"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary px-5 py-2 text-xs"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving...
            </>
          ) : (
            submitButtonText
          )}
        </button>
      </div>
    </form>
  );
}
