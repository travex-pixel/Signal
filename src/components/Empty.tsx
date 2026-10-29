import Link from "next/link";
import type { ReactNode } from "react";

/** An honest empty state: says what is missing and what to do. */
export function Empty({ title, children, action }: { title: string; children: ReactNode; action?: { href: string; label: string } }) {
  return (
    <div className="rounded-lg border border-dashed border-hairline-strong bg-surface px-6 py-8 max-w-[52ch]">
      <h2 className="m-0 text-[16px] font-semibold text-ink">{title}</h2>
      <div className="mt-2 text-[14.5px] leading-[1.55] text-ink-2">{children}</div>
      {action ? (
        <Link href={action.href} className="mt-4 inline-block text-[13.5px] font-semibold text-blue-text underline underline-offset-2 decoration-navy-200 hover:decoration-current">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
