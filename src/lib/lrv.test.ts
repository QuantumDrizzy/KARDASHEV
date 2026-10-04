import assert from "node:assert/strict";
import test from "node:test";
import * as surface from "./surface.ts";
import {
  APOLLO15_RMS_DEVIATION_PCT,
  WES_MEDIAN_OVERESTIMATE_PCT,
  crossoverMargin,
  hopEnergyJPerKg,
  lrvBand,
  muFlipFactor,
  wheelEnergyJPerKg,
} from "./lrv.ts";

test("the sourced band is verbatim from NTRS 19730008090 Table 7", () => {
  assert.deepEqual([...APOLLO15_RMS_DEVIATION_PCT], [11.4, 16.0]);
  assert.equal(WES_MEDIAN_OVERESTIMATE_PCT, 30);
});

test("the baseline reproduces surface.ts's 0.44 MJ/kg", () => {
  const e = wheelEnergyJPerKg(0.1);
  // The doc says 0.44 MJ/kg; the derived g and radius give 0.4435.
  assert.ok(Math.abs(e / 1e6 - 0.44) / 0.44 < 0.01, `E/m = ${e}`);
});

test("the band moves E/m by at most the sourced 16 percent", () => {
  const [lo, hi] = lrvBand(0.1);
  const e = wheelEnergyJPerKg(0.1);
  assert.ok(Math.abs(hi / e - 1.16) < 1e-9);
  assert.ok(Math.abs(lo / e - 0.886) < 1e-2); // 1 - 11.4/100
});

test("L1: the crossover margin stays above four under the sourced band", () => {
  const margin = crossoverMargin(0.1);
  assert.ok(margin > 4, `margin ${margin}`);
  assert.ok(margin < 7, `margin implausibly large: ${margin}`);
});

test("L1b: the assumption must be wrong by ~4.5x before hopping wins", () => {
  const f = muFlipFactor(0.1);
  assert.ok(f > 4 && f < 7, `flip factor ${f}`);
});

test("the hop energy is surface.ts's own model at the same traverse", () => {
  // 90 degrees of arc: v = 1,529 m/s, launch energy v^2 ~ 2.34 MJ/kg.
  const h = hopEnergyJPerKg();
  assert.ok(Math.abs(h - 2.338e6) / 2.338e6 < 1e-2, `hop energy ${h}`);
});

test("the surface refusal stands: dustWear is still absent", () => {
  assert.equal((surface as Record<string, unknown>).dustWear, undefined);
});
