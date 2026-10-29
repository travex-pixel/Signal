import { describe, expect, it } from "vitest";
import {
  demandChange,
  fmtMoney,
  fxMovement,
  landedCost,
  marginAndEbitda,
  safetyStock,
  supplierPriceChange,
  workingCapital,
  zForServiceLevel,
} from "./calculators";

describe("marginAndEbitda", () => {
  it("computes gross profit, EBITDA and EBIT", () => {
    const o = marginAndEbitda({ revenue: 1000, cogs: 700, opex: 200, depreciation: 50 });
    expect(o.grossProfit).toBe(300);
    expect(o.grossMarginPct).toBe(30);
    expect(o.ebitda).toBe(100);
    expect(o.ebitdaMarginPct).toBe(10);
    expect(o.ebit).toBe(50);
  });
});

describe("supplierPriceChange", () => {
  it("shows margin erosion without pass-through and the price that holds margin", () => {
    const o = supplierPriceChange({ unitCost: 1500, changePct: 10, volume: 100, sellingPrice: 1800, passThroughPct: 0 });
    expect(o.newUnitCost).toBeCloseTo(1650, 6);
    expect(o.marginBeforePct).toBeCloseTo(16.67, 1);
    expect(o.marginAfterPct).toBeCloseTo(8.33, 1);
    expect(o.monthlyProfitChange).toBeCloseTo(-15000, 4);
    expect(o.priceToHoldMarginPct).toBeCloseTo(1980, 0);
    expect(o.priceToHoldMarginDollars).toBeCloseTo(1950, 6);
  });
  it("full pass-through holds dollars but not percentage", () => {
    const o = supplierPriceChange({ unitCost: 1500, changePct: 10, volume: 100, sellingPrice: 1800, passThroughPct: 100 });
    expect(o.monthlyProfitChange).toBeCloseTo(0, 4);
    expect(o.marginAfterPct).toBeLessThan(o.marginBeforePct);
  });
});

describe("fxMovement", () => {
  it("a weaker AUD raises AUD cost; hedging dampens it", () => {
    const o = fxMovement({ usdPrice: 1000, rateNow: 0.65, rateScenario: 0.6, volume: 500, hedgedPct: 0 });
    expect(o.audCostNow).toBeCloseTo(1538.46, 1);
    expect(o.audCostScenario).toBeCloseTo(1666.67, 1);
    expect(o.pctChange).toBeCloseTo(8.33, 1);
    const hedged = fxMovement({ usdPrice: 1000, rateNow: 0.65, rateScenario: 0.6, volume: 500, hedgedPct: 50 });
    expect(hedged.monthlyImpact).toBeCloseTo(o.monthlyImpact / 2, 0);
  });
});

describe("landedCost", () => {
  it("adds freight, duty and other costs and scales freight in the scenario", () => {
    const o = landedCost({ fobCost: 1500, freightPerContainer: 2500, tonnesPerContainer: 25, dutyPct: 5, otherPerTonne: 40, freightChangePct: 50 });
    expect(o.freightPerTonne).toBe(100);
    expect(o.dutyPerTonne).toBe(75);
    expect(o.landedNow).toBe(1715);
    expect(o.landedScenario).toBe(1765);
    expect(o.landedChangePct).toBeCloseTo(2.92, 1);
  });
});

describe("demandChange", () => {
  it("falls to break-even at the computed volume change", () => {
    const o = demandChange({ revenue: 1_000_000, grossMarginPct: 20, fixedCosts: 150_000, volumeChangePct: -10, priceChangePct: 0 });
    expect(o.ebitdaBefore).toBe(50_000);
    expect(o.ebitdaAfter).toBe(30_000);
    expect(o.breakEvenVolumeChangePct).toBeCloseTo(-25, 5);
    const be = demandChange({ revenue: 1_000_000, grossMarginPct: 20, fixedCosts: 150_000, volumeChangePct: -25, priceChangePct: 0 });
    expect(be.ebitdaAfter).toBeCloseTo(0, 5);
  });
  it("a price cut flows straight through margin", () => {
    const o = demandChange({ revenue: 1_000_000, grossMarginPct: 20, fixedCosts: 150_000, volumeChangePct: 0, priceChangePct: -5 });
    expect(o.ebitdaChange).toBe(-50_000);
  });
});

describe("safetyStock", () => {
  it("inverse normal is accurate at common service levels", () => {
    expect(zForServiceLevel(0.5)).toBeCloseTo(0, 6);
    expect(zForServiceLevel(0.95)).toBeCloseTo(1.6449, 3);
    expect(zForServiceLevel(0.99)).toBeCloseTo(2.3263, 3);
  });
  it("more variability and a higher service level need more stock", () => {
    const base = { dailyDemand: 10, demandStdDev: 3, leadTimeDays: 30, leadTimeStdDev: 5, serviceLevelPct: 95, valuePerTonne: 1800, carryingCostPct: 18 };
    const a = safetyStock(base);
    const b = safetyStock({ ...base, leadTimeStdDev: 10 });
    const c = safetyStock({ ...base, serviceLevelPct: 99 });
    expect(b.safetyStockTonnes).toBeGreaterThan(a.safetyStockTonnes);
    expect(c.safetyStockTonnes).toBeGreaterThan(a.safetyStockTonnes);
    expect(a.reorderPointTonnes).toBeCloseTo(300 + a.safetyStockTonnes, 6);
    expect(a.annualCarryingCost).toBeCloseTo(a.safetyStockValue * 0.18, 6);
    expect(a.curve).toHaveLength(11);
  });
});

describe("workingCapital", () => {
  it("computes the cash conversion cycle and its financing cost", () => {
    const o = workingCapital({ revenue: 36_500_000, cogs: 29_200_000, dso: 45, dio: 60, dpo: 30, ratePct: 7 });
    expect(o.cashConversionDays).toBe(75);
    expect(o.receivables).toBeCloseTo(4_500_000, 0);
    expect(o.inventory).toBeCloseTo(4_800_000, 0);
    expect(o.payables).toBeCloseTo(2_400_000, 0);
    expect(o.netWorkingCapital).toBeCloseTo(6_900_000, 0);
    expect(o.annualFinancingCost).toBeCloseTo(483_000, 0);
  });
});

describe("formatting", () => {
  it("formats money compactly with a proper minus sign", () => {
    expect(fmtMoney(-15000)).toBe("−$15,000");
    expect(fmtMoney(2_500_000, { compact: true })).toBe("$2.50m");
    expect(fmtMoney(48_000, { compact: true })).toBe("$48k");
  });
});
