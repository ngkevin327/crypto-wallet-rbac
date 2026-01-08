"use client";

import Link from "next/link";
import { Button } from "./button";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-surface-border bg-surface-raised/40 px-8 py-14 text-center">
      {icon && (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300">
          {icon}
        </div>
      )}
      <h2 className="font-display text-lg font-semibold text-slate-100">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-8 inline-block">
          <Button size="md">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
