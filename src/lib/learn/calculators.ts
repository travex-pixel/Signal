/**
 * Commercial calculators behind the simulators and lessons.
 *
 * Pure functions, fully testable, no UI. Every input is an illustrative
 * value the reader supplies; nothing here is company data. Money is in
 * Australian dollars unless a parameter says otherwise.
 */

export interface MarginInputs {
  revenue: number;
  cogs: number;
  opex: number;
  depreciation: number;
}

export interface MarginOutputs {
  grossProfit: number;
  grossMarginPct: number;
  ebitda: number;
  ebitdaMarginPct: number;
  ebit: number;
}

export function marginAndEbitda(i: MarginInputs): MarginOutputs {
  const grossProfit = i.revenue - i.cogs;
  const ebitda = grossProfit - i.opex;
  const ebit = ebitda - i.depreciation;
  return {
    grossProfit,
    grossMarginPct: i.revenue > 0 ? (grossProfit / i.revenue) * 100 : 0,
    ebitda,
    ebitdaMarginPct: i.revenue > 0 ? (ebitda / i.revenue) * 100 : 0,
    ebit,
  };
}

export interface SupplierPriceInputs {
  /** Current purchase cost per tonne. */
  unitCost: number;
  /** Supplier price change in percent (positive = increase). */
  changePct: number;
  /** Tonnes sold per month. */
  volume: number;
  /** Current selling price per tonne. */
  sellingPrice: number;
  /** Share of the cost change passed to customers, 0–100. */
  passThroughPct: number;
}

export interface SupplierPriceOutputs {
  newUnitCost: number;
  newSellingPrice: number;
  marginBeforePct: number;
  marginAfterPct: number;
  grossProfitBefore: number;
  grossProfitAfter: number;
  monthlyProfitChange: number;
  /** Selling price that would keep the original gross-margin percentage. */
  priceToHoldMarginPct: number;
  /** Selling price that would keep the original gross profit in dollars. */
  priceToHoldMarginDollars: number;
}

export function supplierPriceChange(i: SupplierPriceInputs): SupplierPriceOutputs {
  const newUnitCost = i.unitCost * (1 + i.changePct / 100);
  const costDelta = newUnitCost - i.unitCost;
  const newSellingPrice = i.sellingPrice + costDelta * (i.passThroughPct / 100);
  const marginBeforePct = i.sellingPrice > 0 ? ((i.sellingPrice - i.unitCost) / i.sellingPrice) * 100 : 0;
  const marginAfterPct = newSellingPrice > 0 ? ((newSellingPrice - newUnitCost) / newSellingPrice) * 100 : 0;
  const grossProfitBefore = (i.sellingPrice - i.unitCost) * i.volume;
  const grossProfitAfter = (newSellingPrice - newUnitCost) * i.volume;
  const priceToHoldMarginPct = marginBeforePct < 100 ? newUnitCost / (1 - marginBeforePct / 100) : newUnitCost;
  return {
    newUnitCost,
    newSellingPrice,
    marginBeforePct,
    marginAfterPct,
    grossProfitBefore,
    grossProfitAfter,
    monthlyProfitChange: grossProfitAfter - grossProfitBefore,
    priceToHoldMarginPct,
    priceToHoldMarginDollars: i.sellingPrice + costDelta,
  };
}

export interface FxInputs {
  /** Supplier price in USD per tonne. */
  usdPrice: number;
  /** Current AUD/USD rate (US dollars per Australian dollar). */
  rateNow: number;
  /** Scenario AUD/USD rate. */
  rateScenario: number;
  /** Tonnes purchased per month. */
  volume: number;
  /** Share of purchases hedged at the current rate, 0–100. */
  hedgedPct: number;
}

export interface FxOutputs {
  audCostNow: number;
  audCostScenario: number;
  /** Effective AUD cost per tonne after hedging. */
  audCostEffective: number;
  monthlySpendNow: number;
  monthlySpendScenario: number;
  monthlyImpact: number;
  pctChange: number;
}

export function fxMovement(i: FxInputs): FxOutputs {
  const audCostNow = i.rateNow > 0 ? i.usdPrice / i.rateNow : 0;
  const audCostScenario = i.rateScenario > 0 ? i.usdPrice / i.rateScenario : 0;
  const h = i.hedgedPct / 100;
  const audCostEffective = audCostNow * h + audCostScenario * (1 - h);
  const monthlySpendNow = audCostNow * i.volume;
  const monthlySpendScenario = audCostEffective * i.volume;
  return {
    audCostNow,
    audCostScenario,
    audCostEffective,
    monthlySpendNow,
    monthlySpendScenario,
    monthlyImpact: monthlySpendScenario - monthlySpendNow,
    pctChange: audCostNow > 0 ? ((audCostEffective - audCostNow) / audCostNow) * 100 : 0,
  };
}

export interface LandedCostInputs {
  /** Purchase cost per tonne (FOB), in AUD. */
  fobCost: number;
  /** Freight per container, in AUD. */
  freightPerContainer: number;
  /** Tonnes per container. */
  tonnesPerContainer: number;
  /** Duty as a percentage of FOB. */
  dutyPct: number;
  /** Insurance, port, handling and local delivery per tonne, in AUD. */
  otherPerTonne: number;
  /** Scenario change in freight per container, in percent. */
  freightChangePct: number;
}

export interface LandedCostOutputs {
  freightPerTonne: number;
  dutyPerTonne: number;
  landedNow: number;
  landedScenario: number;
  freightShareNowPct: number;
  landedChange: number;
  landedChangePct: number;
}

export function landedCost(i: LandedCostInputs): LandedCostOutputs {
  const freightPerTonne = i.tonnesPerContainer > 0 ? i.freightPerContainer / i.tonnesPerContainer : 0;
  const dutyPerTonne = i.fobCost * (i.dutyPct / 100);
  const landedNow = i.fobCost + freightPerTonne + dutyPerTonne + i.otherPerTonne;
  const freightScenario = freightPerTonne * (1 + i.freightChangePct / 100);
  const landedScenario = i.fobCost + freightScenario + dutyPerTonne + i.otherPerTonne;
  return {
    freightPerTonne,
    dutyPerTonne,
    landedNow,
    landedScenario,
    freightShareNowPct: landedNow > 0 ? (freightPerTonne / landedNow) * 100 : 0,
    landedChange: landedScenario - landedNow,
    landedChangePct: landedNow > 0 ? ((landedScenario - landedNow) / landedNow) * 100 : 0,
  };
}

export interface DemandInputs {
  /** Monthly revenue in AUD. */
  revenue: number;
  /** Gross margin in percent. */
  grossMarginPct: number;
  /** Monthly fixed operating costs in AUD. */
  fixedCosts: number;
  /** Change in volume, in percent (negative = slowdown). */
  volumeChangePct: number;
  /** Change in selling price, in percent, as a response. */
  priceChangePct: number;
}

export interface DemandOutputs {
  ebitdaBefore: number;
  ebitdaAfter: number;
  revenueAfter: number;
  grossProfitAfter: number;
  /** Volume change at which EBITDA reaches zero, in percent. */
  breakEvenVolumeChangePct: number;
  ebitdaChange: number;
}

export function demandChange(i: DemandInputs): DemandOutputs {
  const gm = i.grossMarginPct / 100;
  const grossProfitBefore = i.revenue * gm;
  const ebitdaBefore = grossProfitBefore - i.fixedCosts;
  const volumeFactor = 1 + i.volumeChangePct / 100;
  const priceFactor = 1 + i.priceChangePct / 100;
  // Cost of goods scales with volume; price changes flow straight to margin.
  const cogsBefore = i.revenue * (1 - gm);
  const revenueAfter = i.revenue * volumeFactor * priceFactor;
  const cogsAfter = cogsBefore * volumeFactor;
  const grossProfitAfter = revenueAfter - cogsAfter;
  const ebitdaAfter = grossProfitAfter - i.fixedCosts;
  const breakEvenVolumeChangePct = grossProfitBefore > 0 ? ((i.fixedCosts / grossProfitBefore) - 1) * 100 : 0;
  return { ebitdaBefore, ebitdaAfter, revenueAfter, grossProfitAfter, breakEvenVolumeChangePct, ebitdaChange: ebitdaAfter - ebitdaBefore };
}

export interface InventoryInputs {
  /** Average daily demand in tonnes. */
  dailyDemand: number;
  /** Standard deviation of daily demand in tonnes. */
  demandStdDev: number;
  /** Average replenishment lead time in days. */
  leadTimeDays: number;
  /** Standard deviation of lead time in days. */
  leadTimeStdDev: number;
  /** Target cycle service level in percent (e.g. 95). */
  serviceLevelPct: number;
  /** Inventory value per tonne in AUD. */
  valuePerTonne: number;
  /** Annual carrying cost as a percentage of inventory value. */
  carryingCostPct: number;
}

export interface InventoryOutputs {
  z: number;
  safetyStockTonnes: number;
  reorderPointTonnes: number;
  safetyStockValue: number;
  annualCarryingCost: number;
  /** Service level against safety stock for a chart. */
  curve: { serviceLevelPct: number; safetyStockTonnes: number }[];
}

/** Inverse normal CDF (Acklam's approximation), good to ~1e-9 over (0,1). */
export function zForServiceLevel(p: number): number {
  const pp = Math.min(Math.max(p, 1e-6), 1 - 1e-6);
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const plow = 0.02425;
  const phigh = 1 - plow;
  let q: number;
  let r: number;
  if (pp < plow) {
    q = Math.sqrt(-2 * Math.log(pp));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (pp <= phigh) {
    q = pp - 0.5;
    r = q * q;
    return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  q = Math.sqrt(-2 * Math.log(1 - pp));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}

export function safetyStock(i: InventoryInputs): InventoryOutputs {
  const sigma = Math.sqrt(i.leadTimeDays * i.demandStdDev ** 2 + i.dailyDemand ** 2 * i.leadTimeStdDev ** 2);
  const z = zForServiceLevel(i.serviceLevelPct / 100);
  const safetyStockTonnes = Math.max(0, z * sigma);
  const reorderPointTonnes = i.dailyDemand * i.leadTimeDays + safetyStockTonnes;
  const safetyStockValue = safetyStockTonnes * i.valuePerTonne;
  const curve = [80, 85, 90, 92, 94, 95, 96, 97, 98, 99, 99.5].map((sl) => ({
    serviceLevelPct: sl,
    safetyStockTonnes: Math.max(0, zForServiceLevel(sl / 100) * sigma),
  }));
  return {
    z,
    safetyStockTonnes,
    reorderPointTonnes,
    safetyStockValue,
    annualCarryingCost: safetyStockValue * (i.carryingCostPct / 100),
    curve,
  };
}

export interface WorkingCapitalInputs {
  /** Annual revenue in AUD. */
  revenue: number;
  /** Annual cost of goods sold in AUD. */
  cogs: number;
  /** Days sales outstanding. */
  dso: number;
  /** Days inventory outstanding. */
  dio: number;
  /** Days payable outstanding. */
  dpo: number;
  /** Annual financing rate in percent. */
  ratePct: number;
}

export interface WorkingCapitalOutputs {
  cashConversionDays: number;
  receivables: number;
  inventory: number;
  payables: number;
  netWorkingCapital: number;
  annualFinancingCost: number;
  /** Cash freed by one day less in the cycle. */
  cashPerDay: number;
}

export function workingCapital(i: WorkingCapitalInputs): WorkingCapitalOutputs {
  const receivables = (i.revenue / 365) * i.dso;
  const inventory = (i.cogs / 365) * i.dio;
  const payables = (i.cogs / 365) * i.dpo;
  const netWorkingCapital = receivables + inventory - payables;
  return {
    cashConversionDays: i.dso + i.dio - i.dpo,
    receivables,
    inventory,
    payables,
    netWorkingCapital,
    annualFinancingCost: netWorkingCapital * (i.ratePct / 100),
    cashPerDay: i.cogs / 365,
  };
}

/** Formatting helpers shared by the simulators. */
export function fmtMoney(v: number, opts: { compact?: boolean; decimals?: number } = {}): string {
  const abs = Math.abs(v);
  if (opts.compact && abs >= 1_000_000) return `${v < 0 ? "−" : ""}$${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 1 : 2)}m`;
  if (opts.compact && abs >= 10_000) return `${v < 0 ? "−" : ""}$${Math.round(abs / 1000).toLocaleString("en-AU")}k`;
  return `${v < 0 ? "−" : ""}$${abs.toLocaleString("en-AU", { maximumFractionDigits: opts.decimals ?? 0, minimumFractionDigits: opts.decimals ?? 0 })}`;
}

export function fmtPct(v: number, decimals = 1): string {
  return `${v < 0 ? "−" : ""}${Math.abs(v).toFixed(decimals)}%`;
}

export function fmtNum(v: number, decimals = 0): string {
  return `${v < 0 ? "−" : ""}${Math.abs(v).toLocaleString("en-AU", { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}`;
}
