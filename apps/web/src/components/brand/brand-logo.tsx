import { cn } from "@/lib/cn";
import type { SVGProps } from "react";

/**
 * WTP brand mark: vault (Safe) + shield (policy) + multisig nodes (team approvals).
 */
export function BrandLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="Wallet Team Permissions"
      {...props}
    >
      <defs>
        <linearGradient id="wtp-brand-bg" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#3730a3" />
        </linearGradient>
        <linearGradient id="wtp-shield-glow" x1="24" y1="8" x2="24" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#e0e7ff" />
        </linearGradient>
      </defs>

      {/* Vault container */}
      <rect width="48" height="48" rx="14" fill="url(#wtp-brand-bg)" />
      <rect
        x="6"
        y="6"
        width="36"
        height="36"
        rx="10"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />

      {/* Policy shield */}
      <path
        d="M24 9.5 35 14v10.2c0 7.2-6.2 12.8-11 14.8-4.8-2-11-7.6-11-14.8V14l11-4.5z"
        fill="url(#wtp-shield-glow)"
      />
      <path
        d="M24 9.5 35 14v10.2c0 7.2-6.2 12.8-11 14.8-4.8-2-11-7.6-11-14.8V14l11-4.5z"
        stroke="rgba(99,102,241,0.45)"
        strokeWidth="0.75"
      />

      {/* Lock / permissions */}
      <rect x="21" y="19" width="6" height="7" rx="1.25" fill="#4f46e5" fillOpacity="0.35" />
      <path
        d="M22.5 19v-1.2a1.5 1.5 0 013 0V19"
        stroke="#4338ca"
        strokeWidth="1.25"
        strokeLinecap="round"
      />

      {/* Multisig signers → vault */}
      <path
        d="M13.5 38.5 24 34.5 34.5 38.5"
        stroke="#c7d2fe"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 34.5V30"
        stroke="#a5b4fc"
        strokeWidth="1"
        strokeDasharray="2.5 2.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      <circle cx="13.5" cy="38.5" r="3" fill="#eef2ff" stroke="#818cf8" strokeWidth="1" />
      <circle cx="24" cy="40" r="3.25" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.1" />
      <circle cx="34.5" cy="38.5" r="3" fill="#eef2ff" stroke="#818cf8" strokeWidth="1" />
    </svg>
  );
}
