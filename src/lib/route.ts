/**
 * M26 — ROUTE. What we can actually say, and what we refuse to say.
 *
 * Twenty-five modules and the obvious question has never been answered
 * directly: **when does Type I arrive?**
 *
 * The answer is that **this repo does not know, cannot know, and will not
 * pretend to.** Every date anyone quotes — 2100, 2150, 2367 — is a statement
 * about a handful of free parameters, not about physics. What the chain has
 * actually produced is better and more useful than a date: **a list of gates,
 * each with a number, a unit, an owner and a falsifiable requirement.**
 *
 * **[THE GATES] Everything that must be true, with today's value beside it.**
 *
 *     gate                              today        required        gap
 *     areal density                  2.24 kg/m²    4.43 g/m²        ×506
 *     load specific power             ~100 W/kg     75,900 W/kg     ×759
 *     launch cadence               0.71 flights/d   100 /d          ×142
 *     array lifetime                    ~5 yr        69 yr          ×14
 *     lunar mass fraction                 ~0%        ≥99.98%      materials
 *     compute efficiency          must NOT rise beyond ×52        inverted
 *
 * That last one is the strange one and it is real: M16 showed that if compute
 * efficiency improves by more than ×52, Type I computation no longer needs to
 * leave the crust at all. **It is a gate the thesis needs to stay shut.**
 *
 * **[THE REFUSAL] Why there is no `typeIYear()` in this file.**
 *
 * A date is a function of four numbers this repo has spent five modules making
 * explicit and arguable, and of nothing else:
 *
 *   - **industrial doubling time** — M23 put the thermodynamic floor at 7.7 days
 *     and λ's implication at 3.36 years, a factor of **159** apart, all of it
 *     organisational;
 *   - **the cognitive fraction f** — M24 showed Amdahl caps any speedup at
 *     `1/(1−f)`, so "AGI fixes this" is the claim that f ≈ 99.4%;
 *   - **the learning rate in kg/m²** — M25 showed the areal gap closes at
 *     18.7% per doubling and that photovoltaics' famous 22% is measured in the
 *     wrong currency;
 *   - **launch cadence** — M7's 100 flights/day is ×142 the entire world's 2024
 *     rate.
 *
 * So `yearsToTypeI` here takes a **required** scenario argument and has no
 * default. You cannot get a date out of this module by accident, and a test
 * enforces it. Supply the assumptions and it will do the arithmetic; it will
 * never supply them for you.
 *
 * **That is not evasion. It is the only honest product.** Anyone quoting a year
 * without stating a doubling time, a cognitive fraction and a learning rate is
 * quoting a feeling. With those three stated, the year is a division — and
 * arguing about the three is a real argument, which a year never is.
 *
 * **[FOR A SIMULATOR] The gates are the mechanism.** A player closing gates is
 * doing exactly what the chain says has to happen, and the date falls out of
 * their choices rather than being written on the box. The reference scenarios
 * below are the difficulty settings, and every one of them is a citation.
 */

import { P_2023, P_I, GROWTH } from "./kardashev.ts";
import { LAMBDA, yearsAccelerating, yearsInertial } from "./forecast.ts";
import { WORLD_CADENCE_PER_DAY } from "./lift.ts";
import { arealDensityToGeoKgM2 } from "./transfer.ts";
import { requiredSpecificPowerWKg, SPECIFIC_POWER_W_KG } from "./load.ts";
import { earthShareCeiling, doublingsRequired, typeISystemMassKg, doublingTimeImpliedBy } from "./isru.ts";
import { combinedLifetimeYr } from "./environment.ts";
import { escapeThreshold } from "./substitution.ts";
import { requiredArealRate } from "./learning.ts";
import { doublingFloorSeconds } from "./acceleration.ts";
import { SECONDS_PER_YEAR } from "./constants.ts";
import { firstWall } from "./sequence.ts";

/** What kind of thing stands between here and there. */
export type GateKind =
  /** Thermodynamics or geometry. Cannot be relaxed. */
  | "physical"
  /** A number we chose. Relax it and the gate moves. */
  | "budget"
  /** Engineering and materials. This is where work goes. */
  | "design"
  /** Chemistry of what is available where. */
  | "materials"
  /** A gate the thesis needs to stay SHUT. */
  | "inverted";

export type Gate = {
  id: string;
  question: string;
  today: number;
  required: number;
  unit: string;
  /** Ratio between them, ≥ 1 whichever way it points. Infinity when today is zero. */
  gapX: number;
  /** False when the ratio is not the right frame — see `lunar-fraction`. */
  ratioMeaningful: boolean;
  owner: string;
  kind: GateKind;
  note: string;
};

/**
 * Ratio between where we are and where we must be, always stated as a multiple
 * ≥ 1 whichever way it points.
 *
 * Returns Infinity when today is zero, which is the honest answer for a gate
 * like lunar mass fraction: nothing in orbit is lunar-sourced, so "×N better"
 * is not the right frame and the gate is flagged rather than given a number.
 */
function gap(today: number, required: number): number {
  if (today === 0) return Infinity;
  const r = today / required;
  return r >= 1 ? r : 1 / r;
}

/**
 * [THE ANSWER] Everything that has to become true, as data.
 *
 * Not a schedule. A specification. Each row is a falsifiable engineering target
 * in stated units, owned by the module that derived it.
 */
export function gates(): Gate[] {
  const rows: Omit<Gate, "gapX" | "ratioMeaningful">[] = [
    {
      id: "areal-density",
      question: "How light must a square metre of collector be?",
      today: 2.24,
      required: arealDensityToGeoKgM2(100, 100),
      unit: "kg/m²",
      owner: "transfer.ts",
      kind: "design",
      note: "The hardest number in the chain. M25 says it closes only at ≥18.7% learning per doubling, in mass and not in cost.",
    },
    {
      id: "load-specific-power",
      question: "How many watts must a kilogram of the load dissipate?",
      today: SPECIFIC_POWER_W_KG.rack,
      required: requiredSpecificPowerWKg(1),
      unit: "W/kg",
      owner: "load.ts",
      kind: "design",
      note: "A 14 µm die at 400 K. The lever is making the chip its own radiator rather than its passenger.",
    },
    {
      id: "launch-cadence",
      question: "How often must something reach orbit?",
      today: WORLD_CADENCE_PER_DAY,
      required: 100,
      unit: "flights/day",
      owner: "lift.ts",
      kind: "design",
      note: "McDowell 2024: 258 launches reached orbit or marginal orbit. The requirement is still 100/day.",
    },
    {
      id: "array-lifetime",
      question: "How long must hardware survive in orbit?",
      today: 5,
      required: combinedLifetimeYr(),
      unit: "years",
      owner: "environment.ts",
      kind: "design",
      note: "The mechanism supports it; nothing that thin has flown a decade. M24: verifying it takes as long as it lasts.",
    },
    {
      id: "lunar-fraction",
      question: "How much of the array must never come up Earth's gravity well?",
      today: 0,
      required: earthShareCeiling(100).minLunarFraction,
      unit: "fraction",
      owner: "isru.ts",
      kind: "materials",
      note: "Regolith has silicon, aluminium and oxygen. It has no carbon. This is a chemistry problem, not a logistics one.",
    },
    {
      id: "compute-efficiency-ceiling",
      question: "How much may compute efficiency improve before the thesis dissolves?",
      today: 1,
      required: escapeThreshold(0.1).factor,
      unit: "×",
      owner: "substitution.ts",
      kind: "inverted",
      note: "A gate that must stay SHUT. Past ×52, Type I computation fits on the crust and the orbital argument is about industry instead.",
    },
    {
      id: "thermal-ceiling",
      question: "Above what power must the load leave the crust at all?",
      today: P_2023,
      required: firstWall().powerW,
      unit: "W",
      owner: "thermal.ts",
      kind: "budget",
      note: "The first wall, and a budget we chose. At +0.5 K it moves out by five. Everything else on this list is what happens past it.",
    },
  ];
  return rows.map((r) => {
    const gapX = gap(r.today, r.required);
    return { ...r, gapX, ratioMeaningful: Number.isFinite(gapX) };
  });
}

export const openGates = () => gates().filter((g) => g.kind !== "inverted" && g.gapX > 1.5);
/** Gates where "×N better" is not the right frame at all. */
export const unratioableGates = () => gates().filter((g) => !g.ratioMeaningful);
export const invertedGates = () => gates().filter((g) => g.kind === "inverted");

// ──────────────────────────────────────────────── the date, on your terms

/**
 * The four numbers a date is a function of. **No defaults on purpose.**
 *
 * Every argument here is something the chain made explicit and arguable. A year
 * quoted without all four is a feeling with a number attached.
 */
export type Scenario = {
  label: string;
  /**
   * Years per doubling of installed **power**. Each reference scenario sets this
   * so it reproduces its own published total over the 9.0 doublings to Type I.
   */
  doublingYears: number;
  /** Cognition-bound share of the schedule, for M24's Amdahl ceiling. */
  cognitiveFraction: number;
  /** Learning rate per doubling, in areal density. M25 needs ≥0.187. */
  arealLearningRate: number;
  /** Flights per day sustained. M7 asks for 100. */
  cadencePerDay: number;
  /** Where the numbers came from. Required — a scenario without a source is a guess. */
  source: string;
};

/**
 * [PUBLISHED / DERIVED] Reference scenarios. Difficulty settings, each a citation.
 *
 * These are not predictions. They are the points the chain can actually locate.
 */
export const SCENARIOS: Scenario[] = (() => {
  // Each scenario's power-doubling time is BACKED OUT of that model's own
  // published total, so every row reproduces its source exactly rather than
  // carrying a number typed in here. M11 and M23 quote totals for 30 *mass*
  // doublings; dividing by the 9.0 *power* doublings is the conversion, and it
  // is done in the open.
  const n = Math.log2(P_I / P_2023);
  return [
    {
      label: "IEA inertia",
      doublingYears: Math.LN2 / Math.log(1 + GROWTH),
      cognitiveFraction: 0,
      arealLearningRate: 0.06,
      cadencePerDay: WORLD_CADENCE_PER_DAY,
      source: `1.8%/yr world energy growth extrapolated; reproduces forecast.ts yearsInertial() = ${Math.round(yearsInertial())}`,
    },
    {
      label: "λ hypothesis",
      doublingYears: yearsAccelerating() / n,
      cognitiveFraction: 0,
      arealLearningRate: 0.12,
      cadencePerDay: 10,
      source: `forecast.ts λ = ${LAMBDA}, a labelled hypothesis assuming collaboration; total ${Math.round(yearsAccelerating())} yr`,
    },
    {
      label: "Self-replicating industry",
      doublingYears: (doublingsRequired(typeISystemMassKg()) * (Math.LN2 / 0.96)) / n,
      cognitiveFraction: 0.5,
      arealLearningRate: 0.187,
      cadencePerDay: 100,
      source: "isru.ts productivity 1/yr at the f≈0.96 allocation optimum, over its own 30 mass doublings",
    },
    {
      label: "Thermodynamic floor",
      doublingYears:
        (doublingsRequired(typeISystemMassKg()) * (doublingFloorSeconds() / SECONDS_PER_YEAR)) / n,
      cognitiveFraction: 0.9,
      arealLearningRate: 0.22,
      cadencePerDay: 1000,
      source: "acceleration.ts e/p over 30 mass doublings — a bound, explicitly NOT a forecast",
    },
  ];
})();

export type Projection = {
  scenario: string;
  /** Doublings of installed POWER to Type I. Not M11's mass doublings. */
  doublings: number;
  /** Amdahl ceiling from the stated cognitive fraction. */
  speedupCeiling: number;
  effectiveDoublingYears: number;
  yearsToTypeI: number;
  yearsToFirstWall: number;
  /** Does the stated learning rate close M25's areal gap over those doublings? */
  arealGapCloses: boolean;
};

/**
 * Doublings of installed POWER from today to Type I: log2(P_I/P_2023) = 9.0.
 *
 * [CORRECTED] The first version of `project` used M11's **30 industrial mass
 * doublings** from a 100 t seed instead. Those are a different quantity —
 * building the factory, not raising the supply — and mixing them made IEA
 * inertia give 1,169 years against the 349 this repo has quoted since M1. The
 * ordering test caught it.
 */
export function powerDoublingsToTypeI(): number {
  return Math.log2(P_I / P_2023);
}

/**
 * [THE REFUSAL, made concrete] Give it a scenario and it does the arithmetic.
 *
 * `scenario` is **required**. There is no default and there will not be one:
 * this module will not hand anyone a year they did not choose the inputs for.
 * A test asserts that calling it without arguments is a type error and that no
 * exported function returns a date on its own.
 */
export function project(scenario: Scenario): Projection {
  const doublings = powerDoublingsToTypeI();
  const speedupCeiling = 1 / (1 - Math.min(0.999, Math.max(0, scenario.cognitiveFraction)));
  const effectiveDoublingYears = scenario.doublingYears / speedupCeiling;
  const wallDoublings = Math.log2(firstWall().powerW / P_2023);
  return {
    scenario: scenario.label,
    doublings,
    speedupCeiling,
    effectiveDoublingYears,
    yearsToTypeI: doublings * effectiveDoublingYears,
    yearsToFirstWall: wallDoublings * effectiveDoublingYears,
    arealGapCloses: scenario.arealLearningRate >= requiredArealRate(),
  };
}

/** Every reference scenario, for a table nobody has to assemble by hand. */
export const projections = () => SCENARIOS.map(project);

/** Calendar year, given a scenario and the year you are standing in. */
export function arrivalYear(scenario: Scenario, fromYear = 2026): number {
  return fromYear + project(scenario).yearsToTypeI;
}

export const ROUTE_VERDICT = {
  headline: "There is no date here. There is a specification, and a calculator you must supply.",
  whatWeHave:
    "Seven gates, each a falsifiable engineering target in stated units, owned by the module " +
    "that derived it. That is a route, and it is what a simulator can be built on.",
  whatWeRefuse:
    "A year. A date is a function of a doubling time, a cognitive fraction, a learning rate and " +
    "a cadence. State those four and the year is a division. Quote a year without them and it " +
    "is a feeling with a number attached.",
  /**
   * [KNOWN_LIMIT]
   *
   *  - `project` compounds a single doubling time across the whole build. Real
   *    build-out changes pace, and nothing here models that.
   *  - The Amdahl ceiling is applied to the doubling time as if cognition and
   *    production were separable in the way M24 assumed. They are entangled.
   *  - `arealGapCloses` is a yes/no against M25's threshold and says nothing
   *    about whether a rate is achievable in mass rather than cost.
   *  - Gates are treated as independent. They are not: M25 shows learning is
   *    driven by the very build that the other gates constrain.
   *  - "today" values are order-of-magnitude anchors for orientation, not a
   *    survey of the state of the art.
   */
  limits: "one doubling time throughout, gates treated as independent, today-values are anchors",
} as const;
