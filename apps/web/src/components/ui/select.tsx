import { cn } from "@/lib/cn";
import { labelClassName, selectClassName } from "@/lib/ui-styles";

export function Select({
  label,
  hint,
  error,
  className,
  id,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
}) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className={labelClassName}>
          {label}
        </label>
      )}
      <select id={selectId} className={cn(selectClassName, error && "border-red-500/50", className)} {...props}>
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
