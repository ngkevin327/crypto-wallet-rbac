"use client";

import type { RoleAssignment } from "@/lib/api/members";

export function MemberRow({
  email,
  assignments,
  onClick,
}: {
  email: string;
  assignments: RoleAssignment[];
  onClick: () => void;
}) {
  const temp = assignments.find(
    (a) => a.endsAt && new Date(a.endsAt) > new Date()
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between rounded-lg border border-surface-border px-4 py-3 text-left hover:bg-surface"
    >
      <span className="text-sm text-white">{email}</span>
      {temp?.endsAt && (
        <span className="text-xs rounded-full bg-amber-900/40 text-amber-300 px-2 py-0.5">
          Expires {new Date(temp.endsAt).toLocaleDateString()}
        </span>
      )}
    </button>
  );
}
