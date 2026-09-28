import assert from "node:assert/strict";
import test from "node:test";
import * as K from "./constants.ts";
import * as beam from "./beam.ts";
import * as collector from "./collector.ts";
import * as computeEnergy from "./compute-energy.ts";
import * as facts from "./facts.ts";
import * as grid from "./grid.ts";
import * as kardashev from "./kardashev.ts";
import * as life from "./life.ts";
import * as lift from "./lift.ts";
import * as orbit from "./orbit.ts";
import * as physics from "./physics.ts";
import * as pqc from "./pqc.ts";
import * as reject from "./reject.ts";
import * as thermal from "./thermal.ts";

/**
 * Cross-module audit.
 *
 * Fifteen physics modules share constants and derived quantities. An audit
 * found seven constants declared twice — including four separate speed-of-light
 * declarations under two names. Every copy happened to agree, which was luck.
 * `constants.ts` now owns them and the modules re-export.
 *
 * These tests are the thing that makes that stick. They import the modules and
 * compare their published values, so any future divergence fails the build
 * rather than quietly producing two answers to the same question.
 */

const exact = (a: number, b: number, what: string) =>
  assert.equal(a, b, `${what}: ${a} !== ${b}`);

test("the speed of light has one value under both names", () => {
  exact(beam.C_LIGHT, K.C, "beam.C_LIGHT");
  exact(collector.C_LIGHT, K.C, "collector.C_LIGHT");
  exact(grid.C_VACUUM, K.C, "grid.C_VACUUM");
  exact(pqc.C_VACUUM, K.C, "pqc.C_VACUUM");
  // And it is the SI definition, not an approximation someone typed.
  exact(K.C, 299_792_458, "the definition itself");
});

test("Earth is the same size in every module that uses it", () => {
  exact(facts.R_EARTH_M, K.R_EARTH_M, "facts.R_EARTH_M");
  exact(orbit.R_EARTH_M, K.R_EARTH_M, "orbit.R_EARTH_M");
  // thermal.ts derives its area from the shared radius, not from its own copy.
  exact(thermal.EARTH_AREA_M2, 4 * Math.PI * K.R_EARTH_M ** 2, "thermal.EARTH_AREA_M2");
});

test("gravity, Boltzmann, sigma and AM0 are single-sourced", () => {
  exact(orbit.G0, K.G0, "orbit.G0");
  exact(collector.G0, K.G0, "collector.G0");
  exact(reject.BOLTZMANN, K.BOLTZMANN, "reject.BOLTZMANN");
  exact(physics.SIGMA, K.SIGMA, "physics.SIGMA");
  exact(physics.AM0, K.AM0, "physics.AM0");
  exact(orbit.MU_EARTH, K.MU_EARTH, "orbit.MU_EARTH");
  exact(lift.MU_MOON, K.MU_MOON, "lift.MU_MOON");
  exact(lift.R_MOON_M, K.R_MOON_M, "lift.R_MOON_M");
});

test("population and the year are the same everywhere", () => {
  exact(life.POPULATION, K.POPULATION, "life.POPULATION");
  exact(computeEnergy.POPULATION, K.POPULATION, "compute-energy.POPULATION");
  exact(kardashev.SECONDS_PER_YEAR, K.SECONDS_PER_YEAR, "kardashev.SECONDS_PER_YEAR");
  exact(facts.J_PER_WH, K.J_PER_WH, "facts.J_PER_WH");
});

test("the collector flux is one number, not two that happen to match", () => {
  // orbit.ts and lift.ts both build AM0 x eff x duty x bus. If either chain is
  // edited alone, every area, mass and flight count in M7/M8/M10 diverges.
  const rel = Math.abs(orbit.PANEL_W_M2 - lift.COLLECTOR_W_M2) / orbit.PANEL_W_M2;
  assert.ok(rel < 1e-12, `PANEL_W_M2 ${orbit.PANEL_W_M2} vs COLLECTOR_W_M2 ${lift.COLLECTOR_W_M2}`);
  // Both must trace back to the shared AM0 and the shared bench.
  const chain = K.AM0 * physics.DEFAULT_BENCH.panelEff * physics.DEFAULT_BENCH.dutyCycle * physics.BUS_EFF;
  assert.ok(Math.abs(orbit.PANEL_W_M2 - chain) / chain < 1e-12);
  exact(orbit.SOLAR_KG_M2, physics.SOLAR_KG_M2, "orbit.SOLAR_KG_M2");
});

test("the Type I collector area is the same in every module that quotes it", () => {
  const fromKardashev = kardashev.P_I / orbit.PANEL_W_M2;
  const rel = Math.abs(collector.TYPE_I_AREA_M2 - fromKardashev) / fromKardashev;
  assert.ok(rel < 1e-12, `collector.TYPE_I_AREA_M2 ${collector.TYPE_I_AREA_M2}`);
  // M10 must size its collector off the same figure, or its mass ratio is wrong.
  const s = reject.systemMass({ junctionK: 350 });
  assert.ok(Math.abs(s.collectorAreaM2 - fromKardashev) / fromKardashev < 1e-12);
});

test("M10 radiator physics uses the shared sigma, not a local copy", () => {
  const direct = reject.RADIATOR_EMISSIVITY * K.SIGMA * (320 ** 4 - reject.T_SPACE_K ** 4);
  assert.ok(Math.abs(reject.radiatorFluxWm2(320) - direct) < 1e-9);
});

test("the chain M6-M10 agrees on Type I and on what it implies", () => {
  // One Type I, everywhere.
  exact(kardashev.P_I, 1e16, "P_I");
  // M6: the crust ceiling and the fraction that must leave.
  const budget = thermal.crustBudget(0.1);
  assert.ok(budget.mustLeaveFrac > 0.98);
  // M7/M8: the areal gap, at wing level.
  assert.ok(collector.correctedArealGapX(100, 100) > 150);
  // M10: the radiator roughly doubles what M7/M8 costed.
  assert.ok(reject.massUnderstatementX(320) > 1.9);
  // M9: and none of it is relaxed by beaming.
  assert.equal(beam.BEAM_VERDICT.relaxesThermalLimit, false);
});

test("every module's headline claim is still reachable from the code", () => {
  // A smoke test that the public entry points named in the docs exist and run.
  assert.ok(Number.isFinite(thermal.crustBudget(0.1).ceilingTW));
  assert.ok(Number.isFinite(lift.liftVerdict().paybackDays));
  assert.ok(Number.isFinite(collector.sustainableFractionOfTypeI(100, 5)));
  assert.ok(Number.isFinite(beam.beamBudget(1e9).endToEndEta));
  assert.ok(Number.isFinite(reject.leverComparison().hotterSaves));
  assert.ok(Number.isFinite(computeEnergy.computeScale(6.5e-4).tokensPerSAtTypeI));
});
