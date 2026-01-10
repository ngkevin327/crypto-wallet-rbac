import Link from "next/link";
import { cn } from "@/lib/cn";

export function TextLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("text-sm font-medium text-brand-300 transition-colors hover:text-brand-200", className)}
    >
      {children}
    </Link>
  );
}
