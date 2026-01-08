import { cn } from "@/lib/cn";

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: Array<{ id: T; label: string; count?: number }>;
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-surface-border bg-surface-raised/50 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all duration-200",
            active === tab.id
              ? "bg-brand-500/20 text-brand-200 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          {tab.label}
          {tab.count != null && tab.count > 0 && (
            <span className="ml-2 rounded-full bg-brand-500/30 px-2 py-0.5 text-xs">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
