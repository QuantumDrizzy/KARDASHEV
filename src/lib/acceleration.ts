/**
 * M23 — ACCELERATION. What intelligence can and cannot move.
 *
 * The question this module exists to answer with numbers rather than adjectives:
 * *if AGI arrives around 2030 and ASI follows, what happens to the Kardashev
 * timeline?* The repo has been implicitly assuming IEA inertia or a labelled
 * λ hypothesis for twenty-two modules and has never asked what a fast takeoff
 * does to either.
 *
 * The answer splits cleanly, and the split is the whole content.
 *
 * **[RESULT 1] Almost every wall in this repo is inelastic to intelligence.**
 *
 * Sort the chain's parameters by whether thinking harder can move them:
 *
 *     INELASTIC — no amount of cognition touches these
 *       σT⁴ and the 192 TW crust ceiling            M6
 *       Earth's land area                            M6b
 *       c* ∝ √(T_c/M), the ~450 s chemical ceiling   M20
 *       bulk propellant densities                    M22
 *       Δv budgets, Tsiolkovsky                      M14
 *       the Landauer floor                           M10
 *       the speed of light in a control loop         M5
 *
 *     ELASTIC — design, materials and organisation, which is what intelligence is
 *       industrial doubling time                     M11  ← the leveraged one
 *       areal density                                M7/M14
 *       structural coefficient ε                     M21/M22
 *       array lifetime L                             M12
 *       build rate R                                 M8
 *       compute efficiency                           M16
 *
 * **[RESULT 2] Even the elastic ones have a thermodynamic floor, and it is
 * derivable.**
 *
 * A self-replicating base of mass `M` with specific power `p` generates `M·p`
 * watts. Building another `M` kilograms at embodied energy `e` needs `M·e`
 * joules. So the doubling time is
 *
 *     t_double = e / p          — **independent of scale**
 *
 * With M11's 100 MJ/kg embodied and a collector's own 150 W/kg, that is
 * **7.7 days**. Not years. Days.
 *
 *     physical floor, e/p                    7.7 days     ×1
 *     M11's own industrial model             264 days     ×34
 *     what λ = 0.62 implies                1,226 days     ×159
 *
 * **The entire gap between the forecast and physics is organisational.** λ is
 * 159 times slower than the energy budget allows. Thirty doublings from a 100 t
 * seed take 101 years at λ, 22 years on M11's model, and **0.64 years at the
 * floor**.
 *
 * That last figure is a *reductio*, exactly like M16's 101 MW: it shows the
 * bound is not a forecast. Nothing rebuilds a civilisation's industry in eight
 * months. What it does show is that **the schedule is not protected by physics.
 * It is protected by logistics, tooling, transport and materials — every one of
 * which is a thing intelligence attacks.**
 *
 * **[RESULT 3 — the one that matters] Intelligence moves the date, not the wall.**
 *
 * M19 put the first wall at K = 0.828, ×9.8 today's supply, **3.29 doublings**.
 * That number does not move, because σT⁴ does not negotiate. What moves is when
 * you arrive:
 *
 *     IEA inertia, 1.8%/yr                 ~128 years
 *     λ = 0.62                             ~11 years
 *     M11's industrial model               ~2.4 years
 *     the physical floor                   ~25 days
 *
 * So a fast takeoff does not deliver Type I. **It delivers the +0.1 K waste-heat
 * ceiling, quickly** — and everything M6–M22 says about orbit, lunar sourcing
 * and radiators stops being a twenty-second-century problem and becomes a
 * this-decade one.
 *
 * The honest one-line answer to "what does AGI do to the Kardashev timeline":
 * **it does not raise the ceiling, it shortens the runway to it.**
 *
 * [KNOWN_LIMIT] `e/p` is a bound and nothing more. It assumes energy is the
 * binding input, with zero idle time, zero transport, zero setup, zero tooling
 * and perfect allocation. Real industry is bound by material availability,
 * transport time and — per M11 — by carbon that regolith does not have. Nothing
 * here models the latency from cognition to design to hardware, which is the
 * actual mechanism being asked about and which this module cannot derive. No
 * takeoff dynamics, no date for AGI, no claim that any of this happens.
 */

import { GROWTH, P_2023, kOf } from "./kardashev.ts";
import { LAMBDA } from "./forecast.ts";
import { EMBODIED_J_PER_KG, doublingTimeImpliedBy, doublingsRequired, typeISystemMassKg } from "./isru.ts";
import { SECONDS_PER_YEAR } from "./constants.ts";
import { firstWall } from "./sequence.ts";

/** Collector specific power: M8's own 337 W/m² over 2.24 kg/m². */
export const COLLECTOR_SPECIFIC_POWER_W_KG = 337 / 2.24;

/** [ASSUMED] Self-allocation fraction, from M11's optimum. */
export const SELF_ALLOCATION = 0.96;

/** [ASSUMED] M11's industrial productivity, kg of output per kg of capital per year. */
export const PRODUCTIVITY_PER_YEAR = 1;

export type Elasticity = "inelastic" | "elastic";

export type Parameter = {
  id: string;
  label: string;
  module: string;
  elasticity: Elasticity;
  why: string;
};

/**
 * [RESULT] The classification the whole question turns on.
 *
 * A wall made of thermodynamics or geometry does not care how clever the thing
 * looking at it is. A wall made of design, materials or organisation does.
 */
export const PARAMETERS: Parameter[] = [
  {
    id: "crust-ceiling",
    label: "Waste-heat ceiling on the crust, 192 TW",
    module: "thermal.ts",
    elasticity: "inelastic",
    why: "σT⁴. The planet radiates what it radiates, and a fractional power rise is a quarter of it in temperature.",
  },
  {
    id: "land-area",
    label: "Earth's land area for ground solar",
    module: "thermal.ts",
    elasticity: "inelastic",
    why: "Geometry. No design makes the planet bigger.",
  },
  {
    id: "chemical-isp",
    label: "Chemical specific impulse ceiling, ~450 s",
    module: "engine.ts",
    elasticity: "inelastic",
    why: "c* goes as √(T_c/M) and both are set by which atoms are burning. The periodic table is not a design choice.",
  },
  {
    id: "propellant-density",
    label: "Bulk propellant density",
    module: "density.ts",
    elasticity: "inelastic",
    why: "Hydrogen is 71 kg/m³ because of what hydrogen is. Tanks and pumps follow from that.",
  },
  {
    id: "delta-v",
    label: "Δv budgets and Tsiolkovsky",
    module: "transfer.ts",
    elasticity: "inelastic",
    why: "Orbital mechanics. Cleverness changes the trajectory chosen, never the energy the orbit costs.",
  },
  {
    id: "landauer",
    label: "The Landauer floor on computation",
    module: "reject.ts",
    elasticity: "inelastic",
    why: "kT·ln2. The floor itself is fixed even though the distance to it is not.",
  },
  {
    id: "light-speed",
    label: "Control-loop latency across a distributed system",
    module: "operator.ts",
    elasticity: "inelastic",
    why: "c. A loop cannot settle faster than its own round trip, however good the controller is.",
  },
  {
    id: "doubling-time",
    label: "Industrial doubling time",
    module: "isru.ts",
    elasticity: "elastic",
    why: "The most leveraged elastic parameter in the repo, and 159× above its own thermodynamic floor.",
  },
  {
    id: "areal-density",
    label: "Collector areal density",
    module: "lift.ts",
    elasticity: "elastic",
    why: "Materials science. The 4.4 g/m² requirement is a materials problem, which is a thing intelligence attacks.",
  },
  {
    id: "structural-coefficient",
    label: "Stage structural coefficient ε",
    module: "staging.ts",
    elasticity: "elastic",
    why: "Design and manufacturing. It moves payload fraction by ×4 across its plausible range.",
  },
  {
    id: "array-lifetime",
    label: "Array lifetime L",
    module: "environment.ts",
    elasticity: "elastic",
    why: "Materials again, and A_max = R·L is linear in it.",
  },
  {
    id: "build-rate",
    label: "Build rate R",
    module: "collector.ts",
    elasticity: "elastic",
    why: "Pure logistics and organisation. Nothing physical caps it below the doubling floor.",
  },
  {
    id: "compute-efficiency",
    label: "Compute efficiency",
    module: "substitution.ts",
    elasticity: "elastic",
    why: "Three to eight orders of runway, and spending it removes the need for the watts rather than supplying them.",
  },
];

export const inelastic = () => PARAMETERS.filter((p) => p.elasticity === "inelastic");
export const elastic = () => PARAMETERS.filter((p) => p.elasticity === "elastic");

// ─────────────────────────────────────────── the floor on the elastic ones

/**
 * [RESULT] Doubling time floor, seconds: `t = e / p`.
 *
 * A base of mass M at specific power p makes M·p watts; another M kilograms
 * costs M·e joules; the M cancels. **Scale-independent**, which is what makes it
 * a floor rather than a scenario.
 */
export function doublingFloorSeconds(
  embodiedJPerKg: number = EMBODIED_J_PER_KG,
  specificPowerWKg: number = COLLECTOR_SPECIFIC_POWER_W_KG,
): number {
  return embodiedJPerKg / specificPowerWKg;
}

export type Regime = {
  id: string;
  label: string;
  doublingYears: number;
  /** Multiples of the physical floor. */
  versusFloor: number;
  /** Years for M11's thirty doublings from a 100 t seed. */
  yearsToTypeI: number;
  /** Years to M19's first wall, which is only 3.29 doublings away. */
  yearsToFirstWall: number;
};

/** Doublings from today's supply to a target power. */
export function doublingsTo(powerW: number): number {
  return Math.log2(powerW / P_2023);
}

export function regime(id: string, label: string, doublingYears: number): Regime {
  const floorYears = doublingFloorSeconds() / SECONDS_PER_YEAR;
  return {
    id,
    label,
    doublingYears,
    versusFloor: doublingYears / floorYears,
    yearsToTypeI: doublingsRequired(typeISystemMassKg()) * doublingYears,
    yearsToFirstWall: doublingsTo(firstWall().powerW) * doublingYears,
  };
}

/**
 * The three regimes, ordered from physics to forecast.
 *
 * The spread between them is 159×, and every bit of it is organisational.
 */
export function regimes(): Regime[] {
  const floorYears = doublingFloorSeconds() / SECONDS_PER_YEAR;
  return [
    regime("floor", "Physical floor, e/p", floorYears),
    regime("industrial", "M11's industrial model", Math.LN2 / (SELF_ALLOCATION * PRODUCTIVITY_PER_YEAR)),
    regime("lambda", `What λ = ${LAMBDA} implies`, doublingTimeImpliedBy(101)),
  ];
}

/** How far the forecast sits above what energy alone would allow. */
export function organisationalGap(): number {
  const rs = regimes();
  return rs.find((r) => r.id === "lambda")!.doublingYears / rs.find((r) => r.id === "floor")!.doublingYears;
}

// ─────────────────────────────────────────────────── what does not move

export type WallArrival = {
  regime: string;
  yearsToFirstWall: number;
  /** The wall's K, which is identical in every regime. */
  wallK: number;
  /** Doublings to the wall, also identical. */
  doublings: number;
};

/**
 * [RESULT] The answer, in one table.
 *
 * The wall's height is the same in every column. Only the date changes — from
 * ~128 years at IEA inertia to ~11 at λ, ~2.4 on M11's model and 25 days at the
 * floor.
 *
 * **Intelligence does not raise the ceiling. It shortens the runway to it.**
 */
export function wallArrivals(): WallArrival[] {
  const wall = firstWall();
  const doublings = doublingsTo(wall.powerW);
  const inertial: WallArrival = {
    regime: "IEA inertia, 1.8%/yr",
    yearsToFirstWall: Math.log(wall.powerW / P_2023) / Math.log(1 + GROWTH),
    wallK: wall.k,
    doublings,
  };
  return [
    inertial,
    ...regimes()
      .slice()
      .reverse()
      .map((r) => ({ regime: r.label, yearsToFirstWall: r.yearsToFirstWall, wallK: wall.k, doublings })),
  ];
}

/** Every regime must agree on the wall itself. That is the whole point. */
export function wallIsInvariant(): boolean {
  const ks = wallArrivals().map((w) => w.wallK);
  return ks.every((k) => Math.abs(k - kOf(firstWall().powerW)) < 1e-12);
}

export const ACCELERATION_VERDICT = {
  headline: "Intelligence does not raise the ceiling. It shortens the runway to it.",
  answer:
    "A fast takeoff does not deliver Type I. It delivers the +0.1 K waste-heat ceiling quickly, " +
    "and everything M6-M22 says about orbit stops being a 22nd-century problem.",
  /**
   * [KNOWN_LIMIT]
   *
   *  - `e/p` is a bound, not a forecast, and the 25-day figure is a reductio in
   *    exactly the way M16's 101 MW is. It assumes energy is the binding input,
   *    with no idle time, transport, setup, tooling or allocation loss.
   *  - Real industry is bound by material availability and transport time, and
   *    per M11 by carbon that regolith does not have. None of that is here.
   *  - Nothing models the latency from cognition to design to working hardware,
   *    which is the actual mechanism being asked about.
   *  - No takeoff dynamics, no date for AGI, and no claim that any of this
   *    happens. The module says what would follow *if* the elastic parameters
   *    moved, and which ones cannot.
   */
  limits: "e/p is a bound not a forecast; no cognition-to-hardware latency; no takeoff model",
} as const;
