/**
 * Treasury-themed backdrop: ledger grid, policy flow arcs, and vault motif.
 */
export function AuthBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Ledger grid — structured governance */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.09) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.09) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 85% 75% at 30% 40%, black 20%, transparent 72%)",
        }}
      />

      {/* Ambient color fields */}
      <div className="absolute inset-0 bg-mesh-auth" />
      <div className="absolute -left-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-brand-500/15 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />

      {/* Large vault + approval-flow illustration (left) */}
      <svg
        className="absolute -left-16 top-[12%] h-[min(520px,70vh)] w-[min(520px,70vw)] text-brand-400/20 lg:left-0"
        viewBox="0 0 400 400"
        fill="none"
      >
        {/* Outer vault ring */}
        <circle cx="200" cy="200" r="148" stroke="currentColor" strokeWidth="1" strokeDasharray="6 10" />
        <circle cx="200" cy="200" r="118" stroke="currentColor" strokeWidth="0.75" opacity="0.6" />

        {/* Shield silhouette */}
        <path
          d="M200 72 268 98v72c0 48-38 86-68 98-30-12-68-50-68-98V98l68-26z"
          stroke="currentColor"
          strokeWidth="1.25"
          fill="rgba(99,102,241,0.06)"
        />

        {/* Policy flow: signers → center → outbound */}
        <circle cx="120" cy="300" r="14" stroke="currentColor" strokeWidth="1" fill="rgba(99,102,241,0.08)" />
        <circle cx="200" cy="318" r="16" stroke="currentColor" strokeWidth="1.25" fill="rgba(99,102,241,0.12)" />
        <circle cx="280" cy="300" r="14" stroke="currentColor" strokeWidth="1" fill="rgba(99,102,241,0.08)" />
        <path
          d="M120 300 200 240 280 300"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M200 240 200 170"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 6"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Safe transaction arc */}
        <path
          d="M248 168 310 200 248 232"
          stroke="rgba(56,189,248,0.35)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <circle cx="310" cy="200" r="6" fill="rgba(56,189,248,0.15)" stroke="rgba(56,189,248,0.4)" strokeWidth="1" />
      </svg>

      {/* Right-side audit trail lines */}
      <svg
        className="absolute -right-8 bottom-[8%] h-64 w-64 text-slate-500/25 lg:right-4"
        viewBox="0 0 200 200"
        fill="none"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <rect
            key={i}
            x="24"
            y={32 + i * 28}
            width={120 + (i % 2) * 24}
            height="8"
            rx="4"
            fill="currentColor"
            opacity={0.15 + i * 0.05}
          />
        ))}
      </svg>

      {/* Vignette — focus content */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 35%, rgba(7,11,18,0.85) 100%)",
        }}
      />
    </div>
  );
}
