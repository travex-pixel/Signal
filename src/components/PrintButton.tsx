"use client";

import { Button } from "./Button";
import { IconPrint } from "./shell/icons";

export function PrintButton() {
  return (
    <Button variant="ghost" onClick={() => window.print()} aria-label="Print or save as PDF">
      <IconPrint /> Print
    </Button>
  );
}
