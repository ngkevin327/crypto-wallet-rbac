import { Card, CardBody } from "@/components/ui/card";
import { cn } from "@/lib/cn";

export function AuthFormCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Card className={cn("border-surface-border/80 shadow-card")}>
      <CardBody className="p-6 sm:p-7">
        <header className="mb-6">
          <h1 className="font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">{description}</p>
        </header>
        {children}
        {footer && <div className="mt-5 border-t border-surface-border/60 pt-5">{footer}</div>}
      </CardBody>
    </Card>
  );
}
