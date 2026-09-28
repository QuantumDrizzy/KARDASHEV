/**
 * M13 — PLACEMENT. Where the array goes, and why that is a climate decision.
 *
 * Seven modules have said "in orbit" and none of them picked one. M12 made the
 * omission expensive by pointing out what the array actually is: 29.7 million
 * km², **23% of Earth's own cross-section**. An object that size does not merely
 * sit in orbit. Some fraction of it is always between the Sun and the Earth.
 *
 * **The result.** For an isotropically distributed shell at orbital radius `a`,
 * the fraction of the array inside the sunward cylinder is `(1 − cos θ)/2` with
 * `sin θ = R⊕/a`, and the insolation it removes is that fraction times the array
 * area over Earth's disk. At 400 km an isotropic Type I shell blocks **7.7% of
 * the sunlight reaching Earth**, which by `ΔT/T = ¼·ΔP/P` is **−4.9 K**.
 *
 * That is the Last Glacial Maximum. **The array is large enough to freeze the
 * planet**, and this is the mirror of M6: keeping Type I on the crust is +5.06 K,
 * putting it in low orbit as a shell is −4.9 K. Two climate catastrophes of
 * almost identical magnitude and opposite sign, and the only free variable
 * between them is where you put the hardware.
 *
 * **[RESULT] The climate constraint alone derives an orbit.** Solving for M6's
 * own +0.1 K budget gives a floor at **a = 38,900 km**. Geostationary is 42,164
 * km. The lowest orbit that does not dim Earth past the budget the repo already
 * committed to is **92% of GEO radius** — an orbit selected by nothing but
 * radiative balance, landing within 8% of the one orbit everyone already knows
 * the name of.
 *
 * **The escape, and its price.** Shading needs `a·sin ψ < R⊕`, so anything more
 * than ~27° from the Sun–Earth line at 800 km shades nothing while staying in
 * full sunlight. That non-shading band is 45.9% of a LEO shell and Type I fills
 * **10%** of it — geometrically possible, and it is exactly the shell M12
 * excluded for atomic oxygen and debris. At GEO the band is 98.9% and the fill
 * is 0.13%, so neither constraint binds. **Go high, or thread a band.**
 *
 * **[CORRECTION to physics.ts]** `DEFAULT_BENCH.dutyCycle = 0.96` has been used
 * repo-wide with no orbit attached. Eclipse geometry gives **0.67 at 400 km** and
 * **0.994 at GEO**. The 0.96 is not wrong — it is a dawn-dusk assumption that was
 * never written down, and it only holds inside the same band the climate
 * constraint forces you into. Two independent arguments, one answer.
 *
 * **The symmetry worth knowing.** For a >> R⊕ the shading fraction reduces
 * exactly to `A / 4πa²` — the array area over the shell area — which is *also*
 * the fraction of sky the array covers seen from the ground. The same number
 * cools Earth by blocking sunlight and warms it by blocking outgoing infrared.
 * They partially cancel, and by how much depends on the array's own thermal
 * design, which is M10's. This module bounds it: **|ΔT| ≤ ¼·f·T_eff**.
 *
 * Not modelled: geoengineering. The arithmetic for a deliberate solar shade is
 * the same arithmetic, and this repo does not go there.
 */

import { R_EARTH_M } from "./constants.ts";
import { T_EFFECTIVE_K } from "./thermal.ts";
import { TYPE_I_AREA_M2 } from "./collector.ts";
import { geoAltitudeKm } from "./orbit.ts";

/** Earth's cross-section — the disk the array competes with, not the sphere. */
export const EARTH_DISK_M2 = Math.PI * R_EARTH_M ** 2;

/** Geostationary orbital radius, m. Derived in orbit.ts, not restated. */
export const GEO_RADIUS_M = R_EARTH_M + geoAltitudeKm() * 1000;

/**
 * Fraction of an isotropic shell at radius `a` lying inside a cylinder of radius
 * R⊕ drawn along the Sun–Earth line.
 *
 * An element at angle ψ from the sub-solar direction sits a distance `a·sin ψ`
 * from the axis, so it is inside when `sin ψ < R⊕/a`. Integrating a uniform
 * sphere over ψ < θ gives `(1 − cos θ)/2`.
 *
 * Exact, not small-angle: at 400 km θ is 70° and the approximation is 20% off.
 */
export function sunwardCapFraction(radiusM: number): number {
  const s = Math.min(1, R_EARTH_M / radiusM);
  return (1 - Math.cos(Math.asin(s))) / 2;
}

/** Fraction of the sunlight reaching Earth that an array of this area removes. */
export function shadingFraction(radiusM: number, areaM2: number = TYPE_I_AREA_M2): number {
  return Math.min(1, (sunwardCapFraction(radiusM) * areaM2) / EARTH_DISK_M2);
}

/**
 * Equilibrium cooling from that shading. `ΔT/T = ¼·ΔP/P` — the same first-order
 * relation M6 uses for heating, applied to a loss instead of a gain. Returned
 * positive; it is a cooling.
 */
export function shadingDeltaTK(radiusM: number, areaM2: number = TYPE_I_AREA_M2): number {
  return 0.25 * shadingFraction(radiusM, areaM2) * T_EFFECTIVE_K;
}

/**
 * Fraction of the sky the array covers, seen from the ground: `A / 4πa²`.
 *
 * [IDENTITY] For a >> R⊕ this equals `shadingFraction` exactly — expand
 * `(1 − cos θ)/2 ≈ R⊕²/4a²` and the Earth-disk denominator cancels. The array
 * blocks the same fraction of incoming sunlight as of outgoing infrared, which
 * is why the two effects partially cancel. Checked in the tests to 1% at GEO.
 */
export function skyCoverageFraction(radiusM: number, areaM2: number = TYPE_I_AREA_M2): number {
  return areaM2 / (4 * Math.PI * radiusM ** 2);
}

/** Sky coverage in square degrees. The whole sky is 41,253. */
export function skyCoverageSquareDeg(radiusM: number, areaM2: number = TYPE_I_AREA_M2): number {
  return skyCoverageFraction(radiusM, areaM2) * 41_252.96;
}

/**
 * [RESULT] The lowest orbit whose shading stays inside a given ΔT budget.
 *
 * Against M6's own +0.1 K this is **38,900 km** — 92% of geostationary radius.
 * The climate constraint picks an orbit by itself, and it picks GEO.
 */
export function climateFloorRadiusM(budgetK = 0.1, areaM2: number = TYPE_I_AREA_M2): number {
  let lo = R_EARTH_M;
  let hi = 1e10;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (shadingDeltaTK(mid, areaM2) > budgetK) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// ──────────────────────────────────────────────── eclipse and duty cycle

/**
 * Fraction of an isotropic shell inside Earth's shadow. Same cylinder, antisolar
 * side, so the same cap fraction.
 *
 * [KNOWN_LIMIT] Cylinder, not cone. Earth's umbra converges to a point at
 * ~1.38 million km, so this slightly overstates the shadow — negligibly below
 * GEO, and increasingly wrong beyond it. No penumbra.
 */
export function eclipseFraction(radiusM: number): number {
  return sunwardCapFraction(radiusM);
}

/**
 * [CORRECTION to physics.ts] The duty cycle geometry actually gives.
 *
 * `DEFAULT_BENCH.dutyCycle = 0.96` is used repo-wide with no orbit named. An
 * isotropic shell gives 0.67 at 400 km and 0.994 at GEO. The 0.96 is a dawn-dusk
 * assumption nobody wrote down — and dawn-dusk is precisely the non-shading band
 * below. The climate argument and the duty-cycle argument converge on the same
 * geometry from opposite directions.
 */
export function dutyCycleGeometric(radiusM: number): number {
  return 1 - eclipseFraction(radiusM);
}

/** What physics.ts assumes, so a test can hold the two against each other. */
export const ASSUMED_DUTY_CYCLE = 0.96;

// ─────────────────────────────────────────────── the non-shading band

export type Band = {
  /** Half-angle from the terminator plane within which nothing shades Earth. */
  halfWidthDeg: number;
  /** Share of the shell that is simultaneously sunlit and non-shading. */
  shellFraction: number;
  availableAreaM2: number;
  /** Areal packing Type I would need inside it. */
  fillFraction: number;
};

/**
 * [RESULT] The escape from the shading constraint, and what it costs.
 *
 * Shading needs `a·sin ψ < R⊕`. Everything between θ and 180° − θ of the
 * Sun–Earth line is sunlit and shades nothing: 45.9% of the shell at 800 km,
 * 98.9% at GEO.
 *
 * The band exists at every altitude, so shading never *forces* a high orbit on
 * its own. What it forces is a **choice**: fill 10% of a LEO band — in the shell
 * M12 excluded for atomic oxygen and debris, at a packing density that makes its
 * 9.4 impacts/second an internal collision problem — or go above 38,900 km where
 * the fill is 0.13% and the question disappears.
 */
export function nonShadingBand(radiusM: number, areaM2: number = TYPE_I_AREA_M2): Band {
  const theta = Math.asin(Math.min(1, R_EARTH_M / radiusM));
  const shellFraction = Math.cos(theta);
  const availableAreaM2 = shellFraction * 4 * Math.PI * radiusM ** 2;
  return {
    halfWidthDeg: 90 - (theta * 180) / Math.PI,
    shellFraction,
    availableAreaM2,
    fillFraction: areaM2 / availableAreaM2,
  };
}

// ────────────────────────────────────────────────────────── the ladder

export type PlacementRung = {
  label: string;
  altitudeKm: number;
  radiusM: number;
  shadingFraction: number;
  coolingK: number;
  dutyCycle: number;
  bandFillFraction: number;
  skySquareDeg: number;
  /** Does an isotropic shell here stay inside M6's +0.1 K budget? */
  withinClimateBudget: boolean;
};

export function placementRung(label: string, altitudeKm: number, budgetK = 0.1): PlacementRung {
  const radiusM = R_EARTH_M + altitudeKm * 1000;
  const cooling = shadingDeltaTK(radiusM);
  return {
    label,
    altitudeKm,
    radiusM,
    shadingFraction: shadingFraction(radiusM),
    coolingK: cooling,
    dutyCycle: dutyCycleGeometric(radiusM),
    bandFillFraction: nonShadingBand(radiusM).fillFraction,
    skySquareDeg: skyCoverageSquareDeg(radiusM),
    withinClimateBudget: cooling <= budgetK,
  };
}

/** The orbits worth naming, from ISS to lunar distance. */
export function placementLadder(): PlacementRung[] {
  return [
    placementRung("ISS", 408),
    placementRung("dawn-dusk SSO", 800),
    placementRung("upper LEO", 2000),
    placementRung("MEO", 10_000),
    placementRung("GPS", 20_200),
    placementRung("GEO", geoAltitudeKm()),
    placementRung("super-GEO", 100_000),
    placementRung("lunar distance", 384_400),
  ];
}

export const PLACEMENT_VERDICT = {
  headline: "An isotropic Type I shell in LEO cools Earth by 4.9 K. Placement is a climate decision.",
  /**
   * [KNOWN_LIMIT] What this does not model.
   *
   *  - Isotropic shell. Real constellations are planes with structure, and the
   *    band result shows the distribution is the whole question.
   *  - Cylindrical shadow, no penumbra, no umbral cone convergence.
   *  - Equilibrium ΔT from ¼·ΔP/P. No ocean lag, no ice-albedo feedback, no
   *    regional distribution — a shadow that sweeps is not a uniform dimming,
   *    and the feedbacks would make a real answer larger, not smaller.
   *  - No collision dynamics inside the band. 10% areal fill in a LEO shell is
   *    stated as a number, not simulated.
   *  - Sky coverage is geometric area only. No brightness, no magnitude, no
   *    claim about what it does to astronomy beyond the solid angle it occupies.
   *  - No station-keeping, no orbital decay, no stability of a filled band.
   */
  limits: "isotropic shell, cylindrical shadow, equilibrium ΔT, no feedbacks",
} as const;
