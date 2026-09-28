/**
 * GRID RELIABILITY — M2h. Storage sizing over a DISTRIBUTION of weather years.
 *
 * Every storage number in M2 came from one deterministic year. Reliability
 * engineering does not size that way: it sizes on a loss-of-load probability
 * across many years. This module carries the result of doing that properly.
 *
 * The simulation is not here. It is `native/mc-grid/mc_grid.cu`, a CUDA kernel
 * — one thread per synthetic weather year — because the sweep is
 * 1.05x10^10 region-hours and single-threaded JS would take hours. The website
 * stays dependency-free; only the *results* are checked in, with provenance.
 *
 * The port is validated, not assumed: with variability switched off the kernel
 * reproduces `simulate({ weather: true, allocator: noTradeAllocator })` to
 * 7.4x10^-15 relative — floating-point accumulation order, i.e. bit-level
 * agreement. `native/mc-grid/mc_grid.exe --validate` regenerates that check.
 *
 * ── [CORRECTION] This supersedes the deterministic sizing ────────────────────
 *
 * `sizeIslandStorageHours` and `solveUniformStorageHours` answer "what storage
 * clears 1% unserved in THIS year". That is a coin flip, and the coin was
 * generous. At x1.15 overbuild the deterministic answer is 7.7 h; across 4,000
 * synthetic years the same target needs 96 h for even odds and 200 h at 95%
 * confidence. Twenty-six times more.
 *
 * The mechanism is Jensen, not a shortfall. The stochastic runs carry ~1% MORE
 * annual energy than the deterministic one (clipping wind at zero lifts its
 * mean slightly), and still do far worse — because unserved energy is a CONVEX
 * function of the hourly shortfall, so mean-preserving noise strictly increases
 * its expectation. A deterministic model cannot see this by construction. It is
 * not a modelling detail; it is most of the storage bill.
 *
 * The deterministic helpers are kept: they are the right tool for comparing
 * mixes against each other, and they are what the M2d/M2e/M2f conclusions about
 * *ranking* levers rest on. They are the wrong tool for sizing a tank.
 */

export type ReliabilityPoint = {
  overbuild: number;
  storageHours: number;
  meanUnservedFrac: number;
  p50: number;
  p95: number;
  p99: number;
  maxUnservedFrac: number;
  /** Fraction of synthetic years meeting the <1% unserved target. */
  pMeetsTarget: number;
};

export type ReliabilityRun = {
  label: string;
  heatElectrification: number;
  windSolarRho: number;
  samples: number;
  seed: number;
  kernelMs: number;
  regionHours: number;
  device: string;
  points: ReliabilityPoint[];
};

/** Provenance, so nobody has to guess where these came from. */
export const MC_PROVENANCE = {
  source: "native/mc-grid/mc_grid.cu",
  device: "NVIDIA RTX 5060 Ti 16GB, sm_120",
  toolchain: "CUDA 13.0, MSVC 2022 BuildTools",
  ranOn: "2026-08-25",
  samplesPerConfig: 4000,
  seed: 20260825,
  /** Deterministic-mode agreement with src/lib/grid.ts, relative. */
  portValidationRel: 7.43e-15,
  kernelSeconds: 6.87,
  regionHoursPerSecond: 1.53e9,
  weather: {
    windMeanCf: 0.35,
    windSigma: 0.25,
    windPersistenceHours: 40,
    clearnessMean: 0.6,
    clearnessSigma: 0.18,
    cloudPersistenceHours: 24,
    note:
      "Two OU processes per cluster. Clusters independent — justified: wind-power " +
      "spatial correlation e-folds at ~600 km, hubs are 6,300-14,900 km apart.",
  },
} as const;

const P = (
  overbuild: number,
  storageHours: number,
  meanUnservedFrac: number,
  p50: number,
  p95: number,
  p99: number,
  maxUnservedFrac: number,
  pMeetsTarget: number,
): ReliabilityPoint => ({
  overbuild,
  storageHours,
  meanUnservedFrac,
  p50,
  p95,
  p99,
  maxUnservedFrac,
  pMeetsTarget,
});

/** Today's demand shape, wind and sun uncorrelated. The reference run. */
export const MC_TODAY: ReliabilityRun = {
  label: "today, rho=0",
  heatElectrification: 0,
  windSolarRho: 0,
  samples: 4000,
  seed: 20260825,
  kernelMs: 6873.42,
  regionHours: 1.0512e10,
  device: MC_PROVENANCE.device,
  points: [
    P(1.15, 2, 0.11328, 0.11336, 0.12062, 0.12318, 0.12897, 0.0),
    P(1.15, 4, 0.07173, 0.07168, 0.07848, 0.08144, 0.08459, 0.0),
    P(1.15, 6, 0.04847, 0.04841, 0.05486, 0.05736, 0.06235, 0.0),
    P(1.15, 8, 0.03717, 0.03714, 0.04333, 0.04582, 0.04912, 0.0),
    P(1.15, 12, 0.0282, 0.02812, 0.03401, 0.0366, 0.04097, 0.0),
    P(1.15, 24, 0.01846, 0.01839, 0.02413, 0.02687, 0.03259, 0.003),
    P(1.15, 48, 0.01266, 0.01248, 0.01824, 0.02102, 0.02564, 0.217),
    P(1.15, 96, 0.00836, 0.00818, 0.01327, 0.01541, 0.02017, 0.726),
    P(1.15, 200, 0.00337, 0.00312, 0.00724, 0.00898, 0.01297, 0.997),
    P(1.15, 400, 0.00032, 0.0, 0.00173, 0.00266, 0.00541, 1.0),
  ],
};

/**
 * Storage hours required at a given confidence, read off the sweep.
 * Returns null when no tested configuration reaches it.
 */
export function storageForConfidence(
  run: ReliabilityRun,
  overbuild: number,
  confidence: number,
): number | null {
  const pts = run.points
    .filter((p) => p.overbuild === overbuild)
    .sort((a, b) => a.storageHours - b.storageHours);
  const hit = pts.find((p) => p.pMeetsTarget >= confidence);
  return hit ? hit.storageHours : null;
}

/**
 * The headline of M2h: what sizing on one year costs you.
 * Deterministic answers come from `solveUniformStorageHours` in grid.ts.
 */
export const SIZING_CORRECTION = [
  { overbuild: 1.15, deterministicHours: 7.7, p50Hours: 96, p95Hours: 200 },
  { overbuild: 1.3, deterministicHours: 4.8, p50Hours: 24, p95Hours: 48 },
  { overbuild: 1.5, deterministicHours: 3.4, p50Hours: 8, p95Hours: 12 },
  { overbuild: 1.75, deterministicHours: 2.0, p50Hours: 6, p95Hours: 6 },
  { overbuild: 2.0, deterministicHours: 0.8, p50Hours: 4, p95Hours: 4 },
] as const;

/**
 * With heat electrified. The cliff moves right AND the variance penalty
 * compounds with it: x1.5 goes from 8 h to 96 h at even odds.
 */
export const SIZING_HEAT_ELECTRIFIED = [
  { overbuild: 1.3, p50Hours: 400, p95Hours: 400 },
  { overbuild: 1.5, p50Hours: 96, p95Hours: 200 },
  { overbuild: 1.75, p50Hours: 12, p95Hours: 48 },
  { overbuild: 2.0, p50Hours: 6, p95Hours: 8 },
] as const;

/**
 * [RESULT] Wind-solar tail correlation barely matters at this level.
 * Running rho = +0.3 (calm and grey together, the Dunkelflaute shape) leaves
 * the P50 and P95 sizing identical to rho = 0 at every overbuild tested. The
 * driver is plain variance, not the joint tail — which was not the prior.
 */
export const RHO_SENSITIVITY = {
  testedRho: [0, 0.3],
  sizingChanged: false,
  note: "P50/P95 storage identical at every overbuild. Variance dominates, not tail correlation.",
} as const;

/** Ratio by which sizing on a single year understates the tank. */
export function singleYearOptimismFactor(overbuild: number) {
  const row = SIZING_CORRECTION.find((r) => r.overbuild === overbuild);
  return row ? row.p95Hours / row.deterministicHours : null;
}
