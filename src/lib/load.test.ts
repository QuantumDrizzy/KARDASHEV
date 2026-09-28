import assert from "node:assert/strict";
import test from "node:test";
import {
  SILICON_DENSITY,
  SPECIFIC_POWER_W_KG,
  deliverableMassKg,
  floorCorrection,
  loadCase,
  loadLadder,
  loadMassKg,
  radiatorSpecificPowerWKg,
  radiatorWarmingK,
  requiredSpecificPowerWKg,
  requirementRoutes,
  selfRadiatingSpecificPowerWKg,
  temperatureForSpecificPowerK,
  thicknessForSpecificPowerM,
} from "./load.ts";
import { P_I } from "./kardashev.ts";
import { RADIATOR_KG_M2, radiatorFluxWm2 } from "./reject.ts";
import { climateFloorRadiusM } from "./placement.ts";
import { TYPE_I_AREA_M2 } from "./collector.ts";

/**
 * M15 locks. The load-bearing ones are the size of the hole (759 centuries) and
 * the M13 floor correction, which only appears when two modules are multiplied.
 */

test("[RESULT] the load is the largest mass in the repo, and it was never counted", () => {
  const rack = loadCase("rack", SPECIFIC_POWER_W_KG.rack);
  assert.ok(Math.abs(rack.massKg - 1e14) / 1e14 < 0.01, `${rack.massKg} kg`);
  // 759 centuries of launch at 100 flights/day, delivered to GEO.
  assert.ok(rack.centuriesOfLaunch > 700 && rack.centuriesOfLaunch < 820, `${rack.centuriesOfLaunch}`);
  // [CORRECTED] It does NOT dwarf the collector. Against real hardware at
  // 2.24 kg/m² the load is ×1.5 — comparable, not dominant. The first version of
  // this test asserted >1000 because it was comparing against M7's *required*
  // areal density instead of the real one, and it failed loudly. Keep it: the
  // ×759 above is against the deliverable budget, which is a different question.
  assert.ok(rack.versusCollector > 1.2 && rack.versusCollector < 2, `×${rack.versusCollector.toFixed(2)}`);
  // What is fair to claim: the load adds ~74% to M10's collector-plus-radiator
  // system, and no module in the chain had counted it at all.
  const system = 6.65e13 + 6.93e13;
  assert.ok(Math.abs(rack.massKg / system - 0.74) < 0.05, `adds ${((rack.massKg / system) * 100).toFixed(0)}%`);
});

test("[RESULT] the load's mass is an architecture choice worth two orders of magnitude", () => {
  const ladder = loadLadder();
  const rack = ladder[0];
  const selfRad = ladder.find((c) => c.label.startsWith("self-radiating 100"))!;
  // 150% of the collector bolted to radiators, 1.4% as a self-radiating die.
  assert.ok(selfRad.versusCollector < 0.02, `×${selfRad.versusCollector.toFixed(4)}`);
  assert.ok(rack.versusCollector / selfRad.versusCollector > 90, "same watts, ~100× the mass");
});

test("[RESULT] a self-radiating die beats a radiator by ~70x", () => {
  const radiator = radiatorSpecificPowerWKg(320);
  // M10's radiator caps the system at ~144 W/kg whatever the chip does.
  assert.ok(Math.abs(radiator - 144) < 3, `${radiator} W/kg`);
  assert.ok(Math.abs(radiator - radiatorFluxWm2(320) / RADIATOR_KG_M2) < 1e-12);
  const die = selfRadiatingSpecificPowerWKg(400, 100e-6);
  assert.ok(Math.abs(die - 10_591) / 10_591 < 0.01, `${die} W/kg`);
  assert.ok(die / radiator > 60 && die / radiator < 90, `×${(die / radiator).toFixed(0)}`);
});

test("the self-radiating relation is 2*eps*sigma*T^4/(rho*t) and inverts cleanly", () => {
  // T⁴ scaling: doubling temperature must give sixteen times the power.
  const a = selfRadiatingSpecificPowerWKg(300, 100e-6);
  const b = selfRadiatingSpecificPowerWKg(600, 100e-6);
  assert.ok(Math.abs(b / a - 16) < 1e-9);
  // Inverse in thickness.
  assert.ok(Math.abs(selfRadiatingSpecificPowerWKg(400, 50e-6) / selfRadiatingSpecificPowerWKg(400, 100e-6) - 2) < 1e-9);
  // One face is half of two.
  assert.ok(
    Math.abs(selfRadiatingSpecificPowerWKg(400, 100e-6, { faces: 1 }) / selfRadiatingSpecificPowerWKg(400, 100e-6) - 0.5) < 1e-9,
  );
  // The two inverses must round-trip against the forward relation.
  const target = 50_000;
  const t = thicknessForSpecificPowerM(target, 420);
  assert.ok(Math.abs(selfRadiatingSpecificPowerWKg(420, t) - target) / target < 1e-9);
  const tK = temperatureForSpecificPowerK(target, 40e-6);
  assert.ok(Math.abs(selfRadiatingSpecificPowerWKg(tK, 40e-6) - target) / target < 1e-9);
  assert.equal(SILICON_DENSITY, 2330);
});

test("[RESULT] the requirement is 75,900 W/kg and silicon is nowhere near it", () => {
  const need = requiredSpecificPowerWKg(1);
  assert.ok(Math.abs(need - 75_900) / 75_900 < 0.02, `${need} W/kg`);
  // ×759 above a real rack, and still ×7 above a bare conducted die.
  assert.ok(need / SPECIFIC_POWER_W_KG.rack > 700);
  assert.ok(need / SPECIFIC_POWER_W_KG.die > 5);
  // A smaller share of the budget demands proportionally more.
  assert.ok(Math.abs(requiredSpecificPowerWKg(0.1) / need - 10) < 1e-9);
});

test("the two routes to the requirement are thin dies or hot ones", () => {
  const r = requirementRoutes(1);
  const at400 = r.byThinning.find((x) => x.tK === 400)!;
  // 14 µm at 400 K — thinner than any production die.
  assert.ok(at400.thicknessM * 1e6 > 12 && at400.thicknessM * 1e6 < 17, `${at400.thicknessM * 1e6} µm`);
  const at100um = r.byHeating.find((x) => Math.abs(x.thicknessM - 100e-6) < 1e-12)!;
  // 654 K at 100 µm — far past where silicon logic works.
  assert.ok(at100um.tK > 600 && at100um.tK < 700, `${at100um.tK} K`);
  // Thinner always needs less heat; the routes must not cross.
  const sorted = [...r.byHeating].sort((a, b) => a.thicknessM - b.thicknessM);
  for (let i = 1; i < sorted.length; i++) assert.ok(sorted[i].tK > sorted[i - 1].tK);
});

test("[CORRECTS M13] counting M10's radiator lifts the floor above GEO", () => {
  const f = floorCorrection();
  // M13 solved for the collector alone; the radiator sits on the same shell.
  assert.ok(Math.abs(f.collectorOnlyFloorM - climateFloorRadiusM(0.1, TYPE_I_AREA_M2)) < 1e-6);
  assert.ok(f.radiatorAreaM2 > 1.9e13 && f.radiatorAreaM2 < 2.1e13);
  // √A scaling: 1.67× the area must move the floor 1.29×.
  const areaRatio = f.totalAreaM2 / f.collectorAreaM2;
  assert.ok(Math.abs(f.correctedFloorM / f.collectorOnlyFloorM - Math.sqrt(areaRatio)) < 0.01);
  // And it lands above geostationary, which M13 concluded was sufficient.
  assert.ok(f.versusGeo > 1.0, `corrected floor is ${(f.versusGeo * 100).toFixed(0)}% of GEO`);
  assert.ok(Math.abs(f.correctedFloorM / 1000 - 50_290) < 500, `${(f.correctedFloorM / 1000).toFixed(0)} km`);
});

test("[KNOWN_LIMIT] the radiator's own infrared warms Earth, and is not netted", () => {
  // Stated so the floor correction is not quoted as the whole story: the extra
  // shading cools, this warms, and the split depends on orientation.
  const warming = radiatorWarmingK();
  assert.ok(warming > 0.02 && warming < 0.05, `+${warming.toFixed(4)} K`);
  // It must fall with orbital radius, like every other geometric term here.
  assert.ok(radiatorWarmingK(1e8) < warming);
});

test("the deliverable budget is M7's cadence corrected by M14's penalty", () => {
  const toGeo = deliverableMassKg();
  const toLeo = deliverableMassKg({ toGeo: false });
  assert.ok(Math.abs(toLeo - 3.6525e11) / 3.6525e11 < 1e-6);
  assert.ok(Math.abs(toLeo / toGeo - 2.772) < 0.02, "the GEO penalty must be M14's");
  // Linear in every input, so a doubled cadence doubles the budget.
  assert.ok(Math.abs(deliverableMassKg({ cadencePerDay: 200 }) / toGeo - 2) < 1e-9);
});

test("the ladder is ordered and spans the whole question", () => {
  const ladder = loadLadder();
  for (let i = 1; i < ladder.length; i++) {
    assert.ok(ladder[i].specificPowerWKg > ladder[i - 1].specificPowerWKg, ladder[i].label);
    assert.ok(ladder[i].massKg < ladder[i - 1].massKg);
  }
  // Even the most optimistic rung is still multiple centuries of launch...
  const best = ladder[ladder.length - 2];
  assert.ok(best.centuriesOfLaunch > 1, `${best.label} is only ${best.centuriesOfLaunch} centuries`);
  // ...and mass must be exactly P/(W/kg), with no hidden factor.
  for (const c of ladder) assert.ok(Math.abs(c.massKg - loadMassKg(c.specificPowerWKg)) < 1e-6);
  assert.ok(Math.abs(loadMassKg(1) - P_I) < 1e-3, "one W/kg must give one kg per watt");
});
