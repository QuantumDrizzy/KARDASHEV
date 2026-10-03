/**
 * LIFT — the mass budget to Type I. M7.
 *
 * M6 (`thermal.ts`) showed that waste heat forbids terrestrial Type I: under a
 * +0.1 K budget the crust carries 192 TW and Type I is 10,000 TW, so **98% of
 * it has to be off-planet**. That is not a preference, it is Stefan-Boltzmann.
 *
 * This module asks the obvious next question — what does lifting 98% of Type I
 * actually cost — and finds that the intuitive answer is wrong.
 *
 * ── Energy is not the constraint ─────────────────────────────────────────────
 *
 * The thermodynamic floor to circular LEO is **33.8 MJ/kg** (μ(1/R − 1/2a) at
 * 550 km; Earth's rotation gives back 0.11 MJ/kg and is noise). A Starship-class
 * vehicle burns ~4.6 kt of CH₄/LOX for 100 t, which at an O/F of 3.6 is
 * **500 MJ/kg** — about **15× the floor**. That sounds bad until you ask what
 * the payload does once it arrives:
 *
 *     a 1.2 kg/m² collector repays its entire launch energy in **21 days**.
 *
 * At 337 W/m² of AM0 the thing is an energy fountain. Rocket inefficiency,
 * which dominates every conversation about spaceflight, is irrelevant here.
 *
 * ── Logistics is the constraint, by five orders of magnitude ─────────────────
 *
 * Type I needs **29.7 million km²** of collector — the area of Africa. At
 * today's 1.2 kg/m² flexible arrays that is **35.7 gigatonnes**, or
 * **357 million** 100-tonne flights.
 *
 *     at   3 flights/day   325,000 years
 *     at 100 flights/day     9,800 years
 *     at 1000 flights/day      980 years
 *
 * Jonathan McDowell counts 258 launches that reached orbit or marginal orbit
 * in 2024, and 263 attempts. That is 0.71 per day. One hundred flights a day
 * is still ×141.6 that rate. The gap is not a factor, it is a category.
 *
 * ── The number that turns this into an engineering target ────────────────────
 *
 * Invert it. To finish in a century — the λ=0.62 timeline in `forecast.ts` — at
 * a cadence of 100 flights/day, the collector must weigh **12.3 g/m²**.
 * Today's best flexible arrays are 1,200 g/m². **A factor of 98.**
 *
 * So Type I by Earth launch requires a hundredfold reduction in areal density,
 * held for a century at a cadence about a hundred and forty times today's global
 * total. Either that, or the mass does not come from Earth: lunar escape costs
 * **2.8 MJ/kg against Earth's 33.8**, twelve times less, with no atmosphere and
 * no weather. In-situ material is not enthusiasm, it is what the arithmetic
 * leaves standing.
 *
 * [KNOWN_LIMIT] Collector mass only. No structure, station-keeping, power
 * electronics, thermal, comms or end-of-life. A real system is heavier than its
 * film, so every number here is a floor. Launch energy is propellant chemical
 * energy, not production energy. `orbit.ts::typeISwarm` owns area/mass/flights;
 * this module adds the energy and the inverse problem rather than restating them.
 */

import { P_I } from "./kardashev.ts";
import { AM0, BUS_EFF, DEFAULT_BENCH } from "./physics.ts";
import { MU_EARTH, PANEL_W_M2, R_EARTH_M, STARSHIP_PAYLOAD_KG, typeISwarm } from "./orbit.ts";
import { MU_MOON as MU_MOON_SI, R_MOON_M as R_MOON_SI } from "./constants.ts";

// ────────────────────────────────────────────────────────── energy to orbit

/** Lunar gravitational parameter and mean radius, for the ISRU comparison. */
export const MU_MOON = MU_MOON_SI;
export const R_MOON_M = R_MOON_SI;

/** Equatorial surface speed. Free Δv, and small enough to be noise. */
export const EARTH_ROTATION_MS = 465;

/**
 * Thermodynamic floor: specific energy to go from a body's surface, at rest,
 * to a circular orbit of altitude h. ε = μ(1/R − 1/2a). No rocket, no losses,
 * no engineering — this is what physics charges.
 */
export function orbitalEnergyPerKg(altitudeKm: number, mu = MU_EARTH, radiusM = R_EARTH_M) {
  const a = radiusM + altitudeKm * 1000;
  return mu * (1 / radiusM - 1 / (2 * a));
}

/** Escape energy from a surface. μ/R. Used for the lunar comparison. */
export function escapeEnergyPerKg(mu: number, radiusM: number) {
  return mu / radiusM;
}

export type Vehicle = {
  name: string;
  payloadKg: number;
  propellantKg: number;
  /** Fuel lower heating value, J/kg. */
  fuelJPerKg: number;
  /** Oxidiser-to-fuel mass ratio. */
  oxidiserRatio: number;
};

/** Starship class. Public order-of-magnitude figures. [ASSUMPTION] */
export const STARSHIP: Vehicle = {
  name: "Starship class",
  payloadKg: STARSHIP_PAYLOAD_KG,
  propellantKg: 4.6e6,
  fuelJPerKg: 50e6,
  oxidiserRatio: 3.6,
};

/** Chemical energy in the propellant, per kg of payload delivered. */
export function launchEnergyPerKg(v: Vehicle = STARSHIP) {
  const perKgPropellant = v.fuelJPerKg / (1 + v.oxidiserRatio);
  return (v.propellantKg * perKgPropellant) / v.payloadKg;
}

/** How far a real vehicle sits above the floor. ~15x for a good one. */
export function rocketOverhead(v: Vehicle = STARSHIP, altitudeKm = 550) {
  return launchEnergyPerKg(v) / orbitalEnergyPerKg(altitudeKm);
}

// ───────────────────────────────────────────────────────── the payback

/** Delivered electrical flux of an AM0 collector. Same chain as orbit.ts. */
export const COLLECTOR_W_M2 = AM0 * DEFAULT_BENCH.panelEff * DEFAULT_BENCH.dutyCycle * BUS_EFF;

export type Payback = {
  arealKgM2: number;
  launchJPerM2: number;
  wattsPerM2: number;
  seconds: number;
  days: number;
  /** Energy returned over a lifetime, per unit invested in launching it. */
  eroei: number;
};

export function energyPayback(
  arealKgM2 = 1.2,
  o: { vehicle?: Vehicle; lifetimeYr?: number } = {},
): Payback {
  const lifetimeYr = o.lifetimeYr ?? DEFAULT_BENCH.lifetimeYr;
  const launchJPerM2 = arealKgM2 * launchEnergyPerKg(o.vehicle ?? STARSHIP);
  const seconds = launchJPerM2 / COLLECTOR_W_M2;
  return {
    arealKgM2,
    launchJPerM2,
    wattsPerM2: COLLECTOR_W_M2,
    seconds,
    days: seconds / 86400,
    eroei: (lifetimeYr * 365.25 * 86400) / seconds,
  };
}

// ────────────────────────────────────────────── the logistics, and its inverse

export type BuildPlan = {
  arealKgM2: number;
  payloadKg: number;
  cadencePerDay: number;
  areaM2: number;
  massKg: number;
  flights: number;
  years: number;
  /** Cadence as a multiple of the whole world's 2024 orbital launch rate. */
  versusWorldCadence: number;
};

/**
 * Launches in calendar 2024. Opened: Jonathan McDowell, Space Activities
 * in 2024, Rev 1.4, 2025 Jan 24.
 * https://planet4589.org/space/papers/space24.pdf
 *
 * Printed: "During 2024 there were 263 orbital launch attempts from Earth,
 * with 258 reaching orbit or marginal orbit."
 * Table 1(a) total, 2024 = 263 attempts.
 * Table 1(b) total, 2024 = 258 reaching orbit or marginal orbit.
 * The 258 includes four near-orbital Starship flights (2024-U01, U03, U04,
 * U06) and excludes the North Korean suborbital 2024-U05 and the
 * lunar-surface launch 2024-U02.
 *
 * The count below is the 258. The old ~250 was not a count.
 */
export const LAUNCHES_2024 = {
  attempts: 263,
  reachedOrbitOrMarginal: 258,
  unit: "launches",
  printed:
    "During 2024 there were 263 orbital launch attempts from Earth, with 258 reaching orbit or marginal orbit.",
  source: "Jonathan McDowell, Space Activities in 2024, Rev 1.4, 2025 Jan 24",
  url: "https://planet4589.org/space/papers/space24.pdf",
} as const;

/** Reached orbit or marginal orbit in 2024. Not the 263 attempts. */
export const WORLD_LAUNCHES_2024 = LAUNCHES_2024.reachedOrbitOrMarginal;
export const WORLD_CADENCE_PER_DAY = WORLD_LAUNCHES_2024 / 365.25;

export function buildPlan(
  arealKgM2 = 1.2,
  cadencePerDay = 3,
  payloadKg = STARSHIP_PAYLOAD_KG,
): BuildPlan {
  const s = typeISwarm(arealKgM2, payloadKg, cadencePerDay);
  return {
    arealKgM2,
    payloadKg,
    cadencePerDay,
    areaM2: s.areaM2,
    massKg: s.massKg,
    flights: s.flights,
    years: s.years,
    versusWorldCadence: cadencePerDay / WORLD_CADENCE_PER_DAY,
  };
}

/**
 * The engineering target. Given a deadline and a cadence you believe in, what
 * must the collector weigh per square metre?
 *
 * [RESULT] A century at 100 flights/day demands 12.3 g/m². Today's flexible
 * arrays are 1,200 g/m². The gap is ×98, and it is the whole problem.
 */
export function requiredArealKgM2(
  targetYears: number,
  cadencePerDay: number,
  payloadKg = STARSHIP_PAYLOAD_KG,
) {
  const areaM2 = P_I / PANEL_W_M2;
  const flights = cadencePerDay * 365.25 * targetYears;
  return (flights * payloadKg) / areaM2;
}

/** Today's best flexible space arrays, kg/m². The number to beat. */
export const FLEXIBLE_ARRAY_KG_M2 = 1.2;

export function arealGapX(targetYears: number, cadencePerDay: number) {
  return FLEXIBLE_ARRAY_KG_M2 / requiredArealKgM2(targetYears, cadencePerDay);
}

// ─────────────────────────────────────────────────────────────── the verdict

export type LiftVerdict = {
  /** Days for a collector to repay the energy spent launching it. */
  paybackDays: number;
  /** Years to build Type I at today's array mass and an optimistic cadence. */
  yearsAtTodaysMass: number;
  /** Areal density a 100-year build needs at 100 flights/day. */
  requiredGM2: number;
  /** How much heavier today's arrays are than that. */
  gapX: number;
  /** Lunar escape energy as a fraction of Earth's orbital-insertion floor. */
  lunarAdvantageX: number;
  bindingConstraint: "energy" | "logistics";
};

export function liftVerdict(): LiftVerdict {
  const payback = energyPayback(FLEXIBLE_ARRAY_KG_M2);
  const plan = buildPlan(FLEXIBLE_ARRAY_KG_M2, 100);
  return {
    paybackDays: payback.days,
    yearsAtTodaysMass: plan.years,
    requiredGM2: requiredArealKgM2(100, 100) * 1000,
    gapX: arealGapX(100, 100),
    lunarAdvantageX:
      orbitalEnergyPerKg(550) / escapeEnergyPerKg(MU_MOON, R_MOON_M),
    // Payback in weeks, build in millennia. It was never about the joules.
    bindingConstraint: "logistics",
  };
}

export const WHY_NOT_ENERGY = {
  paybackIsWeeks: true,
  rocketInefficiencyIrrelevant: true,
  note:
    "A collector repays its launch energy in about three weeks, so the 15x " +
    "overhead of chemical rockets — the thing every spaceflight argument is " +
    "about — does not bind. What binds is areal density and flight rate: a " +
    "hundredfold lighter film held for a century at a cadence 150x the world's " +
    "current total, or material that does not come up Earth's gravity well.",
} as const;
