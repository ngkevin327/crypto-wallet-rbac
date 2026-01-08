import Link from "next/link";
import { IconLogo, IconShield, IconSparkles } from "@/components/icons";

const highlights = [
  { title: "Role-based limits", text: "Marketing, finance, and contractors each get scoped spend rules." },
  { title: "Approval workflows", text: "Route high-value transfers through multi-signer review." },
  { title: "Audit-ready", text: "Every policy change and approval decision is logged." },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-surface lg:flex lg:flex-col lg:justify-between p-12">
        <div className="absolute inset-0 bg-mesh-auth" />
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-3">
            <IconLogo className="h-9 w-9" />
            <span className="font-display text-lg font-semibold text-white">Wallet Team Permissions</span>
          </Link>
        </div>
        <div className="relative space-y-8 animate-slide-up">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-brand-300">Treasury governance</p>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-gradient max-w-md">
              Run your onchain ops like enterprise access control
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
              Connect your Gnosis Safe, define who can spend what, and keep founders in control—without sharing keys in chat.
            </p>
          </div>
          <ul className="space-y-4">
            {highlights.map((item) => (
              <li key={item.title} className="flex gap-3 rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm">
                <IconShield className="mt-0.5 text-brand-300" />
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative flex items-center gap-2 text-xs text-slate-500">
          <IconSparkles className="h-4 w-4 text-brand-400" />
          Built for crypto startups and DAO ops teams
        </p>
      </div>

      <div className="flex min-h-screen flex-col justify-center bg-surface px-6 py-12 lg:px-16">
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <IconLogo className="h-8 w-8" />
          <span className="font-display font-semibold text-white">WTP</span>
        </div>
        <div className="mx-auto w-full max-w-md animate-fade-in">{children}</div>
      </div>
    </div>
  );
}
