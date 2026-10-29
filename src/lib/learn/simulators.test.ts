import { describe, expect, it } from "vitest";
import { LESSON_BY_SLUG, LESSONS } from "./lessons";
import { SIMULATOR_BY_SLUG, SIMULATORS } from "./simulators";

describe("simulators", () => {
  it("compute finite results at their defaults and at the extremes", () => {
    for (const sim of SIMULATORS) {
      const defaults = Object.fromEntries(sim.fields.map((f) => [f.id, f.value]));
      const mins = Object.fromEntries(sim.fields.map((f) => [f.id, f.min]));
      const maxs = Object.fromEntries(sim.fields.map((f) => [f.id, f.max]));
      for (const values of [defaults, mins, maxs]) {
        const r = sim.compute(values);
        expect(r.stats.length).toBeGreaterThan(1);
        expect(r.stats.some((s) => s.lead)).toBe(true);
        for (const s of r.stats) expect(s.value).not.toMatch(/NaN|Infinity/);
        expect(r.reading).not.toMatch(/NaN|Infinity/);
        if (r.chart.kind === "line") {
          for (const p of r.chart.points) expect(Number.isFinite(p.y)).toBe(true);
        } else {
          for (const st of r.chart.steps) expect(Number.isFinite(st.value)).toBe(true);
        }
      }
    }
  });

  it("every simulator points at a real lesson and every lesson's simulator exists", () => {
    for (const sim of SIMULATORS) expect(LESSON_BY_SLUG[sim.lesson]).toBeDefined();
    for (const l of LESSONS) {
      if (l.simulator) expect(SIMULATOR_BY_SLUG[l.simulator]).toBeDefined();
      for (const r of l.related) expect(LESSON_BY_SLUG[r]).toBeDefined();
      expect(l.check.answer).toBeLessThan(l.check.options.length);
    }
  });
});
