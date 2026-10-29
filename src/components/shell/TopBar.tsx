import Link from "next/link";
import { Suspense } from "react";
import { IconTune } from "./icons";
import { NavLinks } from "./NavLinks";
import { Wordmark } from "./Wordmark";

export function TopBar() {
  return (
    <header className="topbar text-white print:hidden">
      <div className="mx-auto max-w-[1280px] px-4 md:px-8 h-14 flex items-center justify-between gap-6">
        <Link href="/" className="rounded-md focus-visible:outline-white" aria-label="SIGNAL home">
          <Wordmark />
        </Link>
        <Suspense fallback={<div className="hidden md:block flex-1" />}>
          <NavLinks />
        </Suspense>
        <Link
          href="/preferences"
          className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13.5px] font-medium text-navy-200 hover:text-white hover:bg-white/8 transition-colors duration-150 focus-visible:outline-white"
        >
          <IconTune width={18} height={18} />
          <span className="hidden md:inline">Preferences</span>
          <span className="sr-only md:hidden">Preferences</span>
        </Link>
      </div>
    </header>
  );
}
