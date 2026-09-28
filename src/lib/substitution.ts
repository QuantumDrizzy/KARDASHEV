/**
 * M16 — SUBSTITUTION. The strongest argument against this repo, quantified.
 *
 * Fifteen modules have established where 10¹⁶ W must go and what it costs to put
 * it there. None has connected the watts back to the claim that motivates them:
 * *AGI is a software-and-GW event on Earth. ASI is an energy event.*
 *
 * M10 already flagged the problem in one line — "the energy event is real and it
 * is deferred". This module does not rediscover that. It puts a number on it,
 * and the number is small enough to be uncomfortable.
 *
 * **The substitution law.** For a fixed rate of computation `R`, the power drawn
 * is `P = R × J/op`. Energy and efficiency are **substitutes**. Halve the joules
 * per operation and the same cognition runs on half the watts. So any claim that
 * a given amount of thinking *requires* a given number of watts is a claim about
 * efficiency, not about thinking.
 *
 * **[THE CHALLENGE] The threshold is ×52.**
 *
 * M6 puts the terrestrial ceiling at 192 TW under a +0.1 K budget. Type I's
 * computation, at today's efficiency, is 10¹⁶ W. It only has to leave the crust
 * while `10¹⁶ / f > 1.92e14` — that is, while efficiency improves by less than
 *
 *     **f = 52.1×**
 *
 * against a logic runway of **×1,232** and a data-movement runway of **×10⁸**,
 * both of which are M10's own figures. On the repo's own numbers, a factor of
 * fifty-two in compute efficiency dissolves the entire orbital argument for
 * compute, and fifty-two is not a large number.
 *
 * **Why this is a reductio and not a refutation.** Taken literally the movement
 * runway says all of Type I's computation could run on **101 MW** — one large
 * power station, for a civilisation of thinking machines. That is absurd, and
 * its absurdity is informative: the 100 kT floor is a **device-physics bound,
 * not a roadmap**. Bounds are not forecasts. But ×52 sits so far below the bound
 * that ordinary progress reaches it, which is exactly why it belongs in the
 * document rather than in a footnote.
 *
 * **[RESOLUTION] What the substitution actually attacks.**
 *
 * Not the orbital chain. M6–M15 concern where 10¹⁶ W of *any kind* must go, and
 * K is total energy supply — industry, transport, materials, agriculture, none of
 * which has a Landauer runway. Those legs are untouched.
 *
 * What it attacks is the link from **ASI to Type I**. Compute is the one load in
 * the whole economy with orders of thermodynamic headroom, and it is precisely
 * the load the thesis named. The honest form of the claim is therefore narrower
 * than the slogan:
 *
 *     Type I is an energy event. ASI need not be the thing that causes it.
 *
 * The only defence that would restore the original claim is Jevons — that
 * efficiency gains raise total consumption rather than lowering it. That is
 * economics, not physics, and this module does not lean on it.
 *
 * **A side result worth having: biology is not magic.** A 20 W brain at ~10¹⁵
 * synaptic operations per second runs at 2e-14 J/op, which is 4.84 orders above
 * the practical floor. An H100 is 6.09 orders above it. **The brain beats
 * silicon by ×17.7, not by orders of magnitude** — and it has not spent the
 * runway either. Whatever closes the gap to the floor is available to both.
 */

import { P_I } from "./kardashev.ts";
import { POPULATION } from "./constants.ts";
import { powerCeilingW } from "./thermal.ts";
import {
  BIT_OPS_PER_FLOP,
  LOGIC_J_PER_BIT_OP,
  MOVEMENT_J_PER_BIT,
  landauerJPerBit,
  practicalFloorJPerBit,
  runway,
} from "./reject.ts";
import { runScenarios } from "./compute-energy.ts";

/** [PUBLISHED] Resting metabolic power of the human brain, W. */
export const BRAIN_W = 20;

/**
 * [ASSUMED] Synaptic operations per second in one brain.
 *
 * ~10¹⁴ synapses firing at ~1–10 Hz. Published estimates span 10¹⁴–10¹⁶ and this
 * module sweeps that range rather than defending a point value — the conclusion
 * (that the brain leads silicon by about one order, not six) survives all of it.
 */
export const BRAIN_OPS_PER_S = 1e15;

// ─────────────────────────────────────────────────── what the watts buy

/** Responses per second at Type I, using M3's measured frontier serving cost. */
export function typeIResponsesPerSecond(powerW: number = P_I): number {
  const frontier = runScenarios().find((s) => s.id === "frontier-served")!;
  return powerW / (frontier.energy.whPerResponse * 3600);
}

/** The same, per living human. */
export function responsesPerPersonPerSecond(powerW: number = P_I): number {
  return typeIResponsesPerSecond(powerW) / POPULATION;
}

/** Type I expressed in 20 W brains, and in brains per living human. */
export function brainEquivalents(powerW: number = P_I, brainW: number = BRAIN_W) {
  const brains = powerW / brainW;
  return { brains, perPerson: brains / POPULATION };
}

// ────────────────────────────────────────────── biology against silicon

export type EfficiencyPoint = {
  label: string;
  jPerOp: number;
  /** Multiples of kT·ln2 at 300 K. */
  landauerX: number;
  /** Orders of magnitude above the 100 kT practical floor. */
  ordersOverFloor: number;
};

export function efficiencyPoint(label: string, jPerOp: number, tK = 300): EfficiencyPoint {
  const r = runway(jPerOp, tK);
  return { label, jPerOp, landauerX: r.landauerX, ordersOverFloor: r.ordersOfMagnitude };
}

/** Silicon logic per FLOP, from M10's per-bit-op figure. */
export const SILICON_J_PER_FLOP = LOGIC_J_PER_BIT_OP * BIT_OPS_PER_FLOP;

/** Joules per synaptic operation, from the brain's power and rate. */
export function brainJPerOp(opsPerS: number = BRAIN_OPS_PER_S, brainW: number = BRAIN_W): number {
  return brainW / opsPerS;
}

/**
 * [RESULT] Biology is not magic.
 *
 * The brain is ~4.8 orders above the practical floor and an H100 is ~6.1 — a
 * lead of **×17.7**, not of orders. Neither has spent the runway, and whatever
 * closes the gap is available to both. Swept over the published 10¹⁴–10¹⁶ range
 * for synaptic rate, the lead moves between ×1.8 and ×177 and never becomes the
 * qualitative difference it is usually assumed to be.
 */
export function efficiencyComparison(opsPerS: number = BRAIN_OPS_PER_S) {
  const brain = efficiencyPoint("human brain", brainJPerOp(opsPerS));
  const silicon = efficiencyPoint("H100 FP8 logic", SILICON_J_PER_FLOP);
  const movement = efficiencyPoint("HBM data movement", MOVEMENT_J_PER_BIT);
  return {
    brain,
    silicon,
    movement,
    floor: practicalFloorJPerBit(),
    landauer: landauerJPerBit(),
    brainLeadX: silicon.jPerOp / brain.jPerOp,
  };
}

// ──────────────────────────────────────────────────── the substitution

/** `P = R × J/op`. The whole argument in one line. */
export function powerForComputation(ratePerSecond: number, jPerOp: number): number {
  return ratePerSecond * jPerOp;
}

export type RunwayCase = {
  term: string;
  headroomX: number;
  ordersOfMagnitude: number;
  /** Power the same computation would draw with the full runway spent. */
  powerAtFloorW: number;
};

/**
 * What Type I's computation would cost if a runway term were spent in full.
 *
 * Logic gives 8.1 TW — under half of today's world total energy supply.
 * Movement, the term M3 says actually binds, gives **101 MW**. The second figure
 * is a reductio on the bound, not a prediction.
 */
export function runwayCases(powerW: number = P_I): RunwayCase[] {
  return (
    [
      ["logic", LOGIC_J_PER_BIT_OP],
      ["data movement", MOVEMENT_J_PER_BIT],
    ] as [string, number][]
  ).map(([term, jPerBitOp]) => {
    const r = runway(jPerBitOp);
    return {
      term,
      headroomX: r.headroomX,
      ordersOfMagnitude: r.ordersOfMagnitude,
      powerAtFloorW: powerW / r.headroomX,
    };
  });
}

export type EscapeThreshold = {
  /** M6's terrestrial ceiling under the stated ΔT budget, W. */
  terrestrialCeilingW: number;
  /** Efficiency improvement at which Type I's computation fits on the crust. */
  factor: number;
  /** The same factor in orders of magnitude. */
  ordersOfMagnitude: number;
  /** Runway available on each term, for comparison. */
  logicRunwayX: number;
  movementRunwayX: number;
};

/**
 * [THE CHALLENGE] The number this module exists to state.
 *
 * Type I computation needs orbit only while `P_I / f` exceeds M6's terrestrial
 * ceiling. Solving gives **f = 52.1** — and both of M10's runway terms are
 * larger than that, one of them by six orders.
 *
 * Quote this beside the orbital chain, never instead of it: M6–M15 are about
 * 10¹⁶ W of any kind and are untouched. What ×52 threatens is the link from ASI
 * to Type I, because compute is the one load with a thermodynamic runway.
 */
export function escapeThreshold(deltaTBudgetK = 0.1, powerW: number = P_I): EscapeThreshold {
  const terrestrialCeilingW = powerCeilingW(deltaTBudgetK);
  const factor = powerW / terrestrialCeilingW;
  return {
    terrestrialCeilingW,
    factor,
    ordersOfMagnitude: Math.log10(factor),
    logicRunwayX: runway(LOGIC_J_PER_BIT_OP).headroomX,
    movementRunwayX: runway(MOVEMENT_J_PER_BIT).headroomX,
  };
}

/** True when the available runway on a term already exceeds the escape factor. */
export function runwayBeatsThreshold(jPerBitOp: number, deltaTBudgetK = 0.1): boolean {
  return runway(jPerBitOp).headroomX > escapeThreshold(deltaTBudgetK).factor;
}

export const SUBSTITUTION_CHALLENGE = {
  headline: "A factor of 52 in compute efficiency dissolves the orbital argument for compute.",
  /** The narrower claim that survives the challenge. */
  survivingClaim: "Type I is an energy event. ASI need not be the thing that causes it.",
  /** What the challenge does NOT touch. */
  untouched:
    "M6-M15 concern 10^16 W of any kind, and K is total energy supply. Industry, transport, " +
    "materials and agriculture have no Landauer runway; those legs stand unchanged.",
  /**
   * [KNOWN_LIMIT] What this module does not do.
   *
   *  - No forecast. It compares a thermodynamic bound against a threshold and
   *    says the threshold is small. It does not claim the bound is reachable, and
   *    the 101 MW figure is offered as a reductio on the bound.
   *  - The 100 kT reliability floor is M10's assumption, inherited whole.
   *  - `BIT_OPS_PER_FLOP = 1000` is an order-of-magnitude figure and every
   *    per-FLOP number here carries its error.
   *  - Synaptic rate is assumed and swept; the brain comparison is a
   *    scale-setting exercise, not neuroscience.
   *  - Jevons is named and deliberately not leaned on. Whether efficiency raises
   *    or lowers total consumption is economics and outside this repo.
   *  - Nothing here models what the computation is *for*, so "responses per
   *    person per second" is a unit conversion and not a claim about value.
   */
  limits: "a bound, not a forecast; 100 kT inherited; Jevons excluded as non-physics",
} as const;
