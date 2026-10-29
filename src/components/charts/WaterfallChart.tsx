/**
 * A restrained waterfall: bars stepping from a starting total through
 * deltas to a result. Direct labels, no legend, hairline baseline. Numbers
 * are formatted by the caller so the chart knows nothing about money.
 */
export interface WaterfallStep {
  label: string;
  /** Absolute level for totals; signed delta for changes. */
  value: number;
  kind: "total" | "delta";
  /** Optional hue override: "navy" | "coral" | "cyan" | "blue" | "yellow" | "slate". */
  hue?: string;
}

export function WaterfallChart({ steps, format, title, width = 560, height = 260 }: { steps: WaterfallStep[]; format: (v: number) => string; title: string; width?: number; height?: number }) {
  const pad = { top: 28, right: 12, bottom: 44, left: 12 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  let running = 0;
  const bars = steps.map((s) => {
    const start = s.kind === "total" ? 0 : running;
    const end = s.kind === "total" ? s.value : running + s.value;
    running = end;
    return { ...s, start, end };
  });
  const min = Math.min(0, ...bars.map((b) => Math.min(b.start, b.end)));
  const max = Math.max(0, ...bars.map((b) => Math.max(b.start, b.end)));
  const span = max - min || 1;
  const y = (v: number) => pad.top + innerH - ((v - min) / span) * innerH;
  const slot = innerW / bars.length;
  const barW = Math.min(64, slot * 0.6);

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={title} className="block max-w-full h-auto font-sans">
        <title>{title}</title>
        <line x1={pad.left} x2={width - pad.right} y1={y(0)} y2={y(0)} stroke="var(--hairline-strong)" strokeWidth="1" />
        {bars.map((b, i) => {
          const x = pad.left + slot * i + (slot - barW) / 2;
          const top = y(Math.max(b.start, b.end));
          const h = Math.max(1.5, Math.abs(y(b.start) - y(b.end)));
          const fill =
            b.hue ? `var(--${b.hue})` : b.kind === "total" ? "var(--navy)" : b.value < 0 ? "var(--coral)" : "var(--cyan)";
          const labelValue = b.kind === "total" ? b.end : b.value;
          const connectorY = y(b.end);
          const next = bars[i + 1];
          return (
            <g key={i}>
              <rect x={x} y={top} width={barW} height={h} fill={fill} rx="2" opacity={b.kind === "total" ? 1 : 0.9} />
              {next ? (
                <line x1={x + barW} x2={pad.left + slot * (i + 1) + (slot - barW) / 2} y1={connectorY} y2={connectorY} stroke="var(--ink-4)" strokeWidth="1" strokeDasharray="2 3" />
              ) : null}
              <text x={x + barW / 2} y={top - 7} textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--ink)" className="tnum">
                {b.kind === "delta" && b.value > 0 ? "+" : ""}
                {format(labelValue)}
              </text>
              <text x={x + barW / 2} y={height - pad.bottom + 18} textAnchor="middle" fontSize="11" fill="var(--ink-3)">
                {b.label}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
