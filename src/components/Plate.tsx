import Image from "next/image";

export type PlateName =
  | "region-sea"
  | "region-china"
  | "region-usa"
  | "region-middle-east"
  | "region-australia"
  | "region-global"
  | "pellets-coral"
  | "pellets-cyan"
  | "lesson-margin"
  | "lesson-pnl"
  | "lesson-inventory"
  | "lesson-fx"
  | "lesson-freight"
  | "lesson-tradeoffs"
  | "lesson-cycle"
  | "lesson-price-steps"
  | "chain";

/**
 * A watercolour plate from public/illustrations, generated procedurally by
 * scripts/illustrate.py. Plates are decorative: they carry no information
 * the text does not, so they are hidden from assistive technology.
 */
export function Plate({ name, width = 180, className = "", priority = false }: { name: PlateName; width?: number; className?: string; priority?: boolean }) {
  const height = Math.round(width * 0.75);
  return (
    <Image
      src={`/illustrations/${name}.png`}
      alt=""
      width={width}
      height={height}
      priority={priority}
      className={`select-none pointer-events-none ${className}`}
      sizes={`${width}px`}
    />
  );
}
