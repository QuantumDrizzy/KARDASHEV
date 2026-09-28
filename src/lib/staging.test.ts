import assert from "node:assert/strict";
import test from "node:test";
import {
  FALCON_9,
  STRUCTURAL_COEFFICIENT,
  falcon9Check,
  ispForPayloadFraction,
  minimumStages,
  singleStageIsImpossible,
  stagePayloadRatio,
  stagedFlight,
  stagingLadder,
} from "./staging.ts";
import { deltaVToGeo, massRatio } from "./transfer.ts";
import { chainConsequences } from "./engine.ts";

/**
 * M21 locks. The load-bearing one is the Falcon 9 check: M14 derived a payload
 * penalty from Tsiolkovsky with no vehicle in it, and a flown rocket's published
 * numbers agree to under a percent. Nothing upstream was fitted to it.
 */

test("[VALIDATION] M14's GEO penalty matches Falcon 9 to under 1%", () => {
  const c = falcon9Check();
  // Published: 22,800 kg to LEO, 8,300 kg to GTO. Ratio ×2.747.
  assert.ok(Math.abs(c.observedRatio - 2.747) < 0.01, `observed ×${c.observedRatio.toFixed(3)}`);
  // Derived in M14 from the rocket equation, with no rocket in it.
  assert.ok(Math.abs(c.predictedRatio - 2.772) < 0.02, `predicted ×${c.predictedRatio.toFixed(3)}`);
  assert.ok(Math.abs(c.errorFrac) < 0.02, `off by ${(c.errorFrac * 100).toFixed(1)}%`);
});

test("[VALIDATION] and the payload fraction lands in the right place too", () => {
  const c = falcon9Check();
  // Falcon 9 puts ~1.5% of gross mass into GTO.
  assert.ok(Math.abs(c.observedPayloadFraction - 0.0151) < 0.001, `${c.observedPayloadFraction}`);
  // A two-stage model with an assumed ε should be close and conservative — a
  // first-order model that came out ABOVE a real vehicle would be the warning.
  assert.ok(c.modelledPayloadFraction < c.observedPayloadFraction, "the model must not beat the real rocket");
  assert.ok(c.modelledPayloadFraction > 0.6 * c.observedPayloadFraction, "but it must be in the same league");
});

test("[CORRECTS M20] single stage is impossible, the route is not", () => {
  // The narrow claim M20 actually had hold of: λ goes negative.
  assert.ok(singleStageIsImpossible());
  const one = stagedFlight(deltaVToGeo(), 1);
  assert.ok(one.stagePayloadRatio < 0, `λ = ${one.stagePayloadRatio.toFixed(4)}`);
  assert.equal(one.payloadFraction, 0);
  // And M20's own single-stage figure must agree: mass ratio 30.4 at 380 s.
  const m20 = chainConsequences().find((x) => Math.abs(x.massRatio - 30.4) < 0.1)!;
  assert.ok(Math.abs(one.stageMassRatio - m20.massRatio) / m20.massRatio < 0.01);
  // The broad claim was wrong: two stages do it.
  assert.equal(minimumStages(), 2);
  assert.ok(stagedFlight(deltaVToGeo(), 2).feasible);
});

test("[RESULT] staging is the lever, and it saturates", () => {
  const ladder = stagingLadder();
  assert.ok(!ladder[0].feasible, "one stage cannot");
  // Payload fraction must rise with stage count...
  for (let i = 2; i < ladder.length; i++) {
    assert.ok(ladder[i].payloadFraction > ladder[i - 1].payloadFraction, `${ladder[i].stages} stages`);
  }
  // ...but with diminishing returns, because each stage brings its own structure.
  const gain23 = ladder[2].payloadFraction - ladder[1].payloadFraction;
  const gain45 = ladder[4].payloadFraction - ladder[3].payloadFraction;
  assert.ok(gain45 < gain23 / 3, "returns must diminish sharply");
  // Two stages: ~1.2%. Four: ~2.0%. Never anything like a third of the rocket.
  assert.ok(Math.abs(ladder[1].payloadFraction - 0.0121) < 0.002);
  assert.ok(ladder[4].payloadFraction < 0.03, "payload fraction stays low whatever you do");
});

test("the stage payload ratio behaves at both extremes", () => {
  // A stage that needs no propellant carries everything...
  assert.ok(Math.abs(stagePayloadRatio(1, 0.08) - 1) < 1e-12);
  // ...and one with infinite mass ratio carries nothing but its own structure.
  assert.ok(Math.abs(stagePayloadRatio(1e12, 0.08) - (1 - 1 / 0.92)) < 1e-6);
  // Perfect structure means λ = 1/R exactly.
  assert.ok(Math.abs(stagePayloadRatio(5, 0) - 1 / 5) < 1e-12);
  // Heavier structure always hurts.
  assert.ok(stagePayloadRatio(5, 0.12) < stagePayloadRatio(5, 0.05));
});

test("[SENSITIVITY] epsilon is assumed and it is load-bearing", () => {
  // Stated because the headline 1.2% moves by ×4 across a plausible range, and
  // a reader must not take it as a hard number.
  const good = stagedFlight(deltaVToGeo(), 2, { structuralCoefficient: 0.05 }).payloadFraction;
  const base = stagedFlight(deltaVToGeo(), 2).payloadFraction;
  const heavy = stagedFlight(deltaVToGeo(), 2, { structuralCoefficient: 0.12 }).payloadFraction;
  assert.ok(good > base && base > heavy, "lighter structure must always win");
  assert.ok(good / heavy > 3, `spread is only ×${(good / heavy).toFixed(1)} — check the model`);
  assert.equal(STRUCTURAL_COEFFICIENT, 0.08);
});

test("better engines help, and the inversion round-trips", () => {
  // More Isp, more payload, monotonically.
  const chemical = stagedFlight(deltaVToGeo(), 2, { ispS: 380 }).payloadFraction;
  const hydrogen = stagedFlight(deltaVToGeo(), 2, { ispS: 450 }).payloadFraction;
  const nuclear = stagedFlight(deltaVToGeo(), 2, { ispS: 900 }).payloadFraction;
  assert.ok(nuclear > hydrogen && hydrogen > chemical);
  // Nuclear thermal turns a 1% vehicle into a serious one.
  assert.ok(nuclear > 0.15, `${nuclear}`);
  // And the inverse must reproduce the forward calculation.
  for (const [target, n] of [
    [0.0121, 2],
    [0.05, 3],
  ] as [number, number][]) {
    const isp = ispForPayloadFraction(target, n);
    const back = stagedFlight(deltaVToGeo(), n, { ispS: isp }).payloadFraction;
    assert.ok(Math.abs(back / target - 1) < 1e-6, `target ${target} → ${back}`);
  }
});

test("[KNOWN_LIMIT] the Falcon 9 comparison is a ratio, never a capability claim", () => {
  // 8,300 kg is to TRANSFER orbit; the spacecraft finishes the job. What is
  // being compared is two published numbers for the same vehicle, which is why
  // the ratio is meaningful even though neither figure is a GEO capability.
  assert.ok(FALCON_9.gtoKg < FALCON_9.leoKg);
  assert.ok(FALCON_9.grossMassKg > FALCON_9.leoKg * 20, "gross mass dwarfs payload — that is the point");
  // The model must never be used to predict an absolute payload.
  const c = falcon9Check();
  assert.ok(c.modelledPayloadFraction * FALCON_9.grossMassKg < FALCON_9.gtoKg, "conservative in absolute terms too");
  // And M14's own mass ratios are dry-mass-free, so only the ratio may be quoted.
  assert.ok(massRatio(deltaVToGeo()) > 20, "absolute mass ratios stay large and unquotable");
});
