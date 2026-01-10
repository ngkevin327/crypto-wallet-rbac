import { cn } from "@/lib/cn";
import { tableHeadClassName } from "@/lib/ui-styles";

export function TableShell({
  children,
  empty,
  className,
}: {
  children: React.ReactNode;
  empty?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-surface-border bg-surface-raised/50", className)}>
      {children}
      {empty}
    </div>
  );
}

export function DataTable({ children }: { children: React.ReactNode }) {
  return <table className="w-full text-sm">{children}</table>;
}

export function DataTableHead({ children }: { children: React.ReactNode }) {
  return <thead className={tableHeadClassName}>{children}</thead>;
}

export function DataTableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}
