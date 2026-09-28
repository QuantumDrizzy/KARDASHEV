import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmt(n: number, digits = 2) {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e12) return `${(n / 1e12).toFixed(digits)} T`;
  if (abs >= 1e9) return `${(n / 1e9).toFixed(digits)} G`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(digits)} M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(digits)} k`;
  if (abs > 0 && abs < 0.01) return n.toExponential(2);
  return n.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

export function fmtPowerKw(kw: number) {
  if (!Number.isFinite(kw)) return "—";
  if (Math.abs(kw) >= 1e6) return `${(kw / 1e6).toFixed(2)} GW`;
  if (Math.abs(kw) >= 1e3) return `${(kw / 1e3).toFixed(1)} MW`;
  return `${kw.toFixed(0)} kW`;
}

export function fmtUsd(n: number) {
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(1)}k`;
  return `$${n.toFixed(2)}`;
}
