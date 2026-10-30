"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { KnowledgeCheck as Check } from "@/lib/learn/lessons";
import { Button } from "./Button";
import { IconCheck } from "./shell/icons";

export function KnowledgeCheck({ check }: { check: Check }) {
  const id = useId();
  const [choice, setChoice] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const correct = revealed && choice === check.answer;
  // The "Check answer" button goes away once pressed, so focus moves to the result instead of dropping to the page.
  const resultRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (revealed) resultRef.current?.focus();
  }, [revealed]);

  return (
    <form
      className="rounded-lg bg-surface border border-hairline px-5 py-5 md:px-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (choice !== null) setRevealed(true);
      }}
    >
      <h2 id={`${id}-q`} className="m-0 font-serif text-[17px] font-medium leading-[1.5] text-ink">
        <span className="sr-only">Knowledge check: </span>
        {check.question}
      </h2>
      <div role="radiogroup" aria-labelledby={`${id}-q`} className="mt-4 space-y-2">
        {check.options.map((o, i) => {
          const state = revealed ? (i === check.answer ? "right" : i === choice ? "wrong" : "idle") : choice === i ? "chosen" : "idle";
          return (
            <label
              key={i}
              className={`flex items-start gap-3 rounded-md border px-3.5 py-3 min-h-11 cursor-pointer transition-colors duration-150 ${
                state === "right"
                  ? "border-ok bg-ok-100"
                  : state === "wrong"
                    ? "border-danger bg-danger-100"
                    : state === "chosen"
                      ? "border-navy bg-navy-100/60"
                      : "border-hairline hover:border-navy-200"
              }`}
            >
              <input
                type="radio"
                name={`${id}-opt`}
                value={i}
                checked={choice === i}
                disabled={revealed}
                onChange={() => setChoice(i)}
                className="mt-[3px] accent-navy"
              />
              <span className="text-[14.5px] leading-[1.45] text-ink">{o}</span>
            </label>
          );
        })}
      </div>
      {!revealed ? (
        <Button type="submit" variant="primary" className="mt-4" disabled={choice === null}>
          Check answer
        </Button>
      ) : (
        <p ref={resultRef} tabIndex={-1} role="status" className="mt-4 mb-0 text-[14.5px] leading-[1.5] text-ink focus:outline-none">
          <span className={`inline-flex items-center gap-1 font-semibold ${correct ? "text-ok" : "text-danger"}`}>
            {correct ? <IconCheck /> : null}
            {correct ? "Right." : "Not quite."}
          </span>{" "}
          {check.explanation}
        </p>
      )}
    </form>
  );
}
