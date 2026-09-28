/**
 * M20 — ENGINE. The number M14 assumed, derived.
 *
 * M14 established that delivery is exponential in Δv and that raising the
 * destination to GEO costs ×2.77 in delivered mass. Every one of those results
 * turns on a single line: `ISP_VACUUM_S = 380`, marked `[ASSUMED]` and never
 * derived. The repo has argued about orbits, radiators and lunar industry for
 * fourteen modules without once modelling the thing that does the pushing.
 *
 * **The decomposition that makes this checkable.** Specific impulse factors into
 * a combustion term and a nozzle term, and only the first is a property of the
 * propellant:
 *
 *     Isp · g₀  =  c*  ·  C_f
 *
 * `c*` is characteristic velocity — what the chamber can do, independent of the
 * bell bolted to it. `C_f` is thrust coefficient — what the nozzle recovers.
 * Validating them separately is the whole discipline here, because c* has a
 * tight published value per propellant pair while C_f depends on an area ratio
 * that differs between every engine ever flown.
 *
 * **[VALIDATION] c* lands within 3% for all three pairs.**
 *
 *     LOX/LH2    2,299 m/s  vs  2,360 published   −2.6%
 *     LOX/CH4    1,829 m/s  vs  1,830 published   −0.06%
 *     LOX/RP-1   1,798 m/s  vs  1,820 published   −1.2%
 *
 * And with each engine's own area ratio the vacuum Isp lands within a few
 * percent of RS-25 (+0.5%) and Raptor (−2.2%); Merlin Vacuum runs +9.8% hot,
 * and since its c* is inside 1.2%, the excess sits in C_f — in γ.
 *
 * **[CORRECTED by Unibit-Web ADR-0003]** This module used to carry its own
 * propellant table and its own copy of the ideal-rocket equations, beside the
 * IGNIOS crates: two engines for one ecosystem. The two agreed within 0.8%. The
 * physics and the table now come from the IGNIOS core (`ignis-core.ts`, the same
 * wasm the IGNIOS site runs). The c* anchors above moved into the IGNIOS harness
 * and are in the Unibit chain as `ignios/nozzle/lox_*_cstar_published/...`. The
 * old figures were 2,296 / 1,833 / 1,804 m/s (−2.7 / +0.2 / −0.9%).
 *
 * **[RESULT] The lever is molar mass, not temperature.** Since `c* ∝ √(T_c/M)`,
 * and hydrogen burns *cooler* than kerosene, the reason LOX/LH2 wins is entirely
 * that its exhaust is light — 13.5 g/mol fuel-rich against 23. Chasing chamber
 * temperature is chasing a square root of the wrong variable, and it is why
 * every serious high-Isp chemical engine runs fuel-rich even though that wastes
 * fuel.
 *
 * **[RESULT — what this says for the chain] Chemistry cannot do Type I's
 * logistics, and that is a ceiling, not an engineering gap.**
 *
 * M14's Earth→GEO Δv of 12,724 m/s at 380 s needs a mass ratio of 30.4. To bring
 * that to a sane single-stage 3 you need **1,181 s** — against a chemical
 * ceiling near 450. That is **×2.6 beyond any chemistry**, and it is the same
 * wall M14's ×505 areal gap was casting a shadow of without naming it.
 *
 *     mass ratio 30.4  →   380 s   chemical, and what M14 assumed
 *     mass ratio 10    →   563 s   past chemistry
 *     mass ratio 3     → 1,181 s   nuclear thermal territory and beyond
 *
 * **[CORRECTED by M21] Do not read that as "the route is closed".** This is a
 * *single-stage* mass ratio, and a single stage is not how anyone launches. M21
 * shows staging multiplies ratios and reaches GEO fine — at one to two percent
 * of gross mass. The claim that survives is narrower and still useful:
 * **single-stage-to-GEO on chemistry is impossible**, and the route is expensive
 * rather than closed. The reason M11's conclusion holds is that 98% of what you
 * launch is the launcher, not that chemistry forbids the trip.
 *
 * [KNOWN_LIMIT] Ideal one-dimensional flow: frozen composition, no recombination
 * in the nozzle, no boundary layer, no divergence loss, no film cooling, no
 * combustion inefficiency. Real engines recover some of this and lose more of
 * it; the two roughly cancel at the few-percent level, which is why the
 * validation works and also why it must not be pushed further than a few
 * percent. Chamber temperature, molar mass and γ are `[ASSUMED]` per pair at
 * their fuel-rich optima and are the softest inputs here.
 */

import { G0 } from "./constants.ts";
import * as Ignis from "./ignis-core.ts";

/**
 * Universal gas constant, J/(kmol·K), so molar mass can stay in g/mol. From the
 * IGNIOS core (CODATA), not typed here.
 */
export const R_UNIVERSAL = Ignis.R_UNIVERSAL_J_MOL_K * 1000;

export type Propellant = {
  id: string;
  label: string;
  /** [RECITED] Chamber temperature, K. IGNIOS R1 table. */
  chamberK: number;
  /** [RECITED] Exhaust molar mass, g/mol. The lever. IGNIOS R1 table. */
  molarMass: number;
  /** [RECITED] Ratio of specific heats of the exhaust. IGNIOS R1 table. */
  gamma: number;
  /** [PUBLISHED] Characteristic velocity, m/s. The validation anchor. */
  publishedCStar: number;
  /** A flown engine using this pair, with its own nozzle. */
  engine: string;
  /** [PUBLISHED] That engine's nozzle area ratio and vacuum Isp, s. */
  areaRatio: number;
  publishedIspVac: number;
};

/** The chamber conditions of a pair, from the IGNIOS core's R1 table. */
function chamber(id: Ignis.IgnisPropellantId) {
  const p = Ignis.products(id);
  return { chamberK: p.chamberK, molarMass: p.molarMassKgMol * 1000, gamma: p.gamma };
}

/**
 * [PUBLISHED] Anchors. c* is the tight one; Isp depends on the area ratio, which
 * is why each engine's own ratio is carried rather than a single default. The
 * chamber conditions are the IGNIOS core's, never typed here (ADR-0003).
 */
export const PROPELLANTS: Propellant[] = [
  {
    id: "lox-lh2",
    label: "LOX / LH2",
    ...chamber("lox-lh2"),
    publishedCStar: 2360,
    engine: "RS-25",
    areaRatio: 69,
    publishedIspVac: 452.3,
  },
  {
    id: "lox-ch4",
    label: "LOX / CH4",
    ...chamber("lox-ch4"),
    publishedCStar: 1830,
    engine: "Raptor Vacuum",
    areaRatio: 80,
    publishedIspVac: 380,
  },
  {
    id: "lox-rp1",
    label: "LOX / RP-1",
    ...chamber("lox-rp1"),
    publishedCStar: 1820,
    engine: "Merlin 1D Vacuum",
    areaRatio: 165,
    publishedIspVac: 348,
  },
];

// ─────────────────────────────────────────────────────── ideal rocket flow
// Every function below is the IGNIOS core (crates/ignis-nozzle), through wasm.

/** Vandenkerckhove function Γ(γ). Appears in every choked-flow relation here. */
export function vandenkerckhove(gamma: number): number {
  return Ignis.vandenkerckhove(gamma);
}

/**
 * Characteristic velocity, m/s: `c* = √(R_u·T_c/M) / Γ(γ)`.
 *
 * A pure combustion property — no nozzle in it anywhere. This is the number that
 * validates to under 3% against all three published pairs, and the one to
 * distrust last. `molarMass` in g/mol, as everywhere in this module.
 */
export function characteristicVelocity(chamberK: number, molarMass: number, gamma: number): number {
  return Ignis.characteristicVelocity(chamberK, molarMass / 1000, gamma);
}

/** Exit-to-chamber pressure ratio for a given area ratio, supersonic branch. */
export function pressureRatioForAreaRatio(areaRatio: number, gamma: number): number {
  return Ignis.pressureRatioFromAreaRatio(areaRatio, gamma);
}

/**
 * Thrust coefficient. The nozzle's contribution, including the pressure term
 * that makes a vacuum bell useless at sea level and vice versa. C_f depends on
 * pa/pc only, so the core is called at a nominal 1 MPa chamber.
 */
export function thrustCoefficient(
  gamma: number,
  areaRatio: number,
  o: { ambientOverChamber?: number } = {},
): number {
  const pc = 1e6;
  return Ignis.thrustCoefficient(pc, (o.ambientOverChamber ?? 0) * pc, areaRatio, gamma);
}

/** `Isp = c*·C_f / g₀`. The decomposition, assembled. */
export function specificImpulse(p: Propellant, o: { areaRatio?: number; ambientOverChamber?: number } = {}): number {
  const ar = o.areaRatio ?? p.areaRatio;
  return (
    (characteristicVelocity(p.chamberK, p.molarMass, p.gamma) *
      thrustCoefficient(p.gamma, ar, { ambientOverChamber: o.ambientOverChamber })) /
    G0
  );
}

export type PropellantResult = {
  id: string;
  label: string;
  engine: string;
  cStar: number;
  cStarErrorFrac: number;
  cf: number;
  ispVacS: number;
  ispErrorFrac: number;
  /** T_c / M — the group c* actually depends on. */
  temperatureOverMolarMass: number;
};

export function evaluate(p: Propellant): PropellantResult {
  const cStar = characteristicVelocity(p.chamberK, p.molarMass, p.gamma);
  const cf = thrustCoefficient(p.gamma, p.areaRatio);
  const ispVacS = (cStar * cf) / G0;
  return {
    id: p.id,
    label: p.label,
    engine: p.engine,
    cStar,
    cStarErrorFrac: cStar / p.publishedCStar - 1,
    cf,
    ispVacS,
    ispErrorFrac: ispVacS / p.publishedIspVac - 1,
    temperatureOverMolarMass: p.chamberK / p.molarMass,
  };
}

export const results = () => PROPELLANTS.map(evaluate);

// ────────────────────────────────────────────── what it means for the chain

/** [ASSUMED] Practical ceiling for chemical vacuum Isp, s. LOX/LH2 class. */
export const CHEMICAL_CEILING_S = 450;

/** [PUBLISHED] Where the non-chemical options sit, for scale. */
export const BEYOND_CHEMICAL = {
  nuclearThermal: 900,
  ionElectric: 3000,
} as const;

/** Specific impulse that would deliver a given Δv at a given mass ratio. */
export function ispForMassRatio(deltaVMs: number, massRatio: number): number {
  return deltaVMs / (G0 * Math.log(massRatio));
}

export type ChainConsequence = {
  massRatio: number;
  requiredIspS: number;
  /** Multiples of the chemical ceiling. Above 1 means chemistry cannot do it. */
  versusChemicalCeiling: number;
  reachableChemically: boolean;
};

/**
 * [RESULT] What M14's Earth→GEO Δv demands, against what chemistry can give.
 *
 * A single stage at mass ratio 3 needs 1,181 s — **×2.6 the chemical ceiling**.
 * The Earth-launch route is closed by the periodic table, not by effort, and
 * that is a third independent road to M11's conclusion.
 */
export function chainConsequences(deltaVMs = 12_724, ratios = [30.4, 10, 5, 3, 2]): ChainConsequence[] {
  return ratios.map((massRatio) => {
    const requiredIspS = ispForMassRatio(deltaVMs, massRatio);
    return {
      massRatio,
      requiredIspS,
      versusChemicalCeiling: requiredIspS / CHEMICAL_CEILING_S,
      reachableChemically: requiredIspS <= CHEMICAL_CEILING_S,
    };
  });
}

export const ENGINE_VERDICT = {
  headline: "Isp factors into c* and C_f, c* goes as sqrt(Tc/M), and the lever is molar mass — not temperature.",
  forTheChain:
    "M14's Earth->GEO delta-v needs 1,181 s for a sane SINGLE STAGE against a chemical ceiling " +
    "near 450, so single-stage-to-GEO is impossible. [CORRECTED by M21] That is not the same as " +
    "the route being closed: staging reaches GEO at 1-2% of gross mass, and it is that 2% which " +
    "makes M7's areal density requirement what it is.",
  /**
   * [KNOWN_LIMIT]
   *
   *  - Ideal one-dimensional flow. Frozen composition, no nozzle recombination,
   *    no boundary layer, no divergence loss, no film cooling, no combustion
   *    inefficiency. Real engines recover some and lose more; they roughly
   *    cancel at the few-percent level, which is why this validates and also why
   *    it must not be trusted past a few percent.
   *  - `chamberK`, `molarMass` and `gamma` are assumed per pair at their
   *    fuel-rich optima. They are the softest inputs and c* goes as their square
   *    root, which is the only reason the errors stay small.
   *  - No throttling, no mixture-ratio sweep, no regenerative cooling limit, no
   *    chamber pressure limit — and chamber pressure is what actually decides
   *    whether an engine is buildable.
   *  - The chemical ceiling is a round number for the LOX/LH2 class, not a
   *    derived bound on all chemistry.
   */
  limits: "ideal 1-D flow, assumed chamber conditions, no chamber-pressure or cooling limits",
} as const;
