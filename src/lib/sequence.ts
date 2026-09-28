/**
 * M19 — SEQUENCE. The order things break.
 *
 * Eighteen modules have each established a wall. Not one of them said **which
 * wall you hit first**, and the whole document reads as if the answer were Type
 * I — a ×509 rise, nine doublings, three and a half centuries at inertia.
 *
 * It is not. Put every wall on the same axis and the first one is close.
 *
 *     today                                      19.6 TW   K 0.729   ×1
 *     **thermal ceiling, +0.1 K budget**        **192 TW**  **K 0.828**  **×9.8**
 *     thermal ceiling, +0.5 K                    960 TW   K 0.898   ×48.9
 *     waste heat = today's greenhouse forcing   1,530 TW   K 0.918   ×77.9
 *     ground solar would need all Earth land    5,960 TW   K 0.978   ×303
 *     Type I                                   10,000 TW   K 1.000   ×509
 *
 * **[RESULT] The first wall is 3.3 doublings away, not 9.**
 *
 * At IEA inertia it arrives in ~128 years against ~349 for Type I — **2.7×
 * sooner**. Every argument in M6–M18 about orbit, lunar sourcing, areal density
 * and radiators is an argument about what happens *after* a constraint that
 * binds at less than ten times today's energy supply.
 *
 * That reframes the thesis without weakening it. "The moment watts leave the
 * crust" is not a Type I event. It is a **K ≈ 0.83** event, and everything past
 * that point is the chain the rest of this repo builds.
 *
 * **The distinction that keeps this honest.** Three of these walls are *budget
 * choices* and one is not:
 *
 *   - `+0.1 K` and `+0.5 K` are numbers we picked. Pick a looser one and the
 *     wall moves — that is what the ladder is for, and why both are listed.
 *   - The greenhouse crossover is a *comparison*, not a limit: it is where waste
 *     heat alone equals today's total anthropogenic forcing. Nothing breaks
 *     there; it is the point where the argument stops being ignorable.
 *   - **Ground solar running out of land is physical.** No budget relaxes it.
 *
 * So the ladder is not a prophecy. It is a statement about which number you have
 * to argue with first, and against a stated budget it is the thermal one.
 *
 * [KNOWN_LIMIT] Inertial years assume IEA's 1.8%/yr forever, which nothing
 * supports beyond the fact that it is what the last decades did. Read the K
 * column and the multiple; the year column is the softest thing here and is
 * included only because "128 years" is legible in a way that "×9.8" is not.
 */

import { GROWTH, P_2023, P_I, kOf } from "./kardashev.ts";
import { greenhouseCrossoverW, groundSolarLandFraction, powerCeilingW } from "./thermal.ts";
import { sustainableFractionOfTypeI } from "./collector.ts";
import { combinedLifetimeYr } from "./environment.ts";

/**
 * What kind of thing a wall is. The chain is much less impressive if a reader
 * cannot tell a chosen budget from a physical limit, so this is not decoration.
 */
export type WallKind =
  /** A number we picked. Relax it and the wall moves. */
  | "budget"
  /** Geometry or thermodynamics. No budget relaxes it. */
  | "physical"
  /** Not a limit — the point where the argument stops being ignorable. */
  | "comparison"
  /** A ceiling set by a build rate, not by physics. */
  | "rate";

export type Wall = {
  id: string;
  label: string;
  powerW: number;
  kind: WallKind;
  module: string;
  note: string;
};

/** Power at which ground solar would need every square metre of land. */
export function groundSolarAllLandW(): number {
  return P_I / groundSolarLandFraction(P_I);
}

/**
 * The sustainable ceiling from M8's `A_max = R·L`, using M12's derived lifetime
 * rather than M8's assumed five years.
 */
export function launchCeilingW(cadencePerDay = 100): number {
  return sustainableFractionOfTypeI(cadencePerDay, combinedLifetimeYr()) * P_I;
}

/** Every wall the chain establishes, on one axis, ordered by power. */
export function walls(): Wall[] {
  // Annotated rather than inferred: chaining .sort() on the literal widens
  // `kind` to string and loses the union that the honesty test relies on.
  const list: Wall[] = [
    {
      id: "today",
      label: "Today — IEA total energy supply, 2023",
      powerW: P_2023,
      kind: "comparison",
      module: "kardashev.ts",
      note: "620 EJ/yr over a Julian year. The origin of the axis.",
    },
    {
      id: "thermal-01k",
      label: "Waste-heat ceiling under a +0.1 K budget",
      powerW: powerCeilingW(0.1),
      kind: "budget",
      module: "thermal.ts",
      note: "The first wall in the whole chain, and it is a budget we chose. Everything M6-M18 argues about lies past it.",
    },
    {
      id: "thermal-05k",
      label: "Waste-heat ceiling under a +0.5 K budget",
      powerW: powerCeilingW(0.5),
      kind: "budget",
      module: "thermal.ts",
      note: "Listed so the budget is visibly a dial and not a law. Five times the temperature buys five times the power.",
    },
    {
      id: "greenhouse-crossover",
      label: "Waste heat alone equals today's greenhouse forcing",
      powerW: greenhouseCrossoverW(),
      kind: "comparison",
      module: "thermal.ts",
      note: "Nothing breaks here. It is where waste heat stops being a rounding error against everything else we do.",
    },
    {
      id: "ground-solar-land",
      label: "Ground solar would need every square metre of land",
      powerW: groundSolarAllLandW(),
      kind: "physical",
      module: "thermal.ts",
      note: "The one wall on this ladder no budget can move. Geometry, not thermodynamics.",
    },
    {
      id: "type-i",
      label: "Type I",
      powerW: P_I,
      kind: "comparison",
      module: "kardashev.ts",
      note: "10^16 W on the Sagan 1973 scale. The destination, and the last thing on the list rather than the first.",
    },
  ];
  return list.sort((a, b) => a.powerW - b.powerW);
}

export type Rung = Wall & {
  k: number;
  multipleOfToday: number;
  doublingsFromToday: number;
  /** Years at IEA inertia. The softest column — see the module's KNOWN_LIMIT. */
  inertialYears: number;
};

export function rungs(growth: number = GROWTH): Rung[] {
  return walls().map((w) => ({
    ...w,
    k: kOf(w.powerW),
    multipleOfToday: w.powerW / P_2023,
    doublingsFromToday: Math.log2(w.powerW / P_2023),
    inertialYears: Math.log(w.powerW / P_2023) / Math.log(1 + growth),
  }));
}

/**
 * [RESULT] The wall that binds first, and the number the repo should lead with.
 *
 * K = 0.828, ×9.8 today's supply, 3.3 doublings. Not ×509 and not nine.
 */
export function firstWall(): Rung {
  return rungs().filter((r) => r.id !== "today")[0];
}

/** How much sooner the first wall arrives than Type I, in inertial years. */
export function soonerThanTypeIX(growth: number = GROWTH): number {
  const rs = rungs(growth);
  const typeI = rs.find((r) => r.id === "type-i")!;
  return typeI.inertialYears / firstWall().inertialYears;
}

export const SEQUENCE_VERDICT = {
  headline: "The first wall is at K 0.83 and ×9.8, not at Type I. Everything else in this repo happens after it.",
  /** The reframing, stated so it cannot be read as a weakening. */
  reframe:
    "'The moment watts leave the crust' is not a Type I event. It is a K ~ 0.83 event, and the " +
    "chain in M6-M18 is what happens past that point.",
  /**
   * [KNOWN_LIMIT]
   *
   *  - The year column assumes 1.8%/yr forever. Nothing supports that beyond it
   *    being what recent decades did. Read K and the multiple; the years are
   *    included only because they are legible.
   *  - Two of these are budgets, one is a comparison and one is physical. A
   *    ladder that blurs those is propaganda, so `kind` is on every rung.
   *  - Walls with no natural power threshold are absent: M13's climate floor is
   *    geometric at a given array size, M14's payload penalty is a ratio, M16's
   *    escape factor is defined against the +0.1 K ceiling and so is the same
   *    wall wearing a different hat.
   *  - Nothing here models what actually happens *at* a wall. A ceiling is not a
   *    cliff, and this module does not claim to know the shape of the failure.
   */
  limits: "inertial years are the softest column; budgets, comparisons and physical limits are distinguished",
} as const;
