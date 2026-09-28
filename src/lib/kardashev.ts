/**
 * Sagan 1973: K = (log10(P_watts) − 6) / 10
 *   Type I  → 10¹⁶ W
 *   Type II → 10²⁶ W
 *   Type III→ 10³⁶ W
 *
 * Kardashev 1964 original I was 4×10¹² W (already exceeded). We do not use it.
 *
 * Civilization power: IEA 2023 total energy supply ≈ 620 EJ/yr (± few %).
 * Growth: ~1.8%/yr TES 2013–2023. Not a forecast. Long-run 20th c. was ~2.3%.
 */

import { SECONDS_PER_YEAR as SECONDS_PER_YEAR_SI } from "./constants.ts";

export const SECONDS_PER_YEAR = SECONDS_PER_YEAR_SI;
export const TES_2023_EJ = 620;
export const P_2023 = (TES_2023_EJ * 1e18) / SECONDS_PER_YEAR;
export const EPOCH = Date.UTC(2024, 0, 1);
export const GROWTH = 0.018;

export const P_I = 1e16;
export const P_II_SAGAN = 1e26;
export const P_III_SAGAN = 1e36;
export const L_SUN = 3.826e26;
export const L_MW = 1e37;

export const P_NOW = P_2023;
export const P_II = L_SUN;
export const P_III = P_III_SAGAN;

export function kOf(p: number) {
  return (Math.log10(p) - 6) / 10;
}

export const K_NOW = kOf(P_2023);
export const GAP_I = P_I / P_2023;
export const GAP_II = L_SUN / P_I;

export const MARKS = [
  { p: P_2023, k: Number(kOf(P_2023).toFixed(2)), label: "us" },
  { p: P_I, k: 1, label: "Type I" },
  { p: L_SUN, k: Number(kOf(L_SUN).toFixed(2)), label: "sun" },
] as const;

export function powerAt(ms = Date.now()) {
  const years = (ms - EPOCH) / (SECONDS_PER_YEAR * 1000);
  return P_2023 * (1 + GROWTH) ** years;
}

export function yearsTo(target: number, p: number) {
  return Math.log(target / p) / Math.log(1 + GROWTH);
}

export function tw(w: number) {
  return w / 1e12;
}

export function fmtTW(w: number, digits = 1) {
  return `${tw(w).toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })} TW`;
}

export function sci(n: number) {
  if (!Number.isFinite(n) || n <= 0) return { mant: "0", exp: 0 };
  const exp = Math.floor(Math.log10(n) + 1e-12);
  const mant = n / 10 ** exp;
  return { mant: mant.toFixed(3), exp };
}
