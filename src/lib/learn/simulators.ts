import type { PlateName } from "@/components/Plate";
import {
  demandChange,
  fmtMoney,
  fmtNum,
  fmtPct,
  fxMovement,
  landedCost,
  marginAndEbitda,
  safetyStock,
  supplierPriceChange,
  workingCapital,
} from "./calculators";

/**
 * Simulator definitions: inputs, the calculation, and how to present it.
 * Pure data plus pure functions, so the client component stays generic and
 * every scenario is testable without a browser. All default values are
 * illustrative and are labelled as such in the interface.
 */

export interface Field {
  id: string;
  label: string;
  unit?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  /** Short note on what the input means. */
  hint?: string;
}

export interface Stat {
  label: string;
  value: string;
  /** Emphasis: the one number that answers the question. */
  lead?: boolean;
  /** Tone for the value. */
  tone?: "neutral" | "good" | "bad";
}

export type ChartSpec =
  | { kind: "waterfall"; title: string; steps: { label: string; value: number; kind: "total" | "delta"; hue?: string }[]; format: (v: number) => string }
  | { kind: "line"; title: string; xLabel: string; yLabel: string; points: { x: number; y: number }[]; marker?: { x: number; y: number; label?: string }; formatX: (v: number) => string; formatY: (v: number) => string; hue?: string };

export interface SimulatorResult {
  stats: Stat[];
  chart: ChartSpec;
  /** One or two sentences that read the result back in plain English. */
  reading: string;
  /** The assumptions the calculation makes, stated plainly. */
  assumptions: string[];
}

export interface Simulator {
  slug: string;
  title: string;
  question: string;
  plate: PlateName;
  lesson: string;
  fields: Field[];
  compute: (v: Record<string, number>) => SimulatorResult;
}

const money = (v: number) => fmtMoney(v, { compact: true });

export const SIMULATORS: Simulator[] = [
  {
    slug: "supplier-price-change",
    title: "Supplier price change",
    question: "A supplier raises or cuts its price. What happens to margin, and what price holds it?",
    plate: "lesson-margin",
    lesson: "supplier-price-increases",
    fields: [
      { id: "unitCost", label: "Current cost", unit: "$/t", min: 500, max: 5000, step: 10, value: 1500 },
      { id: "changePct", label: "Supplier price change", unit: "%", min: -30, max: 40, step: 0.5, value: 10 },
      { id: "sellingPrice", label: "Current selling price", unit: "$/t", min: 500, max: 6000, step: 10, value: 1800 },
      { id: "volume", label: "Volume", unit: "t/month", min: 10, max: 5000, step: 10, value: 100 },
      { id: "passThroughPct", label: "Pass-through to customers", unit: "%", min: 0, max: 150, step: 5, value: 0, hint: "Share of the cost change recovered in selling prices" },
    ],
    compute: (v) => {
      const o = supplierPriceChange({ unitCost: v.unitCost, changePct: v.changePct, volume: v.volume, sellingPrice: v.sellingPrice, passThroughPct: v.passThroughPct });
      const delta = o.monthlyProfitChange;
      return {
        stats: [
          { label: "Monthly gross profit change", value: money(delta), lead: true, tone: delta < 0 ? "bad" : delta > 0 ? "good" : "neutral" },
          { label: "Gross margin before → after", value: `${fmtPct(o.marginBeforePct)} → ${fmtPct(o.marginAfterPct)}` },
          { label: "New cost", value: fmtMoney(o.newUnitCost) + "/t" },
          { label: "Price to hold margin %", value: fmtMoney(o.priceToHoldMarginPct) + "/t" },
          { label: "Price to hold gross profit $", value: fmtMoney(o.priceToHoldMarginDollars) + "/t" },
        ],
        chart: {
          kind: "waterfall",
          title: "Monthly gross profit, before and after the price change",
          steps: [
            { label: "Before", value: o.grossProfitBefore, kind: "total" },
            { label: "Cost change", value: -(o.newUnitCost - v.unitCost) * v.volume, kind: "delta" },
            { label: "Pass-through", value: (o.newSellingPrice - v.sellingPrice) * v.volume, kind: "delta" },
            { label: "After", value: o.grossProfitAfter, kind: "total" },
          ],
          format: money,
        },
        reading:
          v.passThroughPct >= 100
            ? `Full pass-through holds gross profit in dollars, but the margin percentage still slips from ${fmtPct(o.marginBeforePct)} to ${fmtPct(o.marginAfterPct)} because the same dollars sit on a larger revenue. Holding ${fmtPct(o.marginBeforePct)} needs ${fmtMoney(o.priceToHoldMarginPct)}/t.`
            : `At ${fmtPct(v.passThroughPct, 0)} pass-through the business absorbs ${money(Math.abs(delta))} a month${delta < 0 ? " of lost gross profit" : ""}. Holding the margin percentage needs a selling price of ${fmtMoney(o.priceToHoldMarginPct)}/t; holding the dollars needs ${fmtMoney(o.priceToHoldMarginDollars)}/t.`,
        assumptions: ["Volume is unchanged by the price move.", "The cost change applies to every tonne sold in the month.", "No stock bought at the old price is left to sell at the new one."],
      };
    },
  },
  {
    slug: "exchange-rate",
    title: "Exchange-rate movement",
    question: "The Australian dollar moves. What does it do to the AUD cost of USD-priced purchases?",
    plate: "lesson-fx",
    lesson: "fx-exposure",
    fields: [
      { id: "usdPrice", label: "Supplier price", unit: "US$/t", min: 300, max: 4000, step: 10, value: 1000 },
      { id: "rateNow", label: "AUD/USD now", unit: "", min: 0.45, max: 0.95, step: 0.005, value: 0.65 },
      { id: "rateScenario", label: "AUD/USD scenario", unit: "", min: 0.45, max: 0.95, step: 0.005, value: 0.6 },
      { id: "volume", label: "Volume", unit: "t/month", min: 10, max: 5000, step: 10, value: 500 },
      { id: "hedgedPct", label: "Hedged at today's rate", unit: "%", min: 0, max: 100, step: 5, value: 0 },
    ],
    compute: (v) => {
      const o = fxMovement({ usdPrice: v.usdPrice, rateNow: v.rateNow, rateScenario: v.rateScenario, volume: v.volume, hedgedPct: v.hedgedPct });
      const points = Array.from({ length: 21 }, (_, i) => {
        const r = 0.5 + i * 0.02;
        return { x: r, y: v.usdPrice / r };
      });
      return {
        stats: [
          { label: "Monthly spend change", value: money(o.monthlyImpact), lead: true, tone: o.monthlyImpact > 0 ? "bad" : o.monthlyImpact < 0 ? "good" : "neutral" },
          { label: "AUD cost now → scenario", value: `${fmtMoney(o.audCostNow)} → ${fmtMoney(o.audCostScenario)}/t` },
          { label: "Effective cost after hedging", value: fmtMoney(o.audCostEffective) + "/t" },
          { label: "Change in unit cost", value: fmtPct(o.pctChange) },
        ],
        chart: {
          kind: "line",
          title: "AUD cost per tonne against the AUD/USD rate",
          xLabel: "AUD/USD",
          yLabel: "AUD per tonne",
          points,
          marker: { x: v.rateScenario, y: o.audCostScenario, label: `${fmtMoney(o.audCostScenario)} at ${v.rateScenario.toFixed(3)}` },
          formatX: (x) => x.toFixed(2),
          formatY: (y) => fmtMoney(y, { compact: true }),
          hue: "blue",
        },
        reading: `A move from ${v.rateNow.toFixed(3)} to ${v.rateScenario.toFixed(3)} changes the AUD cost of the same tonne by ${fmtPct(((o.audCostScenario - o.audCostNow) / o.audCostNow) * 100)}. With ${fmtPct(v.hedgedPct, 0)} hedged, the effective change is ${fmtPct(o.pctChange)}, or ${money(o.monthlyImpact)} a month on ${fmtNum(v.volume)} tonnes.`,
        assumptions: ["The USD price is unchanged by the currency move.", "Hedges are struck at today's rate for the hedged share.", "No lag: the new rate applies to the whole month."],
      };
    },
  },
  {
    slug: "freight-and-landed-cost",
    title: "Freight cost change",
    question: "Container rates move. How much does landed cost per tonne actually change?",
    plate: "lesson-freight",
    lesson: "freight-and-landed-cost",
    fields: [
      { id: "fobCost", label: "Supplier price (FOB)", unit: "$/t", min: 300, max: 5000, step: 10, value: 1500 },
      { id: "freightPerContainer", label: "Freight per container", unit: "$", min: 500, max: 15000, step: 50, value: 2500 },
      { id: "tonnesPerContainer", label: "Tonnes per container", unit: "t", min: 5, max: 28, step: 0.5, value: 25, hint: "Resin pellets load heavier than film" },
      { id: "dutyPct", label: "Duty", unit: "% of FOB", min: 0, max: 25, step: 0.5, value: 5 },
      { id: "otherPerTonne", label: "Insurance, port, delivery", unit: "$/t", min: 0, max: 300, step: 5, value: 40 },
      { id: "freightChangePct", label: "Freight rate change", unit: "%", min: -60, max: 200, step: 5, value: 50 },
    ],
    compute: (v) => {
      const o = landedCost({ fobCost: v.fobCost, freightPerContainer: v.freightPerContainer, tonnesPerContainer: v.tonnesPerContainer, dutyPct: v.dutyPct, otherPerTonne: v.otherPerTonne, freightChangePct: v.freightChangePct });
      return {
        stats: [
          { label: "Landed cost change", value: `${fmtMoney(o.landedChange)}/t (${fmtPct(o.landedChangePct)})`, lead: true, tone: o.landedChange > 0 ? "bad" : o.landedChange < 0 ? "good" : "neutral" },
          { label: "Landed cost now → scenario", value: `${fmtMoney(o.landedNow)} → ${fmtMoney(o.landedScenario)}/t` },
          { label: "Freight share of landed cost", value: fmtPct(o.freightShareNowPct) },
          { label: "Freight per tonne now", value: fmtMoney(o.freightPerTonne) + "/t" },
        ],
        chart: {
          kind: "waterfall",
          title: "Landed cost per tonne, built up from the supplier price",
          steps: [
            { label: "FOB price", value: v.fobCost, kind: "total" },
            { label: "Freight", value: o.freightPerTonne * (1 + v.freightChangePct / 100), kind: "delta", hue: "cyan" },
            { label: "Duty", value: o.dutyPerTonne, kind: "delta", hue: "yellow" },
            { label: "Other", value: v.otherPerTonne, kind: "delta", hue: "slate" },
            { label: "Landed", value: o.landedScenario, kind: "total" },
          ],
          format: (x) => fmtMoney(x),
        },
        reading: `Freight is ${fmtPct(o.freightShareNowPct)} of landed cost, so a ${fmtPct(v.freightChangePct, 0)} change in container rates moves landed cost by ${fmtPct(o.landedChangePct)}. ${Math.abs(v.freightChangePct) >= 50 ? "A dramatic freight headline becomes a modest landed-cost change for dense goods; for lighter products the share, and the effect, is larger." : "Small freight moves barely register in landed cost for dense goods."}`,
        assumptions: ["Duty is charged on the FOB value only.", "Freight is spread evenly over the tonnes in the container.", "Currency is held constant."],
      };
    },
  },
  {
    slug: "demand-slowdown",
    title: "Demand slowdown",
    question: "Volume softens. Hold price or cut it? See what each does to EBITDA and where break-even sits.",
    plate: "lesson-tradeoffs",
    lesson: "demand-and-trade-offs",
    fields: [
      { id: "revenue", label: "Monthly revenue", unit: "$", min: 100000, max: 20000000, step: 50000, value: 1000000 },
      { id: "grossMarginPct", label: "Gross margin", unit: "%", min: 3, max: 60, step: 0.5, value: 20 },
      { id: "fixedCosts", label: "Monthly fixed costs", unit: "$", min: 10000, max: 5000000, step: 10000, value: 150000 },
      { id: "volumeChangePct", label: "Volume change", unit: "%", min: -50, max: 30, step: 1, value: -10 },
      { id: "priceChangePct", label: "Price response", unit: "%", min: -20, max: 20, step: 0.5, value: 0 },
    ],
    compute: (v) => {
      const o = demandChange({ revenue: v.revenue, grossMarginPct: v.grossMarginPct, fixedCosts: v.fixedCosts, volumeChangePct: v.volumeChangePct, priceChangePct: v.priceChangePct });
      const gp = v.revenue * (v.grossMarginPct / 100);
      const priceEffect = v.revenue * (1 + v.volumeChangePct / 100) * (v.priceChangePct / 100);
      const volumeEffect = gp * (v.volumeChangePct / 100);
      return {
        stats: [
          { label: "EBITDA change", value: money(o.ebitdaChange), lead: true, tone: o.ebitdaChange < 0 ? "bad" : o.ebitdaChange > 0 ? "good" : "neutral" },
          { label: "EBITDA before → after", value: `${money(o.ebitdaBefore)} → ${money(o.ebitdaAfter)}` },
          { label: "Break-even volume change", value: fmtPct(o.breakEvenVolumeChangePct, 0) },
          { label: "Revenue after", value: money(o.revenueAfter) },
        ],
        chart: {
          kind: "waterfall",
          title: "Monthly EBITDA, before and after the demand change and price response",
          steps: [
            { label: "Before", value: o.ebitdaBefore, kind: "total" },
            { label: "Volume", value: volumeEffect, kind: "delta" },
            { label: "Price", value: priceEffect, kind: "delta" },
            { label: "After", value: o.ebitdaAfter, kind: "total" },
          ],
          format: money,
        },
        reading: `A ${fmtPct(Math.abs(v.volumeChangePct), 0)} ${v.volumeChangePct < 0 ? "fall" : "rise"} in volume moves EBITDA by ${money(volumeEffect)}; a ${fmtPct(Math.abs(v.priceChangePct))} price ${v.priceChangePct < 0 ? "cut" : "rise"} moves it by ${money(priceEffect)}. Break-even is a ${fmtPct(Math.abs(o.breakEvenVolumeChangePct), 0)} fall in volume at current prices.`,
        assumptions: ["Cost of goods scales with volume; fixed costs do not move.", "A price change applies to all volume sold after the change.", "The price response does not itself change volume (test that by moving both)."],
      };
    },
  },
  {
    slug: "inventory-and-stockouts",
    title: "Inventory and stockouts",
    question: "How much safety stock does a service level cost, and what does lead-time variability do to it?",
    plate: "lesson-inventory",
    lesson: "inventory-and-service-levels",
    fields: [
      { id: "dailyDemand", label: "Average daily demand", unit: "t/day", min: 1, max: 200, step: 1, value: 10 },
      { id: "demandStdDev", label: "Daily demand variability (σ)", unit: "t", min: 0, max: 100, step: 0.5, value: 3 },
      { id: "leadTimeDays", label: "Average lead time", unit: "days", min: 5, max: 120, step: 1, value: 30 },
      { id: "leadTimeStdDev", label: "Lead-time variability (σ)", unit: "days", min: 0, max: 40, step: 0.5, value: 5 },
      { id: "serviceLevelPct", label: "Target service level", unit: "%", min: 80, max: 99.5, step: 0.5, value: 95 },
      { id: "valuePerTonne", label: "Inventory value", unit: "$/t", min: 300, max: 5000, step: 10, value: 1800 },
      { id: "carryingCostPct", label: "Annual carrying cost", unit: "% of value", min: 5, max: 40, step: 1, value: 18, hint: "Financing, storage, insurance, obsolescence" },
    ],
    compute: (v) => {
      const o = safetyStock({ dailyDemand: v.dailyDemand, demandStdDev: v.demandStdDev, leadTimeDays: v.leadTimeDays, leadTimeStdDev: v.leadTimeStdDev, serviceLevelPct: v.serviceLevelPct, valuePerTonne: v.valuePerTonne, carryingCostPct: v.carryingCostPct });
      return {
        stats: [
          { label: "Safety stock", value: `${fmtNum(o.safetyStockTonnes)} t (${money(o.safetyStockValue)})`, lead: true },
          { label: "Reorder point", value: `${fmtNum(o.reorderPointTonnes)} t` },
          { label: "Annual cost of carrying it", value: money(o.annualCarryingCost) },
          { label: "Days of safety cover", value: `${fmtNum(o.safetyStockTonnes / Math.max(v.dailyDemand, 0.01), 1)} days` },
        ],
        chart: {
          kind: "line",
          title: "Safety stock required against target service level",
          xLabel: "Service level (%)",
          yLabel: "Safety stock (t)",
          points: o.curve.map((c) => ({ x: c.serviceLevelPct, y: c.safetyStockTonnes })),
          marker: { x: v.serviceLevelPct, y: o.safetyStockTonnes, label: `${fmtNum(o.safetyStockTonnes)} t at ${v.serviceLevelPct}%` },
          formatX: (x) => `${x}`,
          formatY: (y) => fmtNum(y),
          hue: "cyan",
        },
        reading: `At ${v.serviceLevelPct}% service, ${fmtNum(o.safetyStockTonnes)} tonnes of safety stock sit on top of ${fmtNum(v.dailyDemand * v.leadTimeDays)} tonnes of expected lead-time demand, costing about ${money(o.annualCarryingCost)} a year to carry. The curve steepens toward 99%: the last points of service are the dearest.`,
        assumptions: ["Demand and lead time are independent and roughly normal.", "A cycle service level: the chance of not running out during a replenishment cycle.", "Carrying cost is a flat annual percentage of inventory value."],
      };
    },
  },
  {
    slug: "margin-and-ebitda",
    title: "Gross margin and EBITDA",
    question: "From revenue to EBITDA: see how the cost base turns a trading margin into an operating result.",
    plate: "lesson-pnl",
    lesson: "gross-margin-and-ebitda",
    fields: [
      { id: "revenue", label: "Monthly revenue", unit: "$", min: 100000, max: 50000000, step: 100000, value: 10000000 },
      { id: "cogs", label: "Cost of goods sold", unit: "$", min: 50000, max: 48000000, step: 100000, value: 8300000 },
      { id: "opex", label: "Operating costs", unit: "$", min: 10000, max: 10000000, step: 50000, value: 1200000 },
      { id: "depreciation", label: "Depreciation", unit: "$", min: 0, max: 2000000, step: 10000, value: 100000 },
    ],
    compute: (v) => {
      const o = marginAndEbitda({ revenue: v.revenue, cogs: v.cogs, opex: v.opex, depreciation: v.depreciation });
      return {
        stats: [
          { label: "EBITDA", value: `${money(o.ebitda)} (${fmtPct(o.ebitdaMarginPct)})`, lead: true, tone: o.ebitda < 0 ? "bad" : "neutral" },
          { label: "Gross profit", value: `${money(o.grossProfit)} (${fmtPct(o.grossMarginPct)})` },
          { label: "EBIT", value: money(o.ebit) },
          { label: "Operating leverage", value: `${fmtNum(o.ebitda !== 0 ? o.grossProfit / o.ebitda : 0, 1)}×`, tone: "neutral" },
        ],
        chart: {
          kind: "waterfall",
          title: "From revenue to EBITDA",
          steps: [
            { label: "Revenue", value: v.revenue, kind: "total" },
            { label: "Cost of goods", value: -v.cogs, kind: "delta" },
            { label: "Gross profit", value: o.grossProfit, kind: "total", hue: "blue" },
            { label: "Operating costs", value: -v.opex, kind: "delta" },
            { label: "EBITDA", value: o.ebitda, kind: "total" },
          ],
          format: money,
        },
        reading: `Gross margin of ${fmtPct(o.grossMarginPct)} becomes an EBITDA margin of ${fmtPct(o.ebitdaMarginPct)} after operating costs. Operating leverage of ${fmtNum(o.ebitda !== 0 ? o.grossProfit / o.ebitda : 0, 1)}× means a 1% change in gross profit moves EBITDA by about ${fmtNum(o.ebitda !== 0 ? o.grossProfit / o.ebitda : 0, 1)}%.`,
        assumptions: ["All figures for one month.", "Operating costs are treated as fixed for the period.", "Interest and tax are below EBIT and not shown."],
      };
    },
  },
  {
    slug: "working-capital",
    title: "Working capital and cash conversion",
    question: "How many days of cash does the business fund, and what does each day cost at today's rates?",
    plate: "lesson-inventory",
    lesson: "working-capital",
    fields: [
      { id: "revenue", label: "Annual revenue", unit: "$", min: 1000000, max: 500000000, step: 500000, value: 36500000 },
      { id: "cogs", label: "Annual cost of goods", unit: "$", min: 500000, max: 450000000, step: 500000, value: 29200000 },
      { id: "dso", label: "Customer payment days (DSO)", unit: "days", min: 0, max: 120, step: 1, value: 45 },
      { id: "dio", label: "Inventory days (DIO)", unit: "days", min: 0, max: 180, step: 1, value: 60 },
      { id: "dpo", label: "Supplier payment days (DPO)", unit: "days", min: 0, max: 120, step: 1, value: 30 },
      { id: "ratePct", label: "Financing rate", unit: "%", min: 1, max: 15, step: 0.25, value: 7 },
    ],
    compute: (v) => {
      const o = workingCapital({ revenue: v.revenue, cogs: v.cogs, dso: v.dso, dio: v.dio, dpo: v.dpo, ratePct: v.ratePct });
      return {
        stats: [
          { label: "Cash conversion cycle", value: `${fmtNum(o.cashConversionDays)} days`, lead: true },
          { label: "Net working capital", value: money(o.netWorkingCapital) },
          { label: "Annual financing cost", value: money(o.annualFinancingCost), tone: "bad" },
          { label: "Cash freed per day cut", value: money(o.cashPerDay) },
        ],
        chart: {
          kind: "waterfall",
          title: "Net working capital: receivables plus inventory less payables",
          steps: [
            { label: "Receivables", value: o.receivables, kind: "delta", hue: "blue" },
            { label: "Inventory", value: o.inventory, kind: "delta", hue: "cyan" },
            { label: "Payables", value: -o.payables, kind: "delta", hue: "coral" },
            { label: "Net", value: o.netWorkingCapital, kind: "total" },
          ],
          format: money,
        },
        reading: `The business funds ${fmtNum(o.cashConversionDays)} days of its cost of goods, ${money(o.netWorkingCapital)} of working capital, costing about ${money(o.annualFinancingCost)} a year at ${fmtPct(v.ratePct, 2)}. Each day cut from the cycle frees about ${money(o.cashPerDay)}.`,
        assumptions: ["Receivables are measured on revenue; inventory and payables on cost of goods.", "A simple average-day model; seasonality is ignored.", "All working capital is financed at the stated rate."],
      };
    },
  },
];

export const SIMULATOR_BY_SLUG: Record<string, Simulator> = Object.fromEntries(SIMULATORS.map((s) => [s.slug, s]));
