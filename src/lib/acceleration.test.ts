import assert from "node:assert/strict";
import test from "node:test";
import {
  COLLECTOR_SPECIFIC_POWER_W_KG,
  PARAMETERS,
  doublingFloorSeconds,
  doublingsTo,
  elastic,
  inelastic,
  organisationalGap,
  regimes,
  wallArrivals,
  wallIsInvariant,
} from "./acceleration.ts";
import { EMBODIED_J_PER_KG } from "./isru.ts";
import { SECONDS_PER_YEAR } from "./constants.ts";
import { firstWall } from "./sequence.ts";
import { P_2023 } from "./kardashev.ts";

/**
 * M23 locks. The load-bearing one is that the wall is invariant across regimes —
 * if intelligence ever appears to move σT⁴, the module has a bug, not a result.
 */

test("[RESULT] the doubling floor is e/p and is independent of scale", () => {
  // The M cancels: a base of any size takes the same time to double, because
  // both its power and its appetite scale with its mass. That is what makes it
  // a floor rather than a scenario.
  const t = doublingFloorSeconds();
  assert.ok(Math.abs(t / 86400 - 7.7) < 0.2, `${(t / 86400).toFixed(1)} days`);
  // Doubling the specific power halves the time; doubling embodied energy doubles it.
  assert.ok(
    Math.abs(doublingFloorSeconds(EMBODIED_J_PER_KG, 2 * COLLECTOR_SPECIFIC_POWER_W_KG) / t - 0.5) < 1e-12,
  );
  assert.ok(Math.abs(doublingFloorSeconds(2 * EMBODIED_J_PER_KG) / t - 2) < 1e-12);
  // And it must come from M8's own hardware, not a fresh literal.
  assert.ok(Math.abs(COLLECTOR_SPECIFIC_POWER_W_KG - 337 / 2.24) < 1e-12);
});

test("[RESULT] the forecast sits 159x above what energy alone allows", () => {
  const gap = organisationalGap();
  assert.ok(gap > 120 && gap < 200, `×${gap.toFixed(0)}`);
  const rs = regimes();
  // Ordered from physics to forecast, and each slower than the last.
  for (let i = 1; i < rs.length; i++) {
    assert.ok(rs[i].doublingYears > rs[i - 1].doublingYears, `${rs[i].id} out of order`);
    assert.ok(rs[i].versusFloor > rs[i - 1].versusFloor);
  }
  assert.equal(rs[0].id, "floor");
  assert.ok(Math.abs(rs[0].versusFloor - 1) < 1e-12, "the floor must be one floor");
  // λ's 101 years must be reproduced, since it is where the number came from.
  assert.ok(Math.abs(rs.find((r) => r.id === "lambda")!.yearsToTypeI - 101) < 2);
});

test("[REDUCTIO] the floor gives a Type I timeline nobody should believe", () => {
  // Stated as a bound, exactly like M16's 101 MW. If this ever reads as a
  // forecast the module has been misquoted.
  const floor = regimes().find((r) => r.id === "floor")!;
  assert.ok(floor.yearsToTypeI < 2, `${floor.yearsToTypeI.toFixed(2)} yr — absurd, and that is the point`);
  assert.ok(floor.yearsToTypeI > 0.1, "but not zero: thirty doublings still take thirty doublings");
});

test("[THE ANSWER] the wall's height is invariant; only the date moves", () => {
  assert.ok(wallIsInvariant(), "no regime may move σT⁴");
  const arrivals = wallArrivals();
  const wall = firstWall();
  // Every regime agrees on K and on the doubling count.
  for (const a of arrivals) {
    assert.ok(Math.abs(a.wallK - wall.k) < 1e-12, `${a.regime} moved the wall`);
    assert.ok(Math.abs(a.doublings - doublingsTo(wall.powerW)) < 1e-12);
    assert.ok(Math.abs(a.doublings - 3.29) < 0.05, "the wall is 3.29 doublings away in every regime");
  }
  // And the dates must span from inertia down to days.
  const inertia = arrivals[0];
  assert.ok(Math.abs(inertia.yearsToFirstWall - 128) < 3, `${inertia.yearsToFirstWall.toFixed(0)} yr`);
  const fastest = arrivals[arrivals.length - 1];
  assert.ok(fastest.yearsToFirstWall < 0.2, `${fastest.yearsToFirstWall} yr`);
  assert.ok(inertia.yearsToFirstWall / fastest.yearsToFirstWall > 500, "the spread in dates is enormous");
  // Ordered fastest-last.
  for (let i = 1; i < arrivals.length; i++) {
    assert.ok(arrivals[i].yearsToFirstWall < arrivals[i - 1].yearsToFirstWall, arrivals[i].regime);
  }
});

test("[RESULT] the classification is complete on both sides and cites its modules", () => {
  assert.ok(inelastic().length >= 6, "the physics side must not be a token entry");
  assert.ok(elastic().length >= 5, "nor the design side");
  // Every parameter must name the module that owns it and say why.
  for (const p of PARAMETERS) {
    assert.ok(p.module.endsWith(".ts"), `${p.id} names no module`);
    assert.ok(p.why.length > 40, `${p.id} has no reason`);
  }
  // The thermal ceiling and the chemical Isp ceiling must both be inelastic —
  // those are the two the chain leans on hardest.
  for (const id of ["crust-ceiling", "chemical-isp", "land-area", "delta-v"]) {
    assert.equal(PARAMETERS.find((p) => p.id === id)!.elasticity, "inelastic", id);
  }
  // And doubling time must be elastic, or the module has no subject.
  assert.equal(PARAMETERS.find((p) => p.id === "doubling-time")!.elasticity, "elastic");
});

test("doublings to a target are logarithmic and anchored on today", () => {
  assert.equal(doublingsTo(P_2023), 0);
  assert.ok(Math.abs(doublingsTo(P_2023 * 2) - 1) < 1e-12);
  assert.ok(Math.abs(doublingsTo(P_2023 * 1024) - 10) < 1e-12);
  // The first wall really is only a third of the way to Type I in doublings.
  assert.ok(doublingsTo(1e16) / doublingsTo(firstWall().powerW) > 2.5);
});

test("[KNOWN_LIMIT] nothing here models cognition reaching hardware", () => {
  // The module answers "which parameters could move" and "how far energy lets
  // them". It does not and cannot model the latency from a design existing to a
  // factory existing, which is the actual mechanism. Guard: no regime is derived
  // from anything about intelligence at all — they are all energy or history.
  const rs = regimes();
  assert.equal(rs.length, 3);
  // Floor from thermodynamics, industrial from M11's assumed productivity,
  // lambda from a curve fit. None of the three contains a takeoff model.
  assert.ok(Math.abs(rs[0].doublingYears - doublingFloorSeconds() / SECONDS_PER_YEAR) < 1e-12);
});
