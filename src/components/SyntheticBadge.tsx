/** Shown wherever fixture-built stories render, so invented headlines are never mistaken for news. */
export function SyntheticBadge({ show }: { show?: boolean }) {
  if (!show) return null;
  return (
    <span className="inline-flex items-center rounded-sm bg-warn-100 text-warn px-1.5 py-[1px] text-[10.5px] font-semibold uppercase tracking-[0.06em]">
      Development fixtures
    </span>
  );
}
