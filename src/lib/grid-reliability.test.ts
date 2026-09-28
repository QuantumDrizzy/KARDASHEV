import assert from "node:assert/strict";
import test from "node:test";
import { noTradeAllocator, overbuiltGrid, simulate, solveUniformStorageHours } from "./grid.ts";
import {
  MC_PROVENANCE,
  MC_TODAY,
  RHO_SENSITIVITY,
  SIZING_CORRECTION,
  SIZING_HEAT_ELECTRIFIED,
  singleYearOptimismFactor,
  storageForConfidence,
} from "./grid-reliability.ts";

test("the CUDA port reproduces the TypeScript model in deterministic mode", () => {
  // The gate that makes the Monte Carlo worth anything. Regenerate with
  // native/mc-grid/mc_grid.exe --validate.
  assert.ok(MC_PROVENANCE.portValidationRel < 1e-12, "the port drifted");
  // These are the three values the kernel printed at full double precision.
  const cudaValues: [number, number, number][] = [
    [4, 1, 0.085500429165107084],
    [7.43, 1, 0.049494527333192408],
    [100, 1, 0.034256902604268835],
  ];
  for (const [storageHours, overbuild, cuda] of cudaValues) {
    const ts = simulate({
      grid: overbuiltGrid(overbuild, { storageHours, capShare: 0 }),
      hours: 8760,
      weather: true,
      allocator: noTradeAllocator,
    }).unservedFrac;
    assert.ok(Math.abs(cuda - ts) / ts < 1e-12, `${storageHours}h: ${cuda} vs ${ts}`);
  }
});

test("[CORRECTION] sizing on one weather year understates the tank by ~26x", () => {
  // The deterministic helper still answers what it always answered...
  const deterministic = solveUniformStorageHours({ capShare: 0, target: 0.01 });
  assert.ok(deterministic > 7 && deterministic < 8, `${deterministic} h`);
  // ...and across 4,000 synthetic years that answer is a coin flip at best.
  const row = SIZING_CORRECTION.find((r) => r.overbuild === 1.15)!;
  assert.ok(row.p50Hours / row.deterministicHours > 10, "the optimism gap vanished");
  assert.ok(Math.abs(singleYearOptimismFactor(1.15)! - 26) < 2);
  // The gap narrows as overbuild rises: variance costs less when you have slack.
  assert.ok(singleYearOptimismFactor(2.0)! < singleYearOptimismFactor(1.15)!);
});

test("[MECHANISM] it is Jensen, not an energy shortfall", () => {
  // Unserved energy is convex in the hourly shortfall, so mean-preserving noise
  // strictly raises its expectation. At x1.15 and 8 h the deterministic year
  // gives ~1% unserved; the stochastic mean is ~3.7% on ~1% MORE annual energy.
  const det = simulate({
    grid: overbuiltGrid(1.15, { storageHours: 8, capShare: 0 }),
    hours: 8760,
    weather: true,
    allocator: noTradeAllocator,
  }).unservedFrac;
  const mc = MC_TODAY.points.find((p) => p.overbuild === 1.15 && p.storageHours === 8)!;
  assert.ok(det < 0.015, `deterministic ${det}`);
  assert.ok(mc.meanUnservedFrac > det * 2, "noise stopped hurting — recheck the kernel");
  // And the distribution is tight around a bad mean, not a fat tail around a
  // good one: p50 sits on the mean, so this is a shift, not an outlier story.
  assert.ok(Math.abs(mc.p50 - mc.meanUnservedFrac) / mc.meanUnservedFrac < 0.02);
});

test("a target met on the mean year is met by barely half the years", () => {
  // The reason to report a confidence, not a number.
  const p50 = storageForConfidence(MC_TODAY, 1.15, 0.5);
  const p95 = storageForConfidence(MC_TODAY, 1.15, 0.95);
  assert.equal(p50, 96);
  assert.equal(p95, 200);
  const at96 = MC_TODAY.points.find((p) => p.storageHours === 96)!;
  assert.ok(at96.meanUnservedFrac < 0.01, "mean meets the target...");
  assert.ok(at96.p95 > 0.01, "...but the 95th percentile does not");
  assert.ok(at96.pMeetsTarget > 0.7 && at96.pMeetsTarget < 0.8);
});

test("[RESULT] wind-solar tail correlation is not the driver — variance is", () => {
  // Going in, the Dunkelflaute framing said the joint low-low tail would
  // dominate. Measured at rho = +0.3, the sizing does not move at all.
  assert.equal(RHO_SENSITIVITY.sizingChanged, false);
  assert.deepEqual([...RHO_SENSITIVITY.testedRho], [0, 0.3]);
});

test("electrified heat compounds with variance instead of replacing it", () => {
  const today = SIZING_CORRECTION.find((r) => r.overbuild === 1.5)!;
  const heated = SIZING_HEAT_ELECTRIFIED.find((r) => r.overbuild === 1.5)!;
  assert.ok(heated.p50Hours > today.p50Hours * 5, "heat stopped mattering");
  // Staying in single-digit storage hours now needs x2.0, not x1.5.
  const ok = SIZING_HEAT_ELECTRIFIED.find((r) => r.p95Hours <= 10)!;
  assert.equal(ok.overbuild, 2);
});

test("the Monte Carlo carries its provenance", () => {
  // A number without a seed, a sample count and a device is an opinion.
  assert.equal(MC_TODAY.samples, 4000);
  assert.equal(MC_TODAY.seed, MC_PROVENANCE.seed);
  assert.ok(MC_PROVENANCE.device.includes("5060 Ti"));
  assert.ok(MC_PROVENANCE.regionHoursPerSecond > 1e9);
  assert.ok(MC_TODAY.points.every((p) => p.p95 >= p.p50 && p.p99 >= p.p95));
  assert.ok(MC_TODAY.points.every((p) => p.maxUnservedFrac >= p.p99));
});
