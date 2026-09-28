import assert from "node:assert/strict";
import test from "node:test";
import {
  BRAIN_OPS_PER_S,
  BRAIN_W,
  SILICON_J_PER_FLOP,
  brainEquivalents,
  brainJPerOp,
  efficiencyComparison,
  efficiencyPoint,
  escapeThreshold,
  powerForComputation,
  responsesPerPersonPerSecond,
  runwayBeatsThreshold,
  runwayCases,
  typeIResponsesPerSecond,
} from "./substitution.ts";
import { P_I } from "./kardashev.ts";
import { POPULATION } from "./constants.ts";
import { powerCeilingW } from "./thermal.ts";
import { LOGIC_J_PER_BIT_OP, MOVEMENT_J_PER_BIT, practicalFloorJPerBit, runway } from "./reject.ts";

/**
 * M16 locks. The load-bearing one is the escape threshold: if that number ever
 * rises above M10's runway figures the challenge dissolves, and the synthesis
 * has to be rewritten rather than the test relaxed.
 */

test("[THE CHALLENGE] the escape threshold is ~52, and both runways beat it", () => {
  const e = escapeThreshold(0.1);
  assert.ok(Math.abs(e.factor - 52.1) < 1, `escape factor ${e.factor}`);
  assert.ok(Math.abs(e.terrestrialCeilingW - powerCeilingW(0.1)) < 1e-6, "must use M6's own ceiling");
  // This is the whole point: the available runway is larger than the threshold.
  assert.ok(e.logicRunwayX > e.factor, "logic runway must exceed the threshold");
  assert.ok(e.movementRunwayX > e.factor * 1e5, "and movement must exceed it by orders");
  assert.ok(runwayBeatsThreshold(LOGIC_J_PER_BIT_OP));
  assert.ok(runwayBeatsThreshold(MOVEMENT_J_PER_BIT));
  // A tighter thermal budget makes the challenge stronger, not weaker.
  assert.ok(escapeThreshold(0.01).factor > e.factor);
});

test("the escape threshold is P_I over the ceiling and nothing else", () => {
  // Guard against the number drifting into a fitted constant.
  const e = escapeThreshold(0.1);
  assert.ok(Math.abs(e.factor - P_I / powerCeilingW(0.1)) < 1e-9);
  assert.ok(Math.abs(e.ordersOfMagnitude - Math.log10(e.factor)) < 1e-12);
});

test("[RESULT] spending the runway takes Type I compute below the crust ceiling", () => {
  const cases = runwayCases();
  const logic = cases.find((c) => c.term === "logic")!;
  const movement = cases.find((c) => c.term === "data movement")!;
  // Logic alone: 8.1 TW, under half of today's world TES.
  assert.ok(Math.abs(logic.powerAtFloorW / 1e12 - 8.12) < 0.2, `${logic.powerAtFloorW}`);
  assert.ok(logic.powerAtFloorW < powerCeilingW(0.1), "logic runway alone already fits the crust");
  // Movement: 101 MW. Absurd, and offered as a reductio on the bound.
  assert.ok(movement.powerAtFloorW < 2e8, `${movement.powerAtFloorW} W`);
  assert.ok(movement.headroomX / logic.headroomX > 1e4, "movement has far more headroom than logic");
  // M3 says movement is the binding term today, so the larger runway is on the
  // term that actually matters. That is what makes the challenge sharp.
  assert.ok(MOVEMENT_J_PER_BIT > LOGIC_J_PER_BIT_OP);
});

test("the substitution law is exactly P = R * J/op", () => {
  assert.equal(powerForComputation(0, 1e-15), 0);
  assert.ok(Math.abs(powerForComputation(1e20, 1e-15) - 1e5) < 1e-9);
  // Halving the joules must halve the watts. If this ever fails the module's
  // entire argument is gone.
  const a = powerForComputation(1e20, 2e-15);
  const b = powerForComputation(1e20, 1e-15);
  assert.ok(Math.abs(a / b - 2) < 1e-12);
});

test("[RESULT] biology beats silicon by about one order, not six", () => {
  const c = efficiencyComparison();
  assert.ok(Math.abs(c.brainLeadX - 17.7) < 1, `brain lead ×${c.brainLeadX.toFixed(1)}`);
  // Both sit several orders above the practical floor — neither has spent it.
  assert.ok(c.brain.ordersOverFloor > 4 && c.brain.ordersOverFloor < 6, `${c.brain.ordersOverFloor}`);
  assert.ok(c.silicon.ordersOverFloor > 5 && c.silicon.ordersOverFloor < 7);
  assert.ok(c.silicon.ordersOverFloor > c.brain.ordersOverFloor, "silicon must be the further of the two");
  assert.ok(Math.abs(c.floor - practicalFloorJPerBit()) < 1e-30);
  // Swept across the published range for synaptic rate, the conclusion holds:
  // the brain never becomes a qualitatively different kind of machine.
  for (const ops of [1e14, 1e15, 1e16]) {
    const lead = efficiencyComparison(ops).brainLeadX;
    assert.ok(lead > 1 && lead < 200, `at ${ops} ops/s the lead is ×${lead}`);
  }
});

test("brain energy per operation inverts its power and rate", () => {
  assert.ok(Math.abs(brainJPerOp(1e15, 20) - 2e-14) < 1e-25);
  assert.ok(Math.abs(brainJPerOp(BRAIN_OPS_PER_S, BRAIN_W) * BRAIN_OPS_PER_S - BRAIN_W) < 1e-12);
  // And a point must agree with M10's runway for the same input.
  const p = efficiencyPoint("x", SILICON_J_PER_FLOP);
  assert.ok(Math.abs(p.landauerX - runway(SILICON_J_PER_FLOP).landauerX) < 1e-6);
});

test("what the watts buy, as unit conversions and labelled as such", () => {
  const perSecond = typeIResponsesPerSecond();
  // ~8.6e12 frontier responses per second at M3's measured serving cost.
  assert.ok(perSecond > 5e12 && perSecond < 1.5e13, `${perSecond}/s`);
  assert.ok(Math.abs(responsesPerPersonPerSecond() * POPULATION - perSecond) < 1e-3);
  assert.ok(responsesPerPersonPerSecond() > 500 && responsesPerPersonPerSecond() < 2000);
  // 5e14 brain-equivalents, ~61,000 per living human.
  const b = brainEquivalents();
  assert.ok(Math.abs(b.brains - P_I / BRAIN_W) < 1e-3);
  assert.ok(b.perPerson > 4e4 && b.perPerson < 8e4, `${b.perPerson} per person`);
  // Linear in power, because they are conversions and nothing more.
  assert.ok(Math.abs(brainEquivalents(P_I / 2).brains / b.brains - 0.5) < 1e-12);
});

test("[KNOWN_LIMIT] the challenge must never be quoted as refuting the orbital chain", () => {
  // M6-M15 are about 10^16 W of any kind. The escape only applies to the share
  // of the load that is computation, and this test exists to keep that visible:
  // the threshold is derived from the SAME ceiling M6 uses for every load.
  const e = escapeThreshold(0.1);
  assert.equal(e.terrestrialCeilingW, powerCeilingW(0.1));
  // Non-compute load has no runway, so for it the factor is 1 by construction.
  assert.ok(P_I / 1 > e.terrestrialCeilingW, "unimproved load still has to leave the crust");
});
