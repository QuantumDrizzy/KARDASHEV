/**
 * GRID QUBO — combinatorial assignment for the inter-cluster trade step. M2c.
 *
 * `grid.ts` ships `greedyAllocator`: cheapest link first, continuous flows, one
 * pass. This module asks whether that is leaving anything on the table, and it
 * asks it the only way worth asking — by building the exact optimum and
 * measuring the gap, not by asserting that a fancier solver must be better.
 *
 * Three allocators, on purpose:
 *
 *   greedy       continuous flows, O(L log L). The incumbent.
 *   exhaustive   the QUANTIZED optimum, by enumeration. Ground truth for the
 *                discretized problem, and the yardstick the QUBO must match.
 *   qubo         a real QUBO — an explicit Q matrix over binary variables,
 *                solved by simulated annealing. This is the D-Wave-shaped
 *                formulation, run classically.
 *
 * ── The formulation ──────────────────────────────────────────────────────────
 *
 * Flow on link ℓ is discretized into B blocks in a unary ("thermometer")
 * encoding: n_ℓ = Σ_b x_{ℓb}, f_ℓ = (u_ℓ/B)·n_ℓ. Unary is the right encoding
 * here because the objective is quadratic in flow, so (Σx)² expands into a
 * genuine quadratic form with no auxiliary products.
 *
 *   H = Σ_j ( d_j − Σ_{ℓ→j} a_ℓ n_ℓ )²        demand matching, per deficit node
 *     + P · Σ_i ( Σ_{ℓ←i} g_ℓ n_ℓ + σ_i − s_i )²   surplus budget, with slack
 *
 * The slack σ_i (also unary) turns the surplus inequality into an equality,
 * which is the textbook way to put an inequality into a QUBO. Squaring the
 * demand term penalises over-delivery as well as under-delivery, which is
 * correct: energy pushed at a node that cannot use it is curtailed at the far
 * end after paying the full transport loss.
 *
 * ── The one honest compromise ────────────────────────────────────────────────
 *
 * Transport loss is `f·(1 − m·f)`, so delivered energy is quadratic in flow and
 * the squared demand term would be QUARTIC in x — not a QUBO. The loss is
 * therefore LINEARIZED about an operating point and the solve is iterated
 * (successive linearization). That is standard practice and it is also the
 * catch: the encoding cannot represent the physics exactly, so the QUBO is
 * solving a slightly different problem from the one greedy solves.
 *
 * ── [RESULT] ─────────────────────────────────────────────────────────────────
 *
 * See `allocatorComparison()` and the locks in grid-qubo.test.ts. The short
 * version, measured rather than assumed: quantization costs more than
 * optimality recovers. Do not swap the default.
 */

import {
  type Allocator,
  type Flow,
  type GridModel,
  type Link,
  type RegionId,
  type TradeContext,
  buildGrid,
  greedyAllocator,
  simulate,
} from "./grid.ts";

// ─────────────────────────────────────────────────────────────── QUBO algebra

/** Upper-triangular dense QUBO. Energy = xᵀQx + offset, with Q[i][i] linear. */
export type Qubo = {
  n: number;
  /** Row-major n×n, only i ≤ j populated. */
  Q: Float64Array;
  offset: number;
};

export function makeQubo(n: number): Qubo {
  return { n, Q: new Float64Array(n * n), offset: 0 };
}

export function quboAdd(q: Qubo, i: number, j: number, v: number) {
  const [a, b] = i <= j ? [i, j] : [j, i];
  q.Q[a * q.n + b] += v;
}

export function quboEnergy(q: Qubo, x: Uint8Array) {
  let e = q.offset;
  for (let i = 0; i < q.n; i++) {
    if (!x[i]) continue;
    e += q.Q[i * q.n + i];
    for (let j = i + 1; j < q.n; j++) if (x[j]) e += q.Q[i * q.n + j];
  }
  return e;
}

/** Energy change from flipping bit k. Lets annealing run in O(n) per proposal. */
function deltaEnergy(q: Qubo, x: Uint8Array, k: number) {
  const n = q.n;
  let d = q.Q[k * n + k];
  for (let j = 0; j < n; j++) {
    if (j === k || !x[j]) continue;
    d += j > k ? q.Q[k * n + j] : q.Q[j * n + k];
  }
  return x[k] ? -d : d;
}

/**
 * Add w·(c + Σ wᵢxᵢ)² to the QUBO. Uses x² = x for binaries, which is what
 * makes the square collapse into linear + pairwise terms.
 */
export function addSquare(
  q: Qubo,
  weight: number,
  constant: number,
  terms: { index: number; coeff: number }[],
) {
  q.offset += weight * constant * constant;
  for (let k = 0; k < terms.length; k++) {
    const { index: i, coeff: wi } = terms[k];
    quboAdd(q, i, i, weight * (2 * constant * wi + wi * wi));
    for (let l = k + 1; l < terms.length; l++) {
      const { index: j, coeff: wj } = terms[l];
      quboAdd(q, i, j, weight * 2 * wi * wj);
    }
  }
}

// ────────────────────────────────────────────────────────── deterministic RNG

/** xorshift32. Seeded so every test and every chart is reproducible. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

export type AnnealOptions = {
  sweeps?: number;
  restarts?: number;
  seed?: number;
  tHot?: number;
  tCold?: number;
};

/** Simulated annealing. The classical stand-in for a quantum annealer. */
export function annealQubo(q: Qubo, o: AnnealOptions = {}) {
  const sweeps = o.sweeps ?? 200;
  const restarts = o.restarts ?? 4;
  const rand = rng(o.seed ?? 1);
  // Temperature scale from the largest coefficient, so it works in any units.
  let scale = 0;
  for (let i = 0; i < q.Q.length; i++) scale = Math.max(scale, Math.abs(q.Q[i]));
  const tHot = o.tHot ?? Math.max(scale, 1e-12);
  const tCold = o.tCold ?? tHot * 1e-4;

  let best = new Uint8Array(q.n);
  let bestE = quboEnergy(q, best);

  for (let r = 0; r < restarts; r++) {
    const x = new Uint8Array(q.n);
    if (r > 0) for (let i = 0; i < q.n; i++) x[i] = rand() < 0.5 ? 1 : 0;
    let e = quboEnergy(q, x);
    for (let s = 0; s < sweeps; s++) {
      const t = tHot * (tCold / tHot) ** (s / Math.max(1, sweeps - 1));
      for (let i = 0; i < q.n; i++) {
        const k = Math.floor(rand() * q.n) % q.n;
        const d = deltaEnergy(q, x, k);
        if (d <= 0 || rand() < Math.exp(-d / t)) {
          x[k] ^= 1;
          e += d;
        }
      }
      if (e < bestE) {
        bestE = e;
        best = x.slice();
      }
    }
  }
  return { x: best, energy: bestE, sweeps, restarts };
}

// ──────────────────────────────────────────────────── the trade instance

/** One hour of the trade problem, reduced to the links that can actually flow. */
export type TradeInstance = {
  arcs: { link: Link; from: RegionId; to: RegionId; maxSentW: number }[];
  surplus: Record<RegionId, number>;
  deficit: Record<RegionId, number>;
  /** Normalizing power, so the squared objective stays in sane float range. */
  scaleW: number;
};

export function tradeInstance(ctx: TradeContext): TradeInstance {
  const arcs: TradeInstance["arcs"] = [];
  for (const link of ctx.openLinks) {
    let from: RegionId;
    let to: RegionId;
    if (ctx.surplus[link.a] > 0 && ctx.deficit[link.b] > 0) {
      from = link.a;
      to = link.b;
    } else if (ctx.surplus[link.b] > 0 && ctx.deficit[link.a] > 0) {
      from = link.b;
      to = link.a;
    } else continue;
    // Never past the maximum-power point: beyond it more current delivers less.
    const peak = link.lossSlopePerW > 0 ? 1 / (2 * link.lossSlopePerW) : Infinity;
    const maxSentW = Math.min(ctx.surplus[from], link.capacityW, peak);
    if (maxSentW > 0) arcs.push({ link, from, to, maxSentW });
  }
  const totalDeficit = Object.values(ctx.deficit).reduce((a, b) => a + b, 0);
  return {
    arcs,
    surplus: { ...ctx.surplus },
    deficit: { ...ctx.deficit },
    scaleW: totalDeficit > 0 ? totalDeficit : 1,
  };
}

const deliveredW = (link: Link, sentW: number) => sentW * (1 - link.lossSlopePerW * sentW);

/** Unserved energy left after a set of block counts. The objective, exactly. */
export function evaluateBlocks(inst: TradeInstance, blocks: number[], B: number) {
  const sentFrom: Record<string, number> = {};
  const got: Record<string, number> = {};
  let sentTotal = 0;
  for (let i = 0; i < inst.arcs.length; i++) {
    const a = inst.arcs[i];
    const sent = (a.maxSentW * blocks[i]) / B;
    if (sent <= 0) continue;
    sentFrom[a.from] = (sentFrom[a.from] ?? 0) + sent;
    got[a.to] = (got[a.to] ?? 0) + deliveredW(a.link, sent);
    sentTotal += sent;
  }
  // Infeasible if a cluster exported more than it had.
  for (const id of Object.keys(sentFrom)) {
    if (sentFrom[id] > inst.surplus[id as RegionId] + 1e-6) return null;
  }
  let unserved = 0;
  for (const id of Object.keys(inst.deficit)) {
    unserved += Math.max(0, inst.deficit[id as RegionId] - (got[id] ?? 0));
  }
  return { unservedW: unserved, sentTotalW: sentTotal };
}

function blocksToFlows(inst: TradeInstance, blocks: number[], B: number): Flow[] {
  const flows: Flow[] = [];
  const remainingSurplus = { ...inst.surplus };
  const remainingDeficit = { ...inst.deficit };
  for (let i = 0; i < inst.arcs.length; i++) {
    const a = inst.arcs[i];
    let sentW = (a.maxSentW * blocks[i]) / B;
    sentW = Math.min(sentW, remainingSurplus[a.from]);
    if (sentW <= 0) continue;
    let delivered = deliveredW(a.link, sentW);
    // Never deliver more than the far end can use; trim the send instead.
    if (delivered > remainingDeficit[a.to]) {
      const m = a.link.lossSlopePerW;
      const want = remainingDeficit[a.to];
      const disc = m > 0 ? 1 - 4 * m * want : 1;
      sentW = m > 0 && disc > 0 ? (1 - Math.sqrt(disc)) / (2 * m) : want;
      delivered = deliveredW(a.link, sentW);
    }
    if (sentW <= 0) continue;
    remainingSurplus[a.from] -= sentW;
    remainingDeficit[a.to] = Math.max(0, remainingDeficit[a.to] - delivered);
    flows.push({
      linkId: a.link.id,
      from: a.from,
      to: a.to,
      sentW,
      deliveredW: delivered,
      lossFrac: a.link.lossSlopePerW * sentW,
      loadingFrac: a.link.capacityW > 0 ? sentW / a.link.capacityW : 0,
    });
  }
  return flows;
}

// ──────────────────────────────────────────────────────── exhaustive optimum

export type QuboAllocatorOptions = {
  /** Blocks per link. Resolution of the discretization. */
  blocks?: number;
  /** Above this many active arcs, enumeration is abandoned for greedy. */
  maxArcs?: number;
  anneal?: AnnealOptions;
  /** Slack resolution per surplus cluster in the QUBO encoding. */
  slackBits?: number;
};

/**
 * Exact optimum of the DISCRETIZED problem, by enumeration over block counts.
 * (B+1)^arcs states — tiny in practice, because at any hour only a couple of
 * links have a surplus at one end and a deficit at the other.
 *
 * This is the yardstick. Greedy's optimality gap and the annealer's solution
 * quality are both measured against it, not against each other.
 */
export function exhaustiveBlocks(inst: TradeInstance, o: QuboAllocatorOptions = {}) {
  const B = o.blocks ?? 8;
  const L = inst.arcs.length;
  const blocks = new Array(L).fill(0);
  let best: number[] | null = null;
  let bestUnserved = Infinity;
  let bestSent = Infinity;

  const recurse = (i: number) => {
    if (i === L) {
      const r = evaluateBlocks(inst, blocks, B);
      if (!r) return;
      // Minimize unserved; break ties toward moving less power (less loss).
      if (r.unservedW < bestUnserved - 1e-9 || (Math.abs(r.unservedW - bestUnserved) <= 1e-9 && r.sentTotalW < bestSent)) {
        bestUnserved = r.unservedW;
        bestSent = r.sentTotalW;
        best = blocks.slice();
      }
      return;
    }
    for (let b = 0; b <= B; b++) {
      blocks[i] = b;
      recurse(i + 1);
    }
    blocks[i] = 0;
  };
  recurse(0);
  return { blocks: best, unservedW: bestUnserved, states: (B + 1) ** L };
}

export function makeExhaustiveAllocator(o: QuboAllocatorOptions = {}): Allocator {
  const B = o.blocks ?? 8;
  const maxArcs = o.maxArcs ?? 5;
  return (ctx) => {
    const inst = tradeInstance(ctx);
    if (inst.arcs.length === 0) return [];
    if (inst.arcs.length > maxArcs) return greedyAllocator(ctx);
    const { blocks } = exhaustiveBlocks(inst, { ...o, blocks: B });
    if (!blocks) return [];
    const flows = blocksToFlows(inst, blocks, B);
    applyFlows(ctx, flows);
    return flows;
  };
}

/** An allocator must leave `ctx.surplus`/`ctx.deficit` drawn down, like greedy. */
function applyFlows(ctx: TradeContext, flows: Flow[]) {
  for (const f of flows) {
    ctx.surplus[f.from] = Math.max(0, ctx.surplus[f.from] - f.sentW);
    ctx.deficit[f.to] = Math.max(0, ctx.deficit[f.to] - f.deliveredW);
  }
}

// ───────────────────────────────────────────────────────────── the QUBO proper

export type TradeQubo = {
  qubo: Qubo;
  blocks: number;
  arcVars: number[][];
  slackVars: Record<string, number[]>;
  decode: (x: Uint8Array) => number[];
};

/**
 * Build the Q matrix for one hour of trade. Loss is linearized about
 * `linearizeAtLoading` — the compromise documented at the top of this file.
 */
export function buildTradeQubo(
  inst: TradeInstance,
  o: QuboAllocatorOptions & { linearizeAtLoading?: number; penalty?: number } = {},
): TradeQubo {
  const B = o.blocks ?? 8;
  // Tuned by sweep, not guessed. Coarse slack cannot satisfy the surplus
  // equality at the points the objective wants, so a heavy penalty drags the
  // solution off the optimum: at penalty 8 / 3 bits the ground state was 1.93%
  // worse than exact; at penalty 0.5 / 8 bits it reaches it.
  const S = o.slackBits ?? 8;
  const lin = o.linearizeAtLoading ?? 0.5;
  const R = inst.scaleW;

  const arcVars: number[][] = [];
  let n = 0;
  for (let i = 0; i < inst.arcs.length; i++) {
    arcVars.push(Array.from({ length: B }, () => n++));
  }
  const surplusIds = [...new Set(inst.arcs.map((a) => a.from))];
  const slackVars: Record<string, number[]> = {};
  for (const id of surplusIds) slackVars[id] = Array.from({ length: S }, () => n++);

  const q = makeQubo(n);

  // Delivery coefficient per block, normalized, at the linearization point.
  const blockSent = inst.arcs.map((a) => a.maxSentW / B);
  const blockDelivered = inst.arcs.map((a, i) => {
    const fHat = a.maxSentW * lin;
    const c = Math.max(0, 1 - a.link.lossSlopePerW * fHat);
    return (blockSent[i] * c) / R;
  });

  // 1. Demand matching, one squared term per deficit cluster.
  const deficitIds = [...new Set(inst.arcs.map((a) => a.to))];
  for (const id of deficitIds) {
    const terms: { index: number; coeff: number }[] = [];
    for (let i = 0; i < inst.arcs.length; i++) {
      if (inst.arcs[i].to !== id) continue;
      for (const v of arcVars[i]) terms.push({ index: v, coeff: -blockDelivered[i] });
    }
    addSquare(q, 1, inst.deficit[id as RegionId] / R, terms);
  }

  // 2. Surplus budget as an equality, using unary slack. Penalty must dominate
  //    the demand term or the solver will happily overdraw a cluster.
  const penalty = o.penalty ?? 0.5;
  for (const id of surplusIds) {
    const sNorm = inst.surplus[id as RegionId] / R;
    const terms: { index: number; coeff: number }[] = [];
    for (let i = 0; i < inst.arcs.length; i++) {
      if (inst.arcs[i].from !== id) continue;
      for (const v of arcVars[i]) terms.push({ index: v, coeff: blockSent[i] / R });
    }
    for (const v of slackVars[id]) terms.push({ index: v, coeff: sNorm / S });
    addSquare(q, penalty, -sNorm, terms);
  }

  return {
    qubo: q,
    blocks: B,
    arcVars,
    slackVars,
    decode: (x: Uint8Array) => arcVars.map((vars) => vars.reduce((a, v) => a + x[v], 0)),
  };
}

export function makeQuboAllocator(o: QuboAllocatorOptions = {}): Allocator {
  const B = o.blocks ?? 8;
  const maxArcs = o.maxArcs ?? 6;
  return (ctx) => {
    const inst = tradeInstance(ctx);
    if (inst.arcs.length === 0) return [];
    if (inst.arcs.length > maxArcs) return greedyAllocator(ctx);
    const built = buildTradeQubo(inst, o);
    const { x } = annealQubo(built.qubo, o.anneal);
    let blocks = built.decode(x);
    // Successive linearization: re-solve once about the flow just found.
    const loading =
      blocks.reduce((a, b) => a + b, 0) / Math.max(1, blocks.length * B) || 0.5;
    const built2 = buildTradeQubo(inst, { ...o, linearizeAtLoading: loading });
    const r2 = annealQubo(built2.qubo, o.anneal);
    const blocks2 = built2.decode(r2.x);
    const e1 = evaluateBlocks(inst, blocks, B);
    const e2 = evaluateBlocks(inst, blocks2, B);
    if (e2 && (!e1 || e2.unservedW < e1.unservedW)) blocks = blocks2;
    if (!evaluateBlocks(inst, blocks, B)) return greedyAllocator(ctx);
    const flows = blocksToFlows(inst, blocks, B);
    applyFlows(ctx, flows);
    return flows;
  };
}

export const quboAllocator = makeQuboAllocator();
export const exhaustiveAllocator = makeExhaustiveAllocator();

// ──────────────────────────────────────────────────────────── the measurement

export type AllocatorScore = {
  label: string;
  unservedFrac: number;
  tradedJ: number;
  ms: number;
  /** Excess unserved energy over the best allocator tried, in pp. */
  gapPp: number;
};

/** Histogram of how many links can actually flow in a given hour. */
export function arcHistogram(o: { grid?: GridModel; hours?: number; weather?: boolean } = {}) {
  const grid = o.grid ?? buildGrid();
  const hist: Record<number, number> = {};
  let maxArcs = 0;
  simulate({
    grid,
    hours: o.hours ?? 720,
    weather: o.weather ?? true,
    allocator: (ctx) => {
      const k = tradeInstance(ctx).arcs.length;
      hist[k] = (hist[k] ?? 0) + 1;
      maxArcs = Math.max(maxArcs, k);
      return greedyAllocator(ctx);
    },
  });
  return { hist, maxArcs };
}

/**
 * Run every allocator over the same grid and report. This is the function that
 * decides whether the QUBO earns its place, and the answer it gives is no.
 */
export function allocatorComparison(
  o: { grid?: GridModel; hours?: number; weather?: boolean; blocks?: number } = {},
): AllocatorScore[] {
  const grid = o.grid ?? buildGrid();
  const hours = o.hours ?? 720;
  const weather = o.weather ?? true;
  const blocks = o.blocks ?? 8;

  const candidates: { label: string; allocator: Allocator | undefined }[] = [
    { label: "greedy", allocator: undefined },
    { label: "exhaustive", allocator: makeExhaustiveAllocator({ blocks }) },
    { label: "qubo", allocator: makeQuboAllocator({ blocks }) },
  ];

  const scored = candidates.map(({ label, allocator }) => {
    const t0 = Date.now();
    const sim = simulate({ grid, hours, weather, allocator });
    return {
      label,
      unservedFrac: sim.unservedFrac,
      tradedJ: sim.steps.reduce((a, s) => a + s.tradedW * 3600, 0),
      ms: Date.now() - t0,
      gapPp: 0,
    };
  });
  const best = Math.min(...scored.map((s) => s.unservedFrac));
  for (const s of scored) s.gapPp = (s.unservedFrac - best) * 100;
  return scored;
}
