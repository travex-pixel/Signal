import { REGION_BY_ID } from "@/lib/news/regions";
import type { RegionId } from "@/lib/news/types";

/** A bead in the region's hue, optionally with its name. The bead is the chain's atom. */
export function RegionBead({
  region,
  label = true,
  size = "md",
  className = "",
}: {
  region: RegionId;
  label?: boolean | "short";
  size?: "sm" | "md";
  className?: string;
}) {
  const meta = REGION_BY_ID[region];
  const text = label === "short" ? meta.short : meta.name;
  const dot = size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5";
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        aria-hidden="true"
        className={`${dot} rounded-full flex-none`}
        style={{ background: `var(--region-${meta.hue})` }}
      />
      {label ? (
        <span
          className="text-[12px] font-semibold tracking-[0.02em]"
          style={{ color: `var(--region-${meta.hue}-text)` }}
        >
          {text}
        </span>
      ) : (
        <span className="sr-only">{meta.name}</span>
      )}
    </span>
  );
}

export function RegionBeads({ regions, max = 2, size = "md" }: { regions: RegionId[]; max?: number; size?: "sm" | "md" }) {
  const shown = regions.slice(0, max);
  return (
    <span className="inline-flex items-center gap-3">
      {shown.map((r) => (
        <RegionBead key={r} region={r} label="short" size={size} />
      ))}
    </span>
  );
}
