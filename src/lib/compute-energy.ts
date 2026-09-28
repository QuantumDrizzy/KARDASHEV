/**
 * COMPUTE ENERGY — what a token actually costs in joules. M3.
 *
 * Not a leaderboard. `docs/NEXT-MODULES.md` §M3: Wh per useful token, from a
 * formula you can check, with the assumptions on the outside.
 *
 * ── The one thing most token-cost estimates get wrong ────────────────────────
 *
 * Autoregressive decode is **memory-bandwidth bound, not FLOP bound.** To emit
 * one token you must stream every weight you are going to use out of HBM. The
 * arithmetic is trivial by comparison. So the governing equation is not
 * "FLOPs / TFLOPS", it is a roofline:
 *
 *     t_mem  = (W_bytes + B · KV_bytes) / bandwidth
 *     t_flop = FLOPs(B) / (peak · MFU)
 *     t_step = max(t_mem, t_flop)
 *     E/token = P_device · t_step / B
 *
 * Two consequences fall straight out and both matter more than model choice:
 *
 *   1. At batch 1 the energy per token is `P·W/BW` and does not depend on how
 *      clever anything is. Interactive single-user inference is the worst
 *      possible operating point, by a wide margin.
 *   2. Energy per token falls as 1/B until the compute roof is hit. **Batching
 *      is the biggest lever in the whole model**, bigger than quantization,
 *      bigger than sparsity, bigger than the datacentre's PUE.
 *
 * ── What is derived, what is measured, what is a guess ───────────────────────
 *
 * Derived: everything above, plus KV-cache size from the attention shape, plus
 * training energy from the standard 6·P·D count (2 for the forward pass, 4 for
 * the backward pass).
 *
 * Measured/published: device specs. HBM bandwidth and TDP are datasheet values
 * and are the numbers the result actually turns on.
 *
 * Guessed, and labelled: MFU, PUE, utilization. They are multipliers on the
 * outside of the physics, never inside it.
 *
 * [HYPOTHESIS] `predictiveResidualFrac` encodes the predictive-coding claim:
 * that most of a forward pass recomputes something the model already knew. It is exposed as a **free parameter with no default
 * value asserted**, exactly like λ in forecast.ts. Do NOT quote a number for
 * it. If someone wants 90%, they can move the slider and see what it would
 * imply — the module will not do it for them.
 */

import { DATACENTER_W, ELECTRICITY_W } from "./facts.ts";
import { P_I } from "./kardashev.ts";
import { POPULATION as POPULATION_SHARED } from "./constants.ts";

// ────────────────────────────────────────────────────────── devices (datasheet)

export type Device = {
  id: string;
  name: string;
  /** Usable HBM/GDDR, GB. */
  vramGb: number;
  /** Memory bandwidth, GB/s. This is the number decode actually runs on. */
  bandwidthGBs: number;
  /** Board power, W. */
  tdpW: number;
  /** Dense tensor throughput at the quoted precision, FLOP/s. No sparsity. */
  denseFlops: number;
  flopsPrecision: "fp16" | "fp8";
  /**
   * Dense BF16 rate. Training runs in mixed precision, not FP8, so using the
   * inference number here understates a training run by 2x. Validated against
   * Meta's published Llama-3.1-405B GPU-hours.
   */
  trainFlops: number;
  note: string;
};

export const DEVICES: Record<string, Device> = {
  h100: {
    id: "h100",
    name: "H100 SXM5",
    vramGb: 80,
    bandwidthGBs: 3350,
    tdpW: 700,
    denseFlops: 1979e12,
    flopsPrecision: "fp8",
    trainFlops: 989e12,
    note: "HBM3. Datasheet dense FP8 for inference, BF16 for training.",
  },
  a100: {
    id: "a100",
    name: "A100 SXM4 80GB",
    vramGb: 80,
    bandwidthGBs: 2039,
    tdpW: 400,
    denseFlops: 312e12,
    flopsPrecision: "fp16",
    trainFlops: 312e12,
    note: "HBM2e. No FP8 tensor path.",
  },
  rtx5060ti16: {
    id: "rtx5060ti16",
    name: "RTX 5060 Ti 16GB",
    vramGb: 16,
    bandwidthGBs: 448,
    tdpW: 180,
    denseFlops: 95e12,
    flopsPrecision: "fp16",
    trainFlops: 95e12,
    note:
      "GDDR7. Bandwidth and TDP are published; dense FP16 is [ASSUMPTION] " +
      "derived from the AI-TOPS figure by removing INT4 and 2:4 sparsity.",
  },
};

// ────────────────────────────────────────────────────────────────── the model

export type ModelSpec = {
  name: string;
  /** Total parameters. What you must store. */
  paramsB: number;
  /** Parameters touched per token. Equals paramsB for a dense model; less for MoE. */
  activeParamsB: number;
  layers: number;
  dModel: number;
  /** Grouped-query attention: KV heads, not query heads. */
  kvHeads: number;
  headDim: number;
  /** Weight precision, bytes per parameter. 1 = FP8/INT8, 0.5 = INT4. */
  bytesPerParam: number;
  note?: string;
};

/**
 * Reference shapes. Public architecture figures; the frontier entry is an
 * [ASSUMPTION] since no frontier lab publishes its shape.
 */
export const MODELS: Record<string, ModelSpec> = {
  frontierMoe: {
    name: "Frontier MoE (assumed shape)",
    paramsB: 1800,
    activeParamsB: 220,
    layers: 120,
    dModel: 12288,
    kvHeads: 8,
    headDim: 128,
    bytesPerParam: 1,
    note: "[ASSUMPTION] No frontier lab publishes this. Order of magnitude only.",
  },
  dense70b: {
    name: "Dense 70B",
    paramsB: 70,
    activeParamsB: 70,
    layers: 80,
    dModel: 8192,
    kvHeads: 8,
    headDim: 128,
    bytesPerParam: 1,
  },
  moe8x7b: {
    name: "MoE 8x7B (2 experts active)",
    paramsB: 47,
    activeParamsB: 13,
    layers: 32,
    dModel: 4096,
    kvHeads: 8,
    headDim: 128,
    bytesPerParam: 1,
  },
  llama405b: {
    name: "Llama 3.1 405B (dense)",
    paramsB: 405,
    activeParamsB: 405,
    layers: 126,
    dModel: 16384,
    kvHeads: 8,
    headDim: 128,
    bytesPerParam: 1,
    note: "Published architecture. Used to validate the training-energy formula.",
  },
  local8b: {
    name: "Local 8B",
    paramsB: 8,
    activeParamsB: 8,
    layers: 32,
    dModel: 4096,
    kvHeads: 8,
    headDim: 128,
    bytesPerParam: 1,
  },
  local8bInt4: {
    name: "Local 8B, INT4",
    paramsB: 8,
    activeParamsB: 8,
    layers: 32,
    dModel: 4096,
    kvHeads: 8,
    headDim: 128,
    bytesPerParam: 0.5,
  },
};

export type ServingSpec = {
  /** Concurrent sequences decoded per step. The dominant lever. */
  batch: number;
  contextTokens: number;
  /** Model FLOPs utilization. [ASSUMPTION] 0.3-0.5 is realistic on a good stack. */
  mfu: number;
  /** Datacentre overhead: cooling, conversion. 1.0 = a machine on a desk. */
  pue: number;
  /** Fraction of TDP actually drawn while decoding. [ASSUMPTION] */
  powerFrac: number;
  /** Devices the model is sharded across. Bandwidth and power both scale. */
  devices: number;
  /**
   * [HYPOTHESIS] Fraction of the forward pass a predictive-coding or residual
   * scheme would avoid. NO DEFAULT VALUE IS ASSERTED. Left at 0 unless the
   * caller supplies one, and it is reported as a hypothesis wherever it is used.
   */
  predictiveResidualFrac?: number;
};

export const DEFAULT_SERVING: ServingSpec = {
  batch: 32,
  contextTokens: 8192,
  mfu: 0.4,
  pue: 1.2,
  powerFrac: 0.85,
  devices: 8,
};

/** A single user on their own machine. The worst operating point there is. */
export const INTERACTIVE_LOCAL: ServingSpec = {
  batch: 1,
  contextTokens: 8192,
  mfu: 0.3,
  pue: 1.0,
  powerFrac: 0.9,
  devices: 1,
};

// ───────────────────────────────────────────────────────────────── the physics

/** KV cache bytes per token of context, both K and V, all layers. FP16 cache. */
export const KV_BYTES_PER_ELEMENT = 2;

export function kvBytesPerToken(m: ModelSpec) {
  return 2 * m.layers * m.kvHeads * m.headDim * KV_BYTES_PER_ELEMENT;
}

export function weightBytes(m: ModelSpec) {
  return m.paramsB * 1e9 * m.bytesPerParam;
}

/** Bytes that must move per decode step: all active weights, plus every KV cache. */
export function bytesPerStep(m: ModelSpec, s: ServingSpec) {
  const activeWeights = m.activeParamsB * 1e9 * m.bytesPerParam;
  return activeWeights + s.batch * s.contextTokens * kvBytesPerToken(m);
}

/**
 * FLOPs per decode step. 2 per active parameter per token (one multiply, one
 * add), plus attention, which is 4·layers·dModel·context per token and starts
 * to matter past a few thousand tokens of context.
 */
export function flopsPerStep(m: ModelSpec, s: ServingSpec) {
  const dense = 2 * m.activeParamsB * 1e9;
  const attention = 4 * m.layers * m.dModel * s.contextTokens;
  const residual = 1 - (s.predictiveResidualFrac ?? 0);
  return (dense + attention) * s.batch * residual;
}

export type Roofline = {
  tMemS: number;
  tFlopS: number;
  tStepS: number;
  bound: "memory" | "compute";
  /** Arithmetic intensity, FLOP per byte. Low means bandwidth decides. */
  intensity: number;
  tokensPerS: number;
};

export function roofline(m: ModelSpec, s: ServingSpec, d: Device): Roofline {
  const bytes = bytesPerStep(m, s);
  const flops = flopsPerStep(m, s);
  const tMemS = bytes / (d.bandwidthGBs * 1e9 * s.devices);
  const tFlopS = flops / (d.denseFlops * s.mfu * s.devices);
  const tStepS = Math.max(tMemS, tFlopS);
  return {
    tMemS,
    tFlopS,
    tStepS,
    bound: tMemS >= tFlopS ? "memory" : "compute",
    intensity: flops / bytes,
    tokensPerS: s.batch / tStepS,
  };
}

export type Fit = {
  weightsGb: number;
  kvGb: number;
  totalGb: number;
  capacityGb: number;
  fits: boolean;
  /** Largest batch that still fits, at this context length. */
  maxBatch: number;
};

/** Does it physically fit in VRAM? The constraint that kills naive batching. */
export function fit(m: ModelSpec, s: ServingSpec, d: Device): Fit {
  const weightsGb = weightBytes(m) / 1e9;
  const kvPerSeqGb = (s.contextTokens * kvBytesPerToken(m)) / 1e9;
  const capacityGb = d.vramGb * s.devices;
  const kvGb = kvPerSeqGb * s.batch;
  const headroomGb = capacityGb - weightsGb;
  return {
    weightsGb,
    kvGb,
    totalGb: weightsGb + kvGb,
    capacityGb,
    fits: weightsGb + kvGb <= capacityGb,
    maxBatch: headroomGb > 0 && kvPerSeqGb > 0 ? Math.floor(headroomGb / kvPerSeqGb) : 0,
  };
}

export type TokenEnergy = {
  joulesPerToken: number;
  whPerToken: number;
  /** A 500-token answer, the unit people actually feel. */
  whPerResponse: number;
  tokensPerS: number;
  bound: "memory" | "compute";
  fits: boolean;
  maxBatch: number;
  devicePowerW: number;
  roofline: Roofline;
  /** True when a hypothesis parameter was applied. Surface it in the UI. */
  usedHypothesis: boolean;
};

export const TOKENS_PER_RESPONSE = 500;

export function energyPerToken(
  m: ModelSpec,
  s: ServingSpec,
  d: Device,
  responseTokens = TOKENS_PER_RESPONSE,
): TokenEnergy {
  const r = roofline(m, s, d);
  const f = fit(m, s, d);
  const devicePowerW = d.tdpW * s.devices * s.powerFrac * s.pue;
  const joulesPerToken = (devicePowerW * r.tStepS) / s.batch;
  const whPerToken = joulesPerToken / 3600;
  return {
    joulesPerToken,
    whPerToken,
    whPerResponse: whPerToken * responseTokens,
    tokensPerS: r.tokensPerS,
    bound: r.bound,
    fits: f.fits,
    maxBatch: f.maxBatch,
    devicePowerW,
    roofline: r,
    usedHypothesis: (s.predictiveResidualFrac ?? 0) > 0,
  };
}

// ────────────────────────────────────────────────────────────────── training

/**
 * Standard count: 6 FLOPs per parameter per training token — 2 forward, 4
 * backward. Dense parameters, not MoE totals, since only active experts get
 * gradients on a given token.
 */
export const FLOPS_PER_PARAM_PER_TRAIN_TOKEN = 6;

export function trainingJoules(
  m: ModelSpec,
  trainTokens: number,
  d: Device,
  o: { mfu?: number; pue?: number; powerFrac?: number } = {},
) {
  const mfu = o.mfu ?? 0.4;
  const pue = o.pue ?? 1.2;
  const powerFrac = o.powerFrac ?? 0.9;
  const flops = FLOPS_PER_PARAM_PER_TRAIN_TOKEN * m.activeParamsB * 1e9 * trainTokens;
  const deviceSeconds = flops / (d.trainFlops * mfu);
  return deviceSeconds * d.tdpW * powerFrac * pue;
}

/** Device-hours a training run costs. The unit model cards actually report. */
export function trainingDeviceHours(
  m: ModelSpec,
  trainTokens: number,
  d: Device,
  mfu = 0.4,
) {
  const flops = FLOPS_PER_PARAM_PER_TRAIN_TOKEN * m.activeParamsB * 1e9 * trainTokens;
  return flops / (d.trainFlops * mfu) / 3600;
}

/**
 * Training amortized over a serving lifetime. [RESULT] For anything widely
 * served, training is a rounding error against inference — the opposite of the
 * usual framing, and it follows from arithmetic, not opinion.
 */
export function amortizedTrainingJoulesPerToken(
  m: ModelSpec,
  trainTokens: number,
  servedTokens: number,
  d: Device,
) {
  return servedTokens > 0 ? trainingJoules(m, trainTokens, d) / servedTokens : Infinity;
}

// ───────────────────────────────────────────────── tying it back to the scale

/**
 * The Kardashev question: what does a token cost the planet, and what would it
 * take for inference to become a civilization-scale load?
 */
export type ComputeScale = {
  whPerToken: number;
  /** Tokens per second the world's current datacentre fleet could sustain. */
  tokensPerSAtDatacenterPower: number;
  /** Tokens per second at 1% of world electricity. */
  tokensPerSAtOnePercentElectricity: number;
  /** Tokens per second if all of Type I went to inference. */
  tokensPerSAtTypeI: number;
  /** Tokens per person per day at 1% of world electricity, 8.2e9 people. */
  tokensPerPersonPerDayAtOnePercent: number;
  /** Fraction of world electricity to give everyone 1000 tokens/day. */
  worldElectricityFracFor1kPerPersonPerDay: number;
};

export const POPULATION = POPULATION_SHARED;

export function computeScale(whPerToken: number): ComputeScale {
  const jPerToken = whPerToken * 3600;
  const atPower = (w: number) => (jPerToken > 0 ? w / jPerToken : Infinity);
  const onePct = atPower(ELECTRICITY_W * 0.01);
  const need1k = (POPULATION * 1000 * jPerToken) / 86400;
  return {
    whPerToken,
    tokensPerSAtDatacenterPower: atPower(DATACENTER_W),
    tokensPerSAtOnePercentElectricity: onePct,
    tokensPerSAtTypeI: atPower(P_I),
    tokensPerPersonPerDayAtOnePercent: (onePct * 86400) / POPULATION,
    worldElectricityFracFor1kPerPersonPerDay: need1k / ELECTRICITY_W,
  };
}

// ───────────────────────────────────────────────────────────────── scenarios

export type Scenario = {
  id: string;
  label: string;
  model: ModelSpec;
  serving: ServingSpec;
  device: Device;
};

export const SCENARIOS: Scenario[] = [
  {
    id: "frontier-served",
    label: "Frontier MoE, batched, datacentre",
    model: MODELS.frontierMoe,
    // 1.8 T params at 1 byte is 1.8 TB of weights: it takes 32 cards to hold it.
    serving: { ...DEFAULT_SERVING, batch: 32, devices: 32 },
    device: DEVICES.h100,
  },
  {
    id: "frontier-interactive",
    label: "Frontier MoE, one user at a time",
    model: MODELS.frontierMoe,
    serving: { ...DEFAULT_SERVING, batch: 1, devices: 32 },
    device: DEVICES.h100,
  },
  {
    id: "dense70b-served",
    label: "Dense 70B, batched, datacentre",
    model: MODELS.dense70b,
    serving: { ...DEFAULT_SERVING, batch: 32, devices: 2 },
    device: DEVICES.h100,
  },
  {
    id: "moe-served",
    label: "MoE 8x7B, batched, datacentre",
    model: MODELS.moe8x7b,
    serving: { ...DEFAULT_SERVING, batch: 32, devices: 2 },
    device: DEVICES.h100,
  },
  {
    id: "local-8b",
    label: "Local 8B on one consumer card",
    model: MODELS.local8b,
    serving: INTERACTIVE_LOCAL,
    device: DEVICES.rtx5060ti16,
  },
  {
    id: "local-8b-int4",
    label: "Local 8B INT4 on one consumer card",
    model: MODELS.local8bInt4,
    serving: INTERACTIVE_LOCAL,
    device: DEVICES.rtx5060ti16,
  },
];

export function runScenarios(scenarios = SCENARIOS) {
  return scenarios.map((s) => ({
    ...s,
    energy: energyPerToken(s.model, s.serving, s.device),
  }));
}

/** Energy per token against batch size. The curve that carries the module. */
export function batchSweep(
  m: ModelSpec,
  s: ServingSpec,
  d: Device,
  batches = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
) {
  return batches.map((batch) => {
    const e = energyPerToken(m, { ...s, batch }, d);
    return {
      batch,
      whPerToken: e.whPerToken,
      bound: e.bound,
      fits: e.fits,
      tokensPerS: e.tokensPerS,
    };
  });
}
