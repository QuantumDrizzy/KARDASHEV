/**
 * Two-body Earth. IAU μ, mean radius. First-order — not a flight plan.
 *
 * μ = 3.986004418×10¹⁴ m³/s² (EGM2008 / IAU).
 * Circular: v = √(μ/a), T = 2π √(a³/μ), g = μ/a².
 * Eclipse (Sun in plane, parallel rays): f = asin(R/a) / π.
 * Dawn-dusk SSO sits near β=90° — that fraction goes toward 0.
 */

import { P_I } from "./kardashev.ts";
import { AM0, BUS_EFF, DEFAULT_BENCH } from "./physics.ts";
import { G0 as G0_SI, MU_EARTH as MU_EARTH_SI, R_EARTH_M as R_EARTH_SI } from "./constants.ts";
import { SOLAR_KG_M2 as SOLAR_KG_M2_PHYS } from "./physics.ts";

export const MU_EARTH = MU_EARTH_SI;
export const R_EARTH_M = R_EARTH_SI;
export const G0 = G0_SI;
export const SIDEREAL_DAY_S = 86_164.0905;

export type Circular = {
  hKm: number;
  a: number;
  v: number;
  periodS: number;
  g: number;
  gFrac: number;
  eclipseFrac: number;
  eclipseMin: number;
};

export function circular(hKm: number): Circular {
  const a = R_EARTH_M + hKm * 1000;
  const v = Math.sqrt(MU_EARTH / a);
  const periodS = 2 * Math.PI * Math.sqrt(a ** 3 / MU_EARTH);
  const g = MU_EARTH / a ** 2;
  const ratio = Math.min(1, R_EARTH_M / a);
  const eclipseFrac = Math.asin(ratio) / Math.PI;
  return {
    hKm,
    a,
    v,
    periodS,
    g,
    gFrac: g / G0,
    eclipseFrac,
    eclipseMin: (eclipseFrac * periodS) / 60,
  };
}

export function escapeVelocity(r = R_EARTH_M) {
  return Math.sqrt((2 * MU_EARTH) / r);
}

/** Sidereal GEO. Mean-radius height, not the 35,786 km equatorial figure. */
export function geoAltitudeKm() {
  const a = Math.cbrt((MU_EARTH * SIDEREAL_DAY_S ** 2) / (4 * Math.PI ** 2));
  return (a - R_EARTH_M) / 1000;
}

export function hohmann(r1: number, r2: number) {
  const v1 = Math.sqrt(MU_EARTH / r1);
  const v2 = Math.sqrt(MU_EARTH / r2);
  const aT = (r1 + r2) / 2;
  const dv1 = Math.sqrt(MU_EARTH * (2 / r1 - 1 / aT)) - v1;
  const dv2 = v2 - Math.sqrt(MU_EARTH * (2 / r2 - 1 / aT));
  return { dv1, dv2, dv: dv1 + dv2 };
}

export const ORBITS = [
  { id: "iss", name: "ISS", hKm: 408, note: "Free fall. g is still 0.88." },
  { id: "sso", name: "SSO 550", hKm: 550, note: "Starlink / Suncatcher class. Dawn-dusk." },
  { id: "polar", name: "Polar 800", hKm: 800, note: "Still under the inner belt." },
  { id: "inner", name: "Inner belt", hKm: 3000, note: "Protons. Not a compute parking lot." },
  { id: "gps", name: "GPS MEO", hKm: 20_200, note: "Outer belt. Dose eats commodity silicon." },
  { id: "geo", name: "GEO", hKm: 35_793, note: "Sidereal day. One slot, not a swarm." },
] as const;

export const ISS = circular(408);
export const SSO = circular(550);
export const V_ESCAPE = escapeVelocity();
export const H_GEO_KM = geoAltitudeKm();
export const HOHMANN_LEO_GEO = hohmann(R_EARTH_M + 408_000, R_EARTH_M + H_GEO_KM * 1000);

/** AM0 × panel × duty × bus — same chain as the Energy bench. */
export const PANEL_W_M2 =
  AM0 * DEFAULT_BENCH.panelEff * DEFAULT_BENCH.dutyCycle * BUS_EFF;

export function typeISwarm(arealKgM2: number, payloadKg: number, cadencePerDay: number) {
  const areaM2 = P_I / PANEL_W_M2;
  const massKg = areaM2 * arealKgM2;
  const flights = payloadKg > 0 ? massKg / payloadKg : Infinity;
  const years = cadencePerDay > 0 ? flights / (cadencePerDay * 365.25) : Infinity;
  const mwPerLaunch = ((payloadKg / arealKgM2) * PANEL_W_M2) / 1e6;
  return { areaM2, massKg, flights, years, mwPerLaunch };
}

export const STARSHIP_PAYLOAD_KG = 100_000;
export const SOLAR_KG_M2 = SOLAR_KG_M2_PHYS;
export const TYPE_I_PV = typeISwarm(SOLAR_KG_M2, STARSHIP_PAYLOAD_KG, 3);
