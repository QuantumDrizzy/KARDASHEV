/**
 * ISRU — costing the route the rest of the chain kept pointing at. M11.
 *
 * M7 and M8 both terminated at "material that never came up Earth's gravity
 * well", by two independent roads. Neither of them costed it. It has been an
 * assertion for four modules, and this closes it.
 *
 * It closes — but not for the reason M7 gave, and the binding constraint turns
 * out to be neither energy nor logistics.
 *
 * ── [CORRECTION] M7 understated the lunar advantage by an order of magnitude ─
 *
 * M7 compared lunar escape (2.82 MJ/kg) against Earth's orbital-insertion floor
 * (33.8 MJ/kg) and said ×12. That is floor against floor, which flatters Earth.
 * The honest comparison is real against real: Earth launch is chemical and runs
 * **15× above its floor at 500 MJ/kg**, while a lunar mass driver is
 * electromagnetic and runs close to its own — **4.71 MJ/kg** at 60% efficiency.
 *
 *     ×106, not ×12.
 *
 * ── And transport is not the point anyway ────────────────────────────────────
 *
 * At ~100 MJ/kg of embodied processing energy, getting the material off the Moon
 * is **4.5%** of what it costs to make the thing. The gravity well was never the
 * expensive part of lunar sourcing; not launching at all is.
 *
 * ── The power bill closes comfortably ────────────────────────────────────────
 *
 *     build over a century      1.15 Gt/yr   →  3.8 TW of lunar industry
 *     maintain at 5-year life  23.0 Gt/yr    →   76 TW
 *
 * Absolutely enormous — 76 TW is four times today's world total energy supply,
 * on the Moon. Relatively trivial: **0.76% of Type I**. The overhead is not what
 * stops this.
 *
 * ── What does stop it, first: the array must be essentially all lunar ────────
 *
 * Regolith gives silicon, aluminium, iron, titanium and oxygen. It does **not**
 * give carbon, hydrogen or nitrogen in useful quantity — so polymers, volatiles
 * and some dopants would still be launched from Earth. That fraction has a
 * ceiling, and the ceiling is brutal: at 100 Earth flights/day, already 146× the
 * entire world's 2024 launch rate, Earth can supply **0.016%** of the
 * replacement flow.
 *
 *     **The array must be ≥ 99.98% lunar-sourced by mass.**
 *
 * No polymer substrate. No imported dopants at scale. No carbon. That is a
 * materials-science constraint, and it is far harder than any of the
 * thermodynamics in M6–M10.
 *
 * ── And second: the whole timeline is a doubling count ───────────────────────
 *
 * A self-replicating base with productivity p and self-allocation f grows as
 * `M(t) = M₀·e^(f·p·t)` and yields `C(t) = ((1−f)/f)·M₀·(e^(f·p·t) − 1)`.
 * Optimising the allocation gives **f ≈ 0.96** — put almost everything back into
 * the factory, because the build is essentially the last doubling — and the
 * answer is flat from f = 0.9 to 0.999. Every constant washes out and what
 * remains is:
 *
 *     **30 doublings from a 100 t seed.**
 *
 *     doubling every  1 yr →  30 years to Type I
 *     doubling every  2 yr →  60 years
 *     doubling every  5 yr → 151 years
 *     doubling every 10 yr → 301 years
 *
 * ── Which makes λ falsifiable ────────────────────────────────────────────────
 *
 * `forecast.ts` carries λ = 0.62 as a labelled hypothesis giving ~101 years to
 * Type I. Divide by 30 doublings and λ = 0.62 **is a claim that off-planet
 * industry doubles every 3.4 years.**
 *
 * That is the most useful thing in this module. λ was a curve fit nobody could
 * argue with. A 3.4-year doubling time for a self-replicating lunar industrial
 * base is an engineering parameter people can and should argue about.
 *
 * [KNOWN_LIMIT] Productivity p is the least certain number here and the answer
 * scales inversely with it. No regolith chemistry, no beneficiation, no plant
 * mass estimate, no lunar night, no dust, no radiation hardening of the factory
 * itself. Embodied energy at 100 MJ/kg is a terrestrial-analogue figure; vacuum
 * solar-thermal routes could differ substantially in either direction. Nothing
 * here models whether a ≥99.98%-regolith photovoltaic is possible at all — it
 * states the requirement and stops.
 */

import { escapeEnergyPerKg, launchEnergyPerKg, MU_MOON, R_MOON_M, WORLD_CADENCE_PER_DAY } from "./lift.ts";
import { P_I } from "./kardashev.ts";
import { systemMass } from "./reject.ts";
import { SECONDS_PER_YEAR } from "./constants.ts";

/** Electromagnetic launch efficiency, wall plug to kinetic. [ASSUMPTION] */
export const MASS_DRIVER_EFFICIENCY = 0.6;

/**
 * Embodied energy to turn regolith into deployable array, J/kg.
 * [ASSUMPTION] The least certain number in the module. Terrestrial analogue;
 * vacuum solar-thermal routes could differ substantially either way.
 */
export const EMBODIED_J_PER_KG = 100e6;

/** Tonnes of output per tonne of installed industry per year. [ASSUMPTION] */
export const PRODUCTIVITY_PER_YEAR = 1;

/** Elements regolith supplies, and the ones it does not. */
export const REGOLITH = {
  supplies: ["silicon", "aluminium", "iron", "titanium", "oxygen"],
  lacks: ["carbon", "hydrogen", "nitrogen"],
  note: "Polymers, volatiles and some dopants have no lunar source at scale.",
} as const;

/** Energy to put a kilogram on an escape trajectory with a mass driver. */
export function lunarLaunchJPerKg(efficiency = MASS_DRIVER_EFFICIENCY) {
  return escapeEnergyPerKg(MU_MOON, R_MOON_M) / efficiency;
}

/**
 * How much cheaper lunar sourcing is, comparing what each actually costs rather
 * than what each could cost in principle. [CORRECTION] M7 said ×12 by comparing
 * floors; real-against-real is ×106.
 */
export function lunarAdvantageX(efficiency = MASS_DRIVER_EFFICIENCY) {
  return launchEnergyPerKg() / lunarLaunchJPerKg(efficiency);
}

/** Total energy per kilogram of delivered array: make it, then move it. */
export function totalJPerKg(o: { embodiedJPerKg?: number; efficiency?: number } = {}) {
  return (o.embodiedJPerKg ?? EMBODIED_J_PER_KG) + lunarLaunchJPerKg(o.efficiency);
}

/** Transport as a share of the whole. [RESULT] It is a rounding error. */
export function transportShare(o: { embodiedJPerKg?: number; efficiency?: number } = {}) {
  return lunarLaunchJPerKg(o.efficiency) / totalJPerKg(o);
}

// ───────────────────────────────────────────────── the industrial power bill

export type LunarIndustry = {
  label: string;
  massPerYearKg: number;
  powerW: number;
  /** As a fraction of the Type I it is building. */
  fracOfTypeI: number;
  /** Installed industrial mass, at the stated productivity. */
  industryMassKg: number;
};

/** Full system mass from M10 — collector plus radiator, not collector alone. */
export function typeISystemMassKg(junctionK = 350) {
  return systemMass({ junctionK }).totalKg;
}

export function industryFor(
  label: string,
  massPerYearKg: number,
  o: { embodiedJPerKg?: number; efficiency?: number; productivity?: number } = {},
): LunarIndustry {
  const powerW = (massPerYearKg * totalJPerKg(o)) / SECONDS_PER_YEAR;
  return {
    label,
    massPerYearKg,
    powerW,
    fracOfTypeI: powerW / P_I,
    industryMassKg: massPerYearKg / (o.productivity ?? PRODUCTIVITY_PER_YEAR),
  };
}

export function industryLadder(o: { buildYears?: number; lifetimeYr?: number } = {}) {
  const total = typeISystemMassKg();
  const buildYears = o.buildYears ?? 100;
  const lifetimeYr = o.lifetimeYr ?? 5;
  return [
    industryFor(`build over ${buildYears} yr`, total / buildYears),
    industryFor(`maintain at ${lifetimeYr} yr life`, total / lifetimeYr),
    industryFor("maintain at 30 yr life", total / 30),
  ];
}

// ────────────────────────────────────── the ceiling on Earth-sourced material

export type EarthShareCeiling = {
  earthCadencePerDay: number;
  earthKgPerYear: number;
  requiredKgPerYear: number;
  maxEarthFraction: number;
  minLunarFraction: number;
  /** Earth cadence as a multiple of the whole world's 2024 launch rate. */
  versusWorldCadence: number;
};

/**
 * [RESULT] The hardest constraint in the chain, and it is not thermodynamic.
 * Regolith cannot supply carbon, hydrogen or nitrogen, so anything needing them
 * comes from Earth — and Earth's share is capped by launch cadence.
 */
export function earthShareCeiling(
  earthCadencePerDay = 100,
  o: { lifetimeYr?: number; payloadKg?: number } = {},
): EarthShareCeiling {
  const payloadKg = o.payloadKg ?? 100_000;
  const requiredKgPerYear = typeISystemMassKg() / (o.lifetimeYr ?? 5);
  const earthKgPerYear = earthCadencePerDay * 365.25 * payloadKg;
  const maxEarthFraction = earthKgPerYear / requiredKgPerYear;
  return {
    earthCadencePerDay,
    earthKgPerYear,
    requiredKgPerYear,
    maxEarthFraction,
    minLunarFraction: 1 - maxEarthFraction,
    versusWorldCadence: earthCadencePerDay / WORLD_CADENCE_PER_DAY,
  };
}

// ──────────────────────────────────────────────── the self-replication clock

/**
 * Time for a seed of mass M₀ to deliver a target mass, allocating a fraction f
 * of output back into itself.
 *
 *     M(t) = M₀·e^(f·p·t),  C(t) = ((1−f)/f)·M₀·(e^(f·p·t) − 1)
 */
export function yearsToTarget(
  targetKg: number,
  o: { seedKg?: number; allocation?: number; productivity?: number } = {},
) {
  const seedKg = o.seedKg ?? 100_000;
  const f = o.allocation ?? 0.96;
  const p = o.productivity ?? PRODUCTIVITY_PER_YEAR;
  if (f <= 0 || f >= 1 || p <= 0) return Infinity;
  return Math.log(1 + (targetKg * f) / ((1 - f) * seedKg)) / (f * p);
}

/**
 * The allocation that minimises time to target.
 * [RESULT] ~0.96, and flat from 0.9 to 0.999 — the build is the last doubling,
 * so every constant washes out and only the doubling count survives.
 */
export function optimalAllocation(
  targetKg: number,
  o: { seedKg?: number; productivity?: number } = {},
) {
  let best = { allocation: 0.5, years: Infinity };
  for (let f = 0.01; f < 1; f += 0.001) {
    const years = yearsToTarget(targetKg, { ...o, allocation: f });
    if (years < best.years) best = { allocation: f, years };
  }
  return best;
}

/** Doublings from seed to target. The number the whole timeline reduces to. */
export function doublingsRequired(targetKg: number, seedKg = 100_000) {
  return Math.log2(targetKg / seedKg);
}

/** Years to Type I as a function of the industrial doubling time. */
export function yearsFromDoublingTime(doublingYears: number, seedKg = 100_000) {
  return doublingsRequired(typeISystemMassKg(), seedKg) * doublingYears;
}

/**
 * [RESULT] The inverse, and the most useful thing here. `forecast.ts` carries
 * λ = 0.62 as an unfalsifiable curve fit. Divided by the doubling count it
 * becomes a concrete engineering parameter: an industrial doubling time.
 */
export function doublingTimeImpliedBy(yearsToTypeI: number, seedKg = 100_000) {
  return yearsToTypeI / doublingsRequired(typeISystemMassKg(), seedKg);
}

export const ISRU_VERDICT = {
  /** Energy closes. Transport is 4.5% of it. */
  energyCloses: true,
  /** The power overhead is under 1% of the Type I it builds. */
  overheadUnderOnePercent: true,
  /** What actually binds, in order. */
  bindingConstraints: [
    "the array must be >=99.98% lunar-sourced by mass — regolith has no carbon",
    "the industrial doubling time, which the whole timeline reduces to",
  ],
  note:
    "Every physical constraint in M6-M10 turns out to be surmountable. What is " +
    "left is a materials question and a growth rate. That is a different kind " +
    "of hard, and it is the honest place for this chain to end.",
} as const;
