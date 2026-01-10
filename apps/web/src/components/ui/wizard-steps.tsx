import { cn } from "@/lib/cn";

export function WizardSteps({
  steps,
  current,
}: {
  steps: readonly string[];
  current: number;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {steps.map((label, i) => (
        <div
          key={label}
          className={cn(
            "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            i === current
              ? "bg-brand-500/20 text-brand-200 ring-1 ring-brand-500/40"
              : i < current
                ? "bg-emerald-500/10 text-emerald-300"
                : "bg-surface-overlay text-slate-500"
          )}
        >
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full text-[10px]",
              i === current ? "bg-brand-500 text-white" : i < current ? "bg-emerald-600 text-white" : "bg-slate-700"
            )}
          >
            {i < current ? "✓" : i + 1}
          </span>
          {label}
        </div>
      ))}
    </div>
  );
}
