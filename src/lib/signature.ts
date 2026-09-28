/**
 * M18 — SIGNATURE. What the whole chain predicts, seen from outside.
 *
 * Seventeen modules have built a specific physical object: **4.95e13 m² of
 * collector and radiator, in orbit, rejecting 10¹⁶ W at a few hundred kelvin.**
 * That is not only an engineering claim. It is an **observational prediction**,
 * and nothing in the repo had ever pointed a telescope at it.
 *
 * **[RESULT] Type I is invisible, and it is not close.**
 *
 * Bolometrically, 10¹⁶ W against the Sun's 3.83e26 W is **26 parts per
 * trillion**. Going to the mid-infrared helps enormously — a 320 K radiator
 * peaks at 9.06 µm where the 5772 K photosphere has fallen far down its
 * Rayleigh-Jeans tail — and it is still hopeless:
 *
 *     contrast at 9.06 µm   **2.5e-8**, or one part in 41 million
 *
 * A spectral-shape advantage of ×943 against a bolometric deficit of 4e10.
 * No photometric precision reaches parts per billion, and no coronagraph reaches
 * 10⁻⁸ at these separations. **A Type I array produces an infrared excess of 25
 * parts per billion, which is undetectable by any instrument that exists or is
 * planned.**
 *
 * Even ignoring the star entirely and asking only about absolute flux, the array
 * delivers **0.066 µJy at 10 pc** — below JWST/MIRI-class sensitivity, giving a
 * reach of **3.1 pc**. Four stars.
 *
 * **[THE COROLLARY THAT MATTERS] The SETI null result says nothing about Type I.**
 *
 * Dyson's argument, and every infrared-excess survey since, constrains **Type
 * II** — stellar-scale interception, ~10²⁶ W, where the excess is order unity.
 * Type I is ten orders of magnitude below that. Non-detection of waste heat is
 * evidence about Dyson spheres and **no evidence at all** about civilisations at
 * the scale this repo models. That asymmetry is rarely stated and it falls
 * straight out of the arithmetic.
 *
 * **[RESULT] The one signature that does work is occultation.**
 *
 * The same 4.95e13 m², seen against the solar disk, is **32.6 ppm** — against
 * Earth's own transit depth of 83.9 ppm. **39% of an Earth transit**, which is
 * comfortably inside Kepler- and TESS-class photometry for a bright star. The
 * array is far easier to *block light with* than to *see glowing*, because
 * occultation compares its area to the star's disk (a ratio of 3e-5) while
 * emission compares its luminosity to the star's (a ratio of 3e-11).
 *
 * So the honest observational prediction of this entire chain is narrow and
 * testable: **look for a shallow, aperiodic, non-planetary transit — not for an
 * infrared excess.**
 *
 * **[CORRECTED] And a real tension with M10, not the convenience first written
 * here.** The first draft claimed a hotter array is easier to see, from a scratch
 * calculation that held the radiator area fixed. It does not: a hotter radiator
 * is *smaller* as T⁻⁴ while its peak radiance grows only as T³, so
 *
 *     flux at the peak  ∝ **1/T**        contrast  ∝ **~1/T³**
 *
 * verified to four figures by doubling the temperature. Occultation falls too,
 * because the radiator shrinks. So **every detection axis gets worse when the
 * silicon runs hot** — 320 K gives 0.066 µJy, 2.5e-8 and 32.6 ppm; 500 K gives
 * 0.043 µJy, 7.0e-9 and 21.7 ppm.
 *
 * M10 and M15 both want the junction hot, for mass. Observability wants it cold.
 * Nothing here resolves that; it is stated because the engineering optimum and
 * the detectable optimum genuinely point in opposite directions.
 */

import { SIGMA } from "./constants.ts";
import { P_I } from "./kardashev.ts";
import { TYPE_I_AREA_M2 } from "./collector.ts";
import { RADIATOR_EMISSIVITY, radiatorFluxWm2 } from "./reject.ts";

/** Planck constant, J·s. SI 2019 definition, exact. */
export const PLANCK = 6.62607015e-34;
/** Boltzmann, speed of light — re-exported shapes of the shared constants. */
export const K_B = 1.380649e-23;
export const C_LIGHT = 299_792_458;

/** Parsec in metres. IAU 2015. */
export const PARSEC_M = 3.0857e16;
/** Solar radius (IAU nominal) and luminosity. */
export const R_SUN_M = 6.957e8;
export const L_SUN_W = 3.828e26;
/** Solar effective temperature, K. */
export const T_SUN_K = 5772;

/**
 * [ASSUMED] Mid-infrared point-source sensitivity, Jy.
 *
 * JWST/MIRI-class, roughly 10σ in ~10 ks at 10 µm. Used only to convert a flux
 * into a reach; every conclusion here is stated as a distance so the number can
 * be substituted. The contrast result does not depend on it at all.
 */
export const MID_IR_SENSITIVITY_JY = 0.7e-6;

/** Planck spectral radiance, W·m⁻²·sr⁻¹·Hz⁻¹. */
export function planckBnu(nuHz: number, tK: number): number {
  const x = (PLANCK * nuHz) / (K_B * tK);
  return ((2 * PLANCK * nuHz ** 3) / C_LIGHT ** 2) / (Math.expm1(x));
}

/** Wien displacement: peak wavelength in metres. */
export function wienPeakM(tK: number): number {
  return 2.897771955e-3 / tK;
}

/** Frequency of the Wien peak, Hz. */
export function wienPeakHz(tK: number): number {
  return C_LIGHT / wienPeakM(tK);
}

/**
 * Radiator area needed to reject `powerW` at temperature T. Uses M10's own flux
 * relation so the two modules cannot drift apart.
 */
export function radiatorAreaM2(tK = 320, powerW: number = P_I): number {
  return powerW / radiatorFluxWm2(tK);
}

/** Collector plus radiator — the whole object, as it would be seen. */
export function totalArrayAreaM2(tK = 320, powerW: number = P_I): number {
  return TYPE_I_AREA_M2 + radiatorAreaM2(tK, powerW);
}

// ──────────────────────────────────────────────────── thermal signature

export type ThermalSignature = {
  temperatureK: number;
  peakWavelengthM: number;
  distancePc: number;
  /** Flux density from the array at the Wien peak, Jy. */
  arrayFluxJy: number;
  /** Flux density from the photosphere at the same frequency, Jy. */
  starFluxJy: number;
  /** Array over star. The number that decides everything. */
  contrast: number;
  /** Bolometric ratio, for comparison — worse by three orders. */
  bolometricContrast: number;
};

/**
 * [RESULT] The array against its own star, at the wavelength most favourable to
 * the array.
 *
 * A cold radiator peaking at 9 µm against a hot photosphere is the best case
 * available, and it buys ×943 over the bolometric ratio. It is still **2.5e-8** —
 * one part in 41 million.
 */
export function thermalSignature(distancePc = 10, tK = 320, powerW: number = P_I): ThermalSignature {
  const nu = wienPeakHz(tK);
  const d = distancePc * PARSEC_M;
  const arrayFlux = planckBnu(nu, tK) * (radiatorAreaM2(tK, powerW) / d ** 2) * RADIATOR_EMISSIVITY;
  const starFlux = planckBnu(nu, T_SUN_K) * ((Math.PI * R_SUN_M ** 2) / d ** 2);
  return {
    temperatureK: tK,
    peakWavelengthM: wienPeakM(tK),
    distancePc,
    arrayFluxJy: arrayFlux * 1e26,
    starFluxJy: starFlux * 1e26,
    contrast: arrayFlux / starFlux,
    bolometricContrast: powerW / L_SUN_W,
  };
}

/**
 * Distance at which the array's own flux falls to a stated sensitivity.
 *
 * Ignores the star completely — an upper bound on reach that no real instrument
 * achieves, because at these separations the star is 3e7 times brighter.
 */
export function detectionDistancePc(
  sensitivityJy: number = MID_IR_SENSITIVITY_JY,
  tK = 320,
  powerW: number = P_I,
): number {
  const at10 = thermalSignature(10, tK, powerW).arrayFluxJy;
  return 10 * Math.sqrt(at10 / sensitivityJy);
}

/**
 * How much the spectral shape buys over the bolometric ratio.
 *
 * ×943 at 320 K. Real, and nowhere near enough — which is the module's point.
 */
export function spectralAdvantage(tK = 320, powerW: number = P_I): number {
  const s = thermalSignature(10, tK, powerW);
  return s.contrast / s.bolometricContrast;
}

// ────────────────────────────────────────────────────── occultation

/** Transit depth of an area against the solar disk, in parts per million. */
export function occultationDepthPpm(areaM2: number): number {
  return (areaM2 / (Math.PI * R_SUN_M ** 2)) * 1e6;
}

/** Earth's own transit depth, for scale: 83.9 ppm. */
export function earthTransitPpm(radiusM = 6.371e6): number {
  return (radiusM / R_SUN_M) ** 2 * 1e6;
}

export type OccultationSignature = {
  arrayPpm: number;
  earthPpm: number;
  /** Array depth as a fraction of an Earth transit. */
  versusEarth: number;
  /** How much easier occultation is than emission, as a ratio of ratios. */
  easierThanThermalX: number;
};

/**
 * [RESULT] The one signature that works.
 *
 * Occultation compares the array's **area** to the star's disk — 3e-5. Emission
 * compares its **luminosity** to the star's — 3e-11. Six orders of magnitude
 * separate the two, and they land on opposite sides of what instruments can do.
 */
export function occultationSignature(tK = 320, powerW: number = P_I): OccultationSignature {
  const arrayPpm = occultationDepthPpm(totalArrayAreaM2(tK, powerW));
  const earthPpm = earthTransitPpm();
  return {
    arrayPpm,
    earthPpm,
    versusEarth: arrayPpm / earthPpm,
    easierThanThermalX: arrayPpm / 1e6 / thermalSignature(10, tK, powerW).contrast,
  };
}

export const SIGNATURE_VERDICT = {
  headline: "Type I is undetectable in the infrared and detectable in occultation. Look for a shadow, not a glow.",
  /** The asymmetry that is rarely stated and falls out of the arithmetic. */
  setiCorollary:
    "Infrared-excess surveys constrain Type II, where the excess is order unity. Type I is ten " +
    "orders below that, so the null result is evidence about Dyson spheres and no evidence at " +
    "all about civilisations at this scale.",
  /**
   * [KNOWN_LIMIT] What this does not do.
   *
   *  - Blackbody at a single temperature. A real array has a distribution, an
   *    emissivity spectrum, and a collector face that is deliberately absorbing.
   *  - Flux is evaluated at the Wien peak only. A proper answer integrates over a
   *    band and over the instrument response; the contrast would move somewhat
   *    and would not move by seven orders.
   *  - No zodiacal foreground, no interstellar extinction, no confusion.
   *  - The occultation figure is a geometric area ratio. It says nothing about
   *    the *shape* or *periodicity* of the light curve, which is what would
   *    actually distinguish an array from a planet — and that is the part a real
   *    search would live or die on.
   *  - Sensitivity is one assumed instrument figure, used only to state a reach.
   *    The contrast result is independent of it.
   *  - Nothing here models detectability of anything other than waste heat and
   *    blocked light: no radio, no megastructure dynamics, no technosignature
   *    beyond the two the physics of this chain forces.
   */
  limits: "single-temperature blackbody, peak-only flux, no foregrounds, geometry not light-curve shape",
} as const;

/** Sanity anchor: Planck integrated over frequency must give σT⁴/π. */
export function integratedRadiance(tK: number, steps = 20_000): number {
  const nuMax = 20 * wienPeakHz(tK);
  const dNu = nuMax / steps;
  let sum = 0;
  for (let i = 0; i < steps; i++) sum += planckBnu((i + 0.5) * dNu, tK) * dNu;
  return sum;
}

/** The exact value the above must reproduce. */
export function stefanBoltzmannRadiance(tK: number): number {
  return (SIGMA * tK ** 4) / Math.PI;
}
