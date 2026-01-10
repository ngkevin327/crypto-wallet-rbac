import { cn } from "@/lib/cn";

const presets: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-200 ring-emerald-500/30",
  invited: "bg-amber-500/15 text-amber-200 ring-amber-500/30",
  deactivated: "bg-slate-500/15 text-slate-400 ring-slate-500/30",
  pending: "bg-amber-500/15 text-amber-200 ring-amber-500/30",
  default: "bg-slate-500/15 text-slate-300 ring-slate-500/30",
};

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof presets | string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1",
        presets[tone] ?? presets.default,
        className
      )}
    >
      {children}
    </span>
  );
}
