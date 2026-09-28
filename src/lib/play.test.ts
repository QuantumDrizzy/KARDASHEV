import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { AASM_1980_CLOSURE, requiredClosure } from "./closure.ts";
import { yearsAccelerating, yearsInertial } from "./forecast.ts";
import { earthShareCeiling } from "./isru.ts";
import { P_I, P_II_SAGAN, P_III_SAGAN } from "./kardashev.ts";
import { floorCorrection, requiredSpecificPowerWKg, selfRadiatingSpecificPowerWKg } from "./load.ts";
import { GEO_RADIUS_M } from "./placement.ts";
import { firstWall } from "./sequence.ts";
import { arealDensityToGeoKgM2 } from "./transfer.ts";
import { evaluatePlay, initialPlay, type PlayInput } from "./play.ts";

function paidBuild(): PlayInput {
  const start = initialPlay();
  const thin = evaluatePlay(start).chip;
  return {
    ...start,
    powerW: P_I,
    radiatorRadiusM: floorCorrection().correctedFloorM,
    arealKgM2: arealDensityToGeoKgM2(),
    costRate: 0.99,
    dieThicknessM: thin.filedThicknessM,
    junctionK: thin.filedJunctionK,
    cadencePerDay: evaluatePlay(start).cadence.requiredPerDay,
    lunarFraction: requiredClosure(),
  };
}

test("the opening position is under the wall and off the web", () => {
  const r = evaluatePlay(initialPlay());
  assert.equal(r.heatPath, false);
  assert.equal(r.stranded, false);
  assert.equal(r.typeI, false);
  assert.equal(r.planetaryWeb, false);
  assert.equal(r.typeII.open, false);
  assert.equal(r.typeIII.open, false);
  assert.equal(r.radiator.counts, false);
  assert.ok(r.radiator.playerM < r.radiator.floorM);
  assert.equal(r.mass.exists, false);
  assert.equal(r.mass.met, false);
  assert.equal(r.chip.met, false);
  assert.equal(r.cadence.met, false);
  assert.equal(r.heritage.measured, false);
  assert.equal(r.heritage.label, "UNMEASURED");
  assert.equal(r.lunar.moonIndustry, false);
  assert.equal(r.lunar.webOfSpace, false);
  assert.equal(r.dust.wearRate, null);
  assert.equal(r.dust.bonus, 0);
  assert.equal(r.clock.wins, false);
});

test("crossing the heat wall without a radiator does not leave the crust", () => {
  const wall = firstWall();
  const r = evaluatePlay({
    ...initialPlay(),
    powerW: P_I,
    radiatorRadiusM: GEO_RADIUS_M,
  });
  assert.equal(r.stranded, true);
  assert.equal(r.heatPath, false);
  assert.equal(r.countedW, wall.powerW);
  assert.equal(r.k, wall.k);
  assert.equal(r.typeI, false);
  assert.equal(r.planetaryWeb, false);
  assert.equal(r.mass.exists, false);
});

test("a radiator below the climate floor does not count", () => {
  const floorM = floorCorrection().correctedFloorM;
  const below = evaluatePlay({
    ...initialPlay(),
    powerW: P_I,
    radiatorRadiusM: floorM - 1,
  });
  const at = evaluatePlay({
    ...initialPlay(),
    powerW: P_I,
    radiatorRadiusM: floorM,
  });
  assert.equal(below.radiator.counts, false);
  assert.equal(below.typeI, false);
  assert.equal(below.planetaryWeb, false);
  assert.equal(at.radiator.counts, true);
  assert.equal(at.heatPath, true);
  assert.equal(at.typeI, true);
  assert.equal(at.planetaryWeb, true);
  assert.equal(at.k >= 1, true);
});

test("Type I watts do not open Type II or Type III", () => {
  const atI = evaluatePlay({
    ...initialPlay(),
    powerW: P_I,
    radiatorRadiusM: floorCorrection().correctedFloorM,
  });
  assert.equal(atI.typeII.open, false);
  assert.equal(atI.typeIII.open, false);
  assert.equal(atI.typeII.floorW, P_II_SAGAN);
  assert.equal(atI.typeIII.floorW, P_III_SAGAN);

  const atII = evaluatePlay({
    ...initialPlay(),
    powerW: P_II_SAGAN,
    radiatorRadiusM: floorCorrection().correctedFloorM,
  });
  assert.equal(atII.typeII.open, true);
  assert.equal(atII.typeIII.open, false);

  const atIII = evaluatePlay({
    ...initialPlay(),
    powerW: P_III_SAGAN,
    radiatorRadiusM: floorCorrection().correctedFloorM,
  });
  assert.equal(atIII.typeIII.open, true);
});

test("a cost rate does not close the areal-density gap", () => {
  const floor = floorCorrection().correctedFloorM;
  const wing = initialPlay().arealKgM2;
  const cheap = evaluatePlay({
    ...initialPlay(),
    radiatorRadiusM: floor,
    arealKgM2: wing,
    costRate: 0,
  });
  const dear = evaluatePlay({
    ...initialPlay(),
    radiatorRadiusM: floor,
    arealKgM2: wing,
    costRate: 0.22,
  });
  assert.equal(cheap.mass.met, false);
  assert.equal(dear.mass.met, cheap.mass.met);
  assert.equal(dear.mass.remainingX, cheap.mass.remainingX);
  assert.equal(dear.mass.appliedToMass, false);
  assert.equal(cheap.mass.illustrativeCloses, false);
  assert.ok(cheap.mass.remainingX > 100);

  const committed = evaluatePlay({
    ...initialPlay(),
    radiatorRadiusM: floor,
    arealKgM2: arealDensityToGeoKgM2(),
    costRate: 0.22,
  });
  assert.equal(committed.mass.met, true);
  assert.ok(committed.mass.remainingX <= 1);
});

test("mass below the floor does not exist until the radiator counts", () => {
  const light = evaluatePlay({
    ...initialPlay(),
    arealKgM2: arealDensityToGeoKgM2(),
    radiatorRadiusM: GEO_RADIUS_M,
  });
  assert.equal(light.mass.exists, false);
  assert.equal(light.mass.met, false);
  assert.equal(light.chip.exists, false);
});

test("the chip gate is the die formula, and the reference die misses it", () => {
  const start = evaluatePlay(initialPlay());
  const withPath = {
    ...initialPlay(),
    radiatorRadiusM: floorCorrection().correctedFloorM,
    arealKgM2: arealDensityToGeoKgM2(),
  };
  const reference = evaluatePlay(withPath);
  assert.equal(reference.chip.exists, true);
  assert.equal(reference.chip.met, false);
  assert.equal(reference.chip.packagingIncluded, false);
  assert.ok(reference.chip.achievedWKg < reference.chip.requiredWKg);

  const filed = evaluatePlay({
    ...withPath,
    dieThicknessM: start.chip.filedThicknessM,
    junctionK: start.chip.filedJunctionK,
  });
  assert.equal(filed.chip.met, true);
  const back = selfRadiatingSpecificPowerWKg(start.chip.filedJunctionK, start.chip.filedThicknessM);
  assert.ok(back >= requiredSpecificPowerWKg());
});

test("cadence is flights, and energy return does not bind", () => {
  const start = evaluatePlay(initialPlay());
  const base: PlayInput = {
    ...initialPlay(),
    radiatorRadiusM: floorCorrection().correctedFloorM,
    arealKgM2: arealDensityToGeoKgM2(),
    dieThicknessM: start.chip.filedThicknessM,
    junctionK: start.chip.filedJunctionK,
    cadencePerDay: start.cadence.worldPerDay,
  };
  const short = evaluatePlay(base);
  assert.equal(short.cadence.exists, true);
  assert.equal(short.cadence.met, false);
  assert.equal(short.cadence.energyBinds, false);
  assert.ok(short.cadence.payloadFraction > 0.01 && short.cadence.payloadFraction < 0.015);

  const built = evaluatePlay({ ...base, cadencePerDay: start.cadence.requiredPerDay });
  assert.equal(built.cadence.met, true);
  assert.equal(built.heritage.exists, true);
  assert.equal(built.heritage.measured, false);
  assert.equal(built.heritage.met, false);
  assert.equal(built.heritage.cognitiveFractionEstimated, false);
});

test("heritage cannot be clicked into existence, and the lunar stage stays shut", () => {
  const sneaky = {
    ...paidBuild(),
    heritageMeasured: true,
    dustWear: 1,
    unlockTypeII: true,
  } as PlayInput;
  const r = evaluatePlay(sneaky);
  assert.equal(r.heritage.measured, false);
  assert.equal(r.heritage.met, false);
  assert.equal(r.heritage.label, "UNMEASURED");
  assert.equal(r.lunar.fractionMeets, true);
  assert.equal(r.lunar.exists, false);
  assert.equal(r.lunar.moonIndustry, false);
  assert.equal(r.lunar.webOfSpace, false);
  assert.equal(r.dust.bonus, 0);
  assert.equal(r.dust.wearRate, null);
  assert.equal(r.typeII.open, false);
  assert.equal(r.clock.wins, false);

  const study = evaluatePlay({ ...paidBuild(), lunarFraction: AASM_1980_CLOSURE.high });
  assert.equal(study.lunar.studyMeets, false);
  assert.equal(study.lunar.fractionMeets, false);
  assert.equal(study.lunar.moonIndustry, false);
  assert.ok(AASM_1980_CLOSURE.high < requiredClosure());
  assert.equal(requiredClosure(), earthShareCeiling().minLunarFraction);
});

test("dust grants nothing and the clock is not a win", () => {
  const r = evaluatePlay(paidBuild());
  assert.equal(r.dust.note, "no wear rate — cite a flux, then measure");
  assert.equal(r.dust.bonus, 0);
  assert.equal(r.dust.wearRate, null);
  assert.ok(r.dust.rollJPerKg > 0);
  assert.equal(r.clock.inertialLabel, "extrapolation");
  assert.equal(r.clock.acceleratingLabel, "hypothesis");
  assert.equal(r.clock.inertialYears, yearsInertial());
  assert.equal(r.clock.acceleratingYears, yearsAccelerating());
  assert.equal(r.clock.wins, false);
  assert.equal(r.steps[5]?.mark, "unmeasured");
  assert.equal(r.steps[7]?.mark, "absent");
  assert.deepEqual(
    r.steps.map((s) => s.id),
    ["heat", "radiator", "mass", "chip", "cadence", "heritage", "lunar", "dust"],
  );
});

test("the play module does not import a meteoroid flux or a learning close", () => {
  const src = readFileSync(new URL("./play.ts", import.meta.url), "utf8");
  assert.equal(/grun/i.test(src), false);
  assert.equal(/\bimprovementAfter\b/.test(src), false);
  assert.equal(/\bdoublingsToClose\b/.test(src), false);
  assert.equal(/\bcompleteHeritage\b/.test(src), false);
});
