import { Suspense } from "react";
import { TabLinks } from "./NavLinks";

export function TabBar() {
  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur border-t border-hairline print:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <Suspense fallback={<div className="h-14" />}>
        <TabLinks />
      </Suspense>
    </nav>
  );
}
