"use client";

export function HelpLink() {
  return (
    <a
      href="https://github.com/wtp/docs/blob/main/docs/user-guide.md"
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-surface-border bg-surface-raised/60 px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-brand-500/30 hover:text-brand-200"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
      Help & user guide
    </a>
  );
}
