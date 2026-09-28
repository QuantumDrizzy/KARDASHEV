import { GROWTH, P_2023, P_I, kOf } from "./kardashev.ts";

/** Current TES doubling time at IEA 1.8%. */
export const T_DOUBLE = Math.LN2 / Math.log(1 + GROWTH);

/**
 * λ = 1 → inertia (constant doubling gap).
 * λ < 1 → acceleration: each watt-doubling lasts λ times the previous.
 * λ = 0.62 → ~100 years to Type I. “If we do it well.” Hypothesis, not IEA.
 */
export const LAMBDA = 0.62;

export function doublingsBetween(fromW: number, toW: number) {
  return Math.log2(toW / fromW);
}

export function yearsInertial(fromW = P_2023, toW = P_I) {
  return Math.log(toW / fromW) / Math.log(1 + GROWTH);
}

export function yearsAtRate(rate: number, fromW = P_2023, toW = P_I) {
  return Math.log(toW / fromW) / Math.log(1 + rate);
}

/** Time to N doublings with compressing gaps. Finite singularity at T0/(1-λ). */
export function yearsCompressed(doublings: number, lambda = LAMBDA, T0 = T_DOUBLE) {
  if (doublings <= 0) return 0;
  if (Math.abs(lambda - 1) < 1e-9) return T0 * doublings;
  return (T0 * (1 - lambda ** doublings)) / (1 - lambda);
}

export function yearsAccelerating(fromW = P_2023, toW = P_I, lambda = LAMBDA) {
  return yearsCompressed(doublingsBetween(fromW, toW), lambda);
}

export function singularityYear(lambda = LAMBDA, T0 = T_DOUBLE, epoch = 2024) {
  if (lambda >= 1) return Infinity;
  return epoch + T0 / (1 - lambda);
}

/** Watts at t years from 2024 under compressing doublings. */
export function powerCompressed(t: number, lambda = LAMBDA, P0 = P_2023, T0 = T_DOUBLE) {
  if (t <= 0) return P0;
  if (Math.abs(lambda - 1) < 1e-9) return P0 * 2 ** (t / T0);
  const tSing = T0 / (1 - lambda);
  if (t >= tSing * 0.999) return Number.POSITIVE_INFINITY;
  const inner = 1 - (t * (1 - lambda)) / T0;
  if (inner <= 0) return Number.POSITIVE_INFINITY;
  const k = Math.log(inner) / Math.log(lambda);
  return P0 * 2 ** k;
}

export function doublingGaps(n: number, lambda = LAMBDA, T0 = T_DOUBLE) {
  return Array.from({ length: n }, (_, i) => ({
    n: i + 1,
    years: T0 * lambda ** i,
    fromTW: (P_2023 * 2 ** i) / 1e12,
    toTW: (P_2023 * 2 ** (i + 1)) / 1e12,
  }));
}

export function civilizationSeries(lambda = LAMBDA, from = 2024, to = 2200, step = 2) {
  return Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => {
    const year = from + i * step;
    const t = year - 2024;
    const accel = powerCompressed(t, lambda);
    return {
      year,
      inertia: P_2023 * (1 + GROWTH) ** t,
      accel: Number.isFinite(accel) ? Math.min(accel, 1e18) : 1e18,
      k: kOf(P_2023 * (1 + GROWTH) ** t),
      typeI: P_I,
    };
  });
}

export const RATES = [
  { rate: 0.018, label: "1.8% IEA — inertia" },
  { rate: 0.023, label: "2.3% 20th century" },
  { rate: 0.05, label: "5% constant" },
  { rate: 0.1, label: "10% constant" },
];
