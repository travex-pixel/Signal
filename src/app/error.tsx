"use client";

import { Button } from "@/components/Button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 py-10">
      <div className="rounded-lg border border-danger/30 bg-danger-100 px-6 py-6 max-w-[52ch]">
        <h1 className="m-0 text-[16px] font-semibold text-ink">Something went wrong</h1>
        <p className="mt-2 mb-0 text-[14.5px] leading-[1.55] text-ink-2">
          SIGNAL could not render this view. The feeds and cached digest are fine. Trying again usually works.
          {error.digest ? <span className="block mt-1 text-[12px] text-ink-3 tnum">Reference {error.digest}</span> : null}
        </p>
        <Button className="mt-4" variant="primary" onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </div>
  );
}
