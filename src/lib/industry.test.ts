import assert from "node:assert/strict";
import test from "node:test";
import {
  PROCESSES,
  carnotHeatingRunway,
  computeShareToday,
  meanNonComputeRunway,
  nonComputeSensitivity,
  processRunway,
  requiredComputeShare,
  requiredComputeShareAtBestCase,
  shareLadder,
  totalReduction,
} from "./industry.ts";
import { LOGIC_J_PER_BIT_OP, MOVEMENT_J_PER_BIT, runway } from "./reject.ts";
import { escapeThreshold } from "./substitution.ts";

/**
 * M17 locks. The load-bearing one is the insensitivity of the required compute
 * share to compute's own runway — that is what makes the condition robust rather
 * than a consequence of one assumed efficiency figure.
 */

test("[RESULT] every industrial process is a small single-digit multiple of its floor", () => {
  assert.ok(PROCESSES.length >= 5);
  for (const p of PROCESSES) {
    const r = processRunway(p);
    assert.ok(r > 1, `${p.id} cannot beat its own thermodynamic minimum`);
    assert.ok(r < 5, `${p.id} runs at ×${r.toFixed(2)} — outside the single-digit claim`);
    assert.ok(p.minimum > 0 && p.actual > p.minimum);
  }
  const mean = meanNonComputeRunway();
  assert.ok(Math.abs(mean - 2.31) < 0.1, `mean ×${mean.toFixed(2)}`);
});

test("[RESULT] compute is the anomaly, by three to eight orders", () => {
  const industry = meanNonComputeRunway();
  const logic = runway(LOGIC_J_PER_BIT_OP).headroomX;
  const movement = runway(MOVEMENT_J_PER_BIT).headroomX;
  // This is the sentence M16 asserted. Here it is as a number.
  assert.ok(logic / industry > 400, `logic is only ×${(logic / industry).toFixed(0)} above industry`);
  assert.ok(Math.log10(movement / industry) > 7, "movement should be seven-plus orders above industry");
  // And no industrial process comes close to even the logic runway.
  for (const p of PROCESSES) assert.ok(processRunway(p) * 100 < logic, p.id);
});

test("[THE CONDITION] the escape needs a >=95% compute economy", () => {
  const share = requiredComputeShare();
  assert.ok(share > 0.94 && share < 0.97, `f_c = ${(share * 100).toFixed(2)}%`);
  // And at that share the blend must actually reach M16's target.
  const target = escapeThreshold(0.1).factor;
  assert.ok(Math.abs(totalReduction(share) / target - 1) < 0.01, "the inversion must round-trip");
});

test("[ROBUSTNESS] the answer barely depends on compute's own runway", () => {
  // This is what makes the condition load-bearing rather than a consequence of
  // one assumed efficiency. Even infinite compute efficiency cannot rescue it.
  const atLogic = requiredComputeShare({ computeRunway: runway(LOGIC_J_PER_BIT_OP).headroomX });
  const atMovement = requiredComputeShare({ computeRunway: runway(MOVEMENT_J_PER_BIT).headroomX });
  const atInfinity = requiredComputeShareAtBestCase();
  assert.ok(Math.abs(atLogic - atInfinity) < 0.01, "logic vs infinite must differ by under a point");
  assert.ok(Math.abs(atMovement - atInfinity) < 1e-3);
  assert.ok(atInfinity > 0.94, `even at infinite compute efficiency, f_c >= ${(atInfinity * 100).toFixed(2)}%`);
  // Ordering: a bigger compute runway can only lower the requirement.
  assert.ok(atMovement <= atLogic);
});

test("[ROBUSTNESS] and it never becomes a small number across the industry range", () => {
  const sweep = nonComputeSensitivity([2, 2.5, 3, 5, 10]);
  for (const s of sweep) {
    assert.ok(s.requiredComputeShare > 0.8, `at ×${s.nonComputeRunway} the share is ${s.requiredComputeShare}`);
  }
  // Monotone: more industrial runway lowers the compute share needed.
  for (let i = 1; i < sweep.length; i++) {
    assert.ok(sweep[i].requiredComputeShare < sweep[i - 1].requiredComputeShare);
  }
  // Even a tenfold industrial improvement still demands four fifths compute.
  assert.ok(sweep.find((s) => s.nonComputeRunway === 10)!.requiredComputeShare > 0.8);
});

test("the blend is harmonic and dominated by the small term", () => {
  // Pure compute must give the compute runway, pure industry the industry one.
  const rc = runway(LOGIC_J_PER_BIT_OP).headroomX;
  const rnc = meanNonComputeRunway();
  assert.ok(Math.abs(totalReduction(1) - rc) / rc < 1e-9);
  assert.ok(Math.abs(totalReduction(0) - rnc) / rnc < 1e-9);
  // A half-and-half economy must land far nearer the small term than the large.
  const half = totalReduction(0.5);
  assert.ok(half < 2 * rnc, `half-and-half gives ×${half.toFixed(2)}, should be near industry's ×${rnc.toFixed(2)}`);
  // Monotone increasing in compute share, on the domain.
  for (let i = 0; i < 19; i++) {
    assert.ok(totalReduction((i + 1) / 20) > totalReduction(i / 20));
  }
  // And the share must be clamped: unclamped, a value past 1 makes (1-f)
  // negative and the blend returns a NEGATIVE reduction. A monotonicity walk
  // found that by accumulating floating-point error past 1.0.
  assert.ok(totalReduction(1.05) > 0, "an out-of-domain share must not go negative");
  assert.equal(totalReduction(1.05), totalReduction(1));
  assert.equal(totalReduction(-0.2), totalReduction(0));
});

test("today's mix does not escape, and the ladder says where it would", () => {
  const today = computeShareToday();
  // Data centres are a fraction of a percent of total energy supply.
  assert.ok(today.ofTes < 0.01, `${(today.ofTes * 100).toFixed(2)}% of TES`);
  assert.ok(today.ofElectricity > today.ofTes, "electricity is a subset of TES");
  const ladder = shareLadder();
  assert.ok(!ladder[0].escapes, "today's mix must not escape");
  assert.ok(Math.abs(ladder[0].totalReductionX - 2.31) < 0.1, "and buys only the industrial runway");
  assert.ok(ladder[ladder.length - 1].escapes, "a 99% compute economy must escape");
  // The flag must flip exactly once, at the top.
  const first = ladder.findIndex((c) => c.escapes);
  assert.ok(ladder.slice(first).every((c) => c.escapes));
});

test("[KNOWN_LIMIT] heating is Carnot-bound and excluded from the mean", () => {
  // Stated so nobody folds it in silently: heating has real runway, ~×15, and
  // it is deliberately not in PROCESSES.
  const heat = carnotHeatingRunway(293, 273);
  assert.ok(heat > 10 && heat < 20, `×${heat.toFixed(1)}`);
  assert.ok(heat > meanNonComputeRunway() * 4, "heating has far more headroom than reactions");
  assert.ok(!PROCESSES.some((p) => p.id === "heating"), "and it must not be in the mean");
  // Smaller lift, more headroom — the relation must not be inverted.
  assert.ok(carnotHeatingRunway(293, 283) > heat);
});
