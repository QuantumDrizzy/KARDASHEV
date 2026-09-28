import assert from "node:assert/strict";
import test from "node:test";
import {
  AASM_1980_CLOSURE,
  SEED_KG,
  buildAt,
  closureLadder,
  crossoverMassKg,
  importLimitedRateKgPerYear,
  proposedVersusRequired,
  requiredClosure,
} from "./closure.ts";
import { earthShareCeiling, typeISystemMassKg } from "./isru.ts";
import { deliveredKgPerYear } from "./bootstrap.ts";

/**
 * M28 locks. The load-bearing one is the regime change: below the crossover
 * growth compounds, above it the imports bind and it is a straight line. If
 * that ever stops holding, M27's "exponential needs self-replication" has no
 * ceiling on it and the chain's timelines are unbounded.
 */

test("[RESULT] closure sets a crossover, and above it growth stops compounding", () => {
  const c = 0.96;
  const star = crossoverMassKg(c);
  // M* = I/(p(1-c)), and at 4% imports that is tens of megatonnes.
  assert.ok(Math.abs(star - deliveredKgPerYear(100) / 0.04) < 1, `${star.toExponential(2)} kg`);
  assert.ok(star > 1e10 && star < 1e11);
  // And it is a rounding error against the target, so almost all of the build
  // happens in the linear phase. That is the whole point of the module.
  const b = buildAt(c);
  assert.ok(b.exponentialShareOfTarget < 0.01, `${(b.exponentialShareOfTarget * 100).toFixed(3)}%`);
  assert.ok(b.linearYears > b.exponentialYears * 10, "the straight line must dominate");
});

test("perfect closure never becomes import-limited", () => {
  assert.equal(crossoverMassKg(1), Infinity);
  assert.equal(importLimitedRateKgPerYear(1), Infinity);
  const b = buildAt(1);
  assert.equal(b.linearYears, 0, "nothing is import-limited at perfect closure");
  assert.equal(b.exponentialShareOfTarget, 1);
  // And it must reduce to pure compounding from the seed.
  assert.ok(Math.abs(b.totalYears - Math.log(typeISystemMassKg() / SEED_KG)) < 1e-9);
});

test("[THE GAP] proposed closure and required closure differ by x252", () => {
  const g = proposedVersusRequired();
  assert.ok(Math.abs(g.importFlowX - 252) < 10, `×${g.importFlowX.toFixed(0)}`);
  assert.ok(g.scheduleX > 80 && g.scheduleX < 160, `schedule ×${g.scheduleX.toFixed(0)}`);
  // The required closure must be M11's own number, not a copy.
  assert.ok(Math.abs(requiredClosure() - earthShareCeiling(100).minLunarFraction) < 1e-12);
  assert.ok(requiredClosure() > 0.9998);
  // And the proposed one must be below it, or there is no gap to report.
  assert.ok(AASM_1980_CLOSURE.high < requiredClosure());
  assert.ok(AASM_1980_CLOSURE.low < AASM_1980_CLOSURE.high);
});

test("[RESULT] the ladder spans millennia to decades", () => {
  const ladder = closureLadder();
  // Higher closure is always faster, monotonically.
  for (let i = 1; i < ladder.length; i++) {
    assert.ok(ladder[i].totalYears < ladder[i - 1].totalYears, `${ladder[i].closure}`);
    assert.ok(ladder[i].crossoverKg > ladder[i - 1].crossoverKg);
    assert.ok(ladder[i].importFraction < ladder[i - 1].importFraction);
  }
  // 90% is millennia; the requirement is decades.
  assert.ok(ladder[0].totalYears > 5000, `${ladder[0].totalYears.toFixed(0)} yr at 90%`);
  assert.ok(ladder[ladder.length - 1].totalYears < 60, `${ladder[ladder.length - 1].totalYears.toFixed(0)} yr`);
  // The AASM high case must land in the thousands — that is the headline.
  const aasm = buildAt(AASM_1980_CLOSURE.high);
  assert.ok(Math.abs(aasm.totalYears - 3505) < 200, `${aasm.totalYears.toFixed(0)} yr`);
});

test("the two phases are each internally consistent", () => {
  for (const b of closureLadder()) {
    // The linear rate is the import flow divided by what must be imported.
    assert.ok(Math.abs(b.linearRateKgPerYear * b.importFraction - deliveredKgPerYear(100)) < 1);
    // And the crossover is exactly where the two rates are equal, at p = 1.
    assert.ok(Math.abs(b.crossoverKg - b.linearRateKgPerYear) < 1, "at p=1 the crossover equals the rate");
    assert.ok(b.totalYears === b.exponentialYears + b.linearYears);
    assert.ok(b.exponentialYears > 0, "there is always a compounding phase from the seed");
  }
});

test("productivity and import flow move it the right way", () => {
  const base = buildAt(0.96);
  // A more productive base compounds faster and crosses over sooner.
  const fast = buildAt(0.96, { productivityPerYear: 4 });
  assert.ok(fast.exponentialYears < base.exponentialYears);
  assert.ok(fast.crossoverKg < base.crossoverKg, "higher p means imports bind earlier");
  // More imports raise both the crossover and the linear rate, so it is faster.
  const rich = buildAt(0.96, { importKgPerYear: deliveredKgPerYear(1000) });
  assert.ok(rich.totalYears < base.totalYears);
  assert.ok(Math.abs(rich.crossoverKg / base.crossoverKg - 10) < 1e-6);
});

test("[KNOWN_LIMIT] nothing here says WHICH few percent is hard", () => {
  // The mass fraction is the wrong unit for the real problem: closing the last
  // 4% is a materials question about microelectronics and volatiles, not a
  // matter of shipping less tonnage. Guard: the module exposes no composition.
  const b = buildAt(0.96);
  assert.ok(!("composition" in b), "a mass fraction must not be mistaken for a bill of materials");
  // Tolerance, not equality: 1 - 0.96 is 0.040000000000000036 in binary floating
  // point, and asserting exactness here fails for reasons that have nothing to
  // do with closure.
  assert.ok(Math.abs(b.importFraction - 0.04) < 1e-12);
});
