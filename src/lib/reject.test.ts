import assert from "node:assert/strict";
import test from "node:test";
import { P_I } from "./kardashev.ts";
import { SIGMA, blackbodyWm2 } from "./physics.ts";
import { COLLECTOR_W_M2 } from "./lift.ts";
import {
  BOLTZMANN,
  LOGIC_J_PER_BIT_OP,
  MOVEMENT_J_PER_BIT,
  RADIATOR_EMISSIVITY,
  REJECT_VERDICT,
  THESIS_CHALLENGE,
  landauerJPerBit,
  leverComparison,
  massUnderstatementX,
  optimalRadiatorK,
  practicalFloorJPerBit,
  radiatorAreaM2,
  radiatorFluxWm2,
  runway,
  systemMass,
} from "./reject.ts";

test("radiator flux is sigma T^4 and the 3 K sink is genuinely negligible", () => {
  const f = radiatorFluxWm2(320);
  assert.ok(Math.abs(f - 505) < 5, `${f} W/m2`);
  // physics.ts::blackbodyWm2 omits the 3 K background; this one subtracts it.
  // The gap between them IS that term, and it is eight parts in a billion.
  const bare = blackbodyWm2(320, RADIATOR_EMISSIVITY);
  const backgroundWm2 = RADIATOR_EMISSIVITY * SIGMA * 3 ** 4;
  assert.ok(Math.abs(bare - f - backgroundWm2) < 1e-12, "the gap should be exactly the sink term");
  assert.ok(backgroundWm2 / f < 1e-8, `background is ${backgroundWm2 / f} of the flux`);
  // T^4: doubling the temperature is sixteen times the flux.
  assert.ok(Math.abs(radiatorFluxWm2(640) / f - 16) < 0.01);
});

test("[CORRECTION] M7 and M8 costed the collector only", () => {
  // If the load is in orbit, all of it becomes heat that must be radiated.
  const s = systemMass({ junctionK: 320 });
  assert.ok(Math.abs(s.radiatorAreaM2 / 1e12 - 19.8) < 0.5, `${s.radiatorAreaM2 / 1e12}e12 m2`);
  assert.ok(Math.abs(s.collectorAreaM2 / 1e12 - 29.7) < 0.5);
  // The radiator is the same order as the collector — and heavier.
  assert.ok(s.radiatorKg > s.collectorKg, "radiator should outweigh the collector at 320 K");
  // So every flight count in M7/M8 is about half what it should be.
  const x = massUnderstatementX(320);
  assert.ok(x > 1.9 && x < 2.2, `${x}x`);
  assert.ok(Math.abs(REJECT_VERDICT.liftAndCollectorUnderstatedX - x) < 1e-12);
  // Consistency with the rest of the repo.
  assert.ok(Math.abs(s.collectorAreaM2 - P_I / COLLECTOR_W_M2) < 1e6);
});

test("[RESULT] pumping heat above the junction barely pays", () => {
  // The Carnot work must ALSO be rejected, so most of the T^4 gain pays for
  // its own lift. The optimum is shallow and the surface is flat.
  const best = optimalRadiatorK(350);
  assert.ok(best.radiatorK > 350, "the optimum should be above the junction");
  assert.ok(best.radiatorK < 500, `${best.radiatorK} K`);
  const l = leverComparison(350, 400);
  assert.ok(l.pumpingSaves > 0.02 && l.pumpingSaves < 0.12, `${l.pumpingSaves}`);
  // Flat: 60 K either side of the optimum costs under 5%.
  const lo = systemMass({ junctionK: 350, radiatorK: best.radiatorK - 60 });
  const hi = systemMass({ junctionK: 350, radiatorK: best.radiatorK + 60 });
  assert.ok(lo.totalKg / best.totalKg < 1.05);
  assert.ok(hi.totalKg / best.totalKg < 1.05);
});

test("[RESULT] hot silicon beats heat pumps by about three to one", () => {
  const l = leverComparison(350, 400);
  // 50 K of junction temperature, passively, is worth ~17%.
  assert.ok(l.hotterSaves > 0.12, `${l.hotterSaves}`);
  // Against ~6% for an optimally pumped loop.
  assert.ok(l.hotterSaves > l.pumpingSaves * 2, "the ordering is the finding");
  assert.equal(REJECT_VERDICT.hotSiliconBeatsHeatPumps, true);
  // And it is a semiconductor programme, not a thermal one.
  assert.ok(REJECT_VERDICT.note.includes("50 K hotter"));
});

test("a passive system is exactly the no-pump case", () => {
  const passive = systemMass({ junctionK: 350 });
  assert.equal(passive.pumpWorkW, 0);
  assert.equal(passive.cop, Infinity);
  assert.equal(passive.radiatorK, passive.junctionK);
  // Supply equals the load when nothing is being pumped.
  assert.ok(Math.abs(passive.collectorAreaM2 - P_I / COLLECTOR_W_M2) < 1e6);
  assert.ok(Math.abs(passive.radiatorAreaM2 - radiatorAreaM2(P_I, 350)) < 1e6);
});

test("Landauer sets the floor, and it is kT ln2", () => {
  assert.ok(Math.abs(landauerJPerBit(300) - BOLTZMANN * 300 * Math.LN2) < 1e-30);
  assert.ok(Math.abs(landauerJPerBit(300) - 2.87e-21) < 5e-23);
  // Linear in temperature: a colder machine has a lower floor.
  assert.ok(Math.abs(landauerJPerBit(600) / landauerJPerBit(300) - 2) < 1e-12);
  // Reliable switching needs margin over kT.
  assert.ok(practicalFloorJPerBit(300) > landauerJPerBit(300) * 50);
});

test("[THE CHALLENGE] efficiency can substitute for watts, for a while", () => {
  const logic = runway(LOGIC_J_PER_BIT_OP);
  const movement = runway(MOVEMENT_J_PER_BIT);
  // Logic sits ~10^5 above Landauer, ~10^3 above a practical floor.
  assert.ok(logic.landauerX > 1e4 && logic.landauerX < 1e6, `${logic.landauerX}`);
  assert.ok(logic.ordersOfMagnitude > 2 && logic.ordersOfMagnitude < 4);
  // Data movement is much further out — and M3 said movement is what binds.
  assert.ok(movement.landauerX > 1e9, `${movement.landauerX}`);
  assert.ok(movement.ordersOfMagnitude > logic.ordersOfMagnitude + 4);
  // So the thesis holds only after the runway is spent.
  assert.equal(THESIS_CHALLENGE.energyEventIsDeferred, true);
  assert.ok(THESIS_CHALLENGE.note.includes("deferred"));
});
