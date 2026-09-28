import assert from "node:assert/strict";
import test from "node:test";
import {
  firstWall,
  groundSolarAllLandW,
  launchCeilingW,
  rungs,
  soonerThanTypeIX,
  walls,
} from "./sequence.ts";
import { GROWTH, P_2023, P_I, kOf } from "./kardashev.ts";
import { greenhouseCrossoverW, groundSolarLandFraction, powerCeilingW } from "./thermal.ts";

/**
 * M19 locks. The load-bearing one is that the first wall is not Type I — if that
 * ever stops holding, the repo's whole framing has to change rather than this
 * test being relaxed.
 */

test("[RESULT] the first wall is the thermal ceiling, not Type I", () => {
  const first = firstWall();
  assert.equal(first.id, "thermal-01k", `first wall is ${first.id}`);
  // K 0.828, ×9.8, 3.3 doublings — against ×509 and 9 doublings for Type I.
  assert.ok(Math.abs(first.k - 0.828) < 0.005, `K = ${first.k.toFixed(3)}`);
  assert.ok(Math.abs(first.multipleOfToday - 9.8) < 0.3, `×${first.multipleOfToday.toFixed(1)}`);
  assert.ok(Math.abs(first.doublingsFromToday - 3.29) < 0.05);
  // The headline contrast: it is a third of the way to Type I in doublings.
  const typeI = rungs().find((r) => r.id === "type-i")!;
  assert.ok(typeI.doublingsFromToday / first.doublingsFromToday > 2.5);
  assert.ok(Math.abs(soonerThanTypeIX() - 2.73) < 0.1, `${soonerThanTypeIX()}× sooner`);
});

test("the ladder is ordered, and Type I is last", () => {
  const rs = rungs();
  for (let i = 1; i < rs.length; i++) {
    assert.ok(rs[i].powerW > rs[i - 1].powerW, `${rs[i].id} out of order`);
    assert.ok(rs[i].k > rs[i - 1].k, "K must rise with power");
    assert.ok(rs[i].doublingsFromToday > rs[i - 1].doublingsFromToday);
  }
  assert.equal(rs[0].id, "today", "the axis must start at today");
  assert.equal(rs[rs.length - 1].id, "type-i", "Type I must be last, not first");
  // Three walls sit between today and Type I. That is the point of the module.
  assert.ok(rs.length - 2 >= 3, "at least three walls arrive before Type I");
});

test("every rung agrees with the module that owns it", () => {
  // No wall may be a literal typed into this file — each has to come from its
  // own module, or the ladder drifts from the physics it summarises.
  const byId = Object.fromEntries(rungs().map((r) => [r.id, r]));
  assert.equal(byId["today"].powerW, P_2023);
  assert.equal(byId["type-i"].powerW, P_I);
  assert.equal(byId["thermal-01k"].powerW, powerCeilingW(0.1));
  assert.equal(byId["thermal-05k"].powerW, powerCeilingW(0.5));
  assert.equal(byId["greenhouse-crossover"].powerW, greenhouseCrossoverW());
  assert.equal(byId["ground-solar-land"].powerW, groundSolarAllLandW());
  // And K must be computed, never stored.
  for (const r of rungs()) assert.ok(Math.abs(r.k - kOf(r.powerW)) < 1e-12);
});

test("a looser temperature budget moves the wall, and by the right amount", () => {
  // The ceiling is linear in the budget, so five times the temperature must be
  // five times the power. If that fails, thermal.ts is not doing what M6 says.
  assert.ok(Math.abs(powerCeilingW(0.5) / powerCeilingW(0.1) - 5) < 0.01);
  const rs = rungs();
  const tight = rs.find((r) => r.id === "thermal-01k")!;
  const loose = rs.find((r) => r.id === "thermal-05k")!;
  assert.ok(loose.powerW > tight.powerW);
  // Which is exactly why both are on the ladder: the budget is visibly a dial.
  assert.equal(tight.kind, "budget");
  assert.equal(loose.kind, "budget");
});

test("[HONESTY] budgets, comparisons and physical limits are distinguished", () => {
  const w = walls();
  const kinds = new Set(w.map((x) => x.kind));
  assert.ok(kinds.has("budget") && kinds.has("physical") && kinds.has("comparison"));
  // The one wall no budget can move must be labelled as such, and it must be
  // the land-area one — geometry, not thermodynamics.
  const physical = w.filter((x) => x.kind === "physical");
  assert.equal(physical.length, 1);
  assert.equal(physical[0].id, "ground-solar-land");
  // Every wall must carry a note. A bare number on a ladder is propaganda.
  for (const x of w) assert.ok(x.note.length > 40, `${x.id} has no note`);
});

test("ground solar's land wall follows from M6's own fraction", () => {
  // Type I needs 1.68× all land, so all-land is reached at P_I over that.
  const frac = groundSolarLandFraction(P_I);
  assert.ok(frac > 1.5 && frac < 2, `land fraction ${frac}`);
  assert.ok(Math.abs(groundSolarAllLandW() * frac - P_I) < 1e6);
  assert.ok(groundSolarAllLandW() < P_I, "it must arrive before Type I");
});

test("inertial years are consistent with the growth rate they assume", () => {
  const rs = rungs();
  for (const r of rs) {
    const check = Math.log(r.powerW / P_2023) / Math.log(1 + GROWTH);
    assert.ok(Math.abs(r.inertialYears - check) < 1e-9);
  }
  assert.equal(rs.find((r) => r.id === "today")!.inertialYears, 0);
  // ~128 years to the first wall, ~349 to Type I.
  assert.ok(Math.abs(firstWall().inertialYears - 128) < 3);
  // A faster world reaches every wall sooner, monotonically.
  const fast = rungs(0.03);
  for (const r of fast) {
    const slow = rs.find((x) => x.id === r.id)!;
    assert.ok(r.inertialYears <= slow.inertialYears + 1e-9, r.id);
  }
});

test("[KNOWN_LIMIT] the launch ceiling is a rate, not a wall, and is not on the ladder", () => {
  // M8's A_max = R·L is a ceiling you cannot pass at a given build rate, which
  // is a different kind of object from a thermal budget. Computed here so the
  // number exists, deliberately kept off the ordered ladder.
  const ceiling = launchCeilingW(100);
  assert.ok(ceiling > 0.5 * P_I && ceiling < P_I, `${ceiling / P_I} of Type I`);
  assert.ok(!walls().some((w) => w.id.includes("launch")), "it must not be on the ladder");
  // And it must scale linearly with cadence, which is what makes it a rate.
  assert.ok(Math.abs(launchCeilingW(200) / ceiling - 2) < 1e-9);
});
