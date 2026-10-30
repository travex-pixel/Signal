"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "./Button";
import { KindTag } from "./Claims";
import { IconArrow } from "./shell/icons";

/**
 * Ask SIGNAL: a question answered from today's digest, streamed in.
 * Rendered only when the deployment has an API key (the server decides).
 */
export function AskSignal({
  storyId,
  suggestions = [],
  compact = false,
  inline = false,
  placeholder,
}: {
  storyId?: string;
  suggestions?: string[];
  /** No card chrome. */
  compact?: boolean;
  /** A single row with a visually hidden heading, for tight bands such as the Today footer. */
  inline?: boolean;
  placeholder?: string;
}) {
  const id = useId();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asked, setAsked] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "streaming" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Leaving the page stops the answer, so the model does not keep generating for no one.
  useEffect(() => () => abortRef.current?.abort(), []);

  async function ask(q: string) {
    const text = q.trim();
    if (text.length < 3 || state === "streaming") return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setAsked(text);
    setAnswer("");
    setError(null);
    setState("streaming");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: text, storyId }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let out = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        out += decoder.decode(value, { stream: true });
        setAnswer(out);
      }
      setState("done");
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  }

  return (
    <section aria-labelledby={`${id}-h`} className={compact || inline ? "" : "paper px-5 py-5 md:px-6"}>
      <h2 id={`${id}-h`} className={inline ? "sr-only" : "m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3"}>
        Ask SIGNAL
      </h2>
      <form
        className={`${inline ? "" : "mt-2"} flex items-stretch gap-2`}
        onSubmit={(e) => {
          e.preventDefault();
          void ask(question);
        }}
      >
        <label htmlFor={`${id}-q`} className="sr-only">
          Your question
        </label>
        <input
          id={`${id}-q`}
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={placeholder ?? (storyId ? "Ask about this story…" : "Ask about today's stories…")}
          maxLength={500}
          autoComplete="off"
          className={`min-w-0 flex-1 ${inline ? "h-9 text-[13.5px]" : "h-10 text-[14.5px]"} rounded-md border border-hairline-strong bg-surface px-3 text-ink placeholder:text-ink-4 focus:border-navy`}
        />
        <Button type="submit" variant="primary" disabled={state === "streaming" || question.trim().length < 3} aria-label="Ask">
          <IconArrow />
        </Button>
      </form>
      {suggestions.length > 0 && state === "idle" ? (
        <ul className="mt-2.5 m-0 p-0 list-none flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => {
                  setQuestion(s);
                  void ask(s);
                }}
                className="rounded-full border border-hairline bg-surface px-2.5 h-7 text-[12.5px] text-ink-2 hover:border-navy-200 hover:text-ink transition-colors duration-150"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {asked ? (
        <div className="mt-4" aria-busy={state === "streaming"}>
          <p className="m-0 text-[13px] font-medium text-ink-2">{asked}</p>
          {state === "error" ? (
            <p role="alert" className="mt-2 mb-0 text-[14px] text-danger">
              {error}
            </p>
          ) : (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <KindTag kind="inference" />
                <span className="text-[12.5px] text-ink-3">Answered from today&rsquo;s stories. Not advice.</span>
              </div>
              {/* Announced once, when the answer is complete, rather than word by word. */}
              <p className="sr-only" aria-live="polite">{state === "done" ? answer : ""}</p>
              <p className="mt-2 mb-0 font-serif text-[16px] leading-[1.55] text-ink whitespace-pre-wrap">
                {answer}
                {state === "streaming" ? <span aria-hidden="true" className="inline-block w-[2px] h-[1em] align-text-bottom bg-navy animate-pulse ml-0.5" /> : null}
              </p>
              {state === "streaming" && !answer ? <p className="mt-1 mb-0 text-[13px] text-ink-3">Reading today&rsquo;s stories…</p> : null}
            </div>
          )}
          {state === "done" || state === "error" ? (
            <button
              type="button"
              onClick={() => {
                setAsked(null);
                setAnswer("");
                setQuestion("");
                setState("idle");
              }}
              className="mt-3 text-[13px] font-semibold text-blue-text hover:text-navy"
            >
              Ask another question
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
