import assert from "node:assert/strict";
import test from "node:test";
import {
  TEST_MODES,
  accelerable,
  amdahlSpeedup,
  fractionImpliedByClosingTheGap,
  impliedCognitiveFraction,
  speedupCeiling,
  speedupLadder,
  unaccelerable,
  verification,
} from "./qualification.ts";
import { combinedLifetimeYr } from "./environment.ts";
import { organisationalGap, regimes } from "./acceleration.ts";

/**
 * M24 locks. The load-bearing one is the verification dominance: if building
 * ever stops being two orders faster than knowing, the module's whole point is
 * gone and the synthesis needs rewriting rather than this test relaxing.
 */

test("[RESULT] build 232 days, verify 69 years, dominance x109", () => {
  const v = verification();
  assert.ok(Math.abs(v.buildYears * 365.25 - 232) < 5, `${(v.buildYears * 365.25).toFixed(0)} days`);
  assert.ok(Math.abs(v.verifyYears - combinedLifetimeYr()) < 1e-12, "must be M12's own lifetime");
  assert.ok(v.dominanceX > 80 && v.dominanceX < 140, `×${v.dominanceX.toFixed(0)}`);
  // The build must come from M23's floor, not a fresh literal.
  assert.ok(Math.abs(v.buildYears - regimes().find((r) => r.id === "floor")!.yearsToTypeI) < 1e-12);
  // A shorter-lived array is quicker to qualify, proportionally.
  assert.ok(Math.abs(verification(10).dominanceX / v.dominanceX - 10 / combinedLifetimeYr()) < 1e-9);
});

test("Amdahl behaves at both ends and the ceiling is 1/(1-f)", () => {
  // No cognitive fraction, no speedup, however fast the thinking.
  assert.ok(Math.abs(amdahlSpeedup(0, Infinity) - 1) < 1e-12);
  // All of it, and the speedup is unbounded.
  assert.ok(amdahlSpeedup(1, Infinity) > 1e6);
  // Finite speedup on half the schedule can never exceed two.
  assert.ok(amdahlSpeedup(0.5, 1e9) < 2 + 1e-6);
  assert.ok(Math.abs(speedupCeiling(0.5) - 2) < 1e-9);
  assert.ok(Math.abs(speedupCeiling(0.9) - 10) < 1e-9);
  // Monotone in both arguments.
  assert.ok(amdahlSpeedup(0.9, 10) > amdahlSpeedup(0.9, 5));
  assert.ok(speedupCeiling(0.95) > speedupCeiling(0.9));
  // Out-of-domain fractions must clamp rather than go negative.
  assert.ok(amdahlSpeedup(-0.5, 10) > 0 && amdahlSpeedup(1.5, 10) > 0);
});

test("[RESULT] closing M23's gap means claiming 99.4% of the schedule is thinking", () => {
  const f = fractionImpliedByClosingTheGap();
  assert.ok(Math.abs(f - 0.9937) < 0.001, `${(f * 100).toFixed(2)}%`);
  // And it must be the exact inverse of M23's measured gap.
  assert.ok(Math.abs(speedupCeiling(f) - organisationalGap()) < 1e-6);
  // The inversion round-trips at every scale.
  for (const s of [2, 10, 159, 1000]) {
    assert.ok(Math.abs(speedupCeiling(impliedCognitiveFraction(s)) - s) / s < 1e-9, `${s}`);
  }
});

test("[RESULT] what a plausible cognitive fraction actually buys", () => {
  const ladder = speedupLadder();
  // More thinking in the schedule, more speedup, sooner arrival. Monotone.
  for (let i = 1; i < ladder.length; i++) {
    assert.ok(ladder[i].ceiling > ladder[i - 1].ceiling);
    assert.ok(ladder[i].yearsToFirstWall < ladder[i - 1].yearsToFirstWall);
    assert.ok(ladder[i].yearsToTypeI < ladder[i - 1].yearsToTypeI);
  }
  // Even at 95% thinking, Type I is decades — the wall is what arrives.
  const best = ladder[ladder.length - 1];
  assert.ok(best.yearsToFirstWall < 1, `wall in ${best.yearsToFirstWall.toFixed(1)} yr`);
  assert.ok(best.yearsToTypeI > 4, `Type I still ${best.yearsToTypeI.toFixed(1)} yr away`);
  // And half-thinking buys only a doubling of pace, which is the honest case.
  const half = ladder[0];
  assert.ok(Math.abs(half.ceiling - 2) < 1e-9);
  assert.ok(half.yearsToFirstWall > 4 && half.yearsToFirstWall < 7);
});

test("[RESULT] the test-mode split is about known rates, not about effort", () => {
  assert.ok(accelerable().length >= 2 && unaccelerable().length >= 3);
  for (const m of TEST_MODES) assert.ok(m.why.length > 50, `${m.id} has no reason`);
  // Dose and cycles accelerate; coupled effects, the acceleration factor itself
  // and unknown mechanisms do not. Those three are the whole argument.
  assert.ok(accelerable().every((m) => ["dose", "thermal-cycles"].includes(m.id)));
  for (const id of ["coupled", "acceleration-factor", "unknown-mechanism"]) {
    assert.equal(TEST_MODES.find((m) => m.id === id)!.accelerable, false, id);
  }
});

test("[KNOWN_LIMIT] verification time is the pessimistic bound, and f is not estimated", () => {
  // Stated so nobody reads 69 years as a prediction of how long qualification
  // takes: it is the bound you get with no partial qualification, no staged
  // deployment and no fleet learning, none of which are modelled.
  const v = verification();
  assert.equal(v.verifyYears, combinedLifetimeYr());
  // And the module must never hand back an f of its own — only conversions.
  const f = fractionImpliedByClosingTheGap();
  assert.ok(f > 0 && f < 1, "f is derived from a claim, never asserted");
  assert.ok(Math.abs(f - impliedCognitiveFraction(organisationalGap())) < 1e-12);
});
