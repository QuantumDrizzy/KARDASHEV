/**
 * M28 — CLOSURE. Self-replication is only exponential below a crossover, and
 * the crossover is set by the fraction of itself a factory can make.
 *
 * M27 established a dichotomy: learning with fixed launch capability gives
 * polynomial growth, and **exponential requires self-replication**. It then took
 * self-replication for granted. It should not have.
 *
 * A factory that makes 96% of its own mass still has to import the other 4%, and
 * that import scales with the factory. So growth is
 *
 *     dM/dt = min( p·M ,  I/(1−c) )
 *
 * where `c` is **closure** — the mass fraction of its own components a base can
 * produce — `p` its productivity and `I` the import flow it can be fed. The two
 * terms cross at
 *
 *     **M\* = I / (p·(1−c))**
 *
 * Below `M*` the base is replication-limited and grows **exponentially**. Above
 * it the base is import-limited and grows **linearly**, at a fixed rate set by
 * how fast you can ship the missing few percent.
 *
 * **[RESULT] Closure does not tune the schedule. It decides the growth regime.**
 *
 *     closure   imports    M*          then linear at    total to 115 Gt
 *     90%       10%        13.2 Gg     1.32e10 kg/yr     **8,744 yr**
 *     96%        4%        32.9 Gg     3.29e10 kg/yr     **3,505 yr**
 *     99%        1%        132 Gg      1.32e11 kg/yr        886 yr
 *     99.9%      0.1%      1.32 Tg     1.32e12 kg/yr        103 yr
 *     **99.984%**  0.016%  8.30 Tg     8.30e12 kg/yr       **31 yr**
 *
 * **[THE GAP] NASA proposed 96%. The chain requires 99.984%.**
 *
 * The 1980 Advanced Automation for Space Missions study — the only serious
 * engineering treatment of a self-replicating lunar factory — put achievable
 * closure at roughly 90–96%, with microelectronics and some chemistry imported.
 * M11's Earth-supply ceiling requires **99.984%**. Those differ by a factor of
 * **252 in import flow**, and by **×113 in schedule**.
 *
 * At 96% closure the exponential phase ends at **33 megatonnes** — 0.03% of the
 * 115 Gt system — and everything after it is a straight line taking millennia.
 * **The self-replication that M27 said was needed for exponential growth only
 * delivers it for the first three ten-thousandths of the build.**
 *
 * So M11's ≥99.98% requirement, which arrived there as a *materials* statement
 * about carbon in regolith, turns out to be the same number as the *dynamical*
 * condition for the growth to stay exponential long enough to matter. Two
 * different arguments, one threshold.
 *
 * *(And 99.9% closure gives 103 years against λ's 101 — noted, and not leaned
 * on. Three modules now land near λ from different directions, which is
 * interesting and is not evidence.)*
 *
 * [KNOWN_LIMIT] Closure figures are from a 1980 design study, not a measurement
 * — nobody has built one, and the estimate has never been tested against a
 * physical machine. Productivity is M11's assumed 1/yr. The import flow is taken
 * as fully convertible into base mass with no logistics of its own, which
 * flatters the import-limited case. The crossover is a kink here and would be a
 * smooth transition in anything real.
 */

import { typeISystemMassKg, earthShareCeiling, PRODUCTIVITY_PER_YEAR } from "./isru.ts";
import { deliveredKgPerYear } from "./bootstrap.ts";

/** [ASSUMED] Seed mass, kg. M11's 100 tonnes. */
export const SEED_KG = 1e5;

/**
 * [PUBLISHED] Closure estimated by the 1980 Advanced Automation for Space
 * Missions study — the only serious engineering treatment of a self-replicating
 * lunar factory. A design-study estimate, never tested against a machine.
 */
export const AASM_1980_CLOSURE = { low: 0.9, high: 0.96 } as const;

/** The closure M11's Earth-supply ceiling actually requires. */
export function requiredClosure(earthCadencePerDay = 100): number {
  return earthShareCeiling(earthCadencePerDay).minLunarFraction;
}

/**
 * [RESULT] Crossover mass: `M* = I / (p(1−c))`.
 *
 * Below it the base outgrows its own imports and compounds. Above it the imports
 * are the binding rate and growth is a straight line. At perfect closure it is
 * infinite — nothing is ever import-limited.
 */
export function crossoverMassKg(
  closure: number,
  o: { importKgPerYear?: number; productivityPerYear?: number } = {},
): number {
  const gap = 1 - closure;
  if (gap <= 0) return Infinity;
  return (o.importKgPerYear ?? deliveredKgPerYear(100)) / ((o.productivityPerYear ?? PRODUCTIVITY_PER_YEAR) * gap);
}

/** The linear rate the base is held to once imports bind, kg/yr. */
export function importLimitedRateKgPerYear(closure: number, importKgPerYear?: number): number {
  const gap = 1 - closure;
  if (gap <= 0) return Infinity;
  return (importKgPerYear ?? deliveredKgPerYear(100)) / gap;
}

export type ClosureCase = {
  closure: number;
  importFraction: number;
  crossoverKg: number;
  linearRateKgPerYear: number;
  /** Years compounding from the seed up to the crossover. */
  exponentialYears: number;
  /** Years of straight line from there to the target. */
  linearYears: number;
  totalYears: number;
  /** Share of the target reached before growth stops compounding. */
  exponentialShareOfTarget: number;
};

/**
 * Time to build the Type I industrial base at a given closure: compound to the
 * crossover, then a straight line.
 */
export function buildAt(
  closure: number,
  o: { targetKg?: number; seedKg?: number; importKgPerYear?: number; productivityPerYear?: number } = {},
): ClosureCase {
  const target = o.targetKg ?? typeISystemMassKg();
  const seed = o.seedKg ?? SEED_KG;
  const p = o.productivityPerYear ?? PRODUCTIVITY_PER_YEAR;
  const crossoverKg = crossoverMassKg(closure, o);
  const linearRateKgPerYear = importLimitedRateKgPerYear(closure, o.importKgPerYear);
  // Compound from the seed to whichever comes first, the crossover or the target.
  const compoundTo = Math.min(crossoverKg, target);
  const exponentialYears = compoundTo > seed ? Math.log(compoundTo / seed) / p : 0;
  const linearYears = target > crossoverKg ? (target - crossoverKg) / linearRateKgPerYear : 0;
  return {
    closure,
    importFraction: 1 - closure,
    crossoverKg,
    linearRateKgPerYear,
    exponentialYears,
    linearYears,
    totalYears: exponentialYears + linearYears,
    exponentialShareOfTarget: Math.min(1, crossoverKg / target),
  };
}

/** The ladder, from what has been proposed to what is required. */
export function closureLadder(
  levels = [0.9, 0.96, 0.99, 0.999, requiredClosure()],
): ClosureCase[] {
  return levels.map((c) => buildAt(c));
}

/**
 * [THE GAP] Import flow at the best proposed closure against the required one.
 *
 * ×252. The same factor, necessarily, as the ratio of the two import fractions.
 */
export function proposedVersusRequired(): { importFlowX: number; scheduleX: number } {
  const proposed = buildAt(AASM_1980_CLOSURE.high);
  const required = buildAt(requiredClosure());
  return {
    importFlowX: proposed.importFraction / required.importFraction,
    scheduleX: proposed.totalYears / required.totalYears,
  };
}

export const CLOSURE_VERDICT = {
  headline: "Closure decides the growth regime, not the schedule. Below the crossover, exponential; above it, a straight line.",
  theGap:
    "The 1980 AASM study proposed 90-96% closure. M11's Earth-supply ceiling requires 99.984%. " +
    "A factor of 252 in import flow and 113 in schedule.",
  convergence:
    "M11 reached 99.98% as a MATERIALS statement about carbon in regolith. This reaches the same " +
    "number as the DYNAMICAL condition for growth to stay exponential. Two arguments, one threshold.",
  /**
   * [KNOWN_LIMIT]
   *
   *  - Closure figures come from a 1980 design study, never tested against a
   *    physical machine. Nobody has built a partially self-replicating factory.
   *  - Productivity is M11's assumed 1/yr and the answer scales inversely.
   *  - Imports are taken as fully convertible into base mass with no logistics
   *    of their own, which flatters the import-limited case.
   *  - The crossover is modelled as a kink. Anything real transitions smoothly.
   *  - No model of WHICH few percent is hard to close. That is the whole
   *    engineering problem and it is a materials question, not a mass fraction.
   */
  limits: "1980 design study, assumed productivity, imports frictionless, crossover is a kink",
} as const;
