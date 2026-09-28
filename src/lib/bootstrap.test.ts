import assert from "node:assert/strict";
import test from "node:test";
import {
  AREAL_TODAY_KG_M2,
  LOOP,
  SINGULARITY_RATE,
  STARTING_AREA_M2,
  deliveredKgPerYear,
  growthExponent,
  learningLeverage,
  sensitivity,
  yearsToBuild,
} from "./bootstrap.ts";
import { TYPE_I_AREA_M2 } from "./collector.ts";
import { requiredArealRate, wrightExponent } from "./learning.ts";
import { yearsAccelerating } from "./forecast.ts";

/**
 * M27 locks. The load-bearing one is that growth is polynomial: if this ever
 * comes out exponential, the module has confused learning with self-replication
 * and the chain's whole doubling framing needs revisiting rather than this test.
 */

test("[RESULT] the loop gives polynomial growth, never doublings", () => {
  // A ∝ t^(1/(1−b)). At the required rate that is t^1.43 — superlinear and
  // nothing like exponential.
  const e = growthExponent(requiredArealRate());
  assert.ok(Math.abs(e - 1.43) < 0.05, `t^${e.toFixed(2)}`);
  assert.ok(e > 1, "it must be superlinear, or learning is doing nothing");
  assert.ok(Number.isFinite(e), "and finite, or the model is out of domain");
  // No learning is exactly linear: a fixed launch rate builds at a fixed rate.
  assert.ok(Math.abs(growthExponent(0) - 1) < 1e-12);
  // Faster learning, higher exponent. Monotone.
  assert.ok(growthExponent(0.3) > growthExponent(0.2));
});

test("[THE BOUNDARY] at 50% the model leaves its domain rather than predicting", () => {
  // b = 1 exactly at r = 0.5, and beyond it the integral diverges in finite time.
  assert.ok(Math.abs(wrightExponent(SINGULARITY_RATE) - 1) < 1e-12);
  assert.equal(growthExponent(SINGULARITY_RATE), Infinity);
  assert.equal(yearsToBuild(TYPE_I_AREA_M2, { learningRate: 0.6 }), Infinity);
  // Just below it must still answer, and answer fast.
  const near = yearsToBuild(TYPE_I_AREA_M2, { learningRate: 0.49 });
  assert.ok(Number.isFinite(near) && near >= 0, `${near}`);
});

test("[RESULT] no learning at all is fifty thousand years", () => {
  const none = yearsToBuild(TYPE_I_AREA_M2, { learningRate: 0 });
  assert.ok(Math.abs(none - 50_490) / 50_490 < 0.02, `${none.toFixed(0)} yr`);
  // And it must be exactly mass over rate, since b = 0 collapses the integral.
  const direct = (TYPE_I_AREA_M2 * AREAL_TODAY_KG_M2) / deliveredKgPerYear(100);
  assert.ok(Math.abs(none - direct) / direct < 0.001, "b=0 must reduce to mass/rate");
});

test("[RESULT] learning at the required rate is worth x470 on the schedule", () => {
  const lev = learningLeverage();
  assert.ok(lev > 350 && lev < 600, `×${lev.toFixed(0)}`);
  // Which lands the timeline within sight of λ's own answer, from a mechanism
  // rather than a fit. NOT a derivation — see the sensitivity test below.
  const years = yearsToBuild(TYPE_I_AREA_M2, { learningRate: requiredArealRate() });
  assert.ok(Math.abs(years - 107) < 8, `${years.toFixed(0)} yr`);
  assert.ok(Math.abs(years / yearsAccelerating() - 1) < 0.25, "λ must be inside the same neighbourhood");
});

test("[HONESTY] the starting area dominates, so the match is a range not a result", () => {
  const rows = sensitivity([requiredArealRate()], [1e3, 1e4, 1e5, 1e6]);
  const ys = rows.map((r) => r.years);
  // Three decades of starting area move the answer by nearly an order.
  assert.ok(ys[ys.length - 1] / ys[0] > 5, `only ×${(ys[ys.length - 1] / ys[0]).toFixed(1)} spread`);
  // Monotone: starting bigger takes longer, because learning has less room left.
  for (let i = 1; i < ys.length; i++) assert.ok(ys[i] > ys[i - 1]);
  // λ sits inside the range rather than being reproduced by a point.
  assert.ok(ys[0] < yearsAccelerating() && ys[ys.length - 1] > yearsAccelerating());
  assert.equal(STARTING_AREA_M2, 1e4);
});

test("more cadence and lighter hardware both shorten it, in the right direction", () => {
  const base = yearsToBuild(TYPE_I_AREA_M2, { learningRate: 0.187 });
  assert.ok(yearsToBuild(TYPE_I_AREA_M2, { learningRate: 0.187, cadencePerDay: 1000 }) < base);
  assert.ok(yearsToBuild(TYPE_I_AREA_M2, { learningRate: 0.187, arealKgM2: 0.5 }) < base);
  // Ten times the cadence is exactly ten times faster — C is linear in it.
  const ten = yearsToBuild(TYPE_I_AREA_M2, { learningRate: 0.187, cadencePerDay: 1000 });
  assert.ok(Math.abs(base / ten - 10) < 1e-6);
  // And delivered mass must carry M14's GEO penalty, not be a fresh number.
  assert.ok(deliveredKgPerYear(100) < 100 * 365.25 * 1e5, "the GEO penalty must be applied");
});

test("the loop is a closed cycle and every edge has a reason", () => {
  // Four edges returning to their own start. If it ever stops closing, the
  // module's premise is gone.
  const froms = LOOP.map((e) => e.from);
  const tos = LOOP.map((e) => e.to);
  for (const t of tos) assert.ok(froms.includes(t), `${t} is a dead end, not a cycle`);
  assert.equal(LOOP[LOOP.length - 1].to, LOOP[0].from, "the cycle must close");
  for (const e of LOOP) assert.ok(e.why.length > 40, `${e.from}→${e.to} has no reason`);
});
