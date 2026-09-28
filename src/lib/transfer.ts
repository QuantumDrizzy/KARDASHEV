/**
 * M14 — TRANSFER. What M13's destination costs, and who it costs it to.
 *
 * Every mass number in M7, M8, M11 and M12 was costed to low orbit. M13 then
 * derived, from radiative balance alone, that an isotropic array has to sit at
 * or above 38,960 km — essentially geostationary. Nothing in the chain had
 * recosted the delivery, and the repo has never contained a rocket equation:
 * `lift.ts` reasons entirely in **energy**, which is linear in altitude.
 *
 * Delivery is not linear in altitude. That is the whole module.
 *
 *     orbital energy      GEO / LEO = ×1.71      (linear, what lift.ts sees)
 *     mass ratio          GEO / LEO = ×2.77      (exponential, what a rocket pays)
 *
 * **[TIGHTENS M7] The areal density requirement gets 2.8× harder.** M7's century
 * at 100 flights/day needed 12.3 g/m² to low orbit. To GEO the same cadence
 * carries 1/2.77 as much, so it needs **4.44 g/m²** — a **3.1 µm** film — and
 * M7's gap against a real wing widens from **×183 to ×505**. M13's climate
 * constraint made the hardest number in the chain substantially harder.
 *
 * **[STRENGTHENS M11] And by the same act it moved the destination toward the
 * Moon.** Earth is at the bottom of the well; GEO is most of the way out of it.
 * Lunar surface to GEO is **3,982 m/s** against **6,737 m/s** to low orbit —
 * raising the destination makes lunar delivery *cheaper*, not dearer. Against
 * Earth's 12,724 m/s the mass-ratio advantage of sourcing from the Moon goes
 * from **×1.8 at LEO to ×10.4 at GEO**.
 *
 * So the same geometric fact that widened M7's gap to ×505 widened the Moon's
 * advantage to ×10.4. Two independent roads arrive again where M11 already was:
 * **the material cannot come up Earth's gravity well.** M13 did not weaken the
 * thesis. It moved the argument onto the leg that was already load-bearing.
 *
 * Transfers are Hohmann, and that is checked rather than assumed: at a radius
 * ratio of 6.09 the bi-elliptic alternative costs 4,368 m/s against Hohmann's
 * 3,800, consistent with the classical crossover near 11.94.
 *
 * [ASSUMED] and swept where it matters: vacuum Isp, ascent losses, the plane
 * change against the Moon's inclination, and whether lunar cargo may aerobrake.
 */

import { G0, MU_EARTH, MU_MOON, R_EARTH_M, R_MOON_M } from "./constants.ts";
import { geoAltitudeKm, hohmann } from "./orbit.ts";
import { EARTH_ROTATION_MS, orbitalEnergyPerKg, requiredArealKgM2 } from "./lift.ts";

/** [ASSUMED] Vacuum specific impulse, s. Methalox upper stage, public figures. */
export const ISP_VACUUM_S = 380;

/** [ASSUMED] Gravity, drag and steering losses on ascent, m/s. */
export const ASCENT_LOSSES_MS = 1800;

/** [ASSUMED] Moon's orbital inclination to the equator, degrees. Varies 18.3–28.6. */
export const LUNAR_INCLINATION_DEG = 20;

/** Mean Earth–Moon distance, m. */
export const LUNAR_DISTANCE_M = 3.844e8;

export const exhaustVelocity = (ispS: number = ISP_VACUUM_S) => ispS * G0;

/** Circular orbital speed at radius r. */
export const circularSpeed = (radiusM: number) => Math.sqrt(MU_EARTH / radiusM);

/**
 * Tsiolkovsky. The function `lift.ts` never needed and every delivery argument
 * turns on: propellant scales as `exp(Δv/vₑ)`, not as Δv.
 */
export const massRatio = (deltaVMs: number, ispS: number = ISP_VACUUM_S) =>
  Math.exp(deltaVMs / exhaustVelocity(ispS));

// ──────────────────────────────────────────────────────── Earth departures

/** [ASSUMED] Parking orbit every ascent targets before transferring, km. */
export const PARKING_KM = 550;

/** Δv from the surface directly to a circular orbit. Ascent only, no transfer. */
export function ascentDeltaV(altitudeKm: number, losses: number = ASCENT_LOSSES_MS): number {
  return circularSpeed(R_EARTH_M + altitudeKm * 1000) + losses - EARTH_ROTATION_MS;
}

/**
 * Δv from the surface to a circular orbit at `altitudeKm`: ascent to a parking
 * orbit, then a Hohmann transfer up to the destination.
 *
 * [CORRECTED] The first version of this injected directly at circular speed for
 * every destination, which made 2,000 km look *cheaper* than 550 km — circular
 * speed falls with radius, and without the transfer burn the arithmetic runs
 * backwards. The ladder's monotonicity test caught it. Above the parking orbit
 * you must climb, and climbing costs.
 *
 * Valid for destinations at or above the parking orbit. Below it the fixed loss
 * term dominates and this module makes no claim.
 */
export function deltaVFromSurface(
  altitudeKm: number,
  o: { parkingKm?: number; losses?: number } = {},
): number {
  const parkingKm = o.parkingKm ?? PARKING_KM;
  const losses = o.losses ?? ASCENT_LOSSES_MS;
  if (altitudeKm <= parkingKm) return ascentDeltaV(altitudeKm, losses);
  const r1 = R_EARTH_M + parkingKm * 1000;
  const r2 = R_EARTH_M + altitudeKm * 1000;
  return ascentDeltaV(parkingKm, losses) + hohmann(r1, r2).dv;
}

/** Δv from the surface to GEO. */
export function deltaVToGeo(parkingKm: number = PARKING_KM, losses: number = ASCENT_LOSSES_MS): number {
  return deltaVFromSurface(geoAltitudeKm(), { parkingKm, losses });
}

export type BiEllipticCheck = {
  radiusRatio: number;
  hohmannMs: number;
  biEllipticMs: number;
  /** True when the two-burn Hohmann is the cheaper transfer. */
  hohmannWins: boolean;
};

/**
 * Three-burn bi-elliptic transfer via an apoapsis at `rb`.
 *
 * Included so the transfer choice is verified rather than assumed. Hohmann is
 * optimal below a radius ratio of ~11.94 and bi-elliptic above ~15.58; LEO to
 * GEO is 6.09, comfortably inside Hohmann's regime. Checked in the tests at both
 * ends so a sign error in either formula cannot hide.
 */
export function biEllipticDeltaV(r1: number, r2: number, rb: number): number {
  const a1 = (r1 + rb) / 2;
  const a2 = (rb + r2) / 2;
  const burn1 = Math.sqrt(MU_EARTH * (2 / r1 - 1 / a1)) - circularSpeed(r1);
  const burn2 = Math.abs(Math.sqrt(MU_EARTH * (2 / rb - 1 / a2)) - Math.sqrt(MU_EARTH * (2 / rb - 1 / a1)));
  const burn3 = Math.abs(circularSpeed(r2) - Math.sqrt(MU_EARTH * (2 / r2 - 1 / a2)));
  return burn1 + burn2 + burn3;
}

export function transferComparison(r1: number, r2: number, apoapsisMultiple = 10): BiEllipticCheck {
  const hohmannMs = hohmann(r1, r2).dv;
  const biEllipticMs = biEllipticDeltaV(r1, r2, r2 * apoapsisMultiple);
  return { radiusRatio: r2 / r1, hohmannMs, biEllipticMs, hohmannWins: hohmannMs < biEllipticMs };
}

// ──────────────────────────────────────────── linear energy vs exponential mass

export type DestinationCost = {
  label: string;
  altitudeKm: number;
  deltaVMs: number;
  massRatio: number;
  /** Orbital specific energy, J/kg — what lift.ts costs. */
  energyJPerKg: number;
};

export function destinationCost(label: string, altitudeKm: number): DestinationCost {
  const deltaVMs = deltaVFromSurface(altitudeKm);
  return {
    label,
    altitudeKm,
    deltaVMs,
    massRatio: massRatio(deltaVMs),
    energyJPerKg: orbitalEnergyPerKg(altitudeKm),
  };
}

export type DestinationPenalty = {
  /** Ratio of orbital energies — linear, and what the repo has been using. */
  energyRatio: number;
  /** Ratio of mass ratios — exponential, and what a vehicle actually pays. */
  payloadPenalty: number;
  /** How much the exponential term understates when you reason in energy. */
  understatement: number;
};

/**
 * [RESULT] The correction that motivates the module.
 *
 * Energy says raising the destination from 550 km to GEO costs ×1.71. The rocket
 * equation says it costs ×2.77 in delivered mass. Reasoning about delivery in
 * joules — which is all `lift.ts` does — understates it by **62%**.
 *
 * M7's conclusion survives this: energy payback goes from ~21 days to ~36, still
 * nothing. It is the *logistics* leg, which was already the binding one, that
 * takes the hit.
 */
export function destinationPenalty(fromKm: number = PARKING_KM): DestinationPenalty {
  const low = destinationCost("low", fromKm);
  const geo = destinationCost("GEO", geoAltitudeKm());
  const energyRatio = geo.energyJPerKg / low.energyJPerKg;
  const payloadPenalty = geo.massRatio / low.massRatio;
  return { energyRatio, payloadPenalty, understatement: payloadPenalty / energyRatio - 1 };
}

/**
 * [TIGHTENS M7] The areal density a deadline demands once the destination is GEO.
 *
 * M7 inverted a century at 100 flights/day into 12.3 g/m². The same cadence
 * delivers 1/2.77 of the mass to GEO, so the requirement becomes **4.44 g/m²** —
 * a 3.1 µm film — and the gap against a real wing goes from ×183 to **×505**.
 */
export function arealDensityToGeoKgM2(years = 100, cadencePerDay = 100): number {
  return requiredArealKgM2(years, cadencePerDay) / destinationPenalty().payloadPenalty;
}

// ─────────────────────────────────────────────────────── lunar departures

export type LunarDelivery = {
  destinationKm: number;
  /** Escape from the lunar surface — a mass driver spends no propellant here. */
  escapeMs: number;
  /** Arrival speed at the destination radius, falling from lunar distance. */
  arrivalMs: number;
  /** Capture burn, combining circularisation with the plane change. */
  captureMs: number;
  totalMs: number;
  massRatio: number;
};

/**
 * Lunar surface to an Earth orbit.
 *
 * Leaves the Moon at escape speed, coasts to the destination radius on an orbit
 * whose energy is that of a body at rest at lunar distance, then captures. The
 * plane change against the Moon's inclination is combined with the
 * circularisation burn rather than paid separately, which is the cheap way.
 *
 * `aerobrake` removes the capture burn for destinations inside the atmosphere's
 * reach. It is available at LEO and not at GEO, so it is exposed rather than
 * assumed — it is the one lever that argues against this module's conclusion,
 * and the conclusion survives it.
 */
export function lunarDelivery(
  destinationKm: number,
  o: { inclinationDeg?: number; aerobrake?: boolean; residualMs?: number } = {},
): LunarDelivery {
  const r = R_EARTH_M + destinationKm * 1000;
  const escapeMs = Math.sqrt((2 * MU_MOON) / R_MOON_M);
  const arrivalMs = Math.sqrt(2 * (MU_EARTH / r - MU_EARTH / LUNAR_DISTANCE_M));
  const vc = circularSpeed(r);
  const inc = ((o.inclinationDeg ?? LUNAR_INCLINATION_DEG) * Math.PI) / 180;
  const captureMs = o.aerobrake
    ? (o.residualMs ?? 200)
    : Math.sqrt(arrivalMs ** 2 + vc ** 2 - 2 * arrivalMs * vc * Math.cos(inc));
  const totalMs = escapeMs + captureMs;
  return { destinationKm, escapeMs, arrivalMs, captureMs, totalMs, massRatio: massRatio(totalMs) };
}

export type SourcingAdvantage = {
  destinationKm: number;
  earthDeltaVMs: number;
  moonDeltaVMs: number;
  /** Ratio of mass ratios. How much less vehicle per kg delivered. */
  advantageX: number;
};

/**
 * [RESULT — strengthens M11] Raising the destination helps the Moon and hurts Earth.
 *
 * Earth sits at the bottom of the well and pays the full ascent whatever the
 * destination. The Moon arrives from outside and pays only to *shed* energy, so
 * a higher destination is a smaller capture burn. Moving from LEO to GEO takes
 * lunar delivery from 6,737 to 3,982 m/s while taking Earth from 8,924 to
 * 12,724 — and the mass-ratio advantage from **×1.8 to ×10.4**.
 *
 * With aerobraking allowed at LEO (and it is not available at GEO) the LEO
 * advantage rises to ~×5.5 and the GEO figure is unchanged, so the conclusion —
 * that the advantage roughly doubles — holds either way.
 */
export function sourcingAdvantage(
  destinationKm: number,
  o: { aerobrake?: boolean } = {},
): SourcingAdvantage {
  const earthDeltaVMs = deltaVFromSurface(destinationKm);
  const moon = lunarDelivery(destinationKm, { aerobrake: o.aerobrake });
  return {
    destinationKm,
    earthDeltaVMs,
    moonDeltaVMs: moon.totalMs,
    advantageX: massRatio(earthDeltaVMs) / moon.massRatio,
  };
}

/** The destinations worth naming, with both sourcing routes costed. */
export function transferLadder() {
  const geoKm = geoAltitudeKm();
  return [
    { label: "LEO 550", km: PARKING_KM },
    { label: "upper LEO", km: 2000 },
    { label: "MEO", km: 10_000 },
    { label: "GEO", km: geoKm },
  ].map((d) => {
    const earth = deltaVFromSurface(d.km);
    const moon = lunarDelivery(d.km);
    return {
      label: d.label,
      altitudeKm: d.km,
      earthDeltaVMs: earth,
      earthMassRatio: massRatio(earth),
      moonDeltaVMs: moon.totalMs,
      moonMassRatio: moon.massRatio,
      advantageX: massRatio(earth) / moon.massRatio,
    };
  });
}

export const TRANSFER_VERDICT = {
  headline: "Energy is linear in altitude and delivery is not. GEO costs Earth ×2.8 and pays the Moon ×10.4.",
  /**
   * [KNOWN_LIMIT] What this does not model.
   *
   *  - Single-stage Tsiolkovsky with no dry mass, so every mass ratio here is
   *    optimistic in absolute terms. The module only ever uses *ratios* of mass
   *    ratios, where the optimism largely cancels; do not quote a payload.
   *  - No orbital refuelling, no staging, no reusability economics. A refuelled
   *    architecture changes the flight *count* per delivery, not the Δv.
   *  - Impulsive burns. Low-thrust electric transfer has a very different budget
   *    and a trip time this repo has nowhere to put.
   *  - Patched conics with the Moon treated as a point at rest at 3.844e8 m. No
   *    three-body dynamics, no weak-stability-boundary transfers, which are
   *    cheaper than what is costed here.
   *  - Lunar inclination fixed at 20°; it oscillates 18.3–28.6° over 18.6 years.
   *  - No trip time, no phasing, no launch windows anywhere.
   */
  limits: "no dry mass, no refuelling, impulsive, patched conics, no trip time",
} as const;
