"use client";

import { useState } from "react";
import { Button } from "./Button";
import { IconCheck, IconCopy } from "./shell/icons";

/** Copies prepared plain text, for pasting a brief into notes or an email. */
export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  return (
    <Button
      variant="ghost"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setState("done");
        } catch {
          setState("failed");
        }
        window.setTimeout(() => setState("idle"), 2200);
      }}
    >
      {state === "done" ? <IconCheck /> : <IconCopy />}
      <span aria-live="polite">{state === "done" ? "Copied" : state === "failed" ? "Could not copy" : label}</span>
    </Button>
  );
}
