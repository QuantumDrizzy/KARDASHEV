import assert from "node:assert/strict";
import test from "node:test";
import { P_I } from "./kardashev.ts";
import { AM0 } from "./physics.ts";
import { PANEL_W_M2 } from "./orbit.ts";
import { COLLECTOR_W_M2, FLEXIBLE_ARRAY_KG_M2, requiredArealKgM2 } from "./lift.ts";
import {
  COLLECTOR_VERDICT,
  C_LIGHT,
  SPECIFIC_POWER,
  TYPE_I_AREA_M2,
  correctedArealGapX,
  impliedSpecificPower,
  lifetimeForCadence,
  replacementFlow,
  srpBudget,
  srpPressureNm2,
  structureFactor,
  sustainableAreaM2,
  sustainableFractionOfTypeI,
  wingArealKgM2,
} from "./collector.ts";

test("[CORRECTION] lift.ts costed a blanket; a wing is ~1.9x heavier", () => {
  // 1.2 kg/m^2 implies 281 W/kg at wing level — better than anything flown.
  assert.ok(Math.abs(impliedSpecificPower() - 281) < 5, `${impliedSpecificPower()} W/kg`);
  assert.ok(impliedSpecificPower() > SPECIFIC_POWER.today);
  // ROSA-class 150 W/kg gives 2.24 kg/m^2.
  assert.ok(Math.abs(wingArealKgM2(SPECIFIC_POWER.today) - 2.24) < 0.05);
  assert.ok(Math.abs(structureFactor(SPECIFIC_POWER.today) - 1.87) < 0.05);
  assert.ok(Math.abs(COLLECTOR_VERDICT.liftWasOptimisticX - 1.87) < 0.05);
  // So the areal gap is not x98, it is ~x183.
  assert.ok(Math.abs(correctedArealGapX(100, 100, SPECIFIC_POWER.today) - 183) < 8);
  // Better hardware closes it proportionally, never structurally.
  assert.ok(
    Math.abs(
      correctedArealGapX(100, 100, SPECIFIC_POWER.today) /
        correctedArealGapX(100, 100, SPECIFIC_POWER.advanced) -
        2,
    ) < 0.01,
  );
});

test("solar radiation pressure is AM0/c and it is 135 MN at Type I scale", () => {
  assert.ok(Math.abs(srpPressureNm2() - AM0 / C_LIGHT) < 1e-18);
  assert.ok(Math.abs(srpPressureNm2() - 4.54e-6) < 5e-8);
  // A perfect reflector doubles it: the photon reverses.
  assert.ok(Math.abs(srpPressureNm2(true) / srpPressureNm2() - 2) < 1e-12);
  const s = srpBudget();
  assert.ok(Math.abs(s.forceN / 1e6 - 135) < 5, `${s.forceN / 1e6} MN`);
  assert.ok(Math.abs(s.areaM2 - P_I / PANEL_W_M2) < 1);
});

test("[RESULT] fighting SRP costs more mass per year than replacing the array", () => {
  const s = srpBudget();
  // ~145 Mt/yr of propellant, forever, at Isp 3000 s.
  assert.ok(s.propellantTPerYear / 1e6 > 100, `${s.propellantTPerYear / 1e6} Mt/yr`);
  assert.ok(s.versusReplacement > 1.5, `${s.versusReplacement}x replacement`);
  // Higher Isp helps linearly and cannot rescue it at any plausible value.
  assert.ok(srpBudget({ ispS: 10000 }).propellantTPerYear < s.propellantTPerYear);
  assert.ok(srpBudget({ ispS: 10000 }).versusReplacement > 0.4);
  assert.equal(COLLECTOR_VERDICT.earthOrbitExcludedBySrp, true);
});

test("[RESULT] maintenance beats construction by 20x at a five-year life", () => {
  const five = replacementFlow(5);
  assert.ok(Math.abs(five.flightsPerDay - 2000) < 60, `${five.flightsPerDay}/day`);
  assert.ok(Math.abs(five.versusBuildCadence - 20) < 1);
  // And even a 30-year array still needs 3x the build cadence, forever.
  const thirty = replacementFlow(30);
  assert.ok(thirty.versusBuildCadence > 3);
  // The flow is exactly inverse in lifetime.
  assert.ok(Math.abs(replacementFlow(10).flightsPerDay * 2 - five.flightsPerDay) < 1);
  assert.equal(COLLECTOR_VERDICT.isAStandingFlow, true);
});

test("[THE RESULT] A_max = build rate x lifetime. A ceiling, not a schedule", () => {
  // You add area at R and lose it at installed/L. Steady state: A_max = R·L.
  // Doubling the years you spend launching changes nothing.
  const at100x5 = sustainableFractionOfTypeI(100, 5);
  assert.ok(Math.abs(at100x5 - 0.05) < 0.002, `${at100x5} of Type I`);
  // Linear in both, and only in both.
  assert.ok(Math.abs(sustainableFractionOfTypeI(200, 5) / at100x5 - 2) < 1e-9);
  assert.ok(Math.abs(sustainableFractionOfTypeI(100, 10) / at100x5 - 2) < 1e-9);
  // The convergence condition: the array must outlive its own construction.
  // At a 100-year build, only a 100-year array ever reaches Type I.
  assert.ok(Math.abs(lifetimeForCadence(100) - 100) < 0.5, `${lifetimeForCadence(100)} yr`);
  assert.ok(Math.abs(sustainableFractionOfTypeI(100, 100) - 1) < 0.01);
  assert.ok(sustainableFractionOfTypeI(100, 99) < 1);
  // Consistency with the area the rest of the repo uses.
  assert.ok(Math.abs(TYPE_I_AREA_M2 - P_I / PANEL_W_M2) < 1);
  assert.ok(Math.abs(sustainableAreaM2(100, 100) / TYPE_I_AREA_M2 - 1) < 0.01);
});

test("the module stays anchored on the repo's own constants", () => {
  assert.ok(Math.abs(COLLECTOR_W_M2 - 337) < 5);
  assert.equal(FLEXIBLE_ARRAY_KG_M2, 1.2);
  // The density used for the standing flow is the one lift.ts derived.
  assert.ok(Math.abs(replacementFlow(5).arealKgM2 - requiredArealKgM2(100, 100)) < 1e-12);
  assert.ok(COLLECTOR_VERDICT.note.includes("gravity well"));
});
