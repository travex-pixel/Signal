/**
 * The SIGNAL mark: three bars with beads, a nod to the Primaplas polymer
 * chain, set beside the wordmark. Drawn once; used in the top bar and the
 * meeting brief header.
 */
export function Wordmark({ tone = "light", className = "" }: { tone?: "light" | "dark"; className?: string }) {
  const text = tone === "light" ? "#ffffff" : "var(--navy)";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} aria-label="SIGNAL">
      <svg width="34" height="22" viewBox="0 0 34 22" aria-hidden="true" focusable="false">
        <rect x="0" y="2" width="22" height="4" rx="2" fill="var(--coral)" />
        <circle cx="16" cy="4" r="3" fill="var(--surface)" stroke="var(--coral)" strokeWidth="1.5" />
        <rect x="6" y="9" width="28" height="4" rx="2" fill="var(--cyan)" />
        <circle cx="12" cy="11" r="3" fill="var(--surface)" stroke="var(--cyan)" strokeWidth="1.5" />
        <rect x="2" y="16" width="24" height="4" rx="2" fill="var(--coral)" />
        <circle cx="21" cy="18" r="3" fill="var(--surface)" stroke="var(--coral)" strokeWidth="1.5" />
      </svg>
      <span
        className="font-sans font-bold tracking-[0.14em] text-[15px] leading-none"
        style={{ color: text }}
      >
        SIGNAL
      </span>
    </span>
  );
}
