"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * A quiet footer with the pages a reader needs now and then: where the news
 * comes from, and preferences. Left off Today, which is built to fit one
 * screen, and off printed briefs.
 */
export function Footer() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  const link = "inline-flex items-center min-h-11 font-medium text-ink-3 hover:text-ink transition-colors duration-150";
  return (
    <footer className="print:hidden">
      <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 pb-6 flex flex-wrap items-center gap-x-6 text-[13px]">
        <Link href="/sources" className={link}>
          Where the news comes from
        </Link>
        <Link href="/preferences" className={link}>
          Preferences
        </Link>
      </div>
    </footer>
  );
}
