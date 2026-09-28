/** Orbital compute. First-order. Assumptions are the model. */

import { AM0 as AM0_SI, SIGMA as SIGMA_SI } from "./constants.ts";

export const SIGMA = SIGMA_SI;
export const AM0 = AM0_SI;
export const EARTH_IR = 240;
export const BUS_EFF = 0.92;
export const HEAT_FACTOR = 1.05;
export const SOLAR_KG_M2 = 1.2;
export const COMPUTE_KG_BASE = 180;
export const COMPUTE_KG_PER_KW = 0.35;

export type BenchInputs = {
  nSats: number;
  computeKw: number;
  solarM2: number;
  panelEff: number;
  dutyCycle: number;
  radiatorT: number;
  emissivity: number;
  radiatorKgM2: number;
  launchUsdKg: number;
  lifetimeYr: number;
  extraHwFrac: number;
  gridUsdKwh: number;
  coolingOverhead: number;
};

export type BenchResult = {
  solarW: number;
  computeW: number;
  heatW: number;
  solarMargin: number;
  radiatorWm2: number;
  radiatorM2: number;
  radiatorKg: number;
  dryKg: number;
  solarDominates: boolean;
  launchUsd: number;
  energyKwhLife: number;
  orbitalUsdKwh: number;
  terrestrialUsdKwh: number;
  crossover: boolean;
  constellationKw: number;
  constellationGw: number;
  bottleneck: "radiator" | "solar" | "launch" | "lifetime";
};

/** AI1-class: 120 kW needs ~330 m² at 28%/AM0/SSO. 70 m wings × ~3 m × 2 ≈ 420 m². */
export const DEFAULT_BENCH: BenchInputs = {
  nSats: 81,
  computeKw: 120,
  solarM2: 420,
  panelEff: 0.28,
  dutyCycle: 0.96,
  radiatorT: 320,
  emissivity: 0.85,
  radiatorKgM2: 3.5,
  launchUsdKg: 200,
  lifetimeYr: 5,
  extraHwFrac: 0.38,
  gridUsdKwh: 0.12,
  coolingOverhead: 0.4,
};

export function blackbodyWm2(T: number, eps: number) {
  return eps * SIGMA * T ** 4;
}

export function evaluate(i: BenchInputs): BenchResult {
  const solarW = AM0 * i.solarM2 * i.panelEff * i.dutyCycle * BUS_EFF;
  const computeW = i.computeKw * 1000;
  const heatW = computeW * HEAT_FACTOR;
  const radiatorWm2 = Math.max(1, blackbodyWm2(i.radiatorT, i.emissivity) - 0.25 * EARTH_IR);
  const radiatorM2 = heatW / radiatorWm2;
  const radiatorKg = radiatorM2 * i.radiatorKgM2;
  const solarKg = i.solarM2 * SOLAR_KG_M2;
  const computeKg = COMPUTE_KG_BASE + i.computeKw * COMPUTE_KG_PER_KW;
  const dryKg = (radiatorKg + solarKg + computeKg) * (1 + i.extraHwFrac);
  const launchUsd = dryKg * i.launchUsdKg * i.nSats;
  const constellationKw = i.nSats * i.computeKw;
  const energyKwhLife = constellationKw * 8760 * i.lifetimeYr;
  const orbitalUsdKwh = energyKwhLife > 0 ? launchUsd / energyKwhLife : Infinity;
  const terrestrialUsdKwh = i.gridUsdKwh * (1 + i.coolingOverhead);
  const solarMargin = solarW / computeW;
  const solarDominates = solarKg > radiatorKg;
  const crossover = orbitalUsdKwh < terrestrialUsdKwh;

  let bottleneck: BenchResult["bottleneck"] = "launch";
  if (solarMargin < 1.1) bottleneck = "solar";
  else if (radiatorKg > solarKg * 1.4) bottleneck = "radiator";
  else if (i.lifetimeYr < 4) bottleneck = "lifetime";
  else bottleneck = crossover ? "lifetime" : "launch";

  return {
    solarW,
    computeW,
    heatW,
    solarMargin,
    radiatorWm2,
    radiatorM2,
    radiatorKg,
    dryKg,
    solarDominates,
    launchUsd,
    energyKwhLife,
    orbitalUsdKwh,
    terrestrialUsdKwh,
    crossover,
    constellationKw,
    constellationGw: constellationKw / 1e6,
    bottleneck,
  };
}

export function launchSweep(base: BenchInputs) {
  return [1500, 500, 200, 100, 50, 20, 10].map((launchUsdKg) => {
    const r = evaluate({ ...base, launchUsdKg });
    return { launchUsdKg, orbitalUsdKwh: r.orbitalUsdKwh, terrestrialUsdKwh: r.terrestrialUsdKwh };
  });
}

export function radiatorSweep(base: BenchInputs) {
  return [280, 300, 320, 340, 360, 380, 400].map((radiatorT) => {
    const r = evaluate({ ...base, radiatorT });
    return { radiatorT, m2: r.radiatorM2, kg: r.radiatorKg, wm2: r.radiatorWm2 };
  });
}

/** SSO polar ~550 km, ~3 mm Al. Order of magnitude, not a dose design. */
export function radiationSketch(altitudeKm: number, years: number) {
  const kradYear = 0.9 + Math.max(0, altitudeKm - 400) / 220;
  const dose = kradYear * years;
  const tpuMargin = 15 / Math.max(dose, 0.01);
  return { kradYear, dose, tpuMargin };
}
