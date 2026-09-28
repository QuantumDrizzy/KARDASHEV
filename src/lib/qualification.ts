/**
 * M24 — QUALIFICATION. The latency intelligence cannot compress.
 *
 * M23 answered "what does a fast takeoff do to the timeline" and then named its
 * own gap: *"nothing models the latency from cognition to design to working
 * hardware, which is the actual mechanism being asked about."* This module takes
 * the part of that latency which is **physical rather than organisational**, and
 * it turns out to dominate everything else by two orders of magnitude.
 *
 * **The right frame is Amdahl, and it reduces the whole question to one number.**
 *
 *     speedup = 1 / ((1 − f) + f/s)
 *
 * where `f` is the fraction of the schedule that is cognition-bound and `s` is
 * how much faster the thinking gets. Make cognition instantaneous and the
 * ceiling on speedup is **1/(1 − f)** — set entirely by the part that is not
 * thinking.
 *
 * That turns a vague claim into a falsifiable one. M23 measured the gap between
 * λ's forecast and the thermodynamic floor at **×159**. So:
 *
 *     "AGI closes the organisational gap"  ⟺  **99.37% of the schedule is thinking**
 *
 * Anyone asserting the first is asserting the second, and the second is a
 * statement about the world that can be argued with.
 *
 * **[RESULT] And there is a hard physical floor under `1 − f`: you cannot know a
 * lifetime in less time than the lifetime.**
 *
 * M12 derived an array lifetime of **69 years** — and said explicitly that it is
 * "an argument from mechanism, not from flight heritage. Nothing this thin has
 * flown for a decade, let alone three." M8's whole ceiling is `A_max = R·L`,
 * linear in exactly that number.
 *
 * Now put the build next to the verification:
 *
 *     build 30 doublings at M23's thermodynamic floor      **232 days**
 *     verify a 69-year lifetime                            **69 years**
 *     verification dominates by                            **×109**
 *
 * **The thing takes eight months to build and sixty-nine years to know.** No
 * amount of intelligence shortens an exposure test, because the test *is* the
 * elapsed time.
 *
 * **What accelerated testing does and does not buy.** Single-mechanism
 * acceleration is routine and works: you can deliver a decade of proton fluence
 * in an afternoon, and thermal-cycle a coupon ten thousand times in a month.
 * What does not accelerate:
 *
 *   - **Coupled mechanisms at their true relative rates.** UV with atomic oxygen
 *     with thermal cycling with micrometeoroid damage is documented as
 *     non-additive; accelerating one changes which one dominates.
 *   - **The acceleration factor itself**, which is calibrated against real-time
 *     data. Somebody has to have waited.
 *   - **Discovering a mechanism you did not model.** LDEF flew 5.8 years and
 *     returned surprises. You can accelerate a mechanism you understand; you
 *     cannot accelerate finding out what you missed.
 *
 * **The escape, stated without moralising.** All of this is avoidable by flying
 * unqualified hardware and finding out. That is a real option and fast actors
 * take it. It is a **choice about risk, not a physics result**, and this module
 * only points out that the acceleration is available exclusively to whoever
 * makes it.
 *
 * [KNOWN_LIMIT] `f` is not derivable here and this module does not estimate it —
 * it converts claims about acceleration into claims about `f` so they can be
 * argued with. Verification time is taken equal to the lifetime being verified,
 * which is the pessimistic bound; partial qualification, staged deployment and
 * fleet-learning all shorten it in ways nothing here models. No model of
 * prototype iteration, tooling or supply chain.
 */

import { combinedLifetimeYr } from "./environment.ts";
import { organisationalGap, regimes } from "./acceleration.ts";
import { doublingsRequired, doublingTimeImpliedBy, typeISystemMassKg } from "./isru.ts";
import { firstWall } from "./sequence.ts";
import { doublingsTo } from "./acceleration.ts";

/**
 * Amdahl's law. `f` is the cognition-bound share of the schedule, `s` the
 * speedup on it. Pass `Infinity` for instantaneous thinking.
 */
export function amdahlSpeedup(cognitiveFraction: number, speedupOnCognition: number): number {
  const f = Math.min(1, Math.max(0, cognitiveFraction));
  return 1 / (1 - f + (speedupOnCognition === Infinity ? 0 : f / speedupOnCognition));
}

/** Ceiling on speedup with cognition made free: `1/(1−f)`. */
export function speedupCeiling(cognitiveFraction: number): number {
  return amdahlSpeedup(cognitiveFraction, Infinity);
}

/**
 * [RESULT] The inverse, and the module's sharpest use.
 *
 * Turns "AGI would accelerate this by X" into "X% of the schedule is thinking",
 * which is a claim about the world rather than an adjective.
 */
export function impliedCognitiveFraction(claimedSpeedup: number): number {
  return 1 - 1 / claimedSpeedup;
}

/** What claiming M23's whole ×159 gap actually commits you to. */
export function fractionImpliedByClosingTheGap(): number {
  return impliedCognitiveFraction(organisationalGap());
}

// ────────────────────────────────────────── the floor under the non-cognitive part

export type Verification = {
  /** Years of build at M23's thermodynamic floor. */
  buildYears: number;
  /** Years to verify the lifetime M8's ceiling is linear in. */
  verifyYears: number;
  /** How far verification dominates the build. */
  dominanceX: number;
};

/**
 * [RESULT] Build 232 days, verify 69 years.
 *
 * `A_max = R·L` is linear in a lifetime that M12 derived from mechanism and
 * explicitly did not observe. Committing to it before the evidence exists is a
 * bet; waiting for the evidence is the schedule.
 */
export function verification(lifetimeYr: number = combinedLifetimeYr()): Verification {
  const buildYears = regimes().find((r) => r.id === "floor")!.yearsToTypeI;
  return { buildYears, verifyYears: lifetimeYr, dominanceX: lifetimeYr / buildYears };
}

export type TestMode = {
  id: string;
  label: string;
  accelerable: boolean;
  why: string;
};

/**
 * What accelerated life testing can and cannot compress.
 *
 * The split is not about effort. It is about whether the thing being measured
 * has a rate you already know.
 */
export const TEST_MODES: TestMode[] = [
  {
    id: "dose",
    label: "Total ionising dose from trapped particles",
    accelerable: true,
    why: "A known rate against a known fluence. A decade of exposure fits in an afternoon at an accelerator.",
  },
  {
    id: "thermal-cycles",
    label: "Thermal cycling fatigue",
    accelerable: true,
    why: "Cycles are countable and the damage is per-cycle, so ten thousand of them fit in a month.",
  },
  {
    id: "coupled",
    label: "UV with atomic oxygen with cycling with micrometeoroid",
    accelerable: false,
    why: "Documented as non-additive. Accelerating one term changes which term dominates, so the answer is not the same experiment.",
  },
  {
    id: "acceleration-factor",
    label: "The acceleration factor itself",
    accelerable: false,
    why: "Calibrated against real-time data. Somebody has to have waited, and for a 69-year part nobody has.",
  },
  {
    id: "unknown-mechanism",
    label: "A mechanism nobody modelled",
    accelerable: false,
    why: "LDEF flew 5.8 years and returned surprises. You can accelerate a mechanism you understand; you cannot accelerate finding the one you missed.",
  },
];

export const accelerable = () => TEST_MODES.filter((m) => m.accelerable);
export const unaccelerable = () => TEST_MODES.filter((m) => !m.accelerable);

// ────────────────────────────────────────────────── what a speedup buys

export type SpeedupCase = {
  cognitiveFraction: number;
  ceiling: number;
  /** λ's doubling time divided by the ceiling. */
  doublingYears: number;
  /** Years to M19's first wall at that pace. */
  yearsToFirstWall: number;
  /** Years to Type I's thirty doublings at that pace. */
  yearsToTypeI: number;
};

/**
 * What each assumed cognitive fraction would actually buy, applied to λ.
 *
 * Deliberately expressed against the wall as well as against Type I, because
 * M19 established the wall is what arrives first and M23 that only its date
 * moves.
 */
export function speedupLadder(fractions = [0.5, 0.8, 0.9, 0.95]): SpeedupCase[] {
  const base = doublingTimeImpliedBy(101);
  const wallDoublings = doublingsTo(firstWall().powerW);
  const typeIDoublings = doublingsRequired(typeISystemMassKg());
  return fractions.map((cognitiveFraction) => {
    const ceiling = speedupCeiling(cognitiveFraction);
    const doublingYears = base / ceiling;
    return {
      cognitiveFraction,
      ceiling,
      doublingYears,
      yearsToFirstWall: wallDoublings * doublingYears,
      yearsToTypeI: typeIDoublings * doublingYears,
    };
  });
}

export const QUALIFICATION_VERDICT = {
  headline: "The array takes eight months to build and sixty-nine years to know.",
  amdahl:
    "Claiming AGI closes M23's x159 organisational gap is claiming 99.37% of the schedule is " +
    "thinking. That is a statement about the world, and it can be argued with.",
  escape:
    "All of this is avoidable by flying unqualified hardware and finding out. That is a choice " +
    "about risk, not a physics result. The acceleration is available only to whoever makes it.",
  /**
   * [KNOWN_LIMIT]
   *
   *  - `f` is not derivable here and is not estimated. The module converts
   *    claims about acceleration into claims about `f`, nothing more.
   *  - Verification time is taken equal to the lifetime being verified. That is
   *    the pessimistic bound: partial qualification, staged deployment and
   *    fleet learning all shorten it, and none of them is modelled.
   *  - No prototype iteration, no tooling, no supply chain, no regulatory time.
   *  - The accelerable/unaccelerable split is a judgement informed by how life
   *    testing is actually done, not a derivation.
   */
  limits: "f is not estimated; verification time is the pessimistic bound; no tooling or iteration",
} as const;
