"use client";

import { Button } from "./button";
import { cn } from "@/lib/cn";

export function Drawer({
  open,
  title,
  description,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div
        className={cn(
          "flex h-full w-full max-w-md flex-col border-l border-surface-border",
          "bg-surface-raised/95 backdrop-blur-xl shadow-2xl animate-slide-up"
        )}
      >
        <div className="flex items-start justify-between border-b border-surface-border px-6 py-5">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
            {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
