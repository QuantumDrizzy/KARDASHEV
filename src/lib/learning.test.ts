import assert from "node:assert/strict";
import test from "node:test";
import {
  CURVES,
  ILLUSTRATIVE_MASS_RATE,
  arealGapToGeo,
  buildDoublings,
  doublingsToClose,
  gapCases,
  improvementAfter,
  requiredArealRate,
  requiredRate,
  temptation,
  wrightExponent,
} from "./learning.ts";
import { doublingsRequired, typeISystemMassKg } from "./isru.ts";

/**
 * M25 locks. The load-bearing one is the units guard: a cost learning rate must
 * never be allowed to close a mass gap, and that is enforced here rather than
 * left to a reader's care.
 */

test("[RESULT] the required rate is 18.7% per doubling, in areal density", () => {
  const r = requiredArealRate();
  assert.ok(Math.abs(r - 0.187) < 0.005, `${(r * 100).toFixed(1)}%`);
  // It must close the gap in exactly the doublings the build supplies.
  const gap = arealGapToGeo();
  assert.ok(Math.abs(improvementAfter(buildDoublings(), r) / gap - 1) < 1e-6, "the inversion must round-trip");
  // And the build's doublings must come from M11, not a literal.
  assert.ok(Math.abs(buildDoublings() - doublingsRequired(typeISystemMassKg())) < 1e-12);
  assert.ok(Math.abs(buildDoublings() - 30.1) < 0.3);
});

test("[THE TRAP] the tempting rate and the required rate are in different units", () => {
  const t = temptation();
  // PV cost learning is close enough to the requirement to be seductive...
  assert.ok(t.ratio > 1 && t.ratio < 1.5, `PV is ×${t.ratio.toFixed(2)} the requirement`);
  // ...and it is measured on $/W while the gap is kg/m². Enforce it.
  const pv = CURVES.find((c) => c.id === "pv-cost")!;
  assert.equal(pv.quantity, "$/W");
  assert.notEqual(pv.quantity, "kg/m²", "a cost curve may never be the mass answer");
  // EVERY published curve carried here must be a cost curve, and say so.
  for (const c of CURVES) {
    assert.ok(c.quantity.startsWith("$"), `${c.id} is not labelled as a cost curve`);
    assert.ok(c.note.length > 40, `${c.id} has no note`);
  }
});

test("[RESULT] at a mass-like rate the gap does not close", () => {
  const cases = gapCases();
  const pv = cases.find((c) => c.id === "pv-cost")!;
  const mass = cases.find((c) => c.id === "mass-illustrative")!;
  // The cost curve closes it comfortably. The mass stand-in does not, by a lot.
  assert.ok(pv.closes, "a 22% curve must close a ×505 gap over thirty doublings");
  assert.ok(!mass.closes);
  assert.ok(mass.improvementOverBuild < 10, `×${mass.improvementOverBuild.toFixed(0)}`);
  assert.ok(pv.improvementOverBuild / mass.improvementOverBuild > 100, "three orders separate them");
  // And the mass case needs far more doublings than the build supplies.
  assert.ok(mass.doublingsNeeded > buildDoublings() * 2, `${mass.doublingsNeeded.toFixed(0)} doublings`);
  assert.equal(mass.quantity, "kg/m²");
});

test("at 10% the gap needs twice the doublings the build provides", () => {
  // The clean statement: learning has to outpace construction, not just happen.
  const n = doublingsToClose(arealGapToGeo(), 0.1);
  assert.ok(Math.abs(n - 59) < 2, `${n.toFixed(0)} doublings`);
  assert.ok(n / buildDoublings() > 1.8);
  // Faster learning, fewer doublings. Monotone.
  assert.ok(doublingsToClose(arealGapToGeo(), 0.2) < n);
});

test("Wright's law behaves and the exponent is right", () => {
  // A 50% rate halves per doubling, so b = 1 exactly.
  assert.ok(Math.abs(wrightExponent(0.5) - 1) < 1e-12);
  assert.ok(Math.abs(wrightExponent(0.75) - 2) < 1e-12);
  assert.equal(wrightExponent(0), 0, "no learning is no exponent");
  // Improvement compounds per doubling.
  assert.ok(Math.abs(improvementAfter(1, 0.5) - 2) < 1e-12);
  assert.ok(Math.abs(improvementAfter(10, 0.5) - 1024) < 1e-9);
  assert.equal(improvementAfter(0, 0.22), 1);
  // requiredRate and doublingsToClose must be exact inverses of each other.
  for (const [gap, n] of [
    [505, 30],
    [10, 5],
    [1e4, 50],
  ] as [number, number][]) {
    const r = requiredRate(gap, n);
    assert.ok(Math.abs(doublingsToClose(gap, r) - n) / n < 1e-9, `gap ${gap}`);
  }
});

test("the gap being closed is M14's, not a fresh literal", () => {
  const gap = arealGapToGeo();
  assert.ok(Math.abs(gap - 505) < 10, `×${gap.toFixed(0)}`);
  // Every case must be evaluated against the same gap.
  for (const c of gapCases()) {
    assert.ok(Math.abs(improvementAfter(c.doublingsNeeded, c.rate) / gap - 1) < 1e-6, c.id);
  }
});

test("[KNOWN_LIMIT] no mass learning rate is claimed", () => {
  // The module states a requirement and a warning. The 6% figure exists only as
  // an illustrative low case and must be labelled as such wherever it appears.
  assert.equal(ILLUSTRATIVE_MASS_RATE, 0.06);
  const mass = gapCases().find((c) => c.id === "mass-illustrative")!;
  assert.ok(mass.label.toLowerCase().includes("illustrative"), "it must announce itself");
  // And it must not be in CURVES, which is the published set.
  assert.ok(!CURVES.some((c) => c.rate === ILLUSTRATIVE_MASS_RATE), "an assumption is not a citation");
});
