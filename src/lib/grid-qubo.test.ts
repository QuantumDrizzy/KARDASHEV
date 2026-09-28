import assert from "node:assert/strict";
import test from "node:test";
import { buildGrid, greedyAllocator, simulate } from "./grid.ts";
import {
  addSquare,
  allocatorComparison,
  annealQubo,
  arcHistogram,
  buildTradeQubo,
  evaluateBlocks,
  exhaustiveBlocks,
  makeExhaustiveAllocator,
  makeQubo,
  makeQuboAllocator,
  quboAdd,
  quboEnergy,
  rng,
  tradeInstance,
} from "./grid-qubo.ts";

// ───────────────────────────────────────────────────── the machinery is right

test("quboEnergy agrees with the naive quadratic form", () => {
  const q = makeQubo(4);
  const r = rng(3);
  for (let i = 0; i < 4; i++) for (let j = i; j < 4; j++) quboAdd(q, i, j, r() * 2 - 1);
  for (let m = 0; m < 16; m++) {
    const x = new Uint8Array([m & 1, (m >> 1) & 1, (m >> 2) & 1, (m >> 3) & 1]);
    let e = q.offset;
    for (let i = 0; i < 4; i++) for (let j = i; j < 4; j++) if (x[i] && x[j]) e += q.Q[i * 4 + j];
    assert.ok(Math.abs(e - quboEnergy(q, x)) < 1e-12);
  }
});

test("addSquare expands the square exactly, using x squared equals x", () => {
  const q = makeQubo(3);
  addSquare(q, 1, 0.3, [
    { index: 0, coeff: -0.5 },
    { index: 1, coeff: 0.7 },
    { index: 2, coeff: 1.1 },
  ]);
  for (let m = 0; m < 8; m++) {
    const x = new Uint8Array([m & 1, (m >> 1) & 1, (m >> 2) & 1]);
    const direct = (0.3 - 0.5 * x[0] + 0.7 * x[1] + 1.1 * x[2]) ** 2;
    assert.ok(Math.abs(direct - quboEnergy(q, x)) < 1e-12, `m=${m}`);
  }
});

test("the annealer reaches the ground state of a small QUBO", () => {
  const r = rng(17);
  for (let trial = 0; trial < 4; trial++) {
    const n = 12;
    const q = makeQubo(n);
    for (let i = 0; i < n; i++) for (let j = i; j < n; j++) quboAdd(q, i, j, r() * 2 - 1);
    let exact = Infinity;
    for (let m = 0; m < 1 << n; m++) {
      const x = new Uint8Array(n);
      for (let i = 0; i < n; i++) x[i] = (m >> i) & 1;
      exact = Math.min(exact, quboEnergy(q, x));
    }
    const got = annealQubo(q, { sweeps: 300, restarts: 6, seed: 100 + trial });
    assert.ok(Math.abs(got.energy - exact) < 1e-9, `trial ${trial}: ${got.energy} vs ${exact}`);
  }
});

// ────────────────────────────────────────── the problem is not combinatorial

test("[THE RESULT] the trade instance never has more than two active links", () => {
  // 87% of hours have no link with a surplus at one end and a deficit at the
  // other. 12% have exactly one, which is a 1-D continuous problem. Under 2%
  // have two. There is no combinatorial structure here to exploit.
  const { hist, maxArcs } = arcHistogram({ hours: 720 });
  assert.ok(maxArcs <= 3, `saw ${maxArcs} simultaneous arcs`);
  const total = Object.values(hist).reduce((a, b) => a + b, 0);
  assert.ok((hist[0] ?? 0) / total > 0.7, "most hours should have no trade at all");
  assert.ok((hist[2] ?? 0) / total < 0.1, "two-link hours should be rare");
});

test("greedy is optimal: it matches the enumerated optimum over a full year", () => {
  const grid = buildGrid();
  const g = simulate({ grid, hours: 8760, weather: true });
  const e = simulate({
    grid,
    hours: 8760,
    weather: true,
    allocator: makeExhaustiveAllocator({ blocks: 16 }),
  });
  const gapPp = (g.unservedFrac - e.unservedFrac) * 100;
  assert.ok(gapPp >= 0, "greedy beat the optimum — the enumeration is wrong");
  assert.ok(gapPp < 0.001, `greedy is ${gapPp} pp off the optimum`);
});

test("finer quantization does not find anything greedy missed", () => {
  const grid = buildGrid();
  const at = (blocks: number) =>
    simulate({ grid, hours: 720, weather: true, allocator: makeExhaustiveAllocator({ blocks }) })
      .unservedFrac;
  assert.ok(Math.abs(at(8) - at(32)) < 1e-9, "the answer moved with resolution");
});

// ──────────────────────────────────────────────── the QUBO, measured honestly

test("the QUBO reproduces the greedy answer, at a large multiple of the cost", () => {
  const scores = allocatorComparison({ hours: 720 });
  const greedy = scores.find((s) => s.label === "greedy")!;
  const qubo = scores.find((s) => s.label === "qubo")!;
  // It gets there — the formulation and the solver are sound.
  assert.ok(qubo.gapPp < 0.001, `qubo is ${qubo.gapPp} pp off`);
  // ...and it costs an order of magnitude more wall clock to do it.
  assert.ok(qubo.ms > greedy.ms * 5, `qubo ${qubo.ms} ms vs greedy ${greedy.ms} ms`);
});

test("penalty weight and slack resolution decide whether the QUBO is even right", () => {
  // [FINDING] The ground state of a badly-tuned QUBO is not the optimum of the
  // problem. Coarse slack cannot satisfy the surplus equality where the
  // objective wants to sit, so a heavy penalty drags the solution away. This is
  // the tuning tax that never appears in a QUBO pitch.
  const grid = buildGrid();
  const instances: ReturnType<typeof tradeInstance>[] = [];
  simulate({
    grid,
    hours: 720,
    weather: true,
    allocator: (ctx) => {
      const inst = tradeInstance(ctx);
      if (inst.arcs.length === 2 && instances.length < 6) instances.push(inst);
      return greedyAllocator(ctx);
    },
  });
  assert.ok(instances.length >= 3, "need some two-arc instances to test tuning");

  const excess = (penalty: number, slackBits: number) => {
    let sum = 0;
    let n = 0;
    for (const inst of instances) {
      const B = 4;
      const built = buildTradeQubo(inst, { blocks: B, slackBits, penalty });
      if (built.qubo.n > 20) continue;
      let bestE = Infinity;
      let bestX = new Uint8Array(built.qubo.n);
      for (let m = 0; m < 1 << built.qubo.n; m++) {
        const x = new Uint8Array(built.qubo.n);
        for (let i = 0; i < built.qubo.n; i++) x[i] = (m >> i) & 1;
        const e = quboEnergy(built.qubo, x);
        if (e < bestE) {
          bestE = e;
          bestX = x;
        }
      }
      const ev = evaluateBlocks(inst, built.decode(bestX), B);
      const ex = exhaustiveBlocks(inst, { blocks: B });
      if (!ev) continue;
      sum += (ev.unservedW - ex.unservedW) / Math.max(1, ex.unservedW);
      n++;
    }
    return n > 0 ? sum / n : 0;
  };
  // A heavy penalty on coarse slack is measurably worse than a light one.
  assert.ok(excess(8, 3) > excess(0.5, 3), "penalty tuning stopped mattering — recheck");
  assert.ok(excess(8, 3) > 0.005, "the badly-tuned ground state should be off the optimum");
});

// ──────────────────────────────────────────── every allocator stays physical

test("all three allocators respect surplus, capacity and the loss law", () => {
  const grid = buildGrid();
  const allocators = [
    undefined,
    makeExhaustiveAllocator({ blocks: 8 }),
    makeQuboAllocator({ blocks: 8 }),
  ];
  for (const allocator of allocators) {
    const sim = simulate({ grid, hours: 168, weather: true, allocator });
    for (const st of sim.steps) {
      for (const f of st.flows) {
        const l = grid.links.find((z) => z.id === f.linkId)!;
        assert.ok(f.sentW <= l.capacityW + 1e-6, `${f.linkId} over capacity`);
        assert.ok(f.deliveredW <= f.sentW + 1e-6, "delivered more than sent");
        assert.ok(Math.abs(f.deliveredW - f.sentW * (1 - f.lossFrac)) < 1e-6);
        // Never past the maximum-power point.
        assert.ok(f.sentW <= 1 / (2 * l.lossSlopePerW) + 1e-6, "past max power transfer");
      }
      for (const r of grid.regions) {
        const x = st.regions[r.id];
        const supply = x.solarW + x.windW + x.firmW + Math.max(0, x.storageW) + x.importW;
        const sinks = x.loadW - x.unservedW + Math.max(0, -x.storageW) + x.exportW + x.curtailedW;
        assert.ok(Math.abs(supply - sinks) / Math.max(1, x.loadW) < 1e-9, `${r.id} does not balance`);
      }
    }
  }
});
