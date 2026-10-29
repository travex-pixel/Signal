"use client";

import { useMemo, useState } from "react";
import { SIMULATOR_BY_SLUG } from "@/lib/learn/simulators";
import { Button } from "./Button";
import { LineChart } from "./charts/LineChart";
import { WaterfallChart } from "./charts/WaterfallChart";

/**
 * The generic simulator: inputs on the left, the answer and a chart on the
 * right. Every number recomputes as the reader moves a control, and the
 * assumptions are always in view.
 */
export function Simulator({ slug }: { slug: string }) {
  const def = SIMULATOR_BY_SLUG[slug];
  const defaults = useMemo(() => Object.fromEntries(def.fields.map((f) => [f.id, f.value])), [def]);
  const [values, setValues] = useState<Record<string, number>>(defaults);
  const result = useMemo(() => def.compute(values), [def, values]);
  const dirty = def.fields.some((f) => values[f.id] !== f.value);

  return (
    <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-12">
      <form className="min-w-0" onSubmit={(e) => e.preventDefault()} aria-label="Scenario inputs">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">Inputs</h2>
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-warn">Illustrative values</span>
        </div>
        <div className="mt-2 divide-y divide-hairline">
          {def.fields.map((f) => {
            const v = values[f.id];
            const id = `sim-${def.slug}-${f.id}`;
            return (
              <div key={f.id} className="py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <label htmlFor={id} className="text-[13.5px] font-medium text-ink">
                    {f.label}
                  </label>
                  <span className="inline-flex items-baseline gap-1">
                    <input
                      id={id}
                      type="number"
                      inputMode="decimal"
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      value={v}
                      onChange={(e) => setValues({ ...values, [f.id]: Number(e.target.value) })}
                      className="w-[7.5rem] h-8 rounded-md border border-hairline-strong bg-surface px-2 text-right text-[13.5px] tnum text-ink focus:border-navy"
                    />
                    {f.unit ? <span className="text-[12px] text-ink-3 w-14">{f.unit}</span> : <span className="w-14" />}
                  </span>
                </div>
                <input
                  type="range"
                  aria-label={`${f.label} slider`}
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  value={v}
                  onChange={(e) => setValues({ ...values, [f.id]: Number(e.target.value) })}
                  className="mt-2 w-full h-1.5 cursor-pointer accent-navy"
                />
                {f.hint ? <p className="mt-1 mb-0 text-[12px] text-ink-3">{f.hint}</p> : null}
              </div>
            );
          })}
        </div>
        <div className="mt-3">
          <Button type="button" variant="ghost" onClick={() => setValues(defaults)} disabled={!dirty}>
            Reset to defaults
          </Button>
        </div>
      </form>

      <section className="min-w-0" aria-live="polite" aria-label="Results">
        <dl className="m-0 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {result.stats.map((s) => (
            <div key={s.label} className={s.lead ? "sm:col-span-2" : ""}>
              <dt className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-3">{s.label}</dt>
              <dd
                className={`m-0 mt-0.5 tnum font-semibold tracking-[-0.01em] ${s.lead ? "text-[30px] md:text-[36px] leading-[1.1]" : "text-[17px] leading-[1.3]"} ${
                  s.tone === "bad" ? "text-coral-text" : s.tone === "good" ? "text-ok" : "text-ink"
                }`}
              >
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 mb-0 font-serif text-[16px] leading-[1.55] text-ink max-w-[62ch]">{result.reading}</p>
        <div className="mt-6 rounded-lg bg-surface border border-hairline p-4 md:p-5">
          {result.chart.kind === "waterfall" ? (
            <WaterfallChart steps={result.chart.steps} format={result.chart.format} title={result.chart.title} />
          ) : (
            <LineChart
              points={result.chart.points}
              marker={result.chart.marker}
              title={result.chart.title}
              xLabel={result.chart.xLabel}
              yLabel={result.chart.yLabel}
              formatX={result.chart.formatX}
              formatY={result.chart.formatY}
              hue={result.chart.hue}
            />
          )}
          <p className="mt-2 mb-0 text-[12px] text-ink-3">{result.chart.title}</p>
        </div>
        <div className="mt-5">
          <h3 className="m-0 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-3">Assumptions</h3>
          <ul className="mt-1.5 mb-0 pl-4 space-y-1 text-[13.5px] leading-[1.5] text-ink-2">
            {result.assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
