"use client";

import { useEffect } from "react";

/**
 * Brings the reader to the part of the page a link pointed at. Story content
 * streams in after navigation, so the browser's own jump to "#sources" can
 * happen before the section exists. This runs once the content has mounted,
 * and opens a closed disclosure when the link targets one.
 */
export function HashScroll() {
  useEffect(() => {
    const go = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      if (el instanceof HTMLDetailsElement) el.open = true;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    };
    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, []);
  return null;
}
