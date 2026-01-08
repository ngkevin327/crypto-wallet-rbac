import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
  glow,
}: {
  className?: string;
  children: React.ReactNode;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-surface-border bg-surface-raised/70 backdrop-blur-sm",
        "shadow-card transition-shadow duration-300 hover:shadow-card-hover",
        glow && "ring-1 ring-brand-500/20",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-surface-border/80 px-6 py-5">
      <div>
        <h3 className="font-display text-lg font-semibold text-white tracking-tight">{title}</h3>
        {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}
