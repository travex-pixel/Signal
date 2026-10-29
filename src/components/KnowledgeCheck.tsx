"use client";

import { useId, useState } from "react";
import type { KnowledgeCheck as Check } from "@/lib/learn/lessons";
import { Button } from "./Button";
import { IconCheck } from "./shell/icons";

export function KnowledgeCheck({ check }: { check: Check }) {
  const id = useId();
  const [choice, setChoice] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const correct = revealed && choice === check.answer;

  return (
    <form
      className="rounded-lg bg-surface border border-hairline px-5 py-5 md:px-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (choice !== null) setRevealed(true);
      }}
    >
      <p className="m-0 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-3">Knowledge check</p>
      <p className="mt-2 mb-0 font-serif text-[16.5px] leading-[1.5] text-ink">{check.question}</p>
      <div role="radiogroup" aria-labelledby={`${id}-q`} className="mt-4 space-y-2">
        {check.options.map((o, i) => {
          const state = revealed ? (i === check.answer ? "right" : i === choice ? "wrong" : "idle") : choice === i ? "chosen" : "idle";
          return (
            <label
              key={i}
              className={`flex items-start gap-3 rounded-md border px-3.5 py-2.5 cursor-pointer transition-colors duration-150 ${
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
        <p role="status" className="mt-4 mb-0 text-[14.5px] leading-[1.5] text-ink">
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
