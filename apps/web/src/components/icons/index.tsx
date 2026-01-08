import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = "h-5 w-5 shrink-0";

export function IconLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={base} {...props}>
      <rect width="32" height="32" rx="8" className="fill-brand-500" />
      <path
        d="M10 22V10h4.2c2.8 0 4.5 1.4 4.5 3.6 0 1.5-.8 2.6-2.1 3.1L20 22h-3.4l-2.8-4.6H14v4.6H10zm4-7.4h.6c1.1 0 1.7-.5 1.7-1.3s-.6-1.3-1.7-1.3H14v2.6z"
        className="fill-white"
      />
    </svg>
  );
}

export function IconDashboard(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={base} {...props}>
      <path strokeLinecap="round" d="M4 13h6V4H4v9zm10 7h6V11h-6v9zM4 20h6v-5H4v5zm10-11h6V4h-6v5z" />
    </svg>
  );
}

export function IconWallet(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={base} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm16-3H5a2 2 0 00-2 2v0h18v0a2 2 0 00-2-2zm-2 11h2" />
    </svg>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={base} {...props}>
      <path strokeLinecap="round" d="M16 19v-1a4 4 0 00-8 0v1M12 12a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  );
}

export function IconShield(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={base} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
    </svg>
  );
}

export function IconSend(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={base} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12l16-7-7 16-2-7-7-2z" />
    </svg>
  );
}

export function IconCheckCircle(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={base} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M12 21a9 9 0 110-18 9 9 0 010 18z" />
    </svg>
  );
}

export function IconList(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={base} {...props}>
      <path strokeLinecap="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

export function IconKey(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={base} {...props}>
      <path strokeLinecap="round" d="M15 7a4 4 0 11-8 0 4 4 0 018 0zm-2 10l-2 2m0 0l-2 2m2-2v5" />
    </svg>
  );
}

export function IconLogOut(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={base} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

export function IconSparkles(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={base} {...props}>
      <path strokeLinecap="round" d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10l1.4 1.4M5.6 18.4l1.4-1.4m10-10l1.4-1.4" />
    </svg>
  );
}
