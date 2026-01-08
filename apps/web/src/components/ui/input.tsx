import { cn } from "@/lib/cn";

export function Input({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
}) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-xl border bg-surface-raised/60 px-4 py-2.5 text-sm text-white",
          "placeholder:text-slate-500 transition-colors duration-200",
          "border-surface-border focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20 focus:outline-none",
          error && "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
