"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isCurrent, NAV } from "./nav";

/** Desktop navigation in the top bar. */
export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
      {NAV.map((item) => {
        const current = isCurrent(item, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={`relative px-3 py-1.5 rounded-md text-[13.5px] font-medium transition-colors duration-150 ${
              current ? "text-white" : "text-navy-200 hover:text-white hover:bg-white/8"
            }`}
          >
            {item.label}
            {current ? (
              <span
                aria-hidden="true"
                className="absolute left-3 right-3 -bottom-[9px] h-[3px] rounded-full bg-coral"
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

/** Mobile bottom tab bar. */
export function TabLinks() {
  const pathname = usePathname();
  return (
    <ul className="grid grid-cols-5">
      {NAV.map((item) => {
        const current = isCurrent(item, pathname);
        const Icon = item.icon;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={current ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 h-14 text-[11.5px] font-medium transition-colors duration-150 ${
                current ? "text-navy" : "text-ink-3"
              }`}
            >
              <span className={`flex items-center justify-center w-9 h-6 rounded-full ${current ? "bg-navy-100" : ""}`}>
                <Icon width={20} height={20} />
              </span>
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
