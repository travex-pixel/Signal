import type { Claim, ClaimKind } from "@/lib/analysis/types";

const KIND: Record<ClaimKind, { label: string; className: string; title: string }> = {
  fact: { label: "Fact", className: "bg-navy-100 text-navy", title: "Stated by the source" },
  inference: { label: "Inference", className: "bg-blue-100 text-blue-text", title: "SIGNAL's reasoning from a named mechanism" },
  hypothesis: { label: "Hypothesis", className: "bg-yellow-100 text-yellow-text", title: "Plausible, not confirmed" },
  unknown: { label: "Unknown", className: "bg-slate-100 text-slate-text", title: "Would change the conclusion; not known" },
};

export function KindTag({ kind }: { kind: ClaimKind }) {
  const k = KIND[kind];
  return (
    <span
      title={k.title}
      className={`inline-block align-middle rounded-sm px-1.5 py-[1px] text-[10.5px] font-semibold uppercase tracking-[0.06em] leading-4 ${k.className}`}
    >
      {k.label}
    </span>
  );
}

/** Labelled statements. The label sits in the margin on wide screens and inline on narrow ones. */
export function ClaimList({ claims }: { claims: Claim[] }) {
  return (
    <ul className="list-none p-0 m-0 space-y-3">
      {claims.map((c, i) => (
        <li key={i} className="grid grid-cols-[auto_1fr] gap-x-3 items-start">
          <span className="pt-[3px]">
            <KindTag kind={c.kind} />
          </span>
          <p className="m-0 text-[16px] leading-[1.55] font-serif text-ink">{c.text}</p>
        </li>
      ))}
    </ul>
  );
}

export function KindLegend() {
  return (
    <ul className="list-none p-0 m-0 flex flex-wrap gap-x-4 gap-y-1.5">
      {(Object.keys(KIND) as ClaimKind[]).map((k) => (
        <li key={k} className="flex items-center gap-1.5 text-[12px] text-ink-3">
          <KindTag kind={k} />
          <span>{KIND[k].title}</span>
        </li>
      ))}
    </ul>
  );
}
