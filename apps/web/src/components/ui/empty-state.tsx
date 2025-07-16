"use client";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-surface-border p-12 text-center">
      <h2 className="text-lg font-medium text-slate-200 mb-2">{title}</h2>
      <p className="text-sm text-slate-500 max-w-md mx-auto">{description}</p>
      {actionLabel && actionHref && (
        <a
          href={actionHref}
          className="inline-block mt-6 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          {actionLabel}
        </a>
      )}
    </div>
  );
}
