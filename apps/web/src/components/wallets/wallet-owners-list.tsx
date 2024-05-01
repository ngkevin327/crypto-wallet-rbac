"use client";

function shorten(addr: string): string {
  if (addr.length < 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

interface Props {
  owners: string[];
  threshold: number | null;
}

export function WalletOwnersList({ owners, threshold }: Props) {
  if (!owners.length) {
    return (
      <p className="text-xs text-slate-500 mt-3">
        Owners will appear after the next background sync.
      </p>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Safe owners
        </h4>
        {threshold != null && (
          <span className="text-xs text-slate-400">
            {threshold}-of-{owners.length} threshold
          </span>
        )}
      </div>
      <ul className="space-y-1.5 max-h-32 overflow-y-auto">
        {owners.map((owner) => (
          <li
            key={owner}
            className="flex items-center gap-2 rounded bg-surface px-2 py-1.5 text-xs font-mono text-slate-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
            {shorten(owner)}
          </li>
        ))}
      </ul>
    </div>
  );
}
