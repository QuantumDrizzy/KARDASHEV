/**
 * M17 — INDUSTRY. Checking the sentence M16 asserted and did not verify.
 *
 * M16 resolved its own challenge with a claim: *"industry, transport, materials
 * and agriculture have no Landauer runway"*. That was an assertion. If it is
 * false the resolution collapses and the orbital chain loses its answer to the
 * ×52 escape. So it needs a number, and it turns out to have a very clean one.
 *
 * **[RESULT] Compute is the anomaly, by three to eight orders.**
 *
 * Every physical process has a thermodynamic minimum — the Gibbs free energy of
 * the reaction, the mixing entropy of the separation, the Carnot work of the
 * pump. Industry runs *close* to those minima:
 *
 *     steel, ore to liquid        ×2.86        ammonia, Haber-Bosch     ×1.72
 *     cement clinker              ×1.94        aluminium, Hall-Héroult  ×2.17
 *     desalination, SWRO          ×2.83        — mean **×2.31**
 *
 * Against compute's **×1,232** in logic and **×10⁸** in data movement. Two
 * centuries of thermodynamics has taken heavy industry to within a factor of two
 * or three of its floor. Computation is nowhere near its own, and that gap is
 * not a general property of technology. **It is specific to computation.**
 *
 * **[THE RESOLUTION, with a number] The escape needs a ≥95% compute economy.**
 *
 * Spend every runway at once and the total reduction is the harmonic blend
 * `1 / (f_c/r_c + (1−f_c)/r_nc)`. Setting that equal to M16's escape factor of
 * 52.1 and solving for the compute share `f_c`:
 *
 *     **f_c ≥ 95.6%**
 *
 * And here is the part worth keeping: **the answer barely depends on compute's
 * runway at all.** At ×1,232 it is 95.75%; at ×10⁸ it is 95.57%; at *infinite*
 * compute efficiency it is still 95.57%. The non-compute term dominates the
 * blend, so no improvement in computers can rescue the escape on its own.
 *
 * Swept over the whole plausible range for industry — ×2 to ×10 — the required
 * compute share runs 96.2% down to 80.8%. It never becomes a small number.
 *
 * **So M16's challenge survives, and narrows.** The orbital argument fails only
 * for a civilisation that spends ≥95% of its energy on computation. Today's
 * figure is **0.27%** (IEA data-centre electricity against TES), and at that mix
 * the total achievable reduction is **×2.31** — not ×52. That is not a refutation
 * of M16; it is the condition under which M16 bites, stated so it can be argued
 * with.
 *
 * [KNOWN_LIMIT] Two loads do not fit this frame and both are stated rather than
 * folded in. **Transport has no thermodynamic minimum at all** — moving a mass
 * horizontally costs zero in principle, so its runway is unbounded and the ×2.31
 * mean understates the escape if transport dominates. **Heating is Carnot-bound,
 * not reaction-bound**, and a heat pump has ~×15 of headroom over resistive.
 * Neither is plausibly the bulk of a 10¹⁶ W economy — at 509× today's supply you
 * are not heating houses, you are making things — but that is a judgement, not a
 * derivation, and it is the softest joint in this module.
 */

import { DATACENTER_W, ELECTRICITY_W } from "./facts.ts";
import { P_2023 } from "./kardashev.ts";
import { LOGIC_J_PER_BIT_OP, MOVEMENT_J_PER_BIT, runway } from "./reject.ts";
import { escapeThreshold } from "./substitution.ts";

export type Process = {
  id: string;
  label: string;
  /** Thermodynamic minimum specific energy. */
  minimum: number;
  /** Best-practice or global-average actual, same units. */
  actual: number;
  unit: string;
  note: string;
};

/**
 * [PUBLISHED] Theoretical minimum against actual specific energy.
 *
 * Standard figures from the industrial energy-efficiency literature (DOE
 * bandwidth studies, IEA process analyses). Each carries perhaps ±20%, and the
 * conclusion — that every one of them is a small single-digit multiple — is
 * robust to considerably more error than that in any single entry.
 */
export const PROCESSES: Process[] = [
  {
    id: "steel",
    label: "steel, ore to liquid",
    minimum: 7.0,
    actual: 20.0,
    unit: "GJ/t",
    note: "Reduction of hematite. Minimum is the Gibbs free energy of the reaction plus melting.",
  },
  {
    id: "ammonia",
    label: "ammonia, Haber-Bosch",
    minimum: 20.9,
    actual: 36.0,
    unit: "GJ/t",
    note: "The most thermodynamically mature process at scale. Best plants are nearer ×1.3.",
  },
  {
    id: "cement",
    label: "cement clinker",
    minimum: 1.8,
    actual: 3.5,
    unit: "GJ/t",
    note: "Calcination plus sensible heat. The CO2 is stoichiometric, not an efficiency question.",
  },
  {
    id: "aluminium",
    label: "aluminium, Hall-Héroult",
    minimum: 23.0,
    actual: 50.0,
    unit: "GJ/t",
    note: "Electrolytic. Minimum is the decomposition voltage of alumina at cell temperature.",
  },
  {
    id: "desalination",
    label: "desalination, seawater RO",
    minimum: 1.06,
    actual: 3.0,
    unit: "kWh/m³",
    note: "Minimum is the mixing work at ~50% recovery. A separation, not a reaction.",
  },
];

/** How far a process runs above its own thermodynamic floor. */
export function processRunway(p: Process): number {
  return p.actual / p.minimum;
}

/**
 * Mean runway across the modelled processes.
 *
 * A crude aggregate and deliberately so: the module's conclusion is stated as a
 * function of this number and swept, rather than resting on the mean.
 */
export function meanNonComputeRunway(processes: Process[] = PROCESSES): number {
  return processes.reduce((s, p) => s + processRunway(p), 0) / processes.length;
}

/**
 * Carnot headroom for heating, the one non-compute load with real runway.
 *
 * A heat pump moving heat across ΔT has a ceiling of `T_hot/(T_hot − T_cold)`
 * against resistive heating's 1. At 293 K over a 20 K lift that is ~×15.
 * Stated, not folded into the mean — see the module's KNOWN_LIMIT.
 */
export function carnotHeatingRunway(tHotK = 293, tColdK = 273): number {
  return tHotK / (tHotK - tColdK);
}

// ────────────────────────────────────────────────── the blended economy

/**
 * Total energy reduction available when every runway is spent at once.
 *
 * Power is additive, so the reduction is a harmonic blend weighted by share:
 * `1 / (f_c/r_c + (1−f_c)/r_nc)`. The small term dominates, which is why the
 * result depends far more on industry than on computers.
 *
 * The share is clamped to [0, 1]. A share outside it is not a mix, and left
 * unclamped the blend returns a *negative* reduction — which a monotonicity test
 * duly found by walking past 1.0 on accumulated floating-point error.
 */
export function totalReduction(
  computeShare: number,
  o: { computeRunway?: number; nonComputeRunway?: number } = {},
): number {
  const f = Math.min(1, Math.max(0, computeShare));
  const rc = o.computeRunway ?? runway(LOGIC_J_PER_BIT_OP).headroomX;
  const rnc = o.nonComputeRunway ?? meanNonComputeRunway();
  return 1 / (f / rc + (1 - f) / rnc);
}

/**
 * [THE RESULT] Compute share of the economy needed to reach a given reduction.
 *
 * Inverting the blend for `f_c`. Against M16's escape factor of 52.1 this gives
 * **95.6%**, and it stays there whatever compute's own runway is — at infinite
 * compute efficiency the answer is still 95.57%, because the non-compute term
 * alone has to fit under the target.
 *
 * Returns a value above 1 when the target is unreachable at any mix, which is
 * the honest output when the non-compute floor alone exceeds it.
 */
export function requiredComputeShare(
  o: { target?: number; computeRunway?: number; nonComputeRunway?: number } = {},
): number {
  const target = o.target ?? escapeThreshold(0.1).factor;
  const rc = o.computeRunway ?? runway(LOGIC_J_PER_BIT_OP).headroomX;
  const rnc = o.nonComputeRunway ?? meanNonComputeRunway();
  return (1 / target - 1 / rnc) / (1 / rc - 1 / rnc);
}

/** The same, with compute assumed infinitely efficient — the floor of the answer. */
export function requiredComputeShareAtBestCase(nonComputeRunway?: number, target?: number): number {
  const rnc = nonComputeRunway ?? meanNonComputeRunway();
  const t = target ?? escapeThreshold(0.1).factor;
  return 1 - rnc / t;
}

/** Compute's share of today's energy supply — the starting point of the mix. */
export function computeShareToday(): { ofElectricity: number; ofTes: number } {
  return { ofElectricity: DATACENTER_W / ELECTRICITY_W, ofTes: DATACENTER_W / P_2023 };
}

export type ShareCase = {
  computeShare: number;
  totalReductionX: number;
  escapes: boolean;
};

/** What the mix actually buys, from today's share up to a compute civilisation. */
export function shareLadder(shares = [0.0027, 0.1, 0.5, 0.9, 0.99]): ShareCase[] {
  const target = escapeThreshold(0.1).factor;
  return shares.map((computeShare) => {
    const totalReductionX = totalReduction(computeShare);
    return { computeShare, totalReductionX, escapes: totalReductionX >= target };
  });
}

/** Sensitivity of the answer to the one number it actually depends on. */
export function nonComputeSensitivity(runways = [2, 2.5, 3, 5, 10]) {
  return runways.map((nonComputeRunway) => ({
    nonComputeRunway,
    requiredComputeShare: requiredComputeShareAtBestCase(nonComputeRunway),
  }));
}

export const INDUSTRY_VERDICT = {
  headline: "Industry runs at ×2.3 from its thermodynamic floor. Compute runs at ×1,232. The anomaly is compute.",
  /** The condition under which M16's challenge actually bites. */
  condition: "The orbital argument fails only for a civilisation spending >=95% of its energy on computation.",
  /** Why the condition is robust. */
  robustness:
    "The required share is insensitive to compute's own runway — infinite compute efficiency " +
    "still needs 95.57%, because the non-compute term alone must fit under the target.",
  logicRunwayX: runway(LOGIC_J_PER_BIT_OP).headroomX,
  movementRunwayX: runway(MOVEMENT_J_PER_BIT).headroomX,
  /**
   * [KNOWN_LIMIT]
   *
   *  - Five processes are not an economy. They are chosen because they are the
   *    largest industrial energy sinks with well-established thermodynamic
   *    minima, not because they span the load.
   *  - Transport has no thermodynamic minimum for horizontal displacement, so
   *    its runway is unbounded in principle. If transport dominates a Type I
   *    economy this module's mean is wrong in the direction that helps M16.
   *  - Heating is Carnot-bound at ~×15, not reaction-bound at ×2.3. Also
   *    excluded from the mean rather than folded in.
   *  - The judgement that a 10¹⁶ W economy is dominated by making things rather
   *    than moving or heating them is a judgement, not a derivation. It is the
   *    softest joint here and the place to attack this module.
   *  - Published minima carry ~±20% each; the conclusion tolerates far more.
   */
  limits: "five processes, transport and heating excluded, and the load mix is judged not derived",
} as const;
