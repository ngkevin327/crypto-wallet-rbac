import type { SVGProps } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { cn } from "@/lib/cn";

export type IconProps = SVGProps<SVGSVGElement>;

const base = "h-5 w-5 shrink-0";

function strokeIcon(
  paths: React.ReactNode,
  { className, ...props }: IconProps,
  viewBox = "0 0 24 24"
) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={cn(base, className)}
      {...props}
    >
      {paths}
    </svg>
  );
}

export function IconLogo({ className, ...props }: IconProps) {
  return <BrandLogo className={cn(base, className)} {...props} />;
}

export function IconDashboard(props: IconProps) {
  return strokeIcon(<path strokeLinecap="round" d="M4 13h6V4H4v9zm10 7h6V11h-6v9zM4 20h6v-5H4v5zm10-11h6V4h-6v5z" />, props);
}

export function IconWallet(props: IconProps) {
  return strokeIcon(
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 7h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm16-3H5a2 2 0 00-2 2v0h18v0a2 2 0 00-2-2zm-2 11h2"
    />,
    props
  );
}

export function IconUsers(props: IconProps) {
  return strokeIcon(<path strokeLinecap="round" d="M16 19v-1a4 4 0 00-8 0v1M12 12a4 4 0 100-8 4 4 0 000 8z" />, props);
}

export function IconShield(props: IconProps) {
  return strokeIcon(
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />,
    props
  );
}

export function IconSend(props: IconProps) {
  return strokeIcon(
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12l16-7-7 16-2-7-7-2z" />,
    props
  );
}

export function IconCheckCircle(props: IconProps) {
  return strokeIcon(
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M12 21a9 9 0 110-18 9 9 0 010 18z" />,
    props
  );
}

export function IconList(props: IconProps) {
  return strokeIcon(<path strokeLinecap="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />, props);
}

export function IconKey(props: IconProps) {
  return strokeIcon(
    <path strokeLinecap="round" d="M15 7a4 4 0 11-8 0 4 4 0 018 0zm-2 10l-2 2m0 0l-2 2m2-2v5" />,
    props
  );
}

export function IconLogOut(props: IconProps) {
  return strokeIcon(
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />,
    props
  );
}

export function IconSparkles(props: IconProps) {
  return strokeIcon(
    <path
      strokeLinecap="round"
      d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10l1.4 1.4M5.6 18.4l1.4-1.4m10-10l1.4-1.4"
    />,
    props
  );
}
