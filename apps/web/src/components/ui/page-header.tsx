import Link from "next/link";
import { cn } from "@/lib/cn";
import { Button } from "./button";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: Array<{ label: string; href: string; variant?: "primary" | "secondary" }>;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">{description}</p>}
      </div>
      {actions && actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Button variant={action.variant ?? "primary"} size="md">
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
