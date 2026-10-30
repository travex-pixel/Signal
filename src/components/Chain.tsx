import Link from "next/link";
import type { CSSProperties } from "react";
import type { RegionId } from "@/lib/news/types";
import { REGION_BY_ID } from "@/lib/news/regions";

export const CHAIN_STEPS = [
  { id: "event", label: "The news" },
  { id: "evidence", label: "How sure" },
  { id: "mechanism", label: "How it works" },
  { id: "implication", label: "What it means" },
  { id: "options", label: "What to do" },
  { id: "meeting", label: "In a meeting" },
] as const;

export type ChainStepId = (typeof CHAIN_STEPS)[number]["id"];

/**
 * The reasoning chain as a bar with beads: six equal columns, a bar running
 * through them, a bead at the start of each, the label beneath. Each bead
 * links to the matching section of the story view. `active` marks the
 * current step on a reading page.
 */
export function Chain({
  href,
  region,
  active,
  compact = false,
}: {
  href: string;
  region?: RegionId;
  active?: ChainStepId;
  compact?: boolean;
}) {
  const hue = region ? REGION_BY_ID[region].hue : undefined;
  const activeIndex = active ? CHAIN_STEPS.findIndex((s) => s.id === active) : -1;
  return (
    <nav aria-label="Reasoning chain">
      <ol
        className="chain list-none p-0 m-0"
        style={hue ? ({ "--chain-color": `var(--region-${hue})` } as CSSProperties) : undefined}
      >
        {CHAIN_STEPS.map((step, i) => {
          const done = activeIndex >= 0 && i < activeIndex;
          const isActive = i === activeIndex;
          const last = i === CHAIN_STEPS.length - 1;
          return (
            <li key={step.id} className="chain-step" data-active={isActive ? "true" : undefined} data-done={done ? "true" : undefined} data-last={last ? "true" : undefined}>
              <Link
                href={`${href}#${step.id}`}
                className="chain-link group"
                aria-current={isActive ? "step" : undefined}
              >
                <span className="chain-bead" aria-hidden="true" />
                <span
                  className={`chain-label ${compact ? "text-[11.5px] md:text-[12px]" : "text-[11.5px] md:text-[12.5px]"} font-semibold tracking-[0.005em] transition-colors duration-150 ${
                    isActive ? "text-ink" : "text-ink-3 group-hover:text-ink"
                  }`}
                >
                  {step.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
