/**
 * A single-series line with an optional marker: for curves such as
 * service level against safety stock, or cost against exchange rate.
 * Light gridlines, direct end-label, tabular figures.
 */
export interface Point {
  x: number;
  y: number;
}

export function LineChart({
  points,
  marker,
  title,
  xLabel,
  yLabel,
  formatX,
  formatY,
  width = 560,
  height = 260,
  hue = "navy",
}: {
  points: Point[];
  marker?: Point & { label?: string };
  title: string;
  xLabel: string;
  yLabel: string;
  formatX: (v: number) => string;
  formatY: (v: number) => string;
  width?: number;
  height?: number;
  hue?: string;
}) {
  const pad = { top: 34, right: 24, bottom: 44, left: 64 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y).concat(marker ? [marker.y] : []);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(0, ...ys);
  const yMax = Math.max(...ys) * 1.08 || 1;
  const x = (v: number) => pad.left + ((v - xMin) / (xMax - xMin || 1)) * innerW;
  const y = (v: number) => pad.top + innerH - ((v - yMin) / (yMax - yMin || 1)) * innerH;
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.x).toFixed(1)},${y(p.y).toFixed(1)}`).join(" ");
  const yTicks = 4;
  const xTicks = Math.min(points.length, 6);
  const tickXs = Array.from({ length: xTicks }, (_, i) => xMin + ((xMax - xMin) * i) / (xTicks - 1 || 1));

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={title} className="block max-w-full h-auto font-sans">
        <title>{title}</title>
        {Array.from({ length: yTicks + 1 }, (_, i) => yMin + ((yMax - yMin) * i) / yTicks).map((v, i) => (
          <g key={i}>
            <line x1={pad.left} x2={width - pad.right} y1={y(v)} y2={y(v)} stroke={i === 0 ? "var(--hairline-strong)" : "var(--hairline)"} strokeWidth="1" />
            <text x={pad.left - 8} y={y(v) + 3.5} textAnchor="end" fontSize="11" fill="var(--ink-3)" className="tnum">
              {formatY(v)}
            </text>
          </g>
        ))}
        {tickXs.map((v, i) => (
          <text key={i} x={x(v)} y={height - pad.bottom + 18} textAnchor="middle" fontSize="11" fill="var(--ink-3)" className="tnum">
            {formatX(v)}
          </text>
        ))}
        <text x={pad.left + innerW / 2} y={height - 6} textAnchor="middle" fontSize="11" fill="var(--ink-3)">
          {xLabel}
        </text>
        <text x={12} y={14} fontSize="11" fill="var(--ink-3)">
          {yLabel}
        </text>
        <path d={path} fill="none" stroke={`var(--${hue})`} strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />
        {marker ? (
          <g>
            <line x1={x(marker.x)} x2={x(marker.x)} y1={y(marker.y)} y2={pad.top + innerH} stroke="var(--coral)" strokeWidth="1" strokeDasharray="2 3" />
            <circle cx={x(marker.x)} cy={y(marker.y)} r="5" fill="var(--surface)" stroke="var(--coral)" strokeWidth="2.25" />
            {marker.label ? (
              <text x={x(marker.x) + (marker.x > (xMin + xMax) / 2 ? -10 : 10)} y={y(marker.y) - 10} textAnchor={marker.x > (xMin + xMax) / 2 ? "end" : "start"} fontSize="11.5" fontWeight="600" fill="var(--coral-text)" className="tnum">
                {marker.label}
              </text>
            ) : null}
          </g>
        ) : null}
      </svg>
    </figure>
  );
}
