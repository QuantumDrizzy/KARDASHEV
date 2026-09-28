import assert from "node:assert/strict";
import test from "node:test";
import { P_I } from "./kardashev.ts";
import { yearsAccelerating } from "./forecast.ts";
import { escapeEnergyPerKg, launchEnergyPerKg, orbitalEnergyPerKg, MU_MOON, R_MOON_M } from "./lift.ts";
import { systemMass } from "./reject.ts";
import {
  EMBODIED_J_PER_KG,
  ISRU_VERDICT,
  MASS_DRIVER_EFFICIENCY,
  REGOLITH,
  doublingTimeImpliedBy,
  doublingsRequired,
  earthShareCeiling,
  industryLadder,
  lunarAdvantageX,
  lunarLaunchJPerKg,
  optimalAllocation,
  transportShare,
  typeISystemMassKg,
  yearsFromDoublingTime,
  yearsToTarget,
} from "./isru.ts";

test("[CORRECTION] M7 compared floors; real against real is an order more", () => {
  // Lunar escape with a mass driver, at 60% wall-plug efficiency.
  assert.ok(Math.abs(lunarLaunchJPerKg() / 1e6 - 4.71) < 0.1, `${lunarLaunchJPerKg() / 1e6} MJ/kg`);
  // M7's comparison: lunar escape against Earth's orbital floor. ~12x.
  const floorToFloor = orbitalEnergyPerKg(550) / escapeEnergyPerKg(MU_MOON, R_MOON_M);
  assert.ok(floorToFloor > 10 && floorToFloor < 14, `${floorToFloor}x`);
  // The honest one: Earth is chemical and runs 15x above its floor.
  const realToReal = lunarAdvantageX();
  assert.ok(realToReal > 90 && realToReal < 120, `${realToReal}x`);
  assert.ok(realToReal > floorToFloor * 5, "the correction should be an order of magnitude");
  assert.ok(Math.abs(realToReal - launchEnergyPerKg() / lunarLaunchJPerKg()) < 1e-9);
});

test("[RESULT] transport is a rounding error against processing", () => {
  const share = transportShare();
  assert.ok(share < 0.06, `transport is ${share} of the total`);
  // And it stays small across the whole plausible embodied-energy range.
  assert.ok(transportShare({ embodiedJPerKg: 50e6 }) < 0.1);
  assert.ok(transportShare({ embodiedJPerKg: 200e6 }) < 0.03);
  // So the gravity well was never the expensive part of lunar sourcing.
  assert.ok(EMBODIED_J_PER_KG > lunarLaunchJPerKg() * 10);
});

test("the power overhead closes: enormous absolutely, trivial relatively", () => {
  const ladder = industryLadder();
  const build = ladder.find((x) => x.label.includes("build"))!;
  const maintain5 = ladder.find((x) => x.label.includes("5 yr"))!;
  // 3.8 TW to build over a century — about world electricity today.
  assert.ok(build.powerW / 1e12 > 3 && build.powerW / 1e12 < 5, `${build.powerW / 1e12} TW`);
  // 76 TW to maintain — four times today's world TES, on the Moon.
  assert.ok(maintain5.powerW / 1e12 > 60 && maintain5.powerW / 1e12 < 95);
  // And still under 1% of the Type I it is building.
  assert.ok(maintain5.fracOfTypeI < 0.01, `${maintain5.fracOfTypeI} of Type I`);
  assert.equal(ISRU_VERDICT.overheadUnderOnePercent, true);
  // Longer array life scales it down exactly.
  const maintain30 = ladder.find((x) => x.label.includes("30 yr"))!;
  assert.ok(Math.abs(maintain5.powerW / maintain30.powerW - 6) < 0.1);
});

test("[THE HARD ONE] the array must be essentially all lunar", () => {
  // Regolith has no carbon, hydrogen or nitrogen at scale.
  assert.ok(REGOLITH.lacks.includes("carbon"));
  assert.ok(REGOLITH.supplies.includes("silicon"));
  const c = earthShareCeiling(100);
  // 100 Earth flights/day is already 146x the entire world's 2024 rate...
  assert.ok(c.versusWorldCadence > 140, `${c.versusWorldCadence}x the world`);
  // ...and supplies under 0.02% of what the array consumes.
  assert.ok(c.maxEarthFraction < 2e-4, `${c.maxEarthFraction}`);
  assert.ok(c.minLunarFraction > 0.9998, `${c.minLunarFraction}`);
  // Even a thousandfold cadence does not reach one percent.
  assert.ok(earthShareCeiling(10_000).maxEarthFraction < 0.02);
  assert.ok(ISRU_VERDICT.bindingConstraints[0].includes("carbon"));
});

test("the allocation optimum is ~0.96, and the answer is flat around it", () => {
  const target = typeISystemMassKg();
  const best = optimalAllocation(target);
  assert.ok(best.allocation > 0.9 && best.allocation < 0.99, `f = ${best.allocation}`);
  // Flat: put 90% or 99.9% back in and the timeline barely moves.
  for (const f of [0.9, 0.99, 0.999]) {
    const t = yearsToTarget(target, { allocation: f });
    assert.ok(t / best.years < 1.15, `f=${f} costs ${t / best.years}x the optimum`);
  }
  // Degenerate allocations are infinite, not silently wrong.
  assert.equal(yearsToTarget(target, { allocation: 0 }), Infinity);
  assert.equal(yearsToTarget(target, { allocation: 1 }), Infinity);
});

test("[RESULT] the whole timeline reduces to a doubling count", () => {
  const target = typeISystemMassKg();
  const n = doublingsRequired(target);
  assert.ok(n > 28 && n < 32, `${n} doublings from a 100 t seed`);
  // Linear in the doubling time, and nothing else survives.
  assert.ok(Math.abs(yearsFromDoublingTime(1) - n) < 0.5);
  assert.ok(Math.abs(yearsFromDoublingTime(2) / yearsFromDoublingTime(1) - 2) < 1e-9);
  assert.ok(Math.abs(yearsFromDoublingTime(5) - 151) < 5, `${yearsFromDoublingTime(5)} yr`);
  // A bigger seed buys doublings logarithmically — barely worth having.
  assert.ok(doublingsRequired(target, 1e9) < n);
  assert.ok(n - doublingsRequired(target, 1e9) < 15, "a 10,000x seed saves under 15 doublings");
});

test("[THE PAYOFF] lambda = 0.62 is a claim about an industrial doubling time", () => {
  // forecast.ts carries lambda as an unfalsifiable curve fit. Divided by the
  // doubling count it becomes an engineering parameter people can argue with.
  const years = yearsAccelerating();
  assert.ok(years > 95 && years < 110, `${years} yr`);
  const doubling = doublingTimeImpliedBy(years);
  assert.ok(doubling > 3 && doubling < 4, `${doubling} yr per doubling`);
  // Consistency: feeding it back reproduces the timeline.
  assert.ok(Math.abs(yearsFromDoublingTime(doubling) - years) < 1e-6);
});

test("the module is anchored on M10's full system, not M7's collector", () => {
  // If this reverts to collector-only mass, every number above halves.
  const full = typeISystemMassKg();
  const s = systemMass({ junctionK: 350 });
  assert.equal(full, s.totalKg);
  assert.ok(full > s.collectorKg * 1.5, "the radiator must be included");
  assert.ok(full / 1e12 > 100 && full / 1e12 < 130, `${full / 1e12} Gt`);
  assert.equal(MASS_DRIVER_EFFICIENCY, 0.6);
  assert.ok(P_I === 1e16);
});

test("[DOCTRINE] the chain ends at a materials question and a growth rate", () => {
  assert.equal(ISRU_VERDICT.energyCloses, true);
  assert.equal(ISRU_VERDICT.bindingConstraints.length, 2);
  assert.ok(ISRU_VERDICT.bindingConstraints[1].includes("doubling"));
  assert.ok(ISRU_VERDICT.note.includes("different kind"));
});
