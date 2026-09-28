import { GROWTH, P_2023, P_I, SECONDS_PER_YEAR } from "./kardashev.ts";
import { AM0 } from "./physics.ts";
import { J_PER_WH as J_PER_WH_SI, R_EARTH_M as R_EARTH_SI } from "./constants.ts";

/** Earth mean radius. πR²·AM0 = sunlight the disk already intercepts. */
export const R_EARTH_M = R_EARTH_SI;
export const P_INTERCEPT = Math.PI * R_EARTH_M ** 2 * AM0;
export const BOND_ALBEDO = 0.3;
export const P_ABSORBED = P_INTERCEPT * (1 - BOND_ALBEDO);

/** Type I as a fraction of the sunlight Earth already blocks. ~5.8%. */
export const TYPE_I_OF_DISK = P_I / P_INTERCEPT;

/** 1 Wh = 3600 J. A TWh/yr is not 1e12 J/yr — that error is a factor of 3600. */
export const J_PER_WH = J_PER_WH_SI;

/** Mean power of an annual electrical energy figure quoted in TWh/yr. */
export function twhYrToW(twhYr: number) {
  return (twhYr * 1e12 * J_PER_WH) / SECONDS_PER_YEAR;
}

/** IEA electricity ~30,000 TWh/yr (2023). Not TES — electrons only. ~3.4 TW. */
export const ELECTRICITY_TWH_YR = 30_000;
export const ELECTRICITY_W = twhYrToW(ELECTRICITY_TWH_YR);

/** IEA data-centre estimate ~460 TWh (2024). Order of 50 GW. */
export const DATACENTER_TWH_YR = 460;
export const DATACENTER_W = twhYrToW(DATACENTER_TWH_YR);

/** Nuclear electricity ~2,700 TWh/yr. ~308 GW. */
export const NUCLEAR_TWH_YR = 2_700;
export const NUCLEAR_W = twhYrToW(NUCLEAR_TWH_YR);

/** Inertial TES adds this many watts every second. ~11 kW/s at 20 TW × 1.8%. */
export function wattsPerSecond(p = P_2023) {
  return (p * Math.log(1 + GROWTH)) / SECONDS_PER_YEAR;
}

export function fmtWps(w: number) {
  const kw = w / 1e3;
  return `${kw.toLocaleString("en-US", { maximumFractionDigits: 1, minimumFractionDigits: 1 })} kW/s`;
}
