import { cn } from "@/lib/cn";

type Variant = "error" | "success" | "info";

const styles: Record<Variant, string> = {
  error: "border-red-500/30 bg-red-500/10 text-red-300",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  info: "border-brand-500/30 bg-brand-500/10 text-brand-200",
};

export function Alert({
  variant = "info",
  children,
  className,
}: {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("rounded-lg border px-3 py-2 text-sm", styles[variant], className)}>{children}</p>
  );
}
