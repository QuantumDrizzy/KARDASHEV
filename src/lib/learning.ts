/**
 * M25 — LEARNING. The gap that closes itself, in the wrong currency.
 *
 * M24 listed what it did not model and named fleet learning first. It belongs
 * here rather than there, because learning turns out to share an axis with the
 * build in a way nothing else in the chain does.
 *
 * **Wright's law.** Unit cost falls by a fixed fraction for every doubling of
 * *cumulative production* — not per year, not per unit of effort:
 *
 *     X(Q) = X₀ · Q^(−b)      per doubling, X ← X·(1 − r)
 *
 * **The elegant part: the build and the learning are the same doublings.** M11
 * established that Type I is **30 industrial doublings** from a 100 t seed. Those
 * are doublings of cumulative production, which is exactly Wright's x-axis. So
 * you get thirty doublings of learning for free, simply by building the thing.
 *
 * **And the arithmetic is tantalising.** M14's areal density gap — the hardest
 * number in the chain — is **×505**. Closing that over thirty doublings requires
 *
 *     **r = 18.7% per doubling**
 *
 * against a photovoltaic cost learning rate of **20–24%**, which is one of the
 * best-documented curves in industrial history: forty years, five orders of
 * cumulative production. The requirement lands *just inside* the observed rate.
 *
 * **[THE TRAP] Except those are different quantities, and the chain's is the one
 * that learns slowest.**
 *
 * Photovoltaics learn at 20–24% in **dollars per watt**. M14's gap is in
 * **kilograms per square metre**. Those decouple completely: modules got cheap
 * by getting thinner, cheaper to make and mass-produced, not by getting light.
 * Space array specific power has gone from roughly 30 W/kg to 150 over three
 * decades — **×5 in total**, against the ×505 needed.
 *
 * This repo already refuses to let `grid-cost.ts` into a physics test because it
 * is dated. The same rule applies here, and harder: **a cost learning rate may
 * not be used to close a mass gap.** Applying one to the other is the single
 * most tempting error available in this module, and it would flatter the thesis
 * by three orders of magnitude.
 *
 * **[RESULT] So state the requirement rather than a prediction.**
 *
 *     r ≥ 18.7% per doubling **in areal density**, sustained for thirty doublings
 *
 * That is a falsifiable engineering target, in the right units, on the right
 * axis. At 10% it takes **59 doublings** — twice as many as the build provides —
 * so the gap closes only if learning outpaces construction. At 6%, a plausible
 * guess for mass, thirty doublings buy **×6** and the gap does not close at all.
 *
 * **[FOR M23/M24] And learning is production-driven, not calendar-driven and not
 * cognition-driven.** Wright's x-axis is units built. A faster mind moves it only
 * by causing more units to exist. That is the fourth independent route to the
 * same conclusion M19, M23 and M24 reached from three other directions:
 * **building is what binds.**
 *
 * [KNOWN_LIMIT] Wright's law is empirical, not physical. It has no mechanism, it
 * saturates against material floors, and every published rate here is a *cost*
 * curve. **This module does not estimate a mass learning rate**, because the
 * cumulative-production series for space solar arrays is not something it has —
 * it states the requirement and the warning, and the 6% figure appears only as an
 * illustrative low case, never as a measurement.
 */


import { arealDensityToGeoKgM2 } from "./transfer.ts";
import { doublingsRequired, typeISystemMassKg } from "./isru.ts";

export type Curve = {
  id: string;
  label: string;
  /** Fractional improvement per doubling of cumulative production. */
  rate: number;
  /** The quantity that actually learns. This is the field that matters. */
  quantity: string;
  note: string;
};

/**
 * [PUBLISHED] Learning rates, with the quantity each one is measured on.
 *
 * Every one of these is a **cost** curve. That is not incidental — it is the
 * whole warning this module exists to give.
 */
export const CURVES: Curve[] = [
  {
    id: "pv-cost",
    label: "Photovoltaic modules",
    rate: 0.22,
    quantity: "$/W",
    note: "Forty years and five orders of cumulative production. One of the best-measured curves in industry.",
  },
  {
    id: "liion-cost",
    label: "Lithium-ion cells",
    rate: 0.19,
    quantity: "$/kWh",
    note: "Two decades of data, and still on the curve.",
  },
  {
    id: "wind-cost",
    label: "Wind turbines",
    rate: 0.12,
    quantity: "$/kW",
    note: "Slower, and a useful reminder that the rate is not a law of nature.",
  },
];

/**
 * [ASSUMED — illustrative only] A low rate standing in for mass rather than
 * cost. **Not a measurement.** Space array specific power went from roughly
 * 30 W/kg to 150 over three decades, which is ×5 in total, but the
 * cumulative-production series that would turn it into a rate is not here.
 */
export const ILLUSTRATIVE_MASS_RATE = 0.06;

/** Improvement factor after `n` doublings at rate `r`. */
export function improvementAfter(doublings: number, rate: number): number {
  return 1 / (1 - rate) ** doublings;
}

/**
 * Wright exponent `b` for a given learning rate.
 *
 * The `+ 0` normalises negative zero: `-log2(1)` is `-0` in JavaScript, which
 * compares unequal to `0` under Object.is and turns into `-Infinity` if anyone
 * reciprocates it. A test caught it at rate = 0.
 */
export function wrightExponent(rate: number): number {
  return -Math.log2(1 - rate) + 0;
}

/** The learning rate that closes a given gap over a given number of doublings. */
export function requiredRate(gap: number, doublings: number): number {
  return 1 - (1 / gap) ** (1 / doublings);
}

/** Doublings needed to close a gap at a given rate. */
export function doublingsToClose(gap: number, rate: number): number {
  return Math.log(gap) / Math.log(1 / (1 - rate));
}

/** M11's thirty doublings — the ones the build supplies for free. */
export function buildDoublings(): number {
  return doublingsRequired(typeISystemMassKg());
}

/** M14's areal density gap to GEO, the thing that would have to close. */
export function arealGapToGeo(): number {
  return 2.24 / arealDensityToGeoKgM2(100, 100);
}

export type GapCase = {
  id: string;
  label: string;
  rate: number;
  quantity: string;
  improvementOverBuild: number;
  doublingsNeeded: number;
  /** Does the build's own thirty doublings suffice at this rate? */
  closes: boolean;
};

/**
 * [RESULT] Each curve against the gap, with the quantity carried through.
 *
 * PV cost closes it easily and is the wrong currency. The illustrative mass rate
 * does not close it and is the right one.
 */
export function gapCases(gap: number = arealGapToGeo()): GapCase[] {
  const n = buildDoublings();
  const rows: [string, string, number, string][] = [
    ...CURVES.map((c) => [c.id, c.label, c.rate, c.quantity] as [string, string, number, string]),
    ["mass-illustrative", "Areal density, illustrative low case", ILLUSTRATIVE_MASS_RATE, "kg/m²"],
  ];
  return rows.map(([id, label, rate, quantity]) => ({
    id,
    label,
    rate,
    quantity,
    improvementOverBuild: improvementAfter(n, rate),
    doublingsNeeded: doublingsToClose(gap, rate),
    closes: improvementAfter(n, rate) >= gap,
  }));
}

/**
 * [RESULT] The number to attack: the rate that would close the gap in exactly
 * the doublings the build provides.
 *
 * **18.7% per doubling, in areal density.** A falsifiable engineering target in
 * the right units on the right axis, which is more than "it will get better"
 * has ever been.
 */
export function requiredArealRate(gap: number = arealGapToGeo()): number {
  return requiredRate(gap, buildDoublings());
}

/**
 * How far the required rate sits from the best-measured cost curve.
 *
 * Close enough to be tempting, which is exactly why the units must be stated
 * every single time.
 */
export function temptation(): { required: number; pvCost: number; ratio: number } {
  const required = requiredArealRate();
  const pvCost = CURVES.find((c) => c.id === "pv-cost")!.rate;
  return { required, pvCost, ratio: pvCost / required };
}

export const LEARNING_VERDICT = {
  headline: "The build supplies thirty doublings of learning for free. The question is only the rate, and the units.",
  theTrap:
    "Photovoltaics learn at 20-24% in $/W. The chain's gap is in kg/m². Modules got cheap by " +
    "getting cheap to make, not by getting light — a cost curve may never be used to close a mass gap.",
  forAcceleration:
    "Wright's x-axis is units built, not years elapsed and not effort applied. A faster mind " +
    "moves it only by causing more units to exist.",
  /**
   * [KNOWN_LIMIT]
   *
   *  - Wright's law is empirical. No mechanism, and it saturates against
   *    material floors that nothing here models.
   *  - Every published rate carried here is a **cost** curve, and the module
   *    refuses to convert one into a mass rate.
   *  - `ILLUSTRATIVE_MASS_RATE` is a stand-in, not a measurement. The
   *    cumulative-production series for space solar arrays is not here, so no
   *    mass learning rate is claimed.
   *  - Constant-rate learning over thirty doublings is five orders of cumulative
   *    production. Nothing has ever been observed to hold a rate that far except
   *    photovoltaics, and that is the exception being borrowed from.
   */
  limits: "empirical law, cost curves only, no mass rate claimed, constant rate over five orders",
} as const;
