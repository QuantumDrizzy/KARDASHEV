/**
 * M30 — SURFACE. Moving a kilogram across the Moon, which nothing in the chain
 * had ever done.
 *
 * M29 ended on the flat admission that "transport inside the Moon is absent from
 * the whole chain" — having just shown that the volatiles are at the poles and
 * the power has to be somewhere with sunlight. This closes that, and the answer
 * has a pleasing inversion in it.
 *
 * **[RESULT] Past 1,181 km it is cheaper to leave the Moon than to hop across it.**
 *
 * With no atmosphere a ballistic hop is drag-free, which sounds ideal. The
 * minimum-energy range equation for a central angle Θ is
 *
 *     v² / (gR) = 2·sin(Θ/2) / (1 + sin(Θ/2))
 *
 * and it validates: at Θ → π it gives exactly orbital velocity, and the model's
 * g and R reproduce **1,680 m/s orbital** and **2,376 m/s escape** against the
 * published lunar figures.
 *
 * The catch is that you arrive at the speed you left, so a hop costs **twice**
 * its launch Δv — once to go, once to stop. Setting that equal to lunar escape:
 *
 *     range   Θ       hop     hop + landing    vs escape
 *      100 km   3.3°   397 m/s    795 m/s        ×0.33
 *      500 km  16.5°   841       1,683           ×0.71
 *    **1,181 km  38.9°  1,188     2,376          ×1.00**
 *    2,730 km  90.0°  1,529      3,059           ×1.29
 *
 * **Beyond about a thousand kilometres, launching to lunar orbit and landing is
 * a cheaper trajectory than hopping.** Pole to equator is 2,730 km, so the whole
 * distance M29's conflict opens up sits on the wrong side of that line.
 *
 * **[RESULT] Which makes rolling the answer, and rolling is nearly free.**
 *
 * At a rolling resistance of 0.1 on regolith, `E/m = μ·g·d` gives **0.44 MJ/kg**
 * pole to equator — **×5.3 cheaper than hopping** and **0.44% of the 100 MJ/kg**
 * M11 assigns as embodied energy. Energetically, lunar surface transport does
 * not register.
 *
 * **[THE INVERSION] And the fleet is small for exactly the reason closure is hard.**
 *
 * Only the volatiles have to cross the Moon. Silicon, aluminium, iron and oxygen
 * are under the factory wherever it stands; carbon, hydrogen and nitrogen are
 * only at the poles. That is **0.016% of the replacement flow** — 3.7 Mt/yr
 * against 23 Gt/yr — and at ten tonnes and 10 km/h, a 23-day round trip:
 *
 *     volatiles only          **22,913 rovers**
 *     if everything moved      **143,000,000 rovers**
 *
 * So the architecture is forced rather than chosen: **bulk industry on sunlit
 * ground where the rock already is, and a narrow dedicated volatile chain
 * running to the poles.** A logistics programme, not a physics wall.
 *
 * And the inversion is worth stating plainly. **The same 0.016% that makes M28's
 * closure requirement nearly impossible is what makes this transport problem
 * nearly free.** One number, two signs.
 *
 * [KNOWN_LIMIT] Rolling resistance on regolith is assumed at 0.1 and swept;
 * Apollo experience with soft soil and slopes suggests it can be far worse, and
 * this module models no grade, no craters and no route that a vehicle could
 * actually follow. Rover mass and speed are assumed. Nothing models the thermal
 * cycle of a vehicle crossing repeatedly between 40 K shadow and 400 K sunlight,
 * or lunar dust, which destroyed mechanisms on every Apollo surface mission and
 * is the single most likely thing to make this harder than it looks.
 */

import { MU_MOON, R_MOON_M } from "./constants.ts";
import { EMBODIED_J_PER_KG } from "./isru.ts";

/** Lunar surface gravity, derived rather than quoted. */
export const G_MOON = MU_MOON / R_MOON_M ** 2;

/** Circular orbital speed at the surface, and escape. Both validate. */
export const V_ORBITAL = Math.sqrt(G_MOON * R_MOON_M);
export const V_ESCAPE = Math.sqrt(2 * G_MOON * R_MOON_M);

/** [ASSUMED] Rolling resistance coefficient on regolith. Swept, not defended. */
export const ROLLING_RESISTANCE = 0.1;

/** [ASSUMED] A logistics rover: ten tonnes of payload at ten kilometres an hour. */
export const ROVER = { payloadKg: 1e4, speedKmH: 10 } as const;

/** Great-circle distance for a central angle, m. */
export const rangeFor = (thetaRad: number) => thetaRad * R_MOON_M;
/** And the inverse. */
export const angleFor = (rangeM: number) => rangeM / R_MOON_M;

/**
 * Minimum-energy ballistic launch speed for a ground range, m/s.
 *
 * `v² = gR · 2sin(Θ/2)/(1 + sin(Θ/2))`. At Θ → π this returns orbital velocity
 * exactly, which is the check that the relation is the right one.
 */
export function hopLaunchSpeed(rangeM: number): number {
  const s = Math.sin(angleFor(rangeM) / 2);
  return Math.sqrt((G_MOON * R_MOON_M * 2 * s) / (1 + s));
}

/**
 * Total Δv for a hop: you arrive at the speed you left, so it is twice the
 * launch. This doubling is what makes long hops lose to orbit.
 */
export const hopDeltaV = (rangeM: number) => 2 * hopLaunchSpeed(rangeM);

/**
 * [RESULT] Range at which hopping costs the same Δv as escaping the Moon.
 *
 * ~1,181 km. Beyond it, going to orbit and landing is the cheaper trajectory,
 * and the pole-to-equator distance M29's conflict opens is more than twice it.
 */
export function hopEqualsEscapeRangeM(): number {
  let lo = 0;
  let hi = Math.PI * R_MOON_M;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (hopDeltaV(mid) < V_ESCAPE) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Energy per kilogram to roll a distance: `μ·g·d`. */
export function rollJPerKg(rangeM: number, mu: number = ROLLING_RESISTANCE): number {
  return mu * G_MOON * rangeM;
}

/** Energy per kilogram to hop it, kinetic both ways and no propulsion losses. */
export const hopJPerKg = (rangeM: number) => hopLaunchSpeed(rangeM) ** 2;

/** Quarter of the lunar circumference: pole to equator, m. */
export const POLE_TO_EQUATOR_M = (Math.PI * R_MOON_M) / 2;

export type TransportCase = {
  rangeM: number;
  hopLaunchMs: number;
  hopDeltaVMs: number;
  /** Hop Δv against simply leaving the Moon. Above 1, orbit is cheaper. */
  versusEscape: number;
  rollJPerKg: number;
  hopJPerKg: number;
  /** How much cheaper rolling is, in energy. */
  rollAdvantageX: number;
  /** Rolling energy against M11's embodied energy per kilogram. */
  shareOfEmbodied: number;
};

export function transportCase(rangeM: number, mu: number = ROLLING_RESISTANCE): TransportCase {
  const roll = rollJPerKg(rangeM, mu);
  const hop = hopJPerKg(rangeM);
  return {
    rangeM,
    hopLaunchMs: hopLaunchSpeed(rangeM),
    hopDeltaVMs: hopDeltaV(rangeM),
    versusEscape: hopDeltaV(rangeM) / V_ESCAPE,
    rollJPerKg: roll,
    hopJPerKg: hop,
    rollAdvantageX: hop / roll,
    shareOfEmbodied: roll / EMBODIED_J_PER_KG,
  };
}

export const transportLadder = (ranges = [1e5, 5e5, hopEqualsEscapeRangeM(), POLE_TO_EQUATOR_M]) =>
  ranges.map((r) => transportCase(r));

// ────────────────────────────────────────────────────────────── the fleet

export type Fleet = {
  flowKgPerYear: number;
  flowKgPerSecond: number;
  roundTripDays: number;
  /** Delivery rate of one vehicle, kg/s. */
  perRoverKgPerSecond: number;
  rovers: number;
};

/**
 * [RESULT] How many vehicles it takes to sustain a flow across a distance.
 *
 * The volatile flow needs ~23,000. Moving everything would need 143 million,
 * and nothing has to: the rock is under the factory wherever it stands.
 */
export function fleetFor(
  flowKgPerYear: number,
  o: { rangeM?: number; payloadKg?: number; speedKmH?: number } = {},
): Fleet {
  const range = o.rangeM ?? POLE_TO_EQUATOR_M;
  const payload = o.payloadKg ?? ROVER.payloadKg;
  const speedMs = ((o.speedKmH ?? ROVER.speedKmH) * 1000) / 3600;
  const roundTripS = (2 * range) / speedMs;
  const perRover = payload / roundTripS;
  const flowPerSecond = flowKgPerYear / 31_557_600;
  return {
    flowKgPerYear,
    flowKgPerSecond: flowPerSecond,
    roundTripDays: roundTripS / 86_400,
    perRoverKgPerSecond: perRover,
    rovers: flowPerSecond / perRover,
  };
}

/** [ASSUMED] M11's replacement flow at a five-year array life, kg/yr. */
export const REPLACEMENT_FLOW_KG_YR = 23e12;
/** M11's Earth-import share, which is exactly the share that must cross the Moon. */
export const VOLATILE_SHARE = 1.6e-4;

/** The two fleets, and the reason only one of them is needed. */
export function fleetComparison() {
  return {
    volatilesOnly: fleetFor(REPLACEMENT_FLOW_KG_YR * VOLATILE_SHARE),
    everything: fleetFor(REPLACEMENT_FLOW_KG_YR),
  };
}

export const SURFACE_VERDICT = {
  headline: "Past 1,181 km it is cheaper to leave the Moon than to hop across it, so the answer is wheels.",
  theInversion:
    "The same 0.016% that makes M28's closure requirement nearly impossible is what makes this " +
    "transport problem nearly free: only the volatiles have to cross, and that is 23,000 rovers " +
    "rather than 143 million.",
  architecture:
    "Bulk industry on sunlit ground where the rock already is, and a narrow dedicated volatile " +
    "chain running to the poles. Forced by the numbers rather than chosen.",
  /**
   * [KNOWN_LIMIT]
   *
   *  - Rolling resistance is assumed at 0.1 and swept. Soft regolith and slopes
   *    can be far worse, and Apollo found both.
   *  - No grade, no craters, no route a vehicle could actually follow. A great
   *    circle across the Moon is not a road.
   *  - Rover mass and speed are assumed, and the fleet scales linearly in both.
   *  - Nothing models the thermal cycle of crossing repeatedly between 40 K
   *    shadow and 400 K sunlight.
   *  - Nothing models dust, which destroyed mechanisms on every Apollo surface
   *    mission and is the most likely thing to make this harder than it looks.
   */
  limits: "assumed rolling resistance, no terrain, no thermal cycling, and no dust",
} as const;
