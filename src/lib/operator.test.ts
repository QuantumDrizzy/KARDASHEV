import assert from "node:assert/strict";
import test from "node:test";
import { DISPATCH_S, FCR_FULL_S, ROCOF_ARREST_S } from "./grid.ts";
import { BRAIN_WATT } from "./life.ts";
import {
  CONSUMER_HEADBAND,
  ITR_BITS_PER_S,
  OPERATOR_DOCTRINE,
  SILICON_JOULES_PER_BIT,
  channelCost,
  latencyBudget,
  loopVerdicts,
  rawBitrate,
  resolutionForArrest,
} from "./operator.ts";

test("the observation window is the budget, and it is a theorem", () => {
  // T >= 1/df. Resolving 1 Hz costs 1000 ms before a decision can exist.
  const b = latencyBudget();
  assert.equal(b.windowMs, 1000);
  // 76% of the default budget — the rest is the notch, which is a design
  // choice rather than a theorem. Zero the choices and only the window remains.
  assert.ok(b.irreducibleFrac > 0.7 && b.irreducibleFrac < 0.8, `${b.irreducibleFrac}`);
  const floor = latencyBudget({
    ...CONSUMER_HEADBAND,
    notchTaps: 1,
    bleIntervalMs: 0,
    classifyMs: 0,
  });
  assert.equal(floor.totalMs, floor.windowMs);
  assert.equal(floor.totalMs, 1000);
  // Halving the required resolution halves the window, exactly.
  const coarse = latencyBudget({ ...CONSUMER_HEADBAND, resolutionHz: 2 });
  assert.equal(coarse.windowMs, 500);
  assert.ok(Math.abs(coarse.windowMs / b.windowMs - 0.5) < 1e-12);
});

test("every other stage is small, which is why they are not the answer", () => {
  const b = latencyBudget();
  // FIR group delay is (N-1)/2 samples: 64 samples at 256 Hz = 250 ms.
  assert.ok(Math.abs(b.notchGroupDelayMs - 250) < 1e-9);
  assert.equal(b.radioMs, 60);
  assert.equal(b.classifyMs, 5);
  // Make the radio and the classifier free: the total barely moves.
  const ideal = latencyBudget({ ...CONSUMER_HEADBAND, bleIntervalMs: 0, classifyMs: 0, notchTaps: 1 });
  assert.ok(ideal.totalMs / b.totalMs > 0.7, "the overheads mattered more than expected");
  assert.equal(ideal.windowMs, b.windowMs);
});

test("[RESULT] a human cannot close the arrest loop, same as a transcontinental tie", () => {
  const v = loopVerdicts();
  const arrest = v.find((x) => x.loop === "RoCoF arrest")!;
  assert.equal(arrest.windowS, ROCOF_ARREST_S);
  assert.equal(arrest.canClose, false);
  assert.ok(arrest.operatorS > ROCOF_ARREST_S * 2, "the operator should miss by a wide margin");
  // The slower loops are fine, which is the actual architectural instruction.
  assert.equal(v.find((x) => x.loop === "FCR activation")!.canClose, true);
  assert.equal(v.find((x) => x.loop === "Economic dispatch")!.canClose, true);
  assert.equal(FCR_FULL_S, 30);
  assert.equal(DISPATCH_S, 900);
});

test("the trade that would fix it is not available", () => {
  // To make 0.5 s the operator would need a frequency resolution so coarse it
  // could not separate the EEG bands at all.
  const df = resolutionForArrest();
  assert.ok(!Number.isFinite(df) || df > 4, `${df} Hz would be needed`);
  // Alpha spans 8-13 Hz; you cannot resolve inside it at that resolution.
  assert.ok(!Number.isFinite(df) || df > 1);
  assert.equal(OPERATOR_DOCTRINE.canCloseInnerLoop, false);
});

test("the channel is thin, and the raw bitrate is not the channel", () => {
  // 4 channels x 256 Hz x 12 bits = 12,288 bit/s off the electrodes...
  assert.equal(rawBitrate(), 4 * 256 * 12);
  // ...of which order 10 bit/s survives as decisions.
  const c = channelCost(ITR_BITS_PER_S.best);
  assert.ok(c.survivingFrac < 1e-3, `${c.survivingFrac} survives`);
  assert.ok(ITR_BITS_PER_S.conservative < ITR_BITS_PER_S.best);
});

test("[CAREFUL] joules per bit is a channel figure, not the cost of thought", () => {
  const c = channelCost(10);
  assert.equal(c.brainW, BRAIN_WATT);
  assert.equal(c.joulesPerBitDelivered, BRAIN_WATT / 10);
  assert.ok(Math.abs(c.joulesPerBitDelivered - 2) < 1e-12);
  // Eleven orders of magnitude against measured silicon.
  assert.ok(c.versusSiliconBitX > 1e10, `${c.versusSiliconBitX}`);
  assert.ok(Math.abs(SILICON_JOULES_PER_BIT - 2.267e-10 / 8) < 1e-20);
  // The header must keep the caveat that this is bandwidth, not cognition.
  assert.ok(OPERATOR_DOCTRINE.note.includes("window"));
});
