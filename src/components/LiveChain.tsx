"use client";

import { useEffect, useState } from "react";
import type { RegionId } from "@/lib/news/types";
import { Chain, CHAIN_STEPS, type ChainStepId } from "./Chain";

/**
 * The sticky chain on a story page, following the reader: the step whose
 * section is under the bar is filled and the ones before it are walked.
 */
export function LiveChain({ href, region }: { href: string; region?: RegionId }) {
  const [active, setActive] = useState<ChainStepId>("event");

  useEffect(() => {
    const sections = CHAIN_STEPS.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;
    const update = () => {
      // The current step is the last section whose top has passed a line just under the sticky bar.
      const line = 140;
      let current: ChainStepId = "event";
      for (const el of sections) if (el.getBoundingClientRect().top <= line) current = el.id as ChainStepId;
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return <Chain href={href} region={region} active={active} compact />;
}
