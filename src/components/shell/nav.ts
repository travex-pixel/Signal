import type { ComponentType, SVGProps } from "react";
import { IconBrief, IconLearn, IconRegions, IconSources, IconToday } from "./icons";

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Path prefixes that count as "current" for this item. */
  match: string[];
}

export const NAV: NavItem[] = [
  { href: "/", label: "Today", icon: IconToday, match: ["/", "/stories"] },
  { href: "/regions", label: "Regions", icon: IconRegions, match: ["/regions"] },
  { href: "/brief", label: "Briefs", icon: IconBrief, match: ["/brief"] },
  { href: "/learn", label: "Learn", icon: IconLearn, match: ["/learn", "/simulators"] },
  { href: "/sources", label: "Sources", icon: IconSources, match: ["/sources"] },
];

export function isCurrent(item: NavItem, pathname: string): boolean {
  return item.match.some((m) => (m === "/" ? pathname === "/" : pathname === m || pathname.startsWith(`${m}/`)));
}
