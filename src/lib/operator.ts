/**
 * OPERATOR — the human as a node in a control loop. M5.
 *
 * `docs/NEXT-MODULES.md` §M5 asks for a block diagram and a latency budget for a
 * consumer EEG acquisition chain, explicitly without connecting hardware. The
 * budget is the interesting part, because it lands on the same question the grid
 * module already answered for HVDC ties and the PQC module answered for an ISL:
 *
 *     which control loops can this channel actually close?
 *
 * The answer for a human is harsher than for either cable, and it is not a
 * matter of better electronics.
 *
 * ── The irreducible term ─────────────────────────────────────────────────────
 *
 * To resolve a frequency to within Δf you must observe for at least T ≈ 1/Δf.
 * That is the time-bandwidth product — the same theorem that makes a short pulse
 * broadband — and no amount of DSP evades it. Separating alpha from beta at 1 Hz
 * resolution costs **one full second before any decision exists**.
 *
 * A faster ADC does not help. A faster radio does not help. A bigger model does
 * not help. The window is physics.
 *
 * [CORRECTED] An earlier draft of this header said everything else was rounding.
 * It is not: at the default spec the window is 1000 ms of a 1315 ms budget, and
 * a 129-tap linear-phase notch contributes 250 ms of group delay — 19% of the
 * total. That term is a *design choice*, not a theorem: an IIR notch or adaptive
 * mains cancellation buys most of it back. The distinction matters, because it
 * is the difference between "engineer harder" and "this trade is not available".
 * Set notchTaps, bleIntervalMs and classifyMs to zero and the budget collapses
 * to exactly the window, which is the floor.
 *
 * ── Where that puts the operator ─────────────────────────────────────────────
 *
 * Cross-referenced against the control windows already in grid.ts:
 *
 *   RoCoF arrest      0.5 s    a 5,000 km HVDC tie fails this. So does a human.
 *   FCR activation     30 s    both pass.
 *   Economic dispatch 900 s    both pass, trivially.
 *
 * So the doctrine generalizes: **no node whose loop settles above the arrest
 * window belongs inside a frequency-control loop** — not a continent away, and
 * not a person. Humans supervise; they do not stabilize. That is a statement
 * about time constants, not about competence.
 *
 * ── And the channel is thin ──────────────────────────────────────────────────
 *
 * Non-invasive BCI information transfer rates are order 1-10 bits/s. The brain
 * runs on ~20 W (life.ts). Extracting ten bits per second through this channel
 * therefore costs ~2 J per bit delivered — against 28 pJ/bit measured on a GPU
 * in qsim.ts. Eleven orders of magnitude.
 *
 * [CAREFUL] That 2 J/bit is the cost of the *channel*, not the cost of thought.
 * The brain is not spending 20 W to emit those bits; the bits are a narrow
 * readout of a system doing something else. Quoting it as "thinking costs 2 J
 * per bit" would be wrong, and the number is only meaningful as a statement
 * about bandwidth: the operator interface is the narrowest link in any
 * architecture that contains one.
 *
 * [KNOWN_LIMIT] No hardware is connected and none should be. Device figures are
 * public specifications for a consumer 4-channel headband class; ITR figures are
 * literature order-of-magnitude, not a measurement made here.
 */

import { DISPATCH_S, FCR_FULL_S, ROCOF_ARREST_S } from "./grid.ts";
import { BRAIN_WATT } from "./life.ts";

// ────────────────────────────────────────────────────── acquisition chain

export type AcquisitionSpec = {
  /** Electrodes. A consumer headband class device has 4 plus reference. */
  channels: number;
  /** Sampling rate, Hz. */
  sampleRateHz: number;
  /** Bits per sample from the ADC. */
  adcBits: number;
  /** Mains frequency to notch out. 50 in Europe, 60 in North America. */
  mainsHz: number;
  /** FIR notch length in taps. Group delay is (N−1)/2 samples. */
  notchTaps: number;
  /** BLE connection interval, ms. 7.5 ms is the floor; consumer is 30-50. */
  bleIntervalMs: number;
  /**
   * Frequency resolution the decision needs, Hz. THIS sets the floor:
   * T >= 1/Δf, and everything else is rounding.
   */
  resolutionHz: number;
  /** Overlap between consecutive analysis windows, 0-1. */
  windowOverlap: number;
  /** On-device classification time, ms. [ASSUMPTION] */
  classifyMs: number;
};

/** Public specifications for a consumer 4-channel headband class device. */
export const CONSUMER_HEADBAND: AcquisitionSpec = {
  channels: 4,
  sampleRateHz: 256,
  adcBits: 12,
  mainsHz: 50,
  notchTaps: 129,
  bleIntervalMs: 40,
  resolutionHz: 1,
  windowOverlap: 0.5,
  classifyMs: 5,
};

export type LatencyBudget = {
  /** 1/Δf. The term that cannot be engineered away. */
  windowMs: number;
  /** How often a new decision can be emitted, given overlap. */
  hopMs: number;
  notchGroupDelayMs: number;
  radioMs: number;
  classifyMs: number;
  totalMs: number;
  /** Share of the total that is the observation window alone. */
  irreducibleFrac: number;
  decisionsPerSecond: number;
};

export function latencyBudget(s: AcquisitionSpec = CONSUMER_HEADBAND): LatencyBudget {
  // Time-bandwidth: resolving Δf needs at least 1/Δf of signal.
  const windowMs = (1 / s.resolutionHz) * 1000;
  const hopMs = windowMs * (1 - s.windowOverlap);
  // Linear-phase FIR group delay is (N−1)/2 samples.
  const notchGroupDelayMs = ((s.notchTaps - 1) / 2 / s.sampleRateHz) * 1000;
  // A packet waits, on average, half a connection interval before it goes out.
  const radioMs = s.bleIntervalMs * 1.5;
  const totalMs = windowMs + notchGroupDelayMs + radioMs + s.classifyMs;
  return {
    windowMs,
    hopMs,
    notchGroupDelayMs,
    radioMs,
    classifyMs: s.classifyMs,
    totalMs,
    irreducibleFrac: windowMs / totalMs,
    decisionsPerSecond: hopMs > 0 ? 1000 / hopMs : 0,
  };
}

/** Raw bits off the electrodes, before any of it means anything. */
export function rawBitrate(s: AcquisitionSpec = CONSUMER_HEADBAND) {
  return s.channels * s.sampleRateHz * s.adcBits;
}

// ─────────────────────────────────────────────────────── the channel is thin

/**
 * Information transfer rate of the operator channel, bits/s.
 * [ASSUMPTION] Literature order of magnitude for non-invasive BCI: classic
 * paradigms sit near 1 bit/s, well-tuned SSVEP spellers reach a few. Nothing
 * here was measured.
 */
export const ITR_BITS_PER_S = { conservative: 1, typical: 3, best: 10 } as const;

export type ChannelCost = {
  bitsPerSecond: number;
  /** Watts the brain runs on. Context, not attribution — see the header. */
  brainW: number;
  /** Joules per bit DELIVERED THROUGH THE CHANNEL. Not the cost of thought. */
  joulesPerBitDelivered: number;
  /** Ratio against the 28 pJ/bit measured on a GPU in qsim.ts. */
  versusSiliconBitX: number;
  /** Fraction of the raw electrode bitrate that survives as decisions. */
  survivingFrac: number;
};

/** Measured in qsim.ts: 0.227 nJ per byte moved on an RTX 5060 Ti. */
export const SILICON_JOULES_PER_BIT = 2.267e-10 / 8;

export function channelCost(
  bitsPerSecond: number = ITR_BITS_PER_S.best,
  s: AcquisitionSpec = CONSUMER_HEADBAND,
): ChannelCost {
  const joulesPerBitDelivered = bitsPerSecond > 0 ? BRAIN_WATT / bitsPerSecond : Infinity;
  return {
    bitsPerSecond,
    brainW: BRAIN_WATT,
    joulesPerBitDelivered,
    versusSiliconBitX: joulesPerBitDelivered / SILICON_JOULES_PER_BIT,
    survivingFrac: bitsPerSecond / rawBitrate(s),
  };
}

// ──────────────────────────────────────────────── which loops can it close?

export type LoopVerdict = {
  loop: string;
  windowS: number;
  operatorS: number;
  canClose: boolean;
};

/**
 * The same three windows grid.ts applies to an HVDC tie, applied to a person.
 * [RESULT] The operator fails the arrest window by roughly the same margin a
 * transcontinental cable does, and for an unrelated reason. Two independent
 * physics, one architectural conclusion: keep humans and continents out of the
 * inner loop, and give both of them the outer one.
 */
export function loopVerdicts(s: AcquisitionSpec = CONSUMER_HEADBAND): LoopVerdict[] {
  const operatorS = latencyBudget(s).totalMs / 1000;
  return [
    { loop: "RoCoF arrest", windowS: ROCOF_ARREST_S, operatorS, canClose: operatorS <= ROCOF_ARREST_S },
    { loop: "FCR activation", windowS: FCR_FULL_S, operatorS, canClose: operatorS <= FCR_FULL_S },
    { loop: "Economic dispatch", windowS: DISPATCH_S, operatorS, canClose: operatorS <= DISPATCH_S },
  ];
}

/**
 * How good the electronics would have to get for a human to make the arrest
 * window. Returns the frequency resolution that would be required — and the
 * answer is a resolution too coarse to separate the EEG bands, which is the
 * point: the trade is not available.
 */
export function resolutionForArrest(s: AcquisitionSpec = CONSUMER_HEADBAND) {
  const b = latencyBudget(s);
  const overheadMs = b.totalMs - b.windowMs;
  const budgetMs = ROCOF_ARREST_S * 1000 - overheadMs;
  return budgetMs > 0 ? 1000 / budgetMs : Infinity;
}

export const OPERATOR_DOCTRINE = {
  /** Humans supervise. They do not stabilize. */
  canCloseInnerLoop: false,
  irreducibleTerm: "time-bandwidth product: T >= 1/df",
  note:
    "Every stage but the observation window can be engineered down. The window " +
    "cannot: resolving a frequency to df requires observing for 1/df. A faster " +
    "ADC, a faster radio and a bigger model all leave it untouched.",
} as const;
