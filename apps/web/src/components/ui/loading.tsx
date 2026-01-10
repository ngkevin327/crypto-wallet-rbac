export function LoadingState({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="flex items-center gap-3 text-slate-400">
      <span className="h-5 w-5 animate-pulse rounded-full bg-brand-500/30" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
