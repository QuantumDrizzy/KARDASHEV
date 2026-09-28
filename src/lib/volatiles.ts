/**
 * M29 — VOLATILES. Which few percent, and why it is a location problem.
 *
 * M28 closed on its own limit: *"no model of WHICH few percent is hard to close.
 * That is the whole engineering problem and it is a materials question, not a
 * mass fraction."* This is that question, and the answer is not the one the
 * chain has been implying.
 *
 * **[THE COMPOSITION] Regolith has everything structural and nothing living.**
 *
 *     abundant, weight percent          absent, parts per million
 *     O   44%     Ca  10%               C   ~100 ppm
 *     Si  21%     Fe   6%               H    ~50 ppm
 *     Al  13%     Mg   5%               N    ~80 ppm
 *
 * Collector, radiator, structure and the silicon itself all come out of the left
 * column. **Carbon, hydrogen and nitrogen are in the right one**, present only
 * as solar wind implanted over billions of years, and that is M11's carbon
 * problem stated as a number: **ten thousand kilograms of regolith per kilogram
 * of carbon.**
 *
 * **[RESULT] Extraction is expensive per kilogram and affordable in total.**
 *
 * Heating bulk regolith to ~700 °C releases implanted volatiles at maybe 70%
 * yield. At 800 J/kg·K that is **10 GJ per kilogram of carbon** — one hundred
 * times the embodied energy M11 assigns to the entire system per kilogram.
 *
 * But the quantity needed is small. The imported fraction is 0.016% of a 115 Gt
 * system: **18.4 megatonnes** of volatiles. At 10 GJ/kg over a 31-year build
 * that is **188 GW** — about **5% of the lunar industrial power** M11 already
 * budgets. Painful, and it closes.
 *
 * **[THE ALTERNATIVE] Polar ice is 124 times better, and it moves the problem.**
 *
 * LCROSS measured **~5.6% water by mass** in the Cabeus ejecta. As a hydrogen
 * source that is ×124 the solar-wind concentration, and the 5% energy tax
 * becomes 0.04% — negligible.
 *
 * **Except the ice is in permanent shadow at ~40 K, and the power is in
 * permanent sun.** Those are different places, and this is the part the chain
 * has never said:
 *
 *   - **Volatiles want the cold traps** — order 10⁴ km² of permanently shadowed
 *     crater floor, only at the poles, only because they never see the Sun.
 *   - **Power wants area in sunlight** — 3.8 TW of lunar industry at 231 W/m²
 *     needs **16,450 km²** of array.
 *   - **Peaks of near-eternal light are order 1 km² each**, a handful of ridges.
 *     They can deliver a few hundred megawatts. That is **0.06%** of what the
 *     industry needs.
 *
 * So the two requirements cannot be met in the same place. **The last few
 * percent of closure is not a technology gap. It is a transport problem inside
 * the Moon** — between a polar cold trap and wherever there is enough sunlit
 * ground to run a terawatt-scale industry, which is somewhere else entirely.
 *
 * That is a constraint of exactly the kind M13 found for the array's orbit:
 * geometric, unavoidable, and invisible until someone puts two requirements on
 * the same map.
 *
 * [KNOWN_LIMIT] Regolith composition is Apollo-sample averages and varies
 * strongly between mare and highland; solar-wind volatile content varies with
 * soil maturity by more than the factor quoted here. LCROSS sampled one plume
 * from one crater and the 5.6% carries a ±2.9% uncertainty that this module does
 * not propagate. Extraction is modelled as bulk heating only — no beneficiation,
 * no selective mining, no reagent chemistry, and no accounting for the fact that
 * heating regolith in vacuum at 40 K ambient is its own problem. Nothing here
 * models where a base would actually be sited.
 */

import { typeISystemMassKg, earthShareCeiling } from "./isru.ts";
import { AM0, SECONDS_PER_YEAR } from "./constants.ts";

/** [PUBLISHED] Major elements by weight fraction. Apollo averages, highland-leaning. */
export const MAJOR_ELEMENTS = {
  O: 0.44,
  Si: 0.21,
  Al: 0.13,
  Ca: 0.10,
  Fe: 0.06,
  Mg: 0.05,
  Ti: 0.005,
} as const;

/**
 * [PUBLISHED] Solar-wind implanted volatiles, mass fraction.
 *
 * Billions of years of solar wind, and it still amounts to parts per million.
 * Varies with soil maturity by more than a factor of two.
 */
export const TRACE_VOLATILES = {
  C: 100e-6,
  H: 50e-6,
  N: 80e-6,
} as const;

/** [PUBLISHED] Water ice by mass in the Cabeus plume. LCROSS, 5.6 ± 2.9%. */
export const POLAR_ICE_FRACTION = 0.056;

/** [ASSUMED] Regolith heat capacity, J/kg·K, and the release temperature. */
export const REGOLITH_CP = 800;
export const RELEASE_K = 973;
export const AMBIENT_K = 100;
/** [ASSUMED] Fraction of implanted volatiles actually liberated on heating. */
export const EXTRACTION_YIELD = 0.7;

/** [ASSUMED] Delivered flux of a lunar surface array, W/m². AM0 × 20% × 0.85. */
export const LUNAR_ARRAY_W_M2 = AM0 * 0.2 * 0.85;

/** [ASSUMED] Order of magnitude of a peak-of-near-eternal-light site, m². */
export const PEAK_SITE_M2 = 1e6;

/** Kilograms of regolith that must pass through the process per kilogram won. */
export function regolithPerKg(massFraction: number, yieldFrac: number = EXTRACTION_YIELD): number {
  return 1 / (massFraction * yieldFrac);
}

/**
 * Energy to win one kilogram by bulk heating: process ratio times the sensible
 * heat of everything that had to be warmed.
 */
export function extractionJPerKg(massFraction: number, o: { yieldFrac?: number; cp?: number } = {}): number {
  return (
    regolithPerKg(massFraction, o.yieldFrac ?? EXTRACTION_YIELD) *
    (o.cp ?? REGOLITH_CP) *
    (RELEASE_K - AMBIENT_K)
  );
}

export type VolatileCase = {
  element: string;
  massFraction: number;
  regolithPerKg: number;
  jPerKg: number;
};

export function volatileCases(): VolatileCase[] {
  return Object.entries(TRACE_VOLATILES).map(([element, massFraction]) => ({
    element,
    massFraction,
    regolithPerKg: regolithPerKg(massFraction),
    jPerKg: extractionJPerKg(massFraction),
  }));
}

/** How much better polar ice is than solar wind, as a hydrogen source. */
export function polarAdvantageX(): number {
  return (POLAR_ICE_FRACTION * (2 / 18)) / TRACE_VOLATILES.H;
}

// ─────────────────────────────────────────────────── the total, and the tax

export type VolatileBudget = {
  /** Volatile mass the system needs, from M11's import fraction. */
  massKg: number;
  energyJ: number;
  /** Continuous power to win it over the build, W. */
  powerW: number;
  /** Share of the lunar industrial power M11 already budgets. */
  shareOfLunarIndustry: number;
};

/**
 * [RESULT] The tax, and it is affordable.
 *
 * 18.4 Mt of volatiles at 10 GJ/kg over 31 years is 188 GW — about 5% of the
 * lunar industry's own power. From polar ice it is two orders less.
 */
export function volatileBudget(
  o: { buildYears?: number; lunarIndustryW?: number; jPerKg?: number } = {},
): VolatileBudget {
  const massKg = typeISystemMassKg() * (1 - earthShareCeiling(100).minLunarFraction);
  const energyJ = massKg * (o.jPerKg ?? extractionJPerKg(TRACE_VOLATILES.C));
  const powerW = energyJ / ((o.buildYears ?? 31) * SECONDS_PER_YEAR);
  return {
    massKg,
    energyJ,
    powerW,
    shareOfLunarIndustry: powerW / (o.lunarIndustryW ?? 3.8e12),
  };
}

// ──────────────────────────────────────────── the two places, on one map

export type SitingConflict = {
  /** Array area to run the lunar industry, m². */
  requiredArrayM2: number;
  /** What a handful of peak-of-light sites can actually deliver, W. */
  peakSitePowerW: number;
  /** Share of the industry those peaks could run. */
  peakShareOfIndustry: number;
  /** Sites of that size needed to close the gap. */
  sitesNeeded: number;
};

/**
 * [RESULT] The requirement that cannot be met where the volatiles are.
 *
 * Cold traps exist only because they never see the Sun. A terawatt-scale array
 * exists only where it does. Peaks of near-eternal light are order 1 km² each
 * and would run **0.06%** of the industry.
 */
export function sitingConflict(
  o: { lunarIndustryW?: number; siteM2?: number; sites?: number } = {},
): SitingConflict {
  const industry = o.lunarIndustryW ?? 3.8e12;
  const site = o.siteM2 ?? PEAK_SITE_M2;
  const sites = o.sites ?? 5;
  const peakSitePowerW = site * sites * LUNAR_ARRAY_W_M2;
  return {
    requiredArrayM2: industry / LUNAR_ARRAY_W_M2,
    peakSitePowerW,
    peakShareOfIndustry: peakSitePowerW / industry,
    sitesNeeded: industry / (site * LUNAR_ARRAY_W_M2),
  };
}

export const VOLATILES_VERDICT = {
  headline: "Regolith has everything structural and nothing living. The gap is C, H and N at parts per million.",
  theTax:
    "Winning 18.4 Mt of volatiles by bulk heating costs ~188 GW, about 5% of the lunar industry's " +
    "own power. Expensive per kilogram, affordable in total.",
  theRealProblem:
    "Polar ice is x124 better and sits in permanent shadow at 40 K. The power needs permanent sun. " +
    "Peaks of near-eternal light are order 1 km2 and would run 0.06% of the industry, so the two " +
    "requirements cannot share a site. The last few percent of closure is transport inside the Moon.",
  /**
   * [KNOWN_LIMIT]
   *
   *  - Apollo-sample averages. Mare and highland differ strongly, and implanted
   *    volatile content varies with soil maturity by more than a factor of two.
   *  - LCROSS sampled one plume from one crater. The 5.6% carries ±2.9% and this
   *    module does not propagate it.
   *  - Extraction is bulk heating only: no beneficiation, no selective mining,
   *    no reagent chemistry, and no account of heating regolith in vacuum from a
   *    40 K ambient, which is its own problem.
   *  - Nothing here sites a base. The conflict is stated; the resolution is not
   *    modelled, and transport inside the Moon is absent from the whole chain.
   */
  limits: "Apollo averages, one LCROSS plume, bulk heating only, no siting and no lunar transport",
} as const;
