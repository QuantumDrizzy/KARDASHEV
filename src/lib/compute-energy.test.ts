import assert from "node:assert/strict";
import test from "node:test";
import { ELECTRICITY_W } from "./facts.ts";
import {
  DEFAULT_SERVING,
  DEVICES,
  INTERACTIVE_LOCAL,
  MODELS,
  POPULATION,
  batchSweep,
  computeScale,
  energyPerToken,
  fit,
  kvBytesPerToken,
  roofline,
  runScenarios,
  trainingDeviceHours,
  trainingJoules,
} from "./compute-energy.ts";

// ──────────────────────────────────────────────────── validation against reality

test("a frontier response lands on the published ~0.3 Wh estimate", () => {
  // The only external check available for inference. If this drifts out of
  // band the model has stopped describing the thing it claims to describe.
  const s = runScenarios().find((x) => x.id === "frontier-served")!;
  assert.ok(
    s.energy.whPerResponse > 0.1 && s.energy.whPerResponse < 1,
    `${s.energy.whPerResponse} Wh per 500-token response`,
  );
  assert.equal(s.energy.fits, true, "the reference scenario must physically fit");
});

test("training energy reproduces Meta's published Llama-3.1-405B GPU-hours", () => {
  // Model card: 30.84M H100-hours for 15.6T tokens. 6·P·D at BF16.
  const h = trainingDeviceHours(MODELS.llama405b, 15.6e12, DEVICES.h100, 0.35);
  assert.ok(Math.abs(h / 1e6 / 30.84 - 1) < 0.2, `${h / 1e6}M H100-hours vs 30.84M`);
  // Training runs in BF16, not FP8. Using the inference rate halves the answer.
  assert.ok(DEVICES.h100.trainFlops < DEVICES.h100.denseFlops);
});

test("KV cache size follows the attention shape, not the parameter count", () => {
  // 2 (K and V) × layers × kvHeads × headDim × 2 bytes.
  assert.equal(kvBytesPerToken(MODELS.local8b), 2 * 32 * 8 * 128 * 2);
  // Grouped-query attention is what makes long context affordable at all.
  assert.ok(kvBytesPerToken(MODELS.dense70b) > kvBytesPerToken(MODELS.local8b));
});

// ────────────────────────────────────────────────────────────────── the roofline

test("decode is memory bound in every realistic scenario", () => {
  // The premise of the whole module. If this ever flips, the headline changes.
  for (const s of runScenarios()) {
    assert.equal(s.energy.bound, "memory", `${s.label} is ${s.energy.bound} bound`);
    assert.ok(s.energy.roofline.intensity < 500, `${s.label} intensity ${s.energy.roofline.intensity}`);
  }
});

test("when memory bound, device count cancels out of the energy per token", () => {
  // E/token = (N·tdp)·(bytes/(N·BW))/B = tdp·bytes/(BW·B). No N.
  // Sharding buys you throughput and capacity, never efficiency.
  const at = (devices: number) =>
    energyPerToken(MODELS.frontierMoe, { ...DEFAULT_SERVING, batch: 32, devices }, DEVICES.h100);
  const base = at(8).whPerToken;
  for (const n of [16, 32, 64]) {
    assert.ok(Math.abs(at(n).whPerToken / base - 1) < 1e-12, `${n} cards moved the answer`);
    assert.ok(at(n).tokensPerS > at(8).tokensPerS, "throughput must still scale");
  }
});

test("energy per token falls as 1/batch until something else binds", () => {
  const sweep = batchSweep(MODELS.dense70b, { ...DEFAULT_SERVING, devices: 4 }, DEVICES.h100, [1, 2, 4, 8]);
  for (let i = 1; i < sweep.length; i++) {
    const ratio = sweep[i - 1].whPerToken / sweep[i].whPerToken;
    // Doubling the batch nearly halves the energy, blunted by KV traffic.
    assert.ok(ratio > 1.5 && ratio <= 2.001, `batch ${sweep[i].batch}: ratio ${ratio}`);
  }
});

// ──────────────────────────────────────────────── the counterintuitive results

test("[RESULT] a local 8B at batch 1 costs MORE per token than a frontier MoE batched", () => {
  // 27x fewer active parameters and it still loses, because batch beats size.
  // The lever is not local-vs-cloud, it is busy-vs-idle.
  const local = runScenarios().find((s) => s.id === "local-8b")!.energy;
  const frontier = runScenarios().find((s) => s.id === "frontier-served")!.energy;
  assert.ok(local.whPerToken > frontier.whPerToken, "local finally got cheaper — recheck");
  assert.ok(MODELS.local8b.activeParamsB < MODELS.frontierMoe.activeParamsB / 20);
  // And the same local card wins easily once it is allowed to batch.
  const busy = energyPerToken(
    MODELS.local8b,
    { ...INTERACTIVE_LOCAL, contextTokens: 2048, batch: 16 },
    DEVICES.rtx5060ti16,
  );
  assert.ok(busy.fits);
  assert.ok(busy.whPerToken < frontier.whPerToken / 5);
});

test("[RESULT] on 16 GB, context length is an energy decision, not just a capability one", () => {
  // KV cache eats the headroom that batching needs, so long context forces
  // batch 1, which is the worst operating point on the roofline.
  const at = (contextTokens: number) => {
    const f = fit(MODELS.local8b, { ...INTERACTIVE_LOCAL, contextTokens }, DEVICES.rtx5060ti16);
    const batch = Math.max(1, f.maxBatch);
    return { f, e: energyPerToken(MODELS.local8b, { ...INTERACTIVE_LOCAL, contextTokens, batch }, DEVICES.rtx5060ti16) };
  };
  const short = at(2048);
  const long = at(32768);
  assert.ok(short.f.maxBatch > 20, `2k context allows batch ${short.f.maxBatch}`);
  assert.ok(long.f.maxBatch <= 1, `32k context allows batch ${long.f.maxBatch}`);
  assert.ok(long.e.whPerToken / short.e.whPerToken > 10, "the context penalty vanished");
});

test("[RESULT] training amortizes to nothing for anything widely served", () => {
  const inference = runScenarios().find((s) => s.id === "frontier-served")!.energy.whPerToken;
  const share = (served: number) =>
    trainingJoules(MODELS.frontierMoe, 15e12, DEVICES.h100) / served / 3600 / inference;
  // Below ~1e13 served tokens the training run dominates...
  assert.ok(share(1e12) > 1, "training should dominate for an unused model");
  // ...and above ~1e15 it is a rounding error.
  assert.ok(share(1e16) < 0.01, "training should vanish for a heavily served model");
});

// ─────────────────────────────────────────────────────────── back to the scale

test("[RESULT] chat is not a civilization-scale load; reasoning could be", () => {
  const inference = runScenarios().find((s) => s.id === "frontier-served")!.energy.whPerToken;
  const scale = computeScale(inference);
  // 1000 tokens per person per day for the whole species is a rounding error.
  assert.ok(
    scale.worldElectricityFracFor1kPerPersonPerDay < 0.0005,
    `${scale.worldElectricityFracFor1kPerPersonPerDay} of world electricity`,
  );
  // But 1% of world electricity only buys ~150k tokens per person per day,
  // which is a handful of long reasoning traces. That is the real ceiling.
  assert.ok(
    scale.tokensPerPersonPerDayAtOnePercent > 5e4 && scale.tokensPerPersonPerDayAtOnePercent < 5e5,
    `${scale.tokensPerPersonPerDayAtOnePercent} tokens/person/day at 1%`,
  );
  // Sanity: the scale helper is consistent with facts.ts, not a parallel world.
  assert.ok(Math.abs(scale.tokensPerSAtOnePercentElectricity * inference * 3600 - ELECTRICITY_W * 0.01) < 1);
  assert.equal(POPULATION, 8.2e9);
});

// ───────────────────────────────────────────────────── the hypothesis stays out

test("the predictive-coding parameter asserts nothing by default", () => {
  // [HYPOTHESIS] discipline, same as λ in forecast.ts: exposed, never assumed.
  assert.equal(DEFAULT_SERVING.predictiveResidualFrac, undefined);
  assert.equal(INTERACTIVE_LOCAL.predictiveResidualFrac, undefined);
  for (const s of runScenarios()) assert.equal(s.energy.usedHypothesis, false, s.label);

  // It only touches FLOPs, so in a memory-bound regime even a 90% claim buys
  // nothing at all. That is the honest answer to "predictive coding saves 90%".
  const withIt = energyPerToken(
    MODELS.dense70b,
    { ...DEFAULT_SERVING, devices: 2, predictiveResidualFrac: 0.9 },
    DEVICES.h100,
  );
  const without = energyPerToken(MODELS.dense70b, { ...DEFAULT_SERVING, devices: 2 }, DEVICES.h100);
  assert.equal(withIt.usedHypothesis, true);
  assert.equal(withIt.whPerToken, without.whPerToken);
  assert.equal(withIt.bound, "memory");
});

test("the roofline crosses over when arithmetic intensity gets high enough", () => {
  // Not a hypothetical: prefill and very large batches are compute bound, and
  // the module has to be able to say so rather than always answering "memory".
  const huge = roofline(
    MODELS.dense70b,
    { ...DEFAULT_SERVING, batch: 4096, contextTokens: 1024, devices: 1 },
    DEVICES.h100,
  );
  assert.equal(huge.bound, "compute");
  assert.ok(huge.intensity > 100);
});
