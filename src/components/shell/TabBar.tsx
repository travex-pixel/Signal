import { Suspense } from "react";
import { TabLinks } from "./NavLinks";

export function TabBar() {
  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur border-t border-hairline shadow-[0_-10px_30px_-18px_rgba(35,30,75,0.35)] print:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <Suspense fallback={<div className="h-14" />}>
        <TabLinks />
      </Suspense>
    </nav>
  );
}
