/**
 * M27 — BOOTSTRAP. The gates are coupled, and the coupling has a growth law.
 *
 * M26 listed seven gates and admitted in its own limits that it treats them as
 * independent — "they are not: M25 shows learning is driven by the very build
 * that the other gates constrain." Closing that loop turns out to correct a
 * framing the whole chain has been using, and to hand λ its first mechanism.
 *
 * **The loop.** Lighter array → more square metres per flight → more cumulative
 * production → more learning → lighter array. Positive feedback, and it is the
 * only cycle in M26's dependency graph.
 *
 * **[RESULT] Written down, it integrates, and the answer is not exponential.**
 *
 * With launch capability `C` in kg/yr fixed and Wright's law on areal density:
 *
 *     dA/dt = C / σ(A),    σ(A) = σ₀·(A/A₀)^(−b)    ⟹    dA/dt = (C/σ₀)·(A/A₀)^b
 *
 * which separates and gives
 *
 *     **A(t) ∝ t^(1/(1−b))**
 *
 * **Polynomial. Not exponential.** At M25's required 18.7% learning, `b = 0.299`
 * and area grows as **t^1.43**. Superlinear, and nothing like a doubling curve.
 *
 * **[CORRECTS the chain's framing] Learning does not give doublings.**
 *
 * M11, M23 and M26 all reason in *doublings*, which is exponential growth. This
 * shows learning alone cannot produce that: with fixed launch capability you get
 * a power law. **Exponential growth requires self-replication** — the base
 * building more base, so that `C` itself grows — which is M11's mechanism and a
 * different thing entirely. The two have been used interchangeably and they are
 * not interchangeable.
 *
 * **[RESULT] And λ finally has a mechanism instead of being a fit.**
 *
 * Without learning at all, 100 flights a day at today's 2.24 kg/m² takes
 * **50,490 years**. With learning at exactly the rate M25 says is required, from
 * a 10,000 m² starting fleet: **107 years**, against λ's 101.
 *
 *     starting area     r = 10%    r = 18.7%    r = 22%
 *     1,000 m²           1,524        54          14
 *     10,000 m²          2,162       107          32
 *     100,000 m²         3,069       212          72
 *     1,000,000 m²       4,354       422         165
 *
 * That is **not** a derivation of λ — the answer moves by ×8 across three decades
 * of starting area, and λ is inside the range rather than reproduced by it. But
 * the forecast's free parameter now has a *mechanism* it can be argued about
 * through, which it has never had. And learning at the required rate is worth
 * **×470 on the schedule**, which is the single largest lever in the repo.
 *
 * **[THE BOUNDARY] At r ≥ 50% the model destroys itself.**
 *
 * `b = 1` at exactly a 50% learning rate, and beyond it `dA/dt ∝ A^b` with
 * `b > 1` reaches infinity in **finite time**. That is not a prediction of
 * infinite growth — it is the model announcing it is out of its domain, in the
 * same way M16's 101 MW and M23's 25 days announce theirs. Anything claiming a
 * learning rate above 50% is claiming something this framework cannot represent.
 *
 * [KNOWN_LIMIT] `C` is held fixed, which is the whole point of separating this
 * from self-replication — but it means the module says nothing about the case
 * where the build capacity itself grows. Wright's law is applied across ten
 * orders of magnitude in area, roughly 33 doublings; M25 already flagged 30 as
 * further than any curve has been observed to hold. Starting area is an input
 * and the answer is very sensitive to it. Nothing models the other five gates
 * closing, and no gate outside the loop is represented at all.
 */

import { TYPE_I_AREA_M2 } from "./collector.ts";
import { destinationPenalty } from "./transfer.ts";
import { requiredArealRate, wrightExponent } from "./learning.ts";

/** [ASSUMED] Today's flown areal density, kg/m². ROSA-class wing. */
export const AREAL_TODAY_KG_M2 = 2.24;

/**
 * [ASSUMED] Starting fleet area, m². The answer is very sensitive to this and it
 * is swept rather than defended — an order of magnitude here is a factor of two
 * in the schedule.
 */
export const STARTING_AREA_M2 = 1e4;

/** Launch capability in kg/yr delivered to GEO, at a given cadence. */
export function deliveredKgPerYear(cadencePerDay = 100, payloadKg = 100_000): number {
  return (cadencePerDay * 365.25 * payloadKg) / destinationPenalty().payloadPenalty;
}

/**
 * [RESULT] Time to build a target area under the build-learning loop.
 *
 * Integrating `dA/dt = (C/σ₀)(A/A₀)^b` gives
 * `t = (σ₀·A₀^b/C)·[A^(1−b) − A₀^(1−b)]/(1−b)`.
 *
 * Returns Infinity for `b ≥ 1`, where the model has a finite-time singularity
 * and is out of domain rather than making a claim.
 */
export function yearsToBuild(
  targetAreaM2: number = TYPE_I_AREA_M2,
  o: { learningRate?: number; startAreaM2?: number; arealKgM2?: number; cadencePerDay?: number } = {},
): number {
  const r = o.learningRate ?? 0;
  const b = wrightExponent(r);
  if (b >= 1) return Infinity;
  const a0 = o.startAreaM2 ?? STARTING_AREA_M2;
  const s0 = o.arealKgM2 ?? AREAL_TODAY_KG_M2;
  const c = deliveredKgPerYear(o.cadencePerDay ?? 100);
  return ((s0 * a0 ** b) / c) * ((targetAreaM2 ** (1 - b) - a0 ** (1 - b)) / (1 - b));
}

/** Growth exponent of the loop: `A ∝ t^(1/(1−b))`. Infinity at b ≥ 1. */
export function growthExponent(learningRate: number): number {
  const b = wrightExponent(learningRate);
  return b >= 1 ? Infinity : 1 / (1 - b);
}

/** The learning rate at which the model develops a finite-time singularity. */
export const SINGULARITY_RATE = 0.5;

/**
 * [RESULT] What learning is worth on the schedule, against no learning at all.
 *
 * ×470 at the required rate. The largest single lever anywhere in the chain.
 */
export function learningLeverage(
  learningRate: number = requiredArealRate(),
  o: Parameters<typeof yearsToBuild>[1] = {},
): number {
  return yearsToBuild(TYPE_I_AREA_M2, { ...o, learningRate: 0 }) / yearsToBuild(TYPE_I_AREA_M2, { ...o, learningRate });
}

export type BootstrapCase = {
  learningRate: number;
  startAreaM2: number;
  years: number;
  growthExponent: number;
  /** True when the model is out of domain rather than answering. */
  outOfDomain: boolean;
};

/** The sensitivity table, because the starting area is doing a lot of work. */
export function sensitivity(
  rates = [0.1, requiredArealRate(), 0.22],
  starts = [1e3, 1e4, 1e5, 1e6],
): BootstrapCase[] {
  const out: BootstrapCase[] = [];
  for (const startAreaM2 of starts) {
    for (const learningRate of rates) {
      const years = yearsToBuild(TYPE_I_AREA_M2, { learningRate, startAreaM2 });
      out.push({
        learningRate,
        startAreaM2,
        years,
        growthExponent: growthExponent(learningRate),
        outOfDomain: !Number.isFinite(years),
      });
    }
  }
  return out;
}

/** The dependency edge that makes the loop, stated so it can be argued with. */
export const LOOP = [
  { from: "areal-density", to: "area-per-flight", why: "A lighter square metre means more of them per launch, at fixed payload mass." },
  { from: "area-per-flight", to: "cumulative-production", why: "More area installed per flight is more cumulative production per unit time." },
  { from: "cumulative-production", to: "learning", why: "Wright's x-axis is cumulative production, not calendar time or effort." },
  { from: "learning", to: "areal-density", why: "And learning is what makes the square metre lighter, closing the cycle." },
] as const;

export const BOOTSTRAP_VERDICT = {
  headline: "The build-learning loop gives polynomial growth, not doublings. Exponential needs self-replication.",
  lambdaMechanism:
    "Learning at M25's required rate from a 10,000 m2 fleet gives 107 years against lambda's 101. " +
    "Not a derivation — the answer moves x8 across three decades of starting area — but the " +
    "forecast's free parameter now has a mechanism to be argued through.",
  leverage: "Learning at the required rate is worth x470 on the schedule: 50,490 years down to 107.",
  /**
   * [KNOWN_LIMIT]
   *
   *  - `C` is fixed by construction. That is what separates this from
   *    self-replication, and it means the module says nothing about the case
   *    where build capacity itself grows.
   *  - Wright's law across ten orders of area, ~33 doublings. M25 already
   *    flagged 30 as further than any observed curve holds.
   *  - Starting area is an input and dominates the answer. Swept, not defended.
   *  - The other five gates are absent. Only the cycle is modelled.
   *  - Above a 50% learning rate the integral diverges in finite time. That is
   *    the model leaving its domain, never a claim about growth.
   */
  limits: "C fixed, Wright over ten orders, start area dominates, only the cycle is modelled",
} as const;
