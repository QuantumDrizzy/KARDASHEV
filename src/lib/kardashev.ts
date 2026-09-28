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
 *
 * The numbers and the math live in kardashev-core (core/, Rust), the one core the
 * site, the ledger and the game share (Unibit-Web ADR-0003). This file is its
 * facade: same exports as before, bit-identical values (core/tests/golden.rs).
 * Only the calendar (Date) and the display formatting stay in TypeScript.
 */

import { KARDASHEV_CORE_WASM_BASE64 } from "./kardashev-core.gen.ts";

type Core = {
  kardashev_k_of(p: number): number;
  kardashev_power_after_years(years: number): number;
  kardashev_years_to(target: number, p: number): number;
  kardashev_constant(i: number): number;
};

const bytes = Uint8Array.from(atob(KARDASHEV_CORE_WASM_BASE64), (c) => c.charCodeAt(0));
const core = (await WebAssembly.instantiate(bytes, {})).instance.exports as unknown as Core;

export const SECONDS_PER_YEAR = core.kardashev_constant(5);
export const TES_2023_EJ = core.kardashev_constant(6);
export const P_2023 = core.kardashev_constant(0);
export const EPOCH = Date.UTC(2024, 0, 1);
export const GROWTH = core.kardashev_constant(1);

export const P_I = core.kardashev_constant(2);
export const P_II_SAGAN = core.kardashev_constant(7);
export const P_III_SAGAN = core.kardashev_constant(4);
export const L_SUN = core.kardashev_constant(3);
export const L_MW = core.kardashev_constant(8);

export const P_NOW = P_2023;
export const P_II = L_SUN;
export const P_III = P_III_SAGAN;

export function kOf(p: number) {
  return core.kardashev_k_of(p);
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
  return core.kardashev_power_after_years(years);
}

export function yearsTo(target: number, p: number) {
  return core.kardashev_years_to(target, p);
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
