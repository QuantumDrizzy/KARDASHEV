/**
 * M12 — ENVIRONMENT. What orbit does to the array, and what the array does to orbit.
 *
 * `A_max = R · L` is the sharpest result in the repo (M8, `collector.ts`) and it
 * is **linear in L**, the array lifetime. L = 5 years has been a bare default
 * since M8 was written. Nothing derived it. Every downstream number — the 5% of
 * Type I ceiling, the 2,000 flights/day replacement cadence, the 76 TW of lunar
 * industry in M11 — scales with a constant nobody costed.
 *
 * This module costs it, and the answer inverts twice.
 *
 * **First inversion: the obvious killer is not a killer.** M7 demands 12.3 g/m²,
 * which at polyimide density is an **8.7 µm film**. The intuition is that
 * micrometeoroids shred it. They do not. The film takes ~198 perforations per m²
 * per year and loses **5e-5 % of its area per year** — two hundred thousand
 * years to lose a tenth of it. The result is robust: sweeping both free
 * parameters over their whole plausible range moves it by 7×, and 7× of
 * negligible is negligible. A film is the most damage-tolerant structure
 * imaginable because it has nothing to sever. Trackable debris strikes the full
 * array **9.4 times per second** and the area arithmetic is the same.
 *
 * **Second inversion: the array is not the thing at risk.** 29.7 million km² is
 * **23% of Earth's own cross-section** — a second Earth-scale collision target —
 * and 66.5 Gt is **5.1 million times** the mass humanity has put in orbit in
 * seventy years. The environment does not threaten the array. The array *is* the
 * environment.
 *
 * **[CORRECTION to M8] So L = 5 years is not a physics number, and it was
 * pessimistic.** Five years is the design life of a LEO smallsat, where the
 * limit is drag decay and the bus — the wrong reference class for a film in a
 * high orbit. No mechanism found here supports it: the binding degradation is
 * cell radiation damage at ~1%/yr, which supports a multi-decade array. Because
 * `A_max = R · L` is linear, that moves the sustainable ceiling from **5% of
 * Type I to ~30%**, and turns M8's convergence condition (L >= T_build) from
 * clearly violated into genuinely arguable.
 *
 * Two things the environment does demand, and both are cheap:
 *   - **You cannot fly bare.** Atomic oxygen erodes 45 µm/yr of bare polyimide
 *     at 400 km, so an 8.7 µm film lasts **2.3 months**. A 100 nm silica coat
 *     fixes it for 1.8% of the mass budget — and regolith is 42% oxygen and 21%
 *     silicon, so M11 already has the feedstock.
 *   - **Ripstop at ~1.3 cm pitch**, so 30 years of holes stay one-per-cell. At
 *     10 µm fibre that is 0.14% of the budget.
 *
 * Under 2% of the binding constraint buys survival. The environment is cheap.
 *
 * Units SI unless a name says otherwise. Grün masses are in grams because the
 * published model is, and converting the constants would be a silent edit of a
 * citation.
 */

import { AM0, C, R_EARTH_M, SECONDS_PER_YEAR } from "./constants.ts";
import { TYPE_I_AREA_M2, sustainableFractionOfTypeI } from "./collector.ts";

// ─────────────────────────────────────────────── the meteoroid environment

/**
 * Grün et al. (1985), interplanetary meteoroid flux at 1 AU. Cumulative flux of
 * particles of mass > m onto a randomly tumbling flat plate, one side.
 *
 * Published model, reproduced verbatim. `m` in GRAMS, result in m^-2 s^-1.
 * Do not "clean up" these constants — they are a citation, not a fit we own.
 */
export const GRUN = {
  c1: 2.2e3,
  g1: 0.306,
  c2: 15.0,
  g2: -4.38,
  c3: 1.3e-9,
  c4: 1e11,
  g3: 2,
  c5: 1e27,
  g4: 4,
  g5: -0.36,
  c6: 1.3e-16,
  c7: 1e6,
  g6: 2,
  g7: -0.85,
} as const;

/** Cumulative flux of meteoroids with mass > m grams, per m² per second. */
export function grunFlux(massG: number): number {
  const k = GRUN;
  return (
    Math.pow(k.c1 * Math.pow(massG, k.g1) + k.c2, k.g2) +
    k.c3 * Math.pow(massG + k.c4 * Math.pow(massG, k.g3) + k.c5 * Math.pow(massG, k.g4), k.g5) +
    k.c6 * Math.pow(massG + k.c7 * Math.pow(massG, k.g6), k.g7)
  );
}

/** Same, per m² per year — the unit a lifetime argument is actually made in. */
export function grunFluxPerYear(massG: number): number {
  return grunFlux(massG) * SECONDS_PER_YEAR;
}

/** Bulk density of interplanetary dust, kg/m³. Published, ~2.5 g/cm³. */
export const METEOROID_DENSITY = 2500;

/** Diameter of a spherical grain of mass m grams, in metres. */
export function grainDiameterM(massG: number, density = METEOROID_DENSITY): number {
  return 2 * Math.cbrt((3 * (massG * 1e-3)) / (4 * Math.PI * density));
}

type MassBin = { massG: number; diameterM: number; fluxPerYear: number };

/** Log-spaced integration grid over the mass decades the model covers. */
function massBins(loExp = -18, hiExp = 3, n = 21_000): MassBin[] {
  const bins: MassBin[] = [];
  const step = (hiExp - loExp) / n;
  for (let i = 0; i < n; i++) {
    const m1 = 10 ** (loExp + i * step);
    const m2 = 10 ** (loExp + (i + 1) * step);
    const massG = Math.sqrt(m1 * m2);
    bins.push({
      massG,
      diameterM: grainDiameterM(massG),
      fluxPerYear: (grunFlux(m1) - grunFlux(m2)) * SECONDS_PER_YEAR,
    });
  }
  return bins;
}

export type DustAccretion = {
  /** kg/yr swept by Earth, before gravitational focusing. */
  bareKgPerYear: number;
  /** With focusing 1 + (v_esc/v_inf)². */
  focusedKgPerYear: number;
  /** Diameter of the mass-carrying peak, metres. */
  peakDiameterM: number;
};

/**
 * [VALIDATION] The yardstick. Integrating the model over all masses and over
 * Earth's sphere must reproduce two independently measured facts:
 *
 *   - the mass-carrying peak sits at ~200 µm  (Love & Brownlee 1993)
 *   - the total influx is ~40 kt/yr           (Love & Brownlee 1993, ±50%)
 *
 * We get **172 µm** and **1.2e7 kg/yr**. The peak — which tests the *shape*, and
 * therefore the constants — lands within 14%. The total is 3.4× under Love &
 * Brownlee's central value, which is inside the literature's own spread:
 * published estimates of Earth's dust accretion run from ~5 to ~300 kt/yr
 * depending on whether they come from satellite detectors, lunar microcraters,
 * or deep-sea and polar-ice sediment.
 *
 * Call this a **partial** validation and say so. What this module actually leans
 * on is the small-mass end — the grains that can perforate 8.7 µm — and that is
 * the part Grün calibrates against lunar microcrater counts, the best
 * constrained region of the model. The mass total is dominated by the 200 µm
 * peak, which is not where any conclusion here comes from.
 */
export function dustAccretion(vInfKmS = 17): DustAccretion {
  let totalGramsPerM2PerYear = 0;
  let peak = -1;
  let peakMassG = 0;
  for (const b of massBins()) {
    const carried = b.fluxPerYear * b.massG;
    totalGramsPerM2PerYear += carried;
    if (carried > peak) {
      peak = carried;
      peakMassG = b.massG;
    }
  }
  const sphereM2 = 4 * Math.PI * R_EARTH_M ** 2;
  const bare = totalGramsPerM2PerYear * 1e-3 * sphereM2;
  const vEsc = 11.186;
  return {
    bareKgPerYear: bare,
    focusedKgPerYear: bare * (1 + (vEsc / vInfKmS) ** 2),
    peakDiameterM: grainDiameterM(peakMassG),
  };
}

// ──────────────────────────────────────────────────── what a film actually is

/** Polyimide film density, kg/m³. Kapton HN, published. */
export const FILM_DENSITY = 1420;

/** M7's demanded areal density, kg/m². The whole reason this module exists. */
export const M7_AREAL_KG_M2 = 0.0123;

/** The thickness M7's mass budget implies: 8.7 µm. */
export function filmThicknessM(arealKgM2: number = M7_AREAL_KG_M2, density: number = FILM_DENSITY) {
  return arealKgM2 / density;
}

/**
 * [ASSUMED] Perforation threshold, as a multiple of film thickness. A
 * hypervelocity grain perforates a thin foil at roughly its own scale; the
 * literature spread is wide and this module does not resolve it. Swept in
 * `perforationSensitivity`, and the conclusion does not depend on it.
 */
export const PERFORATION_RATIO = 0.5;

/**
 * [ASSUMED] Hole diameter as a multiple of grain diameter. Thin-film
 * hypervelocity holes run ~1.5–4× the projectile. Also swept.
 */
export const HOLE_DIAMETER_RATIO = 2.5;

export type FilmDamage = {
  thicknessM: number;
  /** Perforations per m² per year. */
  perforationsPerM2Yr: number;
  /** Fraction of area removed per year. */
  areaLossFracPerYr: number;
  /** Years to lose a tenth of the collecting area to holes. */
  yearsToLoseTenth: number;
};

/**
 * [RESULT] Micrometeoroids do not set the lifetime, and it is not close.
 *
 * 198 perforations per m² per year sounds fatal and is not: each hole is a few
 * microns across, so the film loses **5e-5 % of its area per year**. Two hundred
 * thousand years to lose a tenth. A film has no pressure to lose and no spar to
 * sever — the failure mode that kills a satellite does not exist here.
 */
export function filmDamage(
  o: { arealKgM2?: number; perforationRatio?: number; holeRatio?: number } = {},
): FilmDamage {
  const thicknessM = filmThicknessM(o.arealKgM2 ?? M7_AREAL_KG_M2);
  const kPerf = o.perforationRatio ?? PERFORATION_RATIO;
  const kHole = o.holeRatio ?? HOLE_DIAMETER_RATIO;
  let perforations = 0;
  let lost = 0;
  for (const b of massBins()) {
    if (b.diameterM < kPerf * thicknessM) continue;
    perforations += b.fluxPerYear;
    lost += b.fluxPerYear * Math.PI * ((kHole * b.diameterM) / 2) ** 2;
  }
  return {
    thicknessM,
    perforationsPerM2Yr: perforations,
    areaLossFracPerYr: lost,
    yearsToLoseTenth: 0.1 / lost,
  };
}

/**
 * [ROBUSTNESS] Both free parameters swept over their full plausible range. The
 * spread is ~7× and every corner is still negligible, which is what makes the
 * negative result publishable rather than a parameter choice.
 */
export function perforationSensitivity() {
  const out: { perforationRatio: number; holeRatio: number; areaLossFracPerYr: number }[] = [];
  for (const perforationRatio of [0.3, 0.5, 1.0]) {
    for (const holeRatio of [1.5, 2.5, 4.0]) {
      out.push({
        perforationRatio,
        holeRatio,
        areaLossFracPerYr: filmDamage({ perforationRatio, holeRatio }).areaLossFracPerYr,
      });
    }
  }
  return out;
}

/**
 * [DESIGN OUTPUT] Ripstop pitch. Holes do not matter; *tears between holes* do,
 * and this module does not model fracture. What it can do is state the geometric
 * requirement: keep the expected hole count below one per ripstop cell over the
 * design life, and no tear can run past its own cell.
 *
 * At 198 holes/m²/yr and 30 years that is a **1.3 cm** pitch. A 10 µm fibre grid
 * at that pitch costs 0.017 g/m² — **0.14%** of M7's budget. Effectively free.
 */
export function ripstopPitchM(lifetimeYr = 30, o: Parameters<typeof filmDamage>[0] = {}) {
  return Math.sqrt(1 / (filmDamage(o).perforationsPerM2Yr * lifetimeYr));
}

export function ripstopMassKgM2(lifetimeYr = 30, fibreDiameterM = 10e-6, density: number = FILM_DENSITY) {
  const pitch = ripstopPitchM(lifetimeYr);
  const fibreLengthPerM2 = 2 / pitch;
  return fibreLengthPerM2 * Math.PI * (fibreDiameterM / 2) ** 2 * density;
}

// ────────────────────────────────────────────────────────── atomic oxygen

/** [PUBLISHED] Kapton erosion yield, m³ per incident O atom. Standard LEO value. */
export const KAPTON_EROSION_YIELD = 3.0e-30;

/**
 * [PUBLISHED] Atomic oxygen fluence at ~400 km, atoms per m² per year, from
 * LDEF: 8.99e21 atoms/cm² accumulated over 5.8 years on a decaying 319–470 km
 * orbit. Varies by more than an order of magnitude across the solar cycle.
 */
export const AO_FLUENCE_400KM = 1.5e25;

/** [PUBLISHED] Amorphous silica density, kg/m³ — the standard AO overcoat. */
export const SILICA_DENSITY = 2200;

export type AtomicOxygen = {
  erosionMPerYear: number;
  /** Years a bare film of this thickness survives. */
  bareFilmYears: number;
  /** Silica coat mass, kg/m², and what it costs as a share of M7's budget. */
  coatingKgM2: number;
  coatingShareOfBudget: number;
};

/**
 * [RESULT] The one place the environment genuinely bites — and it is a coating
 * problem, not a wall.
 *
 * 45 µm/yr of bare polyimide at 400 km eats an 8.7 µm film in **2.3 months**. A
 * 100 nm silica overcoat is standard practice and drops the yield by orders of
 * magnitude, for **1.8%** of the mass budget. Regolith is ~42% oxygen and ~21%
 * silicon by mass, so M11's feedstock already contains it.
 *
 * The rule this leaves is short: **you cannot fly bare.**
 */
export function atomicOxygen(
  o: { fluencePerM2Yr?: number; arealKgM2?: number; coatingThicknessM?: number } = {},
): AtomicOxygen {
  const arealKgM2 = o.arealKgM2 ?? M7_AREAL_KG_M2;
  const fluence = o.fluencePerM2Yr ?? AO_FLUENCE_400KM;
  const erosionMPerYear = KAPTON_EROSION_YIELD * fluence;
  const coatingKgM2 = (o.coatingThicknessM ?? 100e-9) * SILICA_DENSITY;
  return {
    erosionMPerYear,
    bareFilmYears: filmThicknessM(arealKgM2) / erosionMPerYear,
    coatingKgM2,
    coatingShareOfBudget: coatingKgM2 / arealKgM2,
  };
}

// ─────────────────────────────────────────────────────── trackable debris

/** [PUBLISHED] Objects >~10 cm in the public catalogue, 2024, all regimes. */
export const TRACKED_OBJECTS = 40_000;

/** [PUBLISHED] Cumulative mass humanity has placed in orbit, kg. ESA, ~13 kt. */
export const MASS_IN_ORBIT_KG = 13e6;

/**
 * Spatial density of trackable objects, per km³, derived rather than quoted:
 * catalogue count over the volume of the LEO shell. Lands at 3.1e-8, the same
 * order as the published peak density near 800 km. The catalogue is concentrated
 * in shells and includes non-LEO regimes, so this is an order-of-magnitude
 * figure — which is all the conclusion needs, since it survives two orders.
 */
export function debrisDensityPerKm3(count: number = TRACKED_OBJECTS, loKm = 200, hiKm = 2000) {
  const re = R_EARTH_M / 1000;
  const volume = (4 / 3) * Math.PI * ((re + hiKm) ** 3 - (re + loKm) ** 3);
  return count / volume;
}

export type DebrisExposure = {
  densityPerKm3: number;
  fluxPerKm2Yr: number;
  impactsPerYear: number;
  impactsPerSecond: number;
  /** Area removed per year, as a fraction. Assumes a hole ~3× the object. */
  areaLossFracPerYr: number;
};

/**
 * [RESULT] The full array is struck by a trackable object **9.4 times per
 * second** — and the area arithmetic is the same as for meteoroids: negligible.
 * A 10 cm fragment through an 8.7 µm sheet makes a 30 cm hole and keeps going.
 * There is no spacecraft there to destroy.
 *
 * The conclusion survives two orders of magnitude in the density estimate, which
 * is the point of deriving it rather than trusting a remembered figure.
 */
export function debrisExposure(
  o: { areaM2?: number; relVelocityKmS?: number; densityPerKm3?: number; holeRatio?: number } = {},
): DebrisExposure {
  const areaM2 = o.areaM2 ?? TYPE_I_AREA_M2;
  const density = o.densityPerKm3 ?? debrisDensityPerKm3();
  const fluxPerKm2Yr = density * (o.relVelocityKmS ?? 10) * SECONDS_PER_YEAR;
  const impactsPerYear = fluxPerKm2Yr * (areaM2 / 1e6);
  const holeM = 0.1 * (o.holeRatio ?? 3);
  return {
    densityPerKm3: density,
    fluxPerKm2Yr,
    impactsPerYear,
    impactsPerSecond: impactsPerYear / SECONDS_PER_YEAR,
    areaLossFracPerYr: (impactsPerYear * Math.PI * (holeM / 2) ** 2) / areaM2,
  };
}

// ───────────────────────────────────────────── the array as an object

export type ArrayAsObject = {
  areaM2: number;
  /** Array area over Earth's own cross-section. */
  shareOfEarthCrossSection: number;
  massKg: number;
  /** Multiple of everything humanity has ever put in orbit. */
  versusAllMassEverLaunched: number;
  /** Solar radiation force on the whole sheet, newtons. */
  srpForceN: number;
};

/**
 * [RESULT — the reframe] The environment does not threaten the array. The array
 * is the environment.
 *
 * 29.7 million km² is **23% of Earth's own cross-section**: a second Earth-scale
 * target, permanently in the way. At 2.24 kg/m² it masses 66.5 Gt — **5.1
 * million times** everything launched in seventy years of spaceflight. One part
 * per million of it fragmenting is five times the entire current debris mass.
 *
 * Kessler is not modelled here and this module does not claim a cascade
 * threshold. What it claims is narrower and harder to dodge: **at this scale the
 * debris question stops being about protecting the array and becomes about what
 * the array does to every other orbit**, and nothing in M6–M11 has a place to
 * put that cost.
 */
export function arrayAsObject(o: { areaM2?: number; arealKgM2?: number } = {}): ArrayAsObject {
  const areaM2 = o.areaM2 ?? TYPE_I_AREA_M2;
  const massKg = areaM2 * (o.arealKgM2 ?? 2.24);
  return {
    areaM2,
    shareOfEarthCrossSection: areaM2 / (Math.PI * R_EARTH_M ** 2),
    massKg,
    versusAllMassEverLaunched: massKg / MASS_IN_ORBIT_KG,
    srpForceN: (AM0 / C) * areaM2,
  };
}

// ──────────────────────────────────────────── what the lifetime should be

/**
 * [PUBLISHED] Triple-junction cell power loss to trapped-particle radiation,
 * fraction per year. ~10–15% over 15 years on station is the standard GEO
 * expectation; 1%/yr is the round figure that spans it.
 */
export const CELL_DEGRADATION_PER_YEAR = 0.01;

export type LifetimeCase = {
  mechanism: string;
  /** Fractional power loss per year attributable to it. */
  lossPerYear: number;
  /** Years to reach the end-of-life threshold on this mechanism alone. */
  yearsToEol: number;
};

/**
 * [CORRECTION to M8] Where L = 5 years came from, and why it is wrong.
 *
 * M8 took five years as a default. It is the design life of a LEO smallsat,
 * where the limit is atmospheric drag and bus electronics — the wrong reference
 * class for a coated film in a high orbit, which has neither.
 *
 * Ranked by what each mechanism actually costs per year at end-of-life = 50%
 * remaining power, the only one that reaches decades is cell radiation damage.
 * Micrometeoroids are **five orders of magnitude** short of mattering.
 */
export function lifetimeCases(eolFraction = 0.5): LifetimeCase[] {
  const cases: [string, number][] = [
    ["cell radiation damage", CELL_DEGRADATION_PER_YEAR],
    ["micrometeoroid holes", filmDamage().areaLossFracPerYr],
    ["trackable debris holes", debrisExposure().areaLossFracPerYr],
  ];
  return cases
    .map(([mechanism, lossPerYear]) => ({
      mechanism,
      lossPerYear,
      yearsToEol: Math.log(eolFraction) / Math.log(1 - lossPerYear),
    }))
    .sort((a, b) => b.lossPerYear - a.lossPerYear);
}

/** Years of survival if every mechanism modelled here runs at once. */
export function combinedLifetimeYr(eolFraction = 0.5) {
  const total = lifetimeCases().reduce((s, c) => s + c.lossPerYear, 0);
  return Math.log(eolFraction) / Math.log(1 - total);
}

export type LifetimeLeverage = {
  lifetimeYr: number;
  sustainableFractionOfTypeI: number;
};

/**
 * [RESULT] Why this module was worth writing. `A_max = R · L` is linear in L, so
 * a lifetime nobody derived was setting the ceiling of the whole thesis.
 *
 * Moving from M8's assumed 5 years to what the environment actually supports
 * takes the sustainable share of Type I from **5% to ~30%** at an unchanged
 * launch cadence. That does not make Type I terrestrial-buildable and does not
 * touch M11's ≥99.98%-lunar requirement — but it is the difference between M8's
 * convergence condition being obviously violated and being arguable.
 */
export function lifetimeLeverage(
  cadencePerDay = 100,
  lifetimes = [5, 10, 20, 30, 50, 69],
): LifetimeLeverage[] {
  return lifetimes.map((lifetimeYr) => ({
    lifetimeYr,
    sustainableFractionOfTypeI: sustainableFractionOfTypeI(cadencePerDay, lifetimeYr),
  }));
}

export const ENVIRONMENT_VERDICT = {
  headline: "The array survives the environment. The environment does not survive the array.",
  /**
   * [KNOWN_LIMIT] What this module does not do.
   *
   *  - No fracture mechanics. 198 holes/m²/yr is an input to tear propagation,
   *    which is the failure mode a film actually has, and `ripstopPitchM` states
   *    a geometric requirement rather than solving it.
   *  - No flight heritage. Nothing this thin has flown for a decade, let alone
   *    three. The multi-decade lifetime is an argument from mechanism, not from
   *    a demonstrated part.
   *  - No Kessler cascade model. The array's effect on other orbits is stated in
   *    magnitudes, not simulated.
   *  - Grün is validated on shape (172 vs ~200 µm) and only partially on total
   *    mass (3.4× under Love & Brownlee's central value).
   *  - Debris density is derived from a catalogue count over a shell volume, so
   *    it is an order-of-magnitude figure. The conclusion survives two.
   *  - No thermal cycling, no UV embrittlement, no charging or arcing, no
   *    spallation. Any of them could be the real limit.
   */
  limits: "fracture, heritage, Kessler, cycling, UV, charging — none modelled",
} as const;
