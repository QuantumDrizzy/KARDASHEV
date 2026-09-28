/**
 * M21 — STAGING. The piece M14 and M20 both marked missing, and the correction
 * it forces.
 *
 * M20 ended on a sentence that is too strong: *"the Earth-launch route is closed
 * by the periodic table."* We launch to GEO with chemical rockets every month.
 * Something in that claim had to be wrong, and it is the scope: M20 computed a
 * **single-stage** mass ratio and drew a conclusion about **the route**.
 *
 * **[CORRECTS M20] What is actually true, split into two claims.**
 *
 * The narrow one survives intact and is worth keeping. A stage carries structure
 * as well as propellant, so its payload ratio is
 *
 *     λ = 1 − (1 − 1/R) / (1 − ε)
 *
 * and at M14's Earth→GEO Δv of 12,724 m/s, Isp 380 s and a good structural
 * coefficient of ε = 0.08, a single stage gives **λ = −0.05**. Negative. The
 * stage cannot lift its own tanks, let alone a payload. **Single-stage to GEO on
 * chemistry is genuinely impossible**, and that is what M20 had hold of.
 *
 * The broad one was wrong. **Staging is precisely how you beat the mass ratio
 * without beating chemistry**, because total ratio is a *product* over stages:
 *
 *     stages  1  →  impossible
 *     stages  2  →  **1.21%** payload fraction to GEO
 *     stages  3  →  1.78%
 *     stages  4  →  2.00%      (diminishing, as each stage adds its own structure)
 *
 * **[VALIDATION] And this is where the chain finally meets a flown vehicle.**
 *
 * Falcon 9 Block 5, expendable: 22,800 kg to LEO and 8,300 kg to GTO, both
 * published. That ratio is **×2.747**. M14 derived a GEO payload penalty of
 * **×2.772** from Tsiolkovsky alone, with an assumed Isp and no vehicle in it at
 * all.
 *
 *     **0.9% agreement, against a real rocket.**
 *
 * Nothing in M14 was fitted to that number. It is the strongest external check
 * the transfer chain has, and it had been sitting one division away for two
 * modules. The payload fraction agrees too: this model gives 1.21% at two stages
 * against Falcon 9's actual 1.51% of gross mass to GTO — conservative by a fifth,
 * which is what a first-order model with an assumed ε should be.
 *
 * **[RESULT] So the honest binding number is 2%, not impossibility.**
 *
 * Chemistry reaches GEO. It reaches it at **one to two percent of gross mass**,
 * and *that* is what makes M7's areal density requirement ×505 — you are not
 * fighting the periodic table, you are fighting the fact that ninety-eight
 * percent of what you launch is the launcher. M11's conclusion is unchanged; the
 * reason for it is now stated correctly.
 *
 * [KNOWN_LIMIT] Equal Δv split across identical stages. True optimal staging
 * varies Isp and ε per stage and is solved with Lagrange multipliers; equal split
 * is near-optimal only when the stages are alike, which they are not on any real
 * vehicle. No drop-tanks, no boosters, no reuse penalty, no GTO-versus-GEO
 * distinction — Falcon 9's 8,300 kg is to *transfer* orbit and the spacecraft
 * finishes the job, so the comparison is a like-for-like ratio and not an
 * absolute capability claim.
 */

import { G0 } from "./constants.ts";
import { ISP_VACUUM_S, deltaVToGeo, deltaVFromSurface, massRatio } from "./transfer.ts";

/**
 * [ASSUMED] Structural coefficient: structure over structure-plus-propellant.
 * 0.08 is a good modern stage; 0.05 is excellent, 0.12 is heavy.
 */
export const STRUCTURAL_COEFFICIENT = 0.08;

/**
 * [PUBLISHED] Falcon 9 Block 5, expendable. The yardstick this module exists to
 * hold the chain against — a flown vehicle with published numbers to both
 * destinations, which is what makes the ratio meaningful.
 */
export const FALCON_9 = {
  label: "Falcon 9 Block 5, expendable",
  leoKg: 22_800,
  gtoKg: 8_300,
  grossMassKg: 549_000,
} as const;

/**
 * Payload ratio of one stage: `λ = 1 − (1 − 1/R)/(1 − ε)`.
 *
 * Negative means the stage cannot carry itself. That is not a numerical
 * artefact — it is the statement that the required propellant plus its tankage
 * exceeds the whole vehicle.
 */
export function stagePayloadRatio(mass: number, structuralCoefficient: number = STRUCTURAL_COEFFICIENT): number {
  return 1 - (1 - 1 / mass) / (1 - structuralCoefficient);
}

export type Staged = {
  stages: number;
  deltaVMs: number;
  ispS: number;
  structuralCoefficient: number;
  /** Mass ratio of each identical stage. */
  stageMassRatio: number;
  /** Payload ratio of one stage. Negative means impossible. */
  stagePayloadRatio: number;
  /** Payload over gross mass for the whole vehicle. */
  payloadFraction: number;
  feasible: boolean;
};

/**
 * Payload fraction for `n` identical stages splitting the Δv equally.
 *
 * The product over stages is the whole point: two stages at half the Δv each
 * have a combined ratio far better than one stage at all of it, because each
 * only has to lift the ones above it.
 */
export function stagedFlight(
  deltaVMs: number,
  stages: number,
  o: { ispS?: number; structuralCoefficient?: number } = {},
): Staged {
  const ispS = o.ispS ?? ISP_VACUUM_S;
  const eps = o.structuralCoefficient ?? STRUCTURAL_COEFFICIENT;
  const stageMassRatio = massRatio(deltaVMs / stages, ispS);
  const lambda = stagePayloadRatio(stageMassRatio, eps);
  return {
    stages,
    deltaVMs,
    ispS,
    structuralCoefficient: eps,
    stageMassRatio,
    stagePayloadRatio: lambda,
    payloadFraction: lambda > 0 ? lambda ** stages : 0,
    feasible: lambda > 0,
  };
}

/** The ladder that shows staging is the lever, and that it saturates. */
export function stagingLadder(
  deltaVMs: number = deltaVToGeo(),
  counts = [1, 2, 3, 4, 5],
  o: { ispS?: number; structuralCoefficient?: number } = {},
): Staged[] {
  return counts.map((n) => stagedFlight(deltaVMs, n, o));
}

/**
 * [CORRECTS M20] Single-stage-to-GEO on chemistry is impossible — and that is a
 * narrower claim than the one M20 made.
 */
export function singleStageIsImpossible(deltaVMs: number = deltaVToGeo()): boolean {
  return !stagedFlight(deltaVMs, 1).feasible;
}

/** Fewest stages that can do the job at all. */
export function minimumStages(deltaVMs: number = deltaVToGeo(), max = 8): number {
  for (let n = 1; n <= max; n++) if (stagedFlight(deltaVMs, n).feasible) return n;
  return Infinity;
}

// ───────────────────────────────────────────────── against a real rocket

export type Falcon9Check = {
  /** Published LEO over published GTO capability. */
  observedRatio: number;
  /** M14's derived GEO payload penalty, from Tsiolkovsky with no vehicle in it. */
  predictedRatio: number;
  errorFrac: number;
  /** Falcon 9's actual payload as a fraction of gross mass, to GTO. */
  observedPayloadFraction: number;
  /** What this module's two-stage model gives for the same trip. */
  modelledPayloadFraction: number;
};

/**
 * [VALIDATION] The strongest external check the transfer chain has.
 *
 * M14 predicted the GEO payload penalty from the rocket equation alone. Falcon
 * 9's published LEO and GTO numbers give the same ratio to **0.9%**, and nothing
 * in M14 was fitted to it.
 */
export function falcon9Check(): Falcon9Check {
  const observedRatio = FALCON_9.leoKg / FALCON_9.gtoKg;
  const predictedRatio = massRatio(deltaVToGeo()) / massRatio(deltaVFromSurface(550));
  return {
    observedRatio,
    predictedRatio,
    errorFrac: observedRatio / predictedRatio - 1,
    observedPayloadFraction: FALCON_9.gtoKg / FALCON_9.grossMassKg,
    modelledPayloadFraction: stagedFlight(deltaVToGeo(), 2).payloadFraction,
  };
}

/** Isp that a given stage count would need to reach a target payload fraction. */
export function ispForPayloadFraction(
  target: number,
  stages: number,
  deltaVMs: number = deltaVToGeo(),
  eps: number = STRUCTURAL_COEFFICIENT,
): number {
  const lambda = target ** (1 / stages);
  const r = 1 / (1 - (1 - lambda) * (1 - eps));
  return deltaVMs / stages / (G0 * Math.log(r));
}

export const STAGING_VERDICT = {
  headline: "Chemistry reaches GEO — at one to two percent of gross mass. That is the binding number, not impossibility.",
  correctsM20:
    "M20 computed a single-stage mass ratio and concluded about the route. Single-stage to GEO " +
    "on chemistry is genuinely impossible; the route is not, because staging multiplies ratios.",
  /**
   * [KNOWN_LIMIT]
   *
   *  - Equal Δv split across identical stages. Real optimal staging varies Isp
   *    and ε per stage and needs Lagrange multipliers; equal split is only
   *    near-optimal when stages are alike, and on a real vehicle they are not.
   *  - No boosters, no drop tanks, no reuse penalty, no fairing, no residuals.
   *  - Falcon 9's 8,300 kg is to *transfer* orbit, not circular GEO — the
   *    spacecraft finishes the job. The comparison used here is a like-for-like
   *    ratio between two published capabilities, never an absolute claim.
   *  - ε = 0.08 is assumed and the payload fraction is very sensitive to it:
   *    0.05 gives 1.9% at two stages and 0.12 gives 0.5%.
   */
  limits: "equal split, identical stages, no boosters or reuse, epsilon assumed and load-bearing",
} as const;
