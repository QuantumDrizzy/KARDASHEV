# Next modules (0.73 → 1.0)

The site today is an **instrument** (measure K, gap, orbit, heat). Next it becomes a **validation lab**: small closed-form / toy solvers in-browser that prove architecture, not slideware.

Do these in order. Each ships with tests in `src/lib/*.test.ts` and a bench UI. No cloud. No JAX in the browser — port the *idea* to TS (or later WASM/Rust). CUDA/JAX stay in owner’s bunker; the site shows the **model and the numbers**.

---

## M1 — ENERGY: capture + radiator (exists, tighten)

Already: `physics.ts` + `energy-bench.tsx` + `/energia`.

Tighten:

- Expose kg/W and bottleneck as first-class HUD
- Optional: simple SSO duty-cycle vs beta angle, not a new page
- Label: “first-order, not a PDR”

## M2 — GRID: federated bulkheads (priority)

**Status: M2a done.** `src/lib/grid.ts` + `src/lib/grid.test.ts` (20 locks) ship.
Read `docs/ADR-M2-GRID.md` before touching it — it records what the numbers said, and
three places where the framing below did not survive contact with the physics:

- latency 80–200 ms is **RTT**, not one way (one way is 53–121 ms);
- "kill a cluster" is an **energy**-timescale demo, not a frequency one — a dark cluster
  takes its own load with it, so the pool barely notices;
- do **not** claim a global pool would cascade. Shared inertia genuinely wins on RoCoF.
  The argument that holds is: ocean ties must be HVDC = asynchronous, so a global
  synchronous pool is physically excluded; and one control plane reaches 100% of world
  load vs 46% federated.

Remaining: bench component + `/energia` section or `/grid` (contract in the ADR), then
the QUBO-class block allocator behind the existing `Allocator` seam.

New `src/lib/grid.ts` + `/energia` section or `/grid`.

Model **5 continental clusters**. Each has:

- local load L, local generation G, storage S
- a toy assignment (greedy or tiny QUBO-like: minimize unserved energy + shedding)
- inter-region link with **latency 80–200 ms** and **low priority** (surplus only)

Demo:

1. Steady state: each bulkhead balances locally
2. Kill one cluster (cable cut / 3-body-style shock)
3. Others **circuit-break** — no cascade. Show that global sync would have failed

UI: 5 nodes, latency numbers, a kill switch. No WebGL required. Copy: “same kernel, different hardware. Offline-stable.”

This is the Helsing-shaped bulkheading story. Keep it physics + systems, not defense marketing.

## M3 — AI: cost of a token (energy, not LMSYS)

**Status: done.** `src/lib/compute-energy.ts` + 12 locks. Validated against two external
numbers (published ~0.3 Wh/query; Meta's 30.84M H100-hours for Llama-3.1-405B, matched to
99%). Headline: decode is bandwidth-bound, batching beats model size, and a local 8B at
batch 1 costs more per token than a frontier MoE at batch 32. The 90% predictive-coding
claim was **not** made — the roofline shows it would buy zero in a memory-bound regime.


New `src/lib/compute-energy.ts`.

Compare, order-of-magnitude, **Wh per useful token / per classification**:

- dense transformer backprop / serving in a GW datacenter (IEA 460 TWh as ceiling)
- local MoA 7B–8B experts, load-and-purge VRAM (16 GB) — owner ACI
- predictive coding / local residual (FabricPC framing) as **hypothesis** with a λ-style disclaimer

Do not claim 90% without a cited model. Show the **formula** and sliders (batch, params, FLOP/byte, PUE).

## M4 — QUANTUM: in its place

**Status: simulation half done.** `native/qsim/qsim.cu` + `src/lib/qsim.ts` + 10 locks.
Measured on the owner's own card rather than quoted: 29-qubit wall on 16 GB, 381 GB/s
sustained (85% of datasheet), 7.26 nJ per amplitude-update, and the crossing where one
gate costs a second of Type I at ~80 qubits. The doctrine line now rests on a measurement:
quantum advantage is an **avoided cost**, and avoided cost is not generated power.

**Status: panel done.** `/quantum` states `channelPanel()` from `pqc.ts`: ML-KEM and ML-DSA as the ISL / telemetry channel, labelled from the measured 29-qubit wall. Not a QPU. It does not raise K.


`/quantum` already says it does not raise K.

Add a small panel:

- PQC suite names (ML-KEM, ML-DSA) as **channel** for ISL / telemetry — not a QPU
- the measured **29-qubit** wall on 16 GB (`qsim.ts`) as the **bench**, not a satellite and not an older 12-qubit line
- Keep modalities table

No Cirq in the browser unless WASM is already justified.

## M5 — BIOLOGY / HEALTH: the operator as a control node

**Status: done.** `src/lib/operator.ts` + 6 locks. Framed for this instrument: the human
as a node in a control loop, with the same budget method used for HVDC ties and ISLs. The
result is that 1/Δf sets a ~1 s floor no electronics can move, so the operator fails the
0.5 s arrest window exactly as a transcontinental cable does. Humans supervise; they do not
stabilize.

Still open: the SVG/CSS block diagram itself (UI lane).


Do **not** connect a real Muse in the website.

Ship a block diagram + latency budget (text + SVG/CSS):

```
Muse 2 (4 ch, BT) → notch 50 Hz → FFT / bandpower
                 → vectors into local ACI state
                 → neurorights constraint (no upload, no store of raw by default)
```

Numbers: sample rate, notch, expected ms on-device. Owner implements the Rust/C++ in KHAOS; the site **documents the architecture**.

## M6 — Presentation for Deep Tech interviews (Sep)

When a Helsing / Lakera / similar engineer lands:

- Footer already: instrument, not a company
- Add one line: **offline-first, edge watts, no heavy framework in the physics core**
- `/about#method` stays first-order
- Do **not** add a blog, newsletter, or “book a call”

Portfolio language (use in About, not as buttons):

> Specialized in large-system optimization, GPU parallelism, combinatorial assignment (QUBO-class), local quantum-state emulation. Not “I know Python.”

---

## Explicit non-goals

- Global synchronous control loop
- “Put a dilution fridge in LEO”
- Token-gated features
- Partner logos as endorsements
- Replacing HELIOS/KHAOS or the local multi-agent system with this website
