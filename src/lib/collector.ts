/**
 * COLLECTOR — the inverse problem M7 left open. M8.
 *
 * `lift.ts` costed the *film*: 1.2 kg/m², 12.3 g/m² required, ×98 too heavy. It
 * said plainly that every number there was a floor because a real system is
 * heavier than its blanket. This module closes that, and two things fall out
 * that the film-only view could not see.
 *
 * ── 1. M7 was optimistic by about a factor of two, and here is why ───────────
 *
 * "1.2 kg/m²" is a **blanket** figure. What flies is a **wing**: blanket plus
 * boom, tensioning, canister, harness and hinges. The honest anchor is the one
 * that is actually published and measured — **specific power at wing level**.
 * ROSA-class hardware sits near **150 W/kg** at beginning of life.
 *
 *     337 W/m² ÷ 150 W/kg = 2.24 kg/m² of wing
 *
 * So M7's 1.2 kg/m² implied 281 W/kg — better than anything flown. The film was
 * real; the structure holding it was missing. The areal gap is not ×98, it is
 * **×182**. [CORRECTED] against `lift.ts`, which now reads as the floor it said
 * it was.
 *
 * ── 2. Type I is not a construction project. It is a standing flow. ──────────
 *
 * Nothing in orbit lasts. At end of life the array is replaced, and at Type I
 * scale the replacement rate is an industry, not an event:
 *
 *     life  5 yr  →  2,001 flights/day, forever
 *     life 30 yr  →    334 flights/day, forever
 *
 * M7's headline was **100 flights/day for a century to build it**. Maintaining
 * it at a 5-year life costs **twenty times that, permanently**. Even a 30-year
 * array — far beyond anything demonstrated — needs three times the construction
 * cadence just to stand still.
 *
 * The design variable that matters is therefore **lifetime**, and it enters the
 * replacement flux exactly as areal density does: flux = area × σ / life. They
 * are symmetric. The asymmetry is elsewhere — σ has a hard physical floor (a
 * cell must be thick enough to absorb photons and carry current) while lifetime
 * is limited by radiation and micrometeoroids, which can be traded against
 * shielding mass. Which is itself σ. The two are coupled and neither is free.
 *
 * ── 3. A Type I collector is a 135-meganewton solar sail ─────────────────────
 *
 * Solar radiation pressure is AM0/c = 4.54 µN/m², doubled if reflective. Over
 * 29.7 million km² that is **135 MN of continuous force**. Countering it with
 * ion thrust at Isp 3000 s costs **145 Mt of propellant per year, forever** —
 * more mass per year than replacing the entire array.
 *
 * So SRP cannot be fought; the architecture has to absorb it. In a heliocentric
 * orbit it simply trims the effective solar gravity and the swarm is stable at a
 * slightly larger radius. In Earth orbit it does not average out — it drives
 * secular eccentricity growth and demands exactly the propellant above.
 * **Earth-orbiting Type I collectors are excluded by propellant mass**, which is
 * an architectural fork the arithmetic makes for you.
 *
 * ── Where this leaves the chain ──────────────────────────────────────────────
 *
 * M6: waste heat forbids the crust above ~192 TW.
 * M7: lifting it from Earth needs a ×98 lighter film — build side.
 * M8: it is ×182, and maintaining it costs 20× the build rate, forever.
 *
 * Two independent calculations, one from construction and one from maintenance,
 * both terminate in the same place: **material that does not come up Earth's
 * gravity well.** M7 reached it via a 12× energy advantage; M8 reaches it via a
 * permanent 2,000 flights/day. That convergence is the strongest thing in this
 * module, because neither road was built to arrive there.
 *
 * [KNOWN_LIMIT] Still no power beaming, no rectenna, no orbital assembly, no
 * debris flux, no end-of-life disposal. Specific power is beginning-of-life;
 * degradation is handled as replacement rather than as derating. Every number
 * remains a floor, just a less optimistic one.
 */

import { P_I } from "./kardashev.ts";
import { AM0 } from "./physics.ts";
import { PANEL_W_M2 } from "./orbit.ts";
import { COLLECTOR_W_M2, FLEXIBLE_ARRAY_KG_M2, requiredArealKgM2 } from "./lift.ts";
import { C, G0 as G0_SI } from "./constants.ts";

/** Re-exported from constants.ts. */
export const C_LIGHT = C;
export const G0 = G0_SI;

/** Wing-level specific power, W/kg at beginning of life. */
export const SPECIFIC_POWER = {
  /** ROSA-class flight hardware. */
  today: 150,
  /** Widely stated next-generation target. */
  advanced: 300,
  /** Aggressive thin-film concepts. [ASSUMPTION] */
  aggressive: 500,
} as const;

/** Collector area for Type I, from the same chain orbit.ts uses. */
export const TYPE_I_AREA_M2 = P_I / PANEL_W_M2;

/**
 * Areal mass of a WING, not a blanket. This is the correction to lift.ts:
 * anchor on the quantity that is published and flown.
 */
export function wingArealKgM2(specificPowerWKg: number = SPECIFIC_POWER.today) {
  return COLLECTOR_W_M2 / specificPowerWKg;
}

/** What lift.ts's blanket figure implies at wing level. ~281 W/kg — unflown. */
export function impliedSpecificPower(arealKgM2: number = FLEXIBLE_ARRAY_KG_M2) {
  return COLLECTOR_W_M2 / arealKgM2;
}

/** Structure and harness as a multiple of the blanket alone. */
export function structureFactor(specificPowerWKg: number = SPECIFIC_POWER.today) {
  return wingArealKgM2(specificPowerWKg) / FLEXIBLE_ARRAY_KG_M2;
}

/** The corrected areal gap for a build deadline, at wing level. */
export function correctedArealGapX(
  targetYears = 100,
  cadencePerDay = 100,
  specificPowerWKg: number = SPECIFIC_POWER.today,
) {
  return wingArealKgM2(specificPowerWKg) / requiredArealKgM2(targetYears, cadencePerDay);
}

// ───────────────────────────────────────────────── solar radiation pressure

/** AM0/c. Doubled for a perfect reflector, since the photon reverses. */
export function srpPressureNm2(reflective = false) {
  return (AM0 / C_LIGHT) * (reflective ? 2 : 1);
}

export type SrpBudget = {
  pressureNm2: number;
  areaM2: number;
  forceN: number;
  /** Propellant to hold station against it, kg/s and t/yr. */
  massFlowKgS: number;
  propellantTPerYear: number;
  /** Ratio against the array replacement flux. > 1 means fighting SRP costs more. */
  versusReplacement: number;
};

export function srpBudget(
  o: { areaM2?: number; reflective?: boolean; ispS?: number; lifetimeYr?: number; specificPowerWKg?: number } = {},
): SrpBudget {
  const areaM2 = o.areaM2 ?? TYPE_I_AREA_M2;
  const ispS = o.ispS ?? 3000;
  const forceN = srpPressureNm2(o.reflective) * areaM2;
  const massFlowKgS = forceN / (ispS * G0);
  const propellantTPerYear = (massFlowKgS * 365.25 * 86400) / 1000;
  const repl = replacementFlow(o.lifetimeYr ?? 5, o.specificPowerWKg);
  return {
    pressureNm2: srpPressureNm2(o.reflective),
    areaM2,
    forceN,
    massFlowKgS,
    propellantTPerYear,
    versusReplacement: propellantTPerYear / repl.massTPerYear,
  };
}

// ────────────────────────────────────────────────── the standing flow

export type ReplacementFlow = {
  lifetimeYr: number;
  arealKgM2: number;
  areaPerYearM2: number;
  massTPerYear: number;
  flightsPerYear: number;
  flightsPerDay: number;
  /** Multiple of M7's construction cadence of 100 flights/day. */
  versusBuildCadence: number;
};

/**
 * What it costs to stand still. Uses the density a deadline actually demands,
 * not the density we have — otherwise the answer is dominated by a mass we have
 * already established is impossible.
 */
export function replacementFlow(
  lifetimeYr = 5,
  specificPowerWKg?: number,
  o: { arealKgM2?: number; payloadKg?: number; buildCadencePerDay?: number } = {},
): ReplacementFlow {
  const arealKgM2 =
    o.arealKgM2 ??
    (specificPowerWKg !== undefined ? wingArealKgM2(specificPowerWKg) : requiredArealKgM2(100, 100));
  const payloadKg = o.payloadKg ?? 100_000;
  const areaPerYearM2 = TYPE_I_AREA_M2 / lifetimeYr;
  const massKgPerYear = areaPerYearM2 * arealKgM2;
  const flightsPerYear = massKgPerYear / payloadKg;
  return {
    lifetimeYr,
    arealKgM2,
    areaPerYearM2,
    massTPerYear: massKgPerYear / 1000,
    flightsPerYear,
    flightsPerDay: flightsPerYear / 365.25,
    versusBuildCadence: flightsPerYear / 365.25 / (o.buildCadencePerDay ?? 100),
  };
}

/**
 * [RESULT] The equilibrium ceiling, and the sharpest thing in this module.
 *
 * You add area at rate R and lose it at (installed / L). In steady state those
 * balance, so the largest array you can EVER sustain is
 *
 *     A_max = R · L
 *
 * — build rate times lifetime. Not a schedule, a ceiling. Keep launching for a
 * million years and you still asymptote there.
 *
 * At 100 flights/day and a 5-year array you top out at **5% of Type I**, for
 * ever. The first parts you installed die before the last ones are up: over a
 * 100-year build with a 5-year life, year 1's hardware is replaced nineteen
 * times before year 100. You are not building, you are running on a treadmill.
 *
 * The convergence condition is therefore blunt: **the array must outlive its own
 * construction.** L >= T_build, or the project never completes at any budget.
 */
export function sustainableAreaM2(
  cadencePerDay: number,
  lifetimeYr: number,
  o: { arealKgM2?: number; payloadKg?: number } = {},
) {
  const arealKgM2 = o.arealKgM2 ?? requiredArealKgM2(100, 100);
  const payloadKg = o.payloadKg ?? 100_000;
  const areaPerYear = (cadencePerDay * 365.25 * payloadKg) / arealKgM2;
  return areaPerYear * lifetimeYr;
}

export function sustainableFractionOfTypeI(
  cadencePerDay: number,
  lifetimeYr: number,
  o: { arealKgM2?: number; payloadKg?: number } = {},
) {
  return sustainableAreaM2(cadencePerDay, lifetimeYr, o) / TYPE_I_AREA_M2;
}

/** Lifetime needed for the standing flow to fit a cadence you believe in. */
export function lifetimeForCadence(cadencePerDay: number, arealKgM2?: number) {
  const a = arealKgM2 ?? requiredArealKgM2(100, 100);
  const flightsPerYear = cadencePerDay * 365.25;
  return TYPE_I_AREA_M2 * a / (flightsPerYear * 100_000);
}

// ───────────────────────────────────────────────────────────── the verdict

export const COLLECTOR_VERDICT = {
  /** lift.ts costed a blanket; a wing is heavier by this factor. */
  liftWasOptimisticX: structureFactor(SPECIFIC_POWER.today),
  /** Type I is a rate, not a total. */
  isAStandingFlow: true,
  /** SRP cannot be fought at this area; the orbit has to absorb it. */
  earthOrbitExcludedBySrp: true,
  note:
    "Maintenance beats construction by a factor of twenty at a five-year life. " +
    "Holding station against 135 MN of solar radiation pressure costs more " +
    "propellant per year than replacing the whole array. Both roads end at " +
    "material that never came up Earth's gravity well.",
} as const;
