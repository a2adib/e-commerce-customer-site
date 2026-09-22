"use client";

import React from "react";
import Link from "next/link";
import { PackageOpen } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = <PackageOpen className="h-10 w-10 text-muted-foreground" />,
  title,
  description,
  actionText,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
      {(actionText && actionHref) && (
        <Link href={actionHref} className="btn-primary mt-6 text-xs">
          {actionText}
        </Link>
      )}
      {(actionText && onAction && !actionHref) && (
        <button onClick={onAction} className="btn-primary mt-6 text-xs">
          {actionText}
        </button>
      )}
    </div>
  );
}
