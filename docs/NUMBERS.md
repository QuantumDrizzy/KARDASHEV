# Canonical numbers

> **This is the catalogue.** For the argument — why any of it matters, what we got wrong,
> and what would falsify it — read [`SYNTHESIS.md`](./SYNTHESIS.md) first. For the numbers
> as machine-readable data with provenance, run `npm run findings`.


All live in `src/lib/kardashev.ts`, `facts.ts`, `forecast.ts`, `physics.ts`, `orbit.ts`, `life.ts`. This file is the briefing. If code and this disagree, **code + tests win** — then fix this file.

## Scale (Sagan 1973)

| Symbol | Value | Notes |
|---|---|---|
| K | `(log10 P − 6) / 10` | Sagan 1973. Not Kardashev 1964. |
| Type I | 10¹⁶ W = 10,000 TW | Planet-scale. |
| Type II (Sagan) | 10²⁶ W | Star-scale order. |
| L☉ | 3.826×10²⁶ W | IAU. K ≈ 2.06 |
| Type III (Sagan) | 10³⁶ W | Galaxy-scale order. MW starlight ~10³⁷ W |

## Now

| Quantity | Value | Source / formula |
|---|---|---|
| TES 2023 | 620 EJ/yr | IEA, ± few % |
| P_2023 | TES×1e18 / (365.25×86400) ≈ **1.96×10¹³ W ≈ 19.6 TW** | `P_2023` |
| K_NOW | kOf(P_2023) ≈ **0.729** displayed **0.73** | live via `powerAt()` |
| Growth | **1.8%/yr** | IEA TES 2013–2023. 20th c. ~2.3% |
| Epoch | 2024-01-01 UTC | |
| Gap I | P_I / P_2023 ≈ **×509** | never “0.27 points” |
| Inertia to Type I | ~350 yr | `yearsTo` — not 2030 |
| λ | **0.62** | each doubling lasts λ× previous. Hypothesis. |
| Accel to Type I | **~100 yr** | `yearsAccelerating`, test 95–110 |
| Inertial add | ~11 kW every second | `wattsPerSecond` |

## Earth disk

| Quantity | Value |
|---|---|
| AM0 / TSI | **1361 W/m²** (IAU 2015) |
| R⊕ | 6.371×10⁶ m |
| P_INTERCEPT | πR²·AM0 ≈ **1.74×10¹⁷ W** |
| Bond albedo | 0.3 |
| Type I of disk | P_I / P_INTERCEPT ≈ **5.8%** |

## Electrons (not TES)

TWh/yr → W is `twh × 1e12 × 3600 / SECONDS_PER_YEAR`. **A Wh is 3600 J.** Dropping that
factor was a real bug in `facts.ts` until M2; use `twhYrToW()`.

| Quantity | Value | W |
|---|---|---|
| Electricity | ~30,000 TWh/yr | **3.42 TW** |
| Datacentres | ~460 TWh (2024) | **~52 GW** |
| Nuclear electricity | ~2,700 TWh/yr | **~308 GW** |

Electricity is ~17% of TES. Do not blur the two layers.

## Grid — federated bulkheads (`src/lib/grid.ts`)

Five continental clusters. Mean loads sum **exactly** to `ELECTRICITY_W`. See
`docs/ADR-M2-GRID.md` for the derivation and for where the thesis had to bend.

| Quantity | Value | Source / formula |
|---|---|---|
| Fiber group velocity | **2.042×10⁸ m/s** | c / 1.4682 (SMF-28, 1550 nm) |
| Route factor | 1.6 | cable routes ≠ great circle. [ASSUMPTION] |
| Link latency, one way | **53–121 ms** | RTT 107–242 ms |
| Loop settling, 4τ at ω_c = 0.6/RTT | **0.7–1.6 s** | delay-limited crossover |
| RoCoF arrest (0.5 s) | **fails on every link** | `control.rocofArrest` |
| FCR (30 s) / dispatch (900 s) | passes | ties carry energy, never frequency |
| AC submarine limit | **100 km** | capacitive charging current |
| `synchronousPossible` | **false** | every tie must be HVDC = asynchronous |
| HVDC loss | **P·R/V²** — ∝ loading, ∝ 1/V². `hvdcLossAt(km, loading, kV)` | not a fixed %/km |
| Nameplate loss | NA–EU 39%, **AP–NA 73%** | nobody runs a 24,000 km line at rating |
| Economic loading (10% loss) | NA–EU 26%, **AP–NA 14%** | long ties must be massively overbuilt |
| Max deliverable per tie | at exactly 50% efficiency | maximum power transfer; past it, extra current is heat |
| Intertie capacity | ≤ 8% of smaller endpoint | bulkhead rule |
| Peak import observed | **≤ 5.7% of load** | import is garnish, not structure |
| Solar CF | **1/π ≈ 0.318** | exact mean of the clamped-sine day |
| Storage to island (<1% unserved) | NA 8.3 · SA 9.6 · **EU 2.9** · AF 8.3 · AP 6.9 h | `sizeIslandStorageHours` |
| Default 4 h storage | **6.7% unserved** | today's fleet does not island |
| Kill a cluster, sized grid | survivors move **0.0000 pp**, but the killed cluster trades nothing — `vacuous: true` | `killContainment` |
| Kill the net exporter, 4 h grid | **+0.05 pp** on a 7% baseline; every other cluster 0.0000 | the only non-tautological version |
| Naive `survivorUnservedFrac − unservedFrac` | **±0.1–0.3 pp, spurious** — 4 clusters against 5 | never quote it |
| Blast radius, one control plane | **46% federated vs 100% pooled** | `controlPlaneBlastRadius` |
| Storage to island, uniform | **7.43 h** of mean load | `solveUniformStorageHours`, no ties |
| Same, with a planetary ring at capShare 1.0 | **7.37 h** | `tieStudy` |
| **What the whole cable buys** | **0.06 h = 3.6 minutes of battery** | `bestStorageSavingH` |
| Peak import at capShare 1.0 | 32–38% of load — structural, and still worthless | the tie moves power, not enough energy |
| Type I scaling | every fraction identical; tank becomes **~74,000 TWh** | scale-free; >2× world annual electricity |

### Weather and seasons (M2e — `simulate({ weather: true })`)

Opt-in. With it off the model is bit-identical to the rows above. Solar uses real
astronomy: declination `23.44°·sin(2π(d−81)/365.25)`, sunrise hour angle
`ω_s = acos(−tanφ·tanδ)`, daily insolation `H₀ ∝ ω_s·sinφ·sinδ + cosφ·cosδ·sin ω_s`.
Annual energy is normalized so weather changes the *distribution*, not the total.

| Quantity | Value |
|---|---|
| EU 50.1°N, June / December insolation | **×6.0** (16.2 h vs 7.8 h of daylight) |
| Seasonal penalty, EU / NA | **+3.17 / +3.43 pp** unserved |
| Seasonal penalty, AF / AP (tropics) | **0.00 / −0.01 pp** — it tracks \|lat\| |
| Annual unserved at 7.43 h storage | 2.71% aseasonal → **3.88%** with seasons |
| Storage for <1% over a full year | 7.4 h → **~358 h** (15 days) = 1,225 TWh |
| Wind-power spatial correlation | e-folding **600 km**; ρ ≈ 10⁻⁶ between clusters |
| EU winter is carried by | **wind + firm**. Solar at 50°N in December is ~0.10 of load |

### Seasonal demand and electrified heat (M2f — `heatElectrification`)

Two terms with opposite latitude scalings, because they are different physics. **Heating**
∝ \|sin φ\|, peaks in the local winter — the same instant insolation bottoms out, so they
compound. **Cooling** ∝ cos φ, peaks in the local summer — which cancels against
insolation, and is why an equatorial cluster is an easy grid. A single sinusoid would have
got Brazil backwards. Anchors, both hit to 5 decimals, annual mean exactly 1:

| Anchor | Value |
|---|---|
| EU 50°N winter/summer demand, today | **1.20** |
| Same, heat fully on the grid (`heatElectrification: 1`) | **2.00** |
| Equatorial summer/winter (cooling), unaffected by electrification | **1.15** |

**The attack, and its result** (annual unserved, 7.43 h storage, full year):

| | today (he=0) | heat electrified (he=1) |
|---|---|---|
| Islanded, no ties | 4.949% | **7.860%** |
| Real ring, capShare 1.0, ±1100 kV | 4.328% (−0.62 pp) | 6.788% (−1.07 pp) |
| **Wire with infinite capacity, zero loss** | 4.117% (−0.83 pp) | 6.384% (−1.48 pp) |
| Real ring captures, of the impossible | **75%** | **73%** |

**Electrified heat is the first thing that makes transmission matter.** The cable's value
roughly doubles (0.62 → 1.07 pp) and — the real tell — the *gap* to an impossible wire
widens from 0.21 to 0.40 pp. Transmission has started to bind instead of sitting idle.
EU in December: load **1.52× its own generation**; in June, 0.71×.

**And overbuild still wins.** Islanded, no cable at all:

| | overbuild to clear it |
|---|---|
| Today's demand shape | **×1.5** |
| Heat fully electrified | **×2.0** |

| Lever | Effect on the annual storage bill |
|---|---|
| Whole planetary ring, any capacity, any voltage | ~0.7 h |
| **Generation shares ×1.5** | **358 h → 3.4 h, unserved → 0** (at 42% curtailment) |

Ranking of levers for the distribution layer, by physical effectiveness:
**overbuild ≫ storage ≫ transmission** — with transmission closing the gap only as heat
moves onto the grid.

[KNOWN_LIMIT] No stochastic weather, one scripted Dunkelflaute at a time. Earlier M2e
figures (islanded 3.875%, magic wire −0.45 pp) were computed **without** seasonal demand
and are superseded by the rows above.

## Cost layer (M2g — `src/lib/grid-cost.ts`, **dated 2025-Q1**)

Separate module on purpose. `grid.ts` is physics and holds until the laws change; this has
a shelf life in months. Never import it into a physics test. Trust the **shape**, not the
level: the output is a frontier and a crossover, not a price.

### The iso-reliability frontier is a cliff, not a curve

Storage needed for <1% unserved, islanded, full year, at each overbuild multiplier:

| overbuild | storage (today) | storage (heat electrified) | curtailment |
|---|---|---|---|
| ×1.00 | **400 h** | **751 h** | 1–2% |
| ×1.15 | **7.7 h** | 436 h | 12–13% |
| ×1.30 | 4.8 h | 210 h | 26% |
| ×1.50 | 3.4 h | **5.8 h** | 43% |
| ×2.00 | 0.8 h | 0.9 h | 80% |

Below a threshold you must carry the **season** (hundreds of hours). Above it you only
carry the **night** (single digits). Fifteen percent more generation drops the storage bill
×52. Electrifying heat slides the cliff edge from ×1.15 to ×1.50; it does not remove it.

### Priced (capex only, 3.42 TW mean load)

| | least-cost point | total | crossover |
|---|---|---|---|
| Today's demand | ×1.15, 7.7 h | **$17.9T** | storage wins only under **$1/kWh** |
| Heat electrified | ×1.50, 5.8 h | **$20.9T** | only under **$2/kWh** |

Today's energy-block price is ~$150/kWh. **The economics confirm the physical ranking
rather than inverting it** — a battery would have to get ~100× cheaper for storage-heavy
to beat overbuild-heavy.

### Transmission is the worst buy in the model

| | capex | what it buys |
|---|---|---|
| Ring at capShare 0.08 | **$3.1T** | 0.62 pp of unserved energy |
| Ring at capShare 1.00 | **$38.7T** | 1.07 pp |
| Overbuild ×1.15 → ×1.50 | **$1.5T** | the entire heat-electrification transition |

$38.7T of HVDC is more than the whole rest of the system.

### The actionable line

Above the cliff the cost surface is nearly flat: ×1.15 → ×1.30 is **+0.5%**, ×1.15 → ×1.50
is **+8.4%**. And ×1.50 is exactly the optimum for a heat-electrified world. So overbuilding
to ×1.5 today costs ~8% and buys immunity to the cliff when heating moves onto the grid —
where staying at ×1.15 would mean 436 h of storage instead of 5.8 h.

[KNOWN_LIMIT] Capex sketch, not an LCOE. No land, O&M, financing, lifetime/replacement,
learning curve, carbon price, or intra-cluster network. `firmUsdPerW` is the weakest number
in the basis.

[HONEST] Pooling beats federation on RoCoF for a single contingency (−0.67 vs −1.25 Hz/s
on a 20% AP trip) — shared inertia is real. Federation wins on footprint (10.7% vs 15.0%
of world load shed) and on blast radius. A common-mode fault is architecture-neutral in
the frequency domain. **Never write "the global pool would cascade".**

## Biosphere / operator

| Quantity | Value |
|---|---|
| NPP | ~130 TW (Field et al., order of mag) |
| HANPP | ~25% of NPP |
| Population | 8.2e9 |
| Human metabolic | 120 W → ~1 TW species |
| Brain | ~20 W |
| e0 / HALE | 73.4 / 63.7 |
| LEO dose | ~0.5 mSv/day, ISS ~180 mSv/yr, career ~1 Sv |

## Orbital compute (DEFAULT_BENCH)

AI1-class first-order, `src/lib/physics.ts`:

- 81 sats × 120 kW compute
- 420 m² panel, η=0.28, duty 0.96, bus 0.92
- Radiator T=320 K, ε=0.85, 3.5 kg/m²
- Launch $200/kg, 5 yr life
- σ = 5.670374419e-8

Bottleneck order: radiator mass, then launch $/kg, then chips. Not the model.

## Two-body

μ⊕ = 3.986004418×10¹⁴ m³/s². Circular v=√(μ/a). ISS ~408 km used as the LEO datum on `/space`.

## Compute — cost of a token (M3, `src/lib/compute-energy.ts`)

**Autoregressive decode is memory-bandwidth bound, not FLOP bound.** To emit one token you
must stream every active weight out of HBM; the arithmetic is trivial beside it. So the
governing equation is a roofline, not a FLOP count:

    t_mem  = (W_bytes + B·KV_bytes) / bandwidth
    t_flop = FLOPs(B) / (peak · MFU)
    E/token = P_device · max(t_mem, t_flop) / B

| Quantity | Value | Source |
|---|---|---|
| KV bytes per context token | `2 · layers · kvHeads · headDim · 2` | attention shape |
| Training FLOPs | **6·P·D** (2 forward, 4 backward) | standard count |
| Frontier MoE, batch 32, PUE 1.2 | **6.5×10⁻⁴ Wh/token** → **0.32 Wh** per 500-token reply | matches the published ~0.3 Wh |
| Llama-3.1-405B training | model says **30.4M** H100-hours at MFU 0.35 | Meta published **30.84M** — 99% |
| Same, as energy | **~20 GWh** at PUE 1.2 | |

### Two invariants worth keeping

- **Device count cancels.** When memory-bound, `E/token = tdp·bytes/(BW·B)` — no N.
  Sharding buys throughput and capacity, never efficiency. Locked to 1e-12.
- **Energy falls as 1/batch** until the compute roof. Batching is a bigger lever than
  quantization, sparsity or PUE.

### The counterintuitive results

| | |
|---|---|
| Local 8B, batch 1, 8k ctx | **0.46 Wh** per reply |
| Frontier MoE, batch 32 | **0.32 Wh** per reply |

A model with **27× fewer active parameters loses** — because batch beats size. The lever is
not local-vs-cloud, it is **busy-vs-idle**. The same card at batch 16 and 2k context beats
the frontier datacentre by 5×.

**On 16 GB, context length is an energy decision.** KV cache eats the headroom batching
needs: max batch 29 at 2k context, 7 at 8k, **1 at 32k** — a >10× swing in Wh/token from
context alone.

**Training amortizes to nothing.** Above ~10¹⁵ served tokens it is under 1% of lifetime
inference energy. It only dominates for models nobody uses.

### Back to the scale

At 6.5×10⁻⁴ Wh/token:

| | |
|---|---|
| 1000 tokens/person/day, all 8.2e9 people | **0.006% of world electricity** |
| 1% of world electricity buys | **~155,000 tokens/person/day** |
| All of Type I | 4.3×10¹⁵ tokens/s |

**Chat is not a civilization-scale load. Reasoning could be** — 155k tokens/day is a
handful of long chain-of-thought traces, so a species that thinks out loud at scale is the
regime where inference becomes a grid question. Today's ~52 GW datacentre fleet is a
buildout-and-interconnection story, not a thermodynamic one.

[HYPOTHESIS] `predictiveResidualFrac` (predictive coding) is exposed with **no
default value asserted**, like λ in `forecast.ts`. And note what the roofline says about it:
it only touches FLOPs, so in a memory-bound regime **even a 90% claim buys exactly zero**.
That is the honest answer to "predictive coding saves 90%" — locked as a test.

[KNOWN_LIMIT] Decode only, no prefill accounting. No networking, storage or idle fleet
power. MFU/PUE/powerFrac are labelled assumptions on the outside of the physics. The
frontier model shape is an [ASSUMPTION] — no lab publishes it.

## Reliability — sizing over a distribution (M2h, CUDA)

**[CORRECTION] Every storage number above came from ONE deterministic weather year.**
Reliability engineering does not size that way. `native/mc-grid/mc_grid.cu` runs 4,000
synthetic weather years per configuration on the GPU — one thread per year, 1.05×10¹⁰
region-hours in 6.9 s (1.53×10⁹ region-hours/s) on an RTX 5060 Ti (sm_120).

The port is **validated, not assumed**: with variability off the kernel reproduces
`simulate({ weather: true, allocator: noTradeAllocator })` to **7.4×10⁻¹⁵ relative** —
floating-point accumulation order, i.e. bit-level agreement. Regenerate with
`mc_grid.exe --validate`.

### What sizing on one year costs

Storage hours for <1% unserved, islanded, uniform:

| overbuild | deterministic (1 yr) | **P≥50% of years** | **P≥95% of years** |
|---|---|---|---|
| ×1.15 | 7.7 h | **96 h** | **200 h** |
| ×1.30 | 4.8 h | 24 h | 48 h |
| ×1.50 | 3.4 h | 8 h | 12 h |
| ×1.75 | 2.0 h | 6 h | 6 h |
| ×2.00 | 0.8 h | 4 h | 4 h |

**×26 at ×1.15 overbuild.** The gap narrows as overbuild rises — variance costs less when
you have slack, which is another argument for sitting well above the cliff.

### The mechanism is Jensen, not a shortfall

The stochastic runs carry ~1% **more** annual energy than the deterministic one (clipping
wind at zero lifts its mean) and still do far worse: at ×1.15 and 8 h, deterministic gives
~1.0% unserved and the stochastic **mean** is 3.7%. Unserved energy is a **convex** function
of the hourly shortfall, so mean-preserving noise strictly raises its expectation. A
deterministic model cannot see this by construction — and it is most of the storage bill.

The distribution is a *shift*, not a fat tail: at 96 h, p50 = 0.818% sits on the mean of
0.836%, while p95 = 1.327%. The mean year meets the target; only 73% of years do.

### [RESULT] Wind-solar tail correlation is not the driver

Running ρ = +0.3 (calm and grey together — the Dunkelflaute shape) leaves P50 and P95
sizing **identical at every overbuild tested**. Plain variance dominates, not the joint
tail. That was not the prior, and it is the kind of thing only a distribution can settle.

### With heat electrified

| overbuild | P≥50% | P≥95% |
|---|---|---|
| ×1.30 | 400 h | 400 h |
| ×1.50 | 96 h | 200 h |
| ×1.75 | 12 h | 48 h |
| ×2.00 | **6 h** | **8 h** |

Variance and electrified heat **compound**. Staying in single-digit storage hours moves
from ×1.5 to **×2.0** overbuild.

**What survives from M2d–M2g:** the *ranking* of levers (overbuild ≫ storage ≫
transmission) and every conclusion that compared configurations against each other. The
deterministic helpers are the right tool for that. **What does not survive:** any absolute
storage figure quoted from a single year. Use `grid-reliability.ts`.

[KNOWN_LIMIT] Two OU processes per cluster (wind σ=0.25 τ=40 h; clearness mean 0.60
σ=0.18 τ=24 h), clusters independent — justified by the ~600 km correlation e-folding
against 6,300–14,900 km separations. No inter-annual climate drift, no correlated
multi-cluster blocking events, no forced generator outages.

## Quantum — the cost of simulating one (M4, CUDA)

`/quantum` says quantum does not raise K. That is a claim about energy, so M4 measures it.
`native/qsim/qsim.cu` is a statevector engine on sm_120: 2^n complex amplitudes, every gate
touches all of them, memory-bandwidth bound — the same roofline as LLM decode.

**Physics validated before any timing was believed** (a statevector sim with wrong
amplitudes is a memcpy benchmark in a lab coat):

| check | result |
|---|---|
| Bell state | exact to 1e-12 |
| GHZ-20, leakage outside the two poles | **exactly 0** |
| QFT of a basis state, flatness | 2.3×10⁻¹⁷ |
| Unitarity after 300 random gates | norm 0.999999999999999 |

### The wall, measured

| Quantity | Value |
|---|---|
| Max qubits, complex128, 16 GB | **29** (2^30×16 B = 17.2 GB vs 15.9 GB free) |
| Sustained bandwidth, n ≥ 22 | **381 GB/s** = **85%** of the 448 GB/s datasheet |
| Per extra qubit | memory ×2, time ×2 — locked across 22→29 |
| Board power under load | **86.4 W** mean, 102 W peak (TDP 180 W) |
| Energy per amplitude-update | **7.26 nJ** |
| Energy per byte moved | 0.227 nJ = **28 pJ/bit** |

Below 22 qubits the statevector fits in L2 and the card *appears* to beat its own datasheet
(~650 GB/s). Real, explainable, and excluded from the extrapolation.

**[MEASURED, against my own guess]** The kernel comment predicted a coalescing penalty on
qubit 0. There is none — 383 GB/s at t=0 vs 381 at t=n−1, because the partner amplitudes
are *adjacent* there. Locked as a test so the wrong claim cannot come back.

### The Kardashev consequence

At 7.26 nJ per amplitude, one gate at n qubits costs 2^n × 7.26 nJ:

| n | memory | energy per gate |
|---|---|---|
| 50 | 18 PB | 2.3 kWh |
| 60 | 18 EB | 2,320 kWh |
| **68.7** | — | **one second of world electricity (3.42 TW)** |
| **80.2** | — | **one second of a Type I budget (10¹⁶ W)** |

Doubling the energy budget buys **exactly one more qubit**. That is the argument.

### Why it still does not move K

Brute-force simulation of ~80 qubits is a Type I-scale act, and real quantum hardware does
that gate for microwatts. **That is an avoided cost, not a power source.** K counts watts
*generated*; not paying a bill you chose to incur generates nothing. Quantum sits on the
load side of the ledger, and its proper roles are unchanged: PQC on the channel, sensing
and metrology, chemistry simulation. None of those are on the numerator of K.

[ASSUMPTION] The extrapolation holds one measured joules-per-byte constant fixed across
~50 orders of magnitude of memory. It is an order-of-magnitude statement about an
exponential, not a forecast of anyone's datacentre. Better memory moves the crossing by a
few qubits; it cannot bend a 2^n.

## PQC — the channel, not a QPU (M4b, `src/lib/pqc.ts`)

**This module implements no cryptography and must never be asked to.** Hand-rolled lattice
code is how you get a timing side channel. It is a FIPS parameter catalogue and a link
budget; an implementation belongs in a vetted library, on the ground.

| Handshake (bare protocol, no cert chain) | bytes |
|---|---|
| X25519 + Ed25519 | 256 |
| **ML-KEM-768 + ML-DSA-65** (FIPS 203 + 204) | **12,794** — ×50 |
| ML-KEM-1024 + SLH-DSA-128s (FIPS 205) | 18,912 |

### Whether ×50 matters is a property of the link, not of the crypto

| link, 5,000 km ISL | PQC share of handshake wall time |
|---|---|
| 1 Gbps optical | **0.15%** |
| 100 Mbps | 1.5% |
| 10 Mbps | 13% |
| **1 Mbps telemetry** | **59%** |

**Above ~13.5 Mbps the extra bytes stay under 10%** (`rateForOverhead`). Below that they
dominate — and small-satellite telemetry lives below that. So publish the **crossover**,
never a verdict. On a fast link the handshake is latency bound (16.7 ms of vacuum light
delay against 0.1 ms of transmission): geometry beats payload, the same conclusion the grid
reached about HVDC ties, for the same reason. Note an ISL runs in **vacuum**, not the
n=1.4682 glass of `grid.ts` — 1.47× faster over the same distance.

Handshake energy is ~100 µJ. Crypto is **load**, not generation: it cannot move K either.
The reason to migrate is **harvest-now-decrypt-later**, not performance.

## Operator — the human as a control node (M5, `src/lib/operator.ts`)

Block diagram and latency budget for a consumer 4-channel EEG headband class device. No
hardware is connected and none should be.

**The irreducible term is a theorem.** Resolving a frequency to Δf requires observing for
T ≥ 1/Δf — the time-bandwidth product. Separating alpha from beta at 1 Hz resolution costs
**one full second** before any decision exists. A faster ADC, a faster radio and a bigger
model all leave it untouched.

| stage | ms | engineerable? |
|---|---|---|
| **Observation window (1/Δf)** | **1000** | **no — theorem** |
| 129-tap linear-phase notch, group delay | 250 | yes (IIR / adaptive cancellation) |
| BLE, 40 ms interval | 60 | yes |
| Classification | 5 | yes |
| **Total** | **1315** | floor is 1000 |

[CORRECTED] A first draft claimed everything but the window was rounding. It is not — the
notch is 19% of the budget. But it is a *design choice*, not a theorem, and that
distinction is the difference between "engineer harder" and "this trade is not available".

### Which loops the operator can close — same windows as `grid.ts`

| loop | window | operator 1.32 s | verdict |
|---|---|---|---|
| RoCoF arrest | 0.5 s | ✗ | **fails, like a 5,000 km HVDC tie** |
| FCR activation | 30 s | ✓ | passes |
| Economic dispatch | 900 s | ✓ | passes |

Two unrelated physics — light in glass, and the time-bandwidth product — reach one
architectural conclusion: **no node that settles above the arrest window belongs in a
frequency-control loop.** Not a continent away, and not a person. Humans supervise; they do
not stabilize. That is about time constants, not competence.

### The channel is thin

4 ch × 256 Hz × 12 bits = **12,288 bit/s** off the electrodes, of which order **10 bit/s**
survives as decisions — under 0.1%. At a 20 W brain that is **~2 J per bit delivered
through the channel**, against **28 pJ/bit** measured on the GPU in `qsim.ts`: eleven orders
of magnitude.

[CAREFUL] That 2 J/bit is the cost of the **channel**, not the cost of thought. The brain is
not spending 20 W to emit those bits; they are a narrow readout of a system doing something
else. It is a statement about bandwidth: the operator interface is the narrowest link in
any architecture that contains one.

[KNOWN_LIMIT] Device figures are public specifications for a device class; ITR figures are
literature order-of-magnitude. Nothing here was measured.

## Thermal — why the watts have to leave the crust (M6, `src/lib/thermal.ts`)

The thesis says the singularity is "the moment watts leave the crust". The repo argued that
from capture, from cost and from the grid. It never argued it from thermodynamics, which is
the only version that cannot be negotiated with.

Every watt a civilization uses ends as heat. Earth sheds heat by radiating, and P ∝ T⁴:

    ΔT / T = (1/4) · ΔP / P

| Quantity | Value |
|---|---|
| Earth surface area | 5.10×10¹⁴ m² (whole sphere — a rotating planet radiates from all of it) |
| Outgoing longwave | 240 W/m² → **122.4 PW** |
| Effective radiating T | **255.1 K** — inverted from σT⁴, not quoted |

| scenario | TW | % of OLR | W/m² | ΔT_eff | ΔT_surface | vs today's greenhouse |
|---|---|---|---|---|---|---|
| TES today | 20 | 0.02% | 0.039 | **+0.010 K** | +0.012 K | ×0.013 |
| ×10 today | 196 | 0.16% | 0.385 | +0.102 K | +0.115 K | ×0.13 |
| ×100 today | 1,965 | 1.60% | 3.85 | +1.017 K | +1.149 K | ×1.28 |
| **Type I on the crust** | 10,000 | **8.17%** | 19.6 | **+5.06 K** | **+5.71 K** | **×6.5** |

**Today it is genuinely negligible** — 1.3% of anthropogenic radiative forcing. Treating
waste heat as a rounding error is correct *now*. It stops being correct at **~1,530 TW**
(×78 today), where waste heat alone equals all of today's greenhouse forcing.

### The ceiling, and what it implies

| ΔT budget | crust ceiling | vs today | of Type I | **must leave the crust** |
|---|---|---|---|---|
| +0.01 K | 19 TW | ×1.0 | 0.19% | 99.8% |
| **+0.1 K** | **192 TW** | **×9.8** | **1.9%** | **98.1%** |
| +0.5 K | 960 TW | ×48.9 | 9.6% | 90.4% |
| +1 K | 1,920 TW | ×97.7 | 19.2% | 80.8% |

The gap to Type I is ×509. The crust carries roughly **ten more doublings-worth of growth**
and then stops. **Type I is a 98% orbital problem, and that follows from Stefan-Boltzmann
alone** — not from politics, not from a carbon budget, not from which energy source you pick.

**Fusion does not help. Ground solar does not help.** Nothing in this module can even
express which source produced the watt, and that is the point: the constraint is the
planet's ability to radiate. Orbital load sheds to a 3 K sink through the σT⁴ radiators
costed in `physics.ts` and never joins Earth's 122 PW. That is the physical content of
"watts leave the crust" — a heat-rejection path, not a preference.

Power **density** is a separate and worse problem: 1 GW over 10 km² is 100 W/m², a large
fraction of the planetary flux concentrated in one patch — +23 K local at equilibrium. The
global mean says nothing about it.

### [CORRECTION] Not every watt is new heat (M9)

The rows above computed ΔT from **total** power. That is right only for sources releasing
energy not already entering the atmosphere-surface system.

| class | sources | net heat added |
|---|---|---|
| **New** | fossil, fission, **fusion**, geothermal, **anything beamed from orbit** | all of it |
| **Recycled** | ground solar, wind, hydro, wave | **~zero** |

A ground panel intercepts light that was going to be absorbed anyway. So today's +0.010 K
is really **+0.0086 K**, and an all-renewable civilization adds **no waste heat at all**.
Use `deltaTFromMix()`; `deltaTEffectiveK()` is the all-new-heat case and now says so.

**The conclusion survives, by three different roads:**

| terrestrial route | what closes it |
|---|---|
| Ground solar | **geometry** — 250 Mkm², **1.7× all Earth land**, 49% of the whole planet |
| Fusion / fission | **thermal** — +5.1 K of genuinely new heat |
| Beamed from orbit | **thermal** — +5.1 K, plus the beam's Earth-side losses |

[KNOWN_LIMIT] Equilibrium, no feedbacks — **+5.1 K is a floor**. Fixed albedo, and covering
a large fraction of the planet in panels would change albedo substantially, which is not
modelled. `localAnomaly` ignores advection, which is what actually saves cities.

## Beam — power transmission (M9, `src/lib/beam.ts`)

### The question M6 forgot to ask

M6 costed **generation**. The thermal constraint is on **dissipation**. Generate 1,000 TW in
orbit, beam it down, use it here: **+0.52 K either way**, plus the beam's losses on top.

> **Beaming does not relax the thermal limit. Only moving the LOAD does.**

M6→M7→M8 had an unstated premise — that the *load* leaves, not just the generation. It is
stated now, and it is the difference between space-based solar power and the thesis.
**They are not the same architecture.**

And beaming puts solar on the wrong side of the ledger: orbital PV collects photons that
would have **missed Earth entirely**, so every watt that lands is new heat. Beamed solar is
thermally the *worst* solar there is — ~1.2 W of Earth heat per useful watt, against ~0 for
ground PV.

### Diffraction sets the apertures: √(A_t·A_r) = τ·λ·D, τ ≈ 2

| band | orbit | 1 km² transmitter → rectenna |
|---|---|---|
| 2.45 GHz | GEO | **77 km²**, ~9.9 km across |
| 5.8 GHz | GEO | 14 km², ~4.2 km across |
| 2.45 GHz | LEO | 0.02 km² — but LEO does not hover |

Quadratic in both wavelength and distance. GEO buys continuity and costs kilometre
apertures; LEO makes the optics trivial and gives minutes per pass.

### What beaming is actually for

| | |
|---|---|
| Rectenna design flux | 230 W/m² continuous |
| Ground PV mean | 60 W/m² |
| **Land advantage** | **×3.8** |
| 1 TW delivered | 4,348 km² of rectenna |
| End-to-end DC→DC | ~63% (0.80 × 0.95 × 0.98 × 0.85) |

**Land and continuity. Not thermodynamics, and not K.**

[KNOWN_LIMIT] No pointing or safety analysis, no ionospheric heating, no rain fade, no
exclusion zone, no economics. Optical wavelengths make diffraction trivial and are left out
of the recommendation because clouds are not.

## Lift — the mass budget to Type I (M7, `src/lib/lift.ts`)

M6 says 98% of Type I must be off-planet. M7 asks what lifting it costs, and finds the
intuitive answer is wrong.

### Energy is not the constraint

| Quantity | Value |
|---|---|
| Thermodynamic floor to 550 km | **33.8 MJ/kg** — μ(1/R − 1/2a), derived not quoted |
| Earth's rotation gives back | 0.11 MJ/kg — noise |
| Starship class, CH₄/LOX at O/F 3.6 | **500 MJ/kg** = **×15 the floor** |
| **Collector payback at 1.2 kg/m²** | **21 days** |
| EROEI over a 5-year life | >50 |

At 337 W/m² the payload is an energy fountain. **Rocket inefficiency — the thing every
spaceflight argument is about — does not bind here.**

### Logistics is the constraint, by five orders of magnitude

Type I needs **29.7 million km²** of collector: the area of Africa, in orbit. At today's
1.2 kg/m² arrays that is **35.7 Gt** and **357 million** 100-tonne flights.

| cadence | years to build |
|---|---|
| 3 flights/day | **325,000** |
| 100 flights/day | 9,800 |
| 1,000 flights/day | 980 |

The world flew ~250 orbital launches in **2024** — 0.7 per day, all payloads combined. So
100/day is already **×150 the entire planet, every day, for a century.** Cadence is linear
and cannot close a five-order gap alone.

### The number that makes it an engineering target

Invert it. To finish in a century (the λ=0.62 timeline in `forecast.ts`) at 100 flights/day:

| | |
|---|---|
| Required areal density | **12.3 g/m²** |
| Today's best flexible arrays | 1,200 g/m² |
| **Gap** | **×98** |

So Earth-launched Type I needs a **hundredfold lighter collector**, held for a century at a
cadence 150× the world's current total. Or the mass does not come up Earth's gravity well
at all: **lunar escape is 2.8 MJ/kg against Earth's 33.8 — twelve times less**, with no
atmosphere and no weather. In-situ material is not enthusiasm, it is what the arithmetic
leaves standing.

[KNOWN_LIMIT] Collector mass only — no structure, station-keeping, power electronics,
thermal, comms or end-of-life. A real system is heavier than its film, so **every number
here is a floor**. Launch energy is propellant chemical energy, not production energy.
`orbit.ts::typeISwarm` owns area/mass/flights; this module adds the energy and the inverse.

## Collector — the inverse problem (M8, `src/lib/collector.ts`)

M7 costed the *film* and said every number was a floor. M8 closes it, and two things fall
out that a film-only view cannot see.

### [CORRECTION] M7 was optimistic by ~1.9×

`1.2 kg/m²` is a **blanket**. What flies is a **wing** — blanket plus boom, tensioning,
canister, harness. The honest anchor is the quantity actually published and flown:
**specific power at wing level**.

| | |
|---|---|
| ROSA-class flight hardware | **150 W/kg** → 337/150 = **2.24 kg/m²** |
| What M7's 1.2 kg/m² implied | **281 W/kg** — better than anything flown |
| Structure as a multiple of the blanket | **×1.87** |
| **Corrected areal gap** (100 yr @ 100 flights/day) | **×183**, not ×98 |

### A Type I collector is a 135-meganewton solar sail

SRP = AM0/c = 4.54 µN/m², doubled if reflective. Over 29.7 Mkm² that is **135 MN**
continuous. Countering it with ion thrust at Isp 3000 s costs **145 Mt/yr of propellant,
forever — twice the mass of replacing the entire array each year.**

SRP cannot be fought; the architecture must absorb it. Heliocentric, it just trims effective
solar gravity and the swarm is stable slightly further out. In Earth orbit it drives secular
eccentricity and demands exactly that propellant. **Earth-orbiting Type I collectors are
excluded by propellant mass** — an architectural fork the arithmetic makes for you.

### [THE RESULT] A_max = build rate × lifetime. A ceiling, not a schedule

You add area at rate R and lose it at installed/L. In steady state:

    A_max = R · L

| cadence/day | life 5 yr | 10 yr | 30 yr | 100 yr |
|---|---|---|---|---|
| 10 | 0.5% | 1% | 3% | 10% |
| **100** | **5%** | 10% | 30% | **100%** |
| 1,000 | 50% | 100% | — | — |

At 100 flights/day with a 5-year array you asymptote at **5% of Type I and stay there
forever**. Launching for longer does not help. Over a 100-year build, year 1's hardware is
replaced nineteen times before year 100 — that is a treadmill, not a project.

**The convergence condition is blunt: the array must outlive its own construction.**
L ≥ T_build, or Type I never completes at any budget. A test locks the identity — at a
100-year build only a 100-year array ever reaches 100%.

Maintenance costs, at the density M7 derived:

| lifetime | standing flow | vs the 100/day build cadence |
|---|---|---|
| 5 yr | **2,000 flights/day forever** | **×20** |
| 30 yr | 334 flights/day forever | ×3.3 |

### Where the chain stands

**M6** waste heat forbids the crust above ~192 TW → 98% must leave.
**M7** lifting it needs a ×98 lighter film; energy pays back in 21 days, logistics needs millennia.
**M8** it is ×183, and maintaining it costs 20× the build rate, permanently.

Two independent calculations — one from construction, one from maintenance — terminate in
the same place: **material that never came up Earth's gravity well.** M7 arrived via a 12×
energy advantage, M8 via a permanent 2,000 flights/day. Neither road was built to go there.

[KNOWN_LIMIT] Still no power beaming, rectenna, orbital assembly, debris flux or disposal.
Specific power is beginning-of-life; degradation is handled as replacement, not derating.
Every number remains a floor, just a less optimistic one.

## Reject — heat rejection at Type I scale (M10, `src/lib/reject.ts`)

M9 closed the chain: the **load** goes to orbit. `physics.ts` costs heat rejection for one
satellite; nobody had scaled it. Scaling it corrects M7/M8 and puts a number on how long
efficiency can substitute for watts.

### [CORRECTION] M7 and M8 costed half the system

If the load is in orbit, essentially all the collected power becomes heat that must be
radiated:

| | area | × areal mass | |
|---|---|---|---|
| Collector | 29.7e12 m² | 2.24 kg/m² | 66.6 Gt |
| **Radiator @ 320 K** | **19.8e12 m²** | 3.50 kg/m² | **69.3 Gt** |

**The radiator is heavier than the collector.** Every flight count in M7/M8 is **×2.04**
too low. M8's `A_max = R·L` ceiling is unaffected — it is a ratio — but the cadence to
reach any given fraction doubles.

### The T⁴ lever is real, and pumping does not capture it

σT⁴ says 320 K → 400 K shrinks the radiator ×2.44, which invites a heat pump. Optimising
total mass with Carnot work included:

| | total |
|---|---|
| Passive at Tj = 350 K | 115.1 Gt |
| Pumped, optimum at **425 K** | 108.0 Gt — **6%** |
| **Junction raised to 400 K, passive** | **95.0 Gt — 17%, free** |

Six percent, on a surface flat over 120 K. **The pump work must also be rejected**, so most
of the T⁴ gain pays for its own lift. **Hot silicon beats heat pumps about three to one** —
a semiconductor programme, not a thermal one.

### The thermodynamic runway

Landauer: kT·ln2 = **2.87×10⁻²¹ J** per irreversible bit op at 300 K.

| | J per bit | × Landauer | orders left to a 100 kT floor |
|---|---|---|---|
| Logic (H100 FP8, ~10³ bit-ops/FLOP) | 3.5×10⁻¹⁶ | ~10⁵ | **3.1** |
| Data movement (measured, `qsim.ts`) | 2.8×10⁻¹¹ | ~10¹⁰ | **8.0** |

### [CHALLENGE TO THE THESIS]

`THESIS.md` says ASI is an energy event. That holds **only if efficiency stops improving**.
There are ~3 orders of headroom in logic and ~8 in data movement — and M3 established that
the term which actually binds today *is* data movement, the one furthest from its floor.

So the honest form is narrower: **watts become the constraint after the efficiency runway
is spent, not before.** Three orders of compute growth — about ten doublings — can arrive
without a single extra watt. The energy event is real, and it is deferred.

[KNOWN_LIMIT] Radiator areal density is the `physics.ts` satellite figure; thin-film
concepts claim far less and would shift the balance back toward the collector. No view
factors, no radiator-to-radiator reabsorption in a dense swarm, no coolant loop mass.
Carnot is an upper bound on any real pump, so the 6% is itself optimistic.

## ISRU — costing the route the chain kept pointing at (M11, `src/lib/isru.ts`)

M7 and M8 both terminated at "material that never came up Earth's gravity well", by two
independent roads. Neither costed it. It closes — but not for M7's reason, and what binds is
neither energy nor logistics.

### [CORRECTION] M7 understated the lunar advantage by an order of magnitude

| | |
|---|---|
| M7: lunar escape vs Earth's orbital **floor** | ×12 |
| Real vs real: mass driver at 60% vs chemical launch | **×106** |
| Lunar launch | **4.71 MJ/kg** electrical |
| Earth launch | 500 MJ/kg — chemical, 15× above its own floor |

And transport is not the point: at ~100 MJ/kg embodied, getting material off the Moon is
**4.5%** of what making it costs. The gravity well was never the expensive part of lunar
sourcing; not launching at all is.

### The power bill closes

| | mass/yr | lunar industrial power | of Type I |
|---|---|---|---|
| Build over a century | 1.15 Gt/yr | **3.8 TW** | 0.038% |
| Maintain at 5-yr life | 23.0 Gt/yr | **76 TW** | 0.76% |
| Maintain at 30-yr life | 3.84 Gt/yr | 12.7 TW | 0.13% |

Four times today's world TES, on the Moon — and **under 1% of the Type I it builds**.

### [THE HARD ONE] The array must be essentially all lunar

Regolith supplies Si, Al, Fe, Ti, O. It does **not** supply carbon, hydrogen or nitrogen at
scale, so polymers, volatiles and some dopants would still be launched.

| Earth cadence | vs world 2024 | share of the flow it can supply |
|---|---|---|
| 100 flights/day | ×146 | **0.016%** |
| 1,000 flights/day | ×1,462 | 0.16% |
| 10,000 flights/day | ×14,620 | 1.6% |

**The array must be ≥99.98% lunar-sourced by mass.** No polymer substrate, no imported
dopants at scale, no carbon. A materials-science constraint, and harder than anything in
M6–M10.

### The timeline is a doubling count

`M(t) = M₀·e^(f·p·t)`, `C(t) = ((1−f)/f)·M₀·(e^(f·p·t) − 1)`. The allocation optimum is
**f ≈ 0.96** and the answer is flat from 0.9 to 0.999 — the build is essentially the last
doubling, so every constant washes out:

| | |
|---|---|
| **Doublings from a 100 t seed** | **30** |
| 1 yr doubling | 30 years to Type I |
| 2 yr | 60 years |
| 5 yr | 151 years |
| 10 yr | 301 years |

### [THE PAYOFF] λ = 0.62 is a doubling-time claim

`forecast.ts` λ gives ~101 years. Divided by 30 doublings: **λ = 0.62 is a claim that
off-planet industry doubles every 3.4 years.** A curve fit nobody could argue with becomes
an engineering parameter people can and should argue about.

[KNOWN_LIMIT] Productivity is the least certain input and the answer scales inversely with
it. No regolith chemistry, no beneficiation, no plant mass estimate, no lunar night, no
dust. Embodied energy at 100 MJ/kg is a terrestrial analogue. Nothing here models whether a
≥99.98%-regolith photovoltaic is possible at all — it states the requirement and stops.

## Environment — the number that set the ceiling and was never calculated (M12, `src/lib/environment.ts`)

`A_max = R · L` is linear in the array lifetime, and `L = 5 yr` was a bare default in M8.
The 5% ceiling, the 2,000 flights/day, M11's 76 TW — all of them scale with it.

### The film M7 actually demands

| | |
|---|---|
| M7 areal density | 12.3 g/m² |
| at polyimide density 1420 kg/m³ | **8.66 µm** |

### [RESULT] Micrometeoroids are not the killer, by five orders of magnitude

| | |
|---|---|
| Perforations | **198 /m²/yr** |
| Area lost | **4.87e-5 %/yr** |
| Years to lose 10% of the area | **205,000** |
| Sweeping both free parameters (0.3–1.0 × 1.5–4.0) | 7× spread, every corner negligible |

Trackable debris: **9.4 impacts/second** on the full array, area loss 7.0e-7/yr. A 10 cm
fragment through an 8.7 µm sheet makes a 30 cm hole and keeps going. **A film has nothing to
sever** — no pressure to lose, no spar to cut.

[VALIDATION] Grün (1985) integrated over Earth puts the mass-carrying peak at **172 µm**
against ~200 µm measured (Love & Brownlee 1993) — the shape, and therefore the constants,
check out. The integrated total is 1.1e7 kg/yr, **3.4× under** the 4e7 central value but
inside the literature's 5–300 kt/yr spread. **Partial validation, recorded as partial.**

### [RESULT] Atomic oxygen is the one real bite, and a coating pays for it

| | |
|---|---|
| Erosion of bare polyimide at 400 km | **45 µm/yr** |
| Bare 8.7 µm film survives | **2.3 months** |
| 100 nm silica overcoat | 0.22 g/m² = **1.8%** of budget |
| Ripstop at 1.3 cm pitch, 10 µm fibre | 0.017 g/m² = **0.14%** |

**Under 2% of the binding constraint buys survival.** Regolith is 42% O and 21% Si, so M11's
feedstock already contains the coating. The rule: **you cannot fly bare.**

### [CORRECTION to M8] Five years was the wrong reference class

Five years is the design life of a LEO smallsat — drag decay and bus electronics, neither of
which a coated film in a high orbit has. Ranked by annual loss to 50% power:

| mechanism | loss/yr | years to EoL |
|---|---|---|
| Cell radiation damage | 1.0e-2 | **69** |
| Trackable debris holes | 7.0e-7 | 986,000 |
| Micrometeoroid holes | 4.9e-7 | 1,424,000 |
| **All at once** | | **69.0** |

### [THE LEVERAGE] A_max = R·L is linear

| lifetime | sustainable share of Type I @ 100 flights/day |
|---|---|
| 5 yr — M8's assumption | 5% |
| 10 yr | 10% |
| 30 yr | 30% |
| **69 yr — what the environment supports** | **69%** |

Still short of a century-long build, so M8's convergence condition `L ≥ T_build` is **argued,
not met**. But the ceiling moves from a twentieth to two thirds on a constant nobody checked.

### [THE REFRAME] The array is the environment

| | |
|---|---|
| Array area / Earth's cross-section | **23.3%** |
| Array mass @ 2.24 kg/m² | **66.6 Gt** |
| vs everything ever launched (~13 kt) | **×5.1 million** |
| SRP force on the whole sheet | 1.35e8 N |

One part per million fragmenting is five times the current debris population. No cascade is
modelled and none is claimed — the claim is that **at this scale the debris question stops
being about protecting the array**, and nothing in M6–M11 has anywhere to put that cost.

[KNOWN_LIMIT] No fracture mechanics — tear propagation is the failure mode a film actually
has, and `ripstopPitchM` states a geometric requirement rather than solving it. No flight
heritage: nothing this thin has flown a decade, so the multi-decade lifetime is an argument
from mechanism, not a demonstrated part. No Kessler cascade. No thermal cycling, UV
embrittlement, charging or spallation — any of them could be the real limit.

## Placement — where the array goes, and why that is climate (M13, `src/lib/placement.ts`)

M6–M12 all said "in orbit". None picked one. M12 made the omission expensive: the array is
**23% of Earth's cross-section**, so some of it is always between the Sun and the Earth.

### The geometry

An element at angle ψ from the sub-solar direction sits `a·sin ψ` from the Sun–Earth axis, so
it shades Earth when `a·sin ψ < R⊕`. Integrating a uniform shell over ψ < θ, with
`sin θ = R⊕/a`:

    shaded share of shell = (1 − cos θ)/2
    insolation removed    = that share × A_array / πR⊕²
    ΔT                    = ¼ · (insolation removed) · T_eff

Exact, not small-angle — at 400 km θ is 70° and the approximation is 20% off.

### [RESULT] The ladder

| | altitude | in cylinder | blocked | cooling | duty cycle | band fill | sky | budget |
|---|---|---|---|---|---|---|---|---|
| ISS | 408 km | 33.1% | 7.67% | **−4.89 K** | 0.671 | 15.1% | 2,123 deg² | no |
| dawn-dusk SSO | 800 km | 27.1% | 6.30% | −4.02 K | 0.730 | 10.0% | 1,897 deg² | no |
| upper LEO | 2,000 km | 17.6% | 4.09% | −2.61 K | 0.824 | 5.2% | 1,392 deg² | no |
| MEO | 10,000 km | 3.94% | 0.92% | −0.59 K | **0.961** | 0.96% | 364 deg² | no |
| GPS | 20,200 km | 1.48% | 0.34% | −0.22 K | 0.985 | 0.35% | 138 deg² | no |
| **GEO** | **35,793 km** | **0.57%** | **0.13%** | **−0.085 K** | **0.994** | **0.14%** | **54.9 deg²** | **yes** |
| super-GEO | 100,000 km | 0.09% | 0.02% | −0.013 K | 0.999 | 0.02% | 8.6 deg² | yes |
| lunar distance | 384,400 km | 0.01% | 0.002% | −0.001 K | 1.000 | 0.002% | 0.6 deg² | yes |

### [THE MIRROR] M6 and M13 are the same catastrophe with opposite signs

| | |
|---|---|
| Type I on the crust (M6) | **+5.06 K** |
| Type I as a shell at 400 km (M13) | **−4.89 K** |

The array is large enough to freeze the planet. The only free variable between the two is
where the hardware goes.

### [RESULT] The climate budget derives an orbit

| | |
|---|---|
| Floor for M6's own +0.1 K budget | **38,960 km radius** (32,589 km altitude) |
| Geostationary radius | 42,164 km |
| **floor / GEO** | **0.924** |

Nothing goes into that but radiative balance, and it lands within 8% of GEO. The floor scales
as `√A` — quadruple the array, double the required radius — because shading is `A/4πa²`.

### The escape and its price

Anything beyond `θ` of the Sun–Earth line is sunlit and shades nothing. At 800 km that band
is **45.9% of the shell** with a half-width of **27.3°**, and Type I fills **10.0%** of it.
Geometrically possible — and it is exactly the shell M12 excluded for atomic oxygen and where
the array already takes 9.4 debris strikes/second. At GEO the band is 98.9% and the fill
0.135%. **Go high, or thread a band.**

### [CORRECTION to physics.ts] The 0.96 duty cycle silently assumed an orbit

`DEFAULT_BENCH.dutyCycle = 0.96` is used repo-wide with no orbit named. Read as geometry it
is one: **0.9606 is MEO at 10,000 km**, which fails the climate budget by six times. The
value is defensible for a dawn-dusk band and has **not** been changed — what was missing is
that it assumed one. The climate argument and the duty-cycle argument converge on the same
geometry from opposite directions.

### [IDENTITY] Shading equals sky coverage

For `a >> R⊕`, `(1 − cos θ)/2 ≈ R⊕²/4a²` and the Earth-disk denominator cancels:

    shading fraction = A / 4πa² = fraction of sky the array covers

Holds to 0.6% at GEO, fails above 10% at LEO where the expansion is invalid — which is what
makes it a useful test rather than a restatement. The same number cools Earth by blocking
sunlight and warms it by blocking outgoing IR; they partially cancel by an amount that
depends on the array's own thermal design (M10). Bound: `|ΔT| ≤ ¼·f·T_eff`.

[KNOWN_LIMIT] Isotropic shell — real constellations are planes, and the band result shows the
distribution is the whole question. Cylindrical shadow, no penumbra, no umbral cone
convergence. Equilibrium ΔT: no ocean lag, no ice-albedo feedback, no regional distribution —
a sweeping shadow is not a uniform dimming, and the feedbacks make a real answer larger, not
smaller, so −4.89 K is a floor on the harm rather than an estimate of it. No collision
dynamics inside a band filled to a tenth. Sky coverage is solid angle only: no brightness, no
magnitude, no claim about astronomy. No geoengineering — the arithmetic for a deliberate
solar shade is the same arithmetic, and this repo does not go there.

## Transfer — what M13's destination costs, and who it costs it to (M14, `src/lib/transfer.ts`)

M7, M8, M11 and M12 all costed delivery to low orbit. M13 then derived a floor at 38,960 km
from radiative balance alone. Nothing had recosted it — and the repo had no way to:
**`lift.ts` reasons entirely in energy, which is linear in altitude. Delivery is not.**

### [RESULT] Linear against exponential

| | GEO / LEO |
|---|---|
| Orbital specific energy (33.8 → 57.8 MJ/kg) | **×1.71** |
| Tsiolkovsky mass ratio (Δv 8,924 → 12,724 m/s) | **×2.77** |
| **Reasoning in joules understates delivery by** | **62%** |

M7's energy conclusion survives — payback goes from ~21 days to ~36, still nothing. It is the
**logistics** leg, already the binding one, that takes the hit.

### [TIGHTENS M7] The areal density requirement gets 2.8× harder

| | to LEO | to GEO |
|---|---|---|
| Century at 100 flights/day needs | 12.3 g/m² | **4.43 g/m²** |
| Film thickness at 1420 kg/m³ | 8.66 µm | **3.12 µm** |
| Gap vs a 2.24 kg/m² wing | ×182 | **×505** |

### [STRENGTHENS M11] The scissors

Earth sits at the bottom of the well and pays the full ascent wherever it is going. The Moon
arrives from outside and pays only to **shed** energy, so a higher destination is a *smaller*
capture burn. The two columns move in opposite directions:

| destination | alt (km) | Earth Δv | mass ratio | Moon Δv | mass ratio | advantage |
|---|---|---|---|---|---|---|
| LEO 550 | 550 | 8,924 | 10.97 | 6,737 | 6.10 | ×1.80 |
| upper LEO | 2,000 | 9,611 | 13.18 | 6,326 | 5.46 | ×2.41 |
| MEO | 10,000 | 11,463 | 21.67 | 5,142 | 3.97 | ×5.45 |
| **GEO** | **35,793** | **12,724** | **30.40** | **3,982** | **2.91** | **×10.44** |

Lunar delivery decomposes as escape (2,376 m/s, and a mass driver spends no propellant on it)
plus a capture burn that combines circularisation with the 20° plane change against the Moon's
inclination: 4,361 m/s at LEO, **1,606 m/s at GEO**.

**The honest counterweight:** lunar cargo can aerobrake into LEO and cannot into GEO. Granting
the Moon that, the LEO advantage rises to **×5.49** — GEO still wins by nearly two to one. The
direction survives the objection that most threatens it.

### [VALIDATION] Hohmann is checked, not assumed

| | |
|---|---|
| LEO→GEO radius ratio | 6.09 |
| Hohmann | **3,800 m/s** |
| Bi-elliptic (apoapsis 10×) | 4,368 m/s |

Consistent with the classical crossover near 11.94. The tests also assert bi-elliptic **wins**
at a ratio of 60, so a sign error in either formula cannot hide behind the case we want.

### [CORRECTED] A regression the tests caught

The first version of `deltaVFromSurface` injected directly at circular speed for every
destination — which made 2,000 km look **cheaper** than 550 km, because circular speed falls
with radius. Without the transfer burn the arithmetic runs backwards. The ladder's
monotonicity test caught it before anything downstream consumed it, and the case is now
locked as a regression.

### The synthesis

The same geometric fact that widened the Earth-launch gap to ×505 widened the Moon's
advantage to ×10.44. **M13 did not weaken the thesis — it moved the argument onto the leg
that was already load-bearing.** Two independent roads arrive once more where M11 already
was: the material cannot come up Earth's gravity well.

[KNOWN_LIMIT] Single-stage Tsiolkovsky with no dry mass, so absolute mass ratios are
optimistic and **only ratios may be quoted, never a payload**. No orbital refuelling, no
staging, no reusability economics — a refuelled architecture changes the flight count per
delivery, not the Δv. Impulsive burns only; low-thrust electric transfer has a very different
budget and a trip time this repo has nowhere to put. Patched conics with the Moon as a point
at rest at 3.844e8 m: no three-body dynamics, no weak-stability-boundary transfers, which are
cheaper than what is costed here. Lunar inclination fixed at 20° (it oscillates 18.3–28.6°
over 18.6 years). No trip time, no phasing, no launch windows anywhere.

## The load — weighing the thing the thesis is about (M15, `src/lib/load.ts`)

*The singularity is the moment watts leave the crust.* M6–M14 costed the power station that
makes those watts. **None of them weighed the load.**

### [RESULT] The size of the hole

| | |
|---|---|
| Load mass at rack specific power (~100 W/kg) | **1.00e14 kg** |
| Deliverable in a century at 100 flights/day, to GEO | 1.32e11 kg |
| **Centuries of launch, load alone** | **759** |
| Against the collector's real mass (66.5 Gt) | ×1.5 |
| Added to M10's collector-plus-radiator system | **+74%** |

### [CORRECTED] An overclaim the test caught

The first draft said the power station was "a rounding error against the thing it powers".
**It is not.** The load is ×1.5 the collector, not ×1000 — the draft compared against M7's
*required* areal density (4.43 g/m²) instead of the real hardware (2.24 kg/m²). The test
asserted `versusCollector > 1000` and failed loudly.

Both numbers are true and answer different questions: **×759 is against the deliverable
budget** (right denominator for feasibility), **×1.5 is against other hardware** (right
denominator for comparison). The mistake was quoting one where the other belonged. What
survives is narrower and still damning: **every mass total in the chain was ~40% low.**

### [RESULT] The mass is an architecture choice worth ×100

| architecture | W/kg | load mass | centuries | vs collector |
|---|---|---|---|---|
| Datacentre rack (today) | 100 | 1.00e14 kg | 759 | ×1.50 |
| M10 radiator ceiling, 320 K | 144 | 6.93e13 kg | 526 | ×1.04 |
| Board level | 1,000 | 1.00e13 kg | 75.9 | ×0.15 |
| Bare die, conducted | 7,000 | 1.43e12 kg | 10.8 | ×0.021 |
| **Self-radiating 100 µm @ 400 K** | **10,591** | **9.44e11 kg** | **7.2** | **×0.014** |
| Self-radiating 10 µm @ 500 K | 258,574 | 3.87e10 kg | 0.3 | ×0.0006 |

A radiator at 3.5 kg/m² and 320 K rejects 505 W/m², capping the **system** at 144 W/kg
whatever the chip does. A thinned die radiating from its own two faces is 0.23 kg/m² and has
two of them: `2εσT⁴/(ρ·t)` = **10,591 W/kg**, **×73 better**.

> **At Type I scale you do not bolt chips to radiators. You make the chip the radiator** —
> and M10's radiator mass becomes an artefact of the wrong architecture.

### [THE REQUIREMENT] 75,900 W/kg

Inverting the way M7 inverted for areal density — fit the load inside one century of launch,
leaving nothing for the collector:

| route | |
|---|---|
| At 400 K, thickness needed | **14.0 µm** |
| At 450 K | 22.4 µm |
| At 10 µm, temperature needed | 368 K |
| At 30 µm | 484 K |
| At 100 µm | **654 K** (381 °C) |

Thinner than any production die, or far past where silicon logic works. **The wall is die
thinning and junction temperature, not thermodynamics** — M10's lever, pushed much harder.

### [CORRECTS M13] The array cannot be geostationary

| | |
|---|---|
| Collector area | 2.970e13 m² |
| M10 radiator area at 320 K | 1.979e13 m² |
| Total on the same shell | 4.949e13 m² (×1.666) |
| Floor scales as √A | ×1.291 |
| **M13's floor 38,960 km becomes** | **50,290 km** |
| **As a fraction of GEO radius** | **1.193** |

Both modules were right in isolation. Nobody had multiplied them.

*Not netted:* the radiator also emits toward Earth, which from GEO intercepts 0.574% of an
isotropic emission — 5.7e13 W, or **+0.030 K**, running against the extra shading. The split
depends on radiator orientation, which nothing in this repo models.

### Where it leaves the chain

The load must be built off-planet too, for the same reason the collector must — a **third**
independent road to M11. But M11's ≥99.98%-lunar requirement was posed for a *solar film*,
where regolith supplies silicon, aluminium and oxygen. Posed for **semiconductors** it is a
far harder question, and this module does not answer it.

[KNOWN_LIMIT] No architecture: "the load" is a mass that dissipates 10¹⁶ W, with no claim
about what it computes — M3 owns Wh/token, this owns kg/W. Specific powers are reference
points, not a forecast; only `rack` is a measured system. The self-radiating die is pure
`2εσT⁴/ρt` geometry with no power delivery, interconnect, substrate or packaging, so every
self-radiating figure is an optimistic ceiling. Silicon logic stops working well before
654 K — the module states what the mass budget demands, not that it is available. No
radiation tolerance: chips degrade far faster than M12's film, and at GEO that is a shorter
lifetime feeding straight back into `A_max = R·L`. Whether regolith can make a semiconductor
is modelled nowhere.

## Substitution — the strongest argument against this repo (M16, `src/lib/substitution.ts`)

M6-M15 established where 10^16 W must go. None connected the watts back to the claim that
motivates them. M10 flagged it in one line — *"the energy event is real and it is deferred"*.
This module puts a number on it.

### The substitution law

    P = R x J/op

For a fixed rate of computation, energy and efficiency are **substitutes**. Any claim that a
given amount of thinking *requires* a given number of watts is a claim about efficiency.

### [THE CHALLENGE] The threshold is x52

| | |
|---|---|
| M6 terrestrial ceiling @ +0.1 K | 1.920e14 W = 192 TW |
| Type I | 1e16 W |
| **Escape factor `P_I / ceiling`** | **52.1** |
| M10 logic runway | x1,232 (3.09 orders) |
| M10 data-movement runway | **x9.87e7 (7.99 orders)** |

Type I computation has to leave the crust only while efficiency improves by **less than
x52**. Both of M10's runway terms are larger — one by six orders. And M3 established that the
binding term today is data *movement*, which is the term with the larger runway.

| runway spent in full | Type I compute needs |
|---|---|
| Logic (x1,232) | **8.117e12 W = 8.1 TW** |
| Data movement (x9.87e7) | 1.013e8 W = **101 MW** |

8.1 TW is under half of today's world TES and far inside the terrestrial ceiling.

### Why this is a reductio, not a refutation

101 MW for a civilisation of thinking machines is absurd, and the absurdity is the
information: **the 100 kT floor is a device-physics bound, not a roadmap.** Bounds are not
forecasts. But x52 sits so far below the bound that ordinary progress reaches it — which is
why it belongs in the argument rather than in a footnote.

### [RESOLUTION] What the substitution actually attacks

**Not the orbital chain.** M6-M15 concern where 10^16 W of *any kind* must go, and K is total
energy supply. Industry, transport, materials and agriculture have no Landauer runway. Those
legs stand unchanged.

What it attacks is the link from **ASI to Type I**. Compute is the one load in the whole
economy with orders of thermodynamic headroom, and it is precisely the load the thesis named.

> **Surviving claim: Type I is an energy event. ASI need not be the thing that causes it.**

The only defence that restores the original slogan is Jevons — that efficiency gains raise
total consumption. That is economics, not physics, and this module does not lean on it.

### [SIDE RESULT] Biology is not magic

| | J/op | x Landauer | orders over the 100 kT floor |
|---|---|---|---|
| Human brain (20 W, ~1e15 syn-ops/s) | 2.00e-14 | 6.97e6 | **4.84** |
| H100 FP8 logic (per FLOP) | 3.54e-13 | 1.23e8 | **6.09** |
| HBM data movement (per bit) | 2.83e-11 | 9.87e9 | 7.99 |

**The brain leads silicon by x17.7 — one order, not six.** Swept across the published
1e14-1e16 range for synaptic rate the lead moves between x1.8 and x177 and never becomes a
qualitative difference. Neither has spent the runway, and whatever closes the gap to the
floor is available to both.

### What the watts buy (conversions, not claims)

| | |
|---|---|
| Frontier responses/second at Type I | 8.61e12 |
| **Per living human, per second** | **1,050** |
| Type I in 20 W brains | 5.00e14 |
| **Brain-equivalents per living human** | **60,976** |

[KNOWN_LIMIT] No forecast — this compares a thermodynamic bound against a threshold and says
the threshold is small; it does not claim the bound is reachable, and 101 MW is offered as a
reductio. The 100 kT reliability floor is M10's assumption, inherited whole.
`BIT_OPS_PER_FLOP = 1000` is order-of-magnitude and every per-FLOP figure carries its error.
Synaptic rate is assumed and swept; the brain comparison sets scale, it is not neuroscience.
Jevons is named and deliberately not leaned on. Nothing here models what the computation is
*for*, so "responses per person per second" is a unit conversion and not a claim about value.

## Industry — checking the sentence M16 asserted (M17, `src/lib/industry.ts`)

M16 resolved its own challenge with a claim: *"industry, transport, materials and agriculture
have no Landauer runway."* **That was an assertion.** If false, the resolution collapses and
the orbital chain loses its answer to the x52 escape.

### [RESULT] Compute is the anomaly, by 534x

| process | thermodynamic minimum | actual | runway |
|---|---|---|---|
| Ammonia, Haber-Bosch | 20.9 GJ/t | 36 GJ/t | **x1.72** |
| Cement clinker | 1.8 GJ/t | 3.5 GJ/t | x1.94 |
| Aluminium, Hall-Heroult | 23 GJ/t | 50 GJ/t | x2.17 |
| Desalination, seawater RO | 1.06 kWh/m3 | 3.0 kWh/m3 | x2.83 |
| Steel, ore to liquid | 7.0 GJ/t | 20 GJ/t | x2.86 |
| | | **mean** | **x2.31** |
| Compute, logic (M10) | | | x1,232 |
| Compute, data movement (M10) | | | x9.87e7 |

**Logic has x534 the headroom of heavy industry.** Two centuries of thermodynamics has taken
industry to within a factor of two or three of its floor. Computation is nowhere near its
own, and **that gap is specific to computation, not general to technology.**

### [THE CONDITION] The escape needs a >=95% compute economy

Power is additive, so the total reduction is the harmonic blend `1/(f/r_c + (1-f)/r_nc)`.
Setting it equal to M16's escape factor of 52.1 and solving for the compute share:

| compute runway assumed | required compute share |
|---|---|
| x1,232 (logic) | **95.75%** |
| x9.87e7 (movement) | 95.57% |
| **infinite** | **95.57%** |

**The answer barely depends on compute's runway at all.** Even infinitely efficient computers
still need a 95.57% compute economy, because the industrial term alone must fit under the
target. This is what makes the condition robust rather than a consequence of one assumed
efficiency figure.

### Sensitivity — it never becomes a small number

| industrial runway | required compute share (infinite compute runway) |
|---|---|
| x2.0 | 96.2% |
| x2.31 (measured) | **95.6%** |
| x3.0 | 94.2% |
| x5.0 | 90.4% |
| x10.0 | 80.8% |

### What today's mix actually buys

| compute share of energy | total reduction | escapes? |
|---|---|---|
| **0.27% (today, IEA)** | **x2.31** | no |
| 10% | x2.56 | no |
| 50% | x4.60 | no |
| 90% | x22.7 | no |
| 99% | x194 | **yes** |

### The resolution

M16's challenge survives and narrows into something arguable:

> **The orbital argument fails only for a civilisation that spends nineteen twentieths of its
> energy on thinking.**

That is a real claim about what a Type I economy is *for*, and it is now the hinge the whole
document turns on.

### [CORRECTED] A clamp the test found

`totalReduction` originally took the compute share unclamped. A monotonicity walk accumulated
floating-point error past 1.0, which made `(1 - f)` negative and the blend return a
**negative reduction**. A share outside [0,1] is not a mix; it is clamped now, and the
out-of-domain case is locked as a test rather than left to a caller to discover.

[KNOWN_LIMIT] Five processes are not an economy — they are chosen as the largest industrial
energy sinks with well-established thermodynamic minima, not because they span the load.
**Transport has no thermodynamic minimum for horizontal displacement at all**, so its runway
is unbounded in principle, and if transport dominates a Type I economy the x2.31 mean is
wrong in the direction that helps M16. **Heating is Carnot-bound at ~x15**, not
reaction-bound; also excluded rather than folded in. The judgement that a 10^16 W economy is
dominated by making things rather than moving or heating them is a **judgement, not a
derivation** — it is the softest joint here and the place to attack this module. Published
minima carry ~+/-20% each; the conclusion tolerates far more.

## Signature — what the chain predicts from outside (M18, `src/lib/signature.ts`)

M6-M17 built a specific physical object: **4.95e13 m2 of collector and radiator, in orbit,
rejecting 10^16 W at a few hundred kelvin.** That is an **observational prediction**, and
nothing in the repo had ever pointed a telescope at it.

### [VALIDATION] Planck against Stefan-Boltzmann

The spectral function is the whole module, so it is checked against a yardstick that does not
depend on it: integrating `B_nu` over frequency must give `sigma*T^4/pi`. Verified to <1% at
320 K, 400 K and 5772 K by numerical quadrature, plus the Rayleigh-Jeans (`~nu^2`) and Wien
(exponential) tails.

### [RESULT] Type I is invisible, by seven orders

| | |
|---|---|
| Bolometric: 10^16 W / L_sun | **2.61e-11** (26 parts per trillion) |
| Radiator peak at 320 K | 9.06 um |
| Array flux at 10 pc | **0.066 uJy** |
| Sun flux at the same frequency | 2.70 Jy |
| **Mid-IR contrast** | **2.46e-8** — one part in 41 million |
| What the spectral shape buys over bolometric | **x943** |
| Reach at JWST/MIRI-class 0.7 uJy | **3.08 pc** |

No photometry reaches parts per billion and no coronagraph reaches 1e-8 at these separations.
The reach figure **ignores the star entirely**, so it is an upper bound no real instrument
achieves.

### [THE COROLLARY] The SETI null result says nothing about Type I

Dyson's argument, and every IR-excess survey since, constrains **Type II** — stellar-scale
interception at ~10^26 W, where the excess is order unity. Type I is **ten orders below
that**. Non-detection of waste heat is evidence about Dyson spheres and **no evidence at all**
about civilisations at the scale this repo models. The asymmetry is rarely stated and falls
straight out of the arithmetic.

### [RESULT] The one signature that works is occultation

| | |
|---|---|
| Array area against the solar disk | **32.55 ppm** |
| Earth's own transit depth | 83.9 ppm |
| **Array as a fraction of an Earth transit** | **0.388** |
| Collector alone | 19.5 ppm |

Occultation compares the array's **area** to the star's disk (3e-5). Emission compares its
**luminosity** to the star's (3e-11). Six orders separate the two, and they land on opposite
sides of what instruments can do.

> **The prediction: a shallow, aperiodic, non-planetary transit — not an infrared excess.**

### [CORRECTED] A hotter array is harder to see, not easier

The first draft claimed detectability and M10's mass lever pointed the same way, from a
scratch calculation that **held the radiator area fixed**. A hotter radiator is *smaller* as
T^-4 while its peak radiance grows only as T^3:

| T (K) | area (m2) | peak (um) | flux (uJy) | contrast | reach (pc) | occult (ppm) |
|---|---|---|---|---|---|---|
| 280 | 3.38e13 | 10.35 | 0.0759 | 3.61e-8 | 3.29 | 41.7 |
| **320** | 1.98e13 | 9.06 | **0.0664** | **2.46e-8** | **3.08** | **32.6** |
| 400 | 8.10e12 | 7.24 | 0.0531 | 1.31e-8 | 2.75 | 24.9 |
| 500 | 3.32e12 | 5.80 | 0.0425 | 7.01e-9 | 2.46 | 21.7 |

    flux at the peak  ~ 1/T      (verified: 0.5000 for a doubling)
    contrast          ~ 1/T^3    (verified: 0.145 for a doubling)

**Every detection axis gets worse when the silicon runs hot.** M10 and M15 both want the
junction hot, for mass. Observability wants it cold. Nothing here resolves it; it is stated
because the engineering optimum and the detectable optimum genuinely point apart.

[KNOWN_LIMIT] Single-temperature blackbody — a real array has a distribution, an emissivity
spectrum, and a collector face that is deliberately absorbing. Flux is evaluated at the Wien
peak only; a proper answer integrates over a band and an instrument response, which would
move the contrast somewhat and not by seven orders. No zodiacal foreground, no interstellar
extinction, no confusion. The occultation figure is a **geometric area ratio** and says
nothing about the shape or periodicity of the light curve — which is exactly what would
distinguish an array from a planet, and what a real search would live or die on. Sensitivity
is one assumed instrument figure used only to state a reach; the contrast result is
independent of it. Nothing here models any technosignature beyond the two this chain's own
physics forces.

## Sequence — the order things break (M19, `src/lib/sequence.ts`)

M6-M18 each establish a wall. **None of them says which one you hit first**, and the whole
document reads as if the answer were Type I — x509, nine doublings, three and a half
centuries. It is not.

### [RESULT] The ladder

| wall | power | K | vs today | doublings | inertial | kind |
|---|---|---|---|---|---|---|
| Today (IEA TES 2023) | 19.6 TW | 0.729 | x1 | 0 | — | comparison |
| **Waste-heat ceiling, +0.1 K** | **192 TW** | **0.828** | **x9.8** | **3.29** | **~128 yr** | **budget** |
| Waste-heat ceiling, +0.5 K | 960 TW | 0.898 | x48.9 | 5.61 | ~218 yr | budget |
| Waste heat = today's greenhouse forcing | 1,530 TW | 0.918 | x77.9 | 6.28 | ~244 yr | comparison |
| Ground solar needs all Earth's land | 5,960 TW | 0.978 | x303 | 8.24 | ~320 yr | **physical** |
| Type I | 10,000 TW | 1.000 | x509 | 8.99 | ~349 yr | comparison |

**The first wall is 3.29 doublings away, not 8.99**, and at inertia it arrives **x2.73
sooner** than Type I. Four walls arrive before Type I does.

### The reframing

Every argument in M6-M18 — orbit, lunar sourcing, areal density, radiators, placement,
transfer, the load — is an argument about what happens **after** a constraint that binds below
ten times today's energy supply.

> **"The moment watts leave the crust" is not a Type I event. It is a K ~ 0.83 event**, and
> the chain in M6-M18 is what happens past that point.

That does not weaken the thesis. It moves the whole argument much closer, and makes the
number worth arguing about **x9.8**, not x509.

### [HONESTY] Three kinds of rung, and the ladder marks which

A ladder that blurs these is propaganda, so `kind` is on every wall and a test enforces it:

- **budget** — `+0.1 K` and `+0.5 K` are numbers we picked. Both are listed precisely so the
  budget is visibly a dial: five times the temperature buys exactly five times the power.
- **comparison** — the greenhouse crossover is not a limit. Nothing breaks there. It is where
  waste heat alone stops being a rounding error against everything else we do.
- **physical** — ground solar running out of land. **The only rung no budget can move.**

### What is deliberately NOT on the ladder

- **M8's launch ceiling** (`A_max = R·L`) is a *rate*, not a wall: it scales linearly with
  cadence, so it is a ceiling you cannot pass at a given build rate rather than a threshold
  you cross. Computed in `launchCeilingW()` and kept off the ordered list.
- **M13's climate floor** is geometric at a given array size, not a power threshold.
- **M14's payload penalty** is a ratio.
- **M16's escape factor** is defined *against* the +0.1 K ceiling, so it is the same wall
  wearing a different hat — listing it twice would double-count.

[KNOWN_LIMIT] The year column assumes IEA's 1.8%/yr forever, which nothing supports beyond it
being what recent decades did. **Read the K column and the multiple** — the years are included
only because "128 years" is legible in a way that "x9.8" is not. And nothing here models what
actually happens *at* a wall: a ceiling is not a cliff, and this module does not claim to know
the shape of the failure.

## Engine — the number M14 assumed, derived (M20, `src/lib/engine.ts`)

**This is the module IGNIOS builds on.** M14's entire transfer argument turns on one line:
`ISP_VACUUM_S = 380`, marked `[ASSUMED]` and never derived. Fourteen modules argued about
orbits, radiators and lunar industry without modelling the thing that does the pushing.

### The decomposition that makes it checkable

    Isp * g0  =  c*  x  C_f

`c*` = characteristic velocity, what the chamber can do, **no nozzle in it**.
`C_f` = thrust coefficient, what the nozzle recovers.

Validating them separately is the whole discipline: c* has a tight published value per
propellant pair, while C_f depends on an area ratio that differs between every engine flown.

    c*  = sqrt(R_u * Tc / M) / Gamma(g)      Gamma(g) = sqrt(g) * (2/(g+1))^((g+1)/(2(g-1)))

### [VALIDATION] c* within 3% for all three pairs

| pair | Tc (K) | M (g/mol) | g | c* derived | c* published | error |
|---|---|---|---|---|---|---|
| LOX/LH2 | 3600 | 13.5 | 1.20 | **2,296 m/s** | 2,360 | **-2.7%** |
| LOX/CH4 | 3550 | 21.4 | 1.16 | **1,833 m/s** | 1,830 | **+0.2%** |
| LOX/RP-1 | 3670 | 23.0 | 1.15 | **1,804 m/s** | 1,820 | **-0.9%** |

And with each engine's own area ratio:

| engine | AR | Isp derived | published | error |
|---|---|---|---|---|
| RS-25 | 69 | **451.1 s** | 452.3 | **-0.2%** |
| Raptor Vacuum | 80 | 371 s | 380 | -2.5% |
| Merlin 1D Vacuum | 165 | 367 s | 348 | +5.5% |

### [CORRECTED] A units trap that cost the first run

The first evaluation was out by **exactly sqrt(1000)** — dividing by molar mass in kg/mol
against a gas constant per kmol. `R_u = 8314.462618 J/(kmol*K)` **so that M stays in g/mol**.
Invisible in any self-consistency check; obvious in one line against a published number. That
is the entire argument for keeping external yardsticks.

### [RESULT] The lever is molar mass, not chamber temperature

| pair | Tc | M | Tc/M |
|---|---|---|---|
| LOX/LH2 | 3600 K | 13.5 | **267** |
| LOX/CH4 | 3550 K | 21.4 | 166 |
| LOX/RP-1 | **3670 K** | 23.0 | 160 |

**Hydrogen burns the coolest flame of the three and still wins by 27%** in c*, because
`c* ~ sqrt(Tc/M)` and its exhaust is light — a **x1.67** advantage in the group that matters.
Chasing chamber temperature is chasing a square root of the wrong variable, and it is why
every serious high-Isp engine runs fuel-rich even though that wastes fuel.

### [RESULT] Chemistry cannot do M14's logistics

M14's Earth->GEO delta-v is 12,724 m/s. Inverting Tsiolkovsky:

| mass ratio | Isp needed | verdict |
|---|---|---|
| 30.4 | **380 s** | chemical — and exactly what M14 assumed, so M14 was self-consistent |
| 10 | 563 s | already past chemistry |
| 5 | 806 s | |
| **3** — a sane single stage | **1,181 s** | **x2.62 the ~450 s chemical ceiling** |
| 2 | 1,872 s | |

Nuclear thermal is ~900 s; ion electric >3000 s.

> **The Earth-launch route is closed by the periodic table, not by engineering effort.**

That is a **third independent road** to M11's conclusion. M14's x505 areal gap was the shadow
this was casting without naming it.

[KNOWN_LIMIT] Ideal one-dimensional flow: frozen composition, no nozzle recombination, no
boundary layer, no divergence loss, no film cooling, no combustion inefficiency. Real engines
recover some of this and lose more; they roughly cancel at the few-percent level, which is why
the validation works **and also why it must not be pushed past a few percent**. Chamber
temperature, molar mass and gamma are assumed per pair at their fuel-rich optima and are the
softest inputs — c* goes as their square root, which is the only reason the errors stay small.
No throttling, no mixture-ratio sweep, no regenerative cooling limit, and **no chamber
pressure limit — which is what actually decides whether an engine is buildable**. The 450 s
ceiling is a round figure for the LOX/LH2 class, not a derived bound on all chemistry.

## Density — the same property, costed on the other side of the tank wall (M22, `src/lib/density.ts`)

M20's result: `c* ~ sqrt(Tc/M)`, so **the lever is molar mass**. M20 then named its own gap —
no chamber-pressure or feed-system limit, "which is what actually decides whether an engine is
buildable." Closing it finds the answer is the **same atomic fact measured from the other
direction**.

> **Hydrogen is light. That is exactly why its exhaust is fast and exactly why its tank is
> enormous.** One fact, helping in the nozzle and hurting everywhere upstream of it.

### [RESULT] Density impulse reverses the ranking

Bulk density is **volume-weighted**, not mass-weighted — `(1+MR)/(1/rho_f + MR/rho_ox)` — because
that is what the tank has to hold.

| pair | rho_f | MR | rho_bulk | Isp | rho*Isp | vs LH2 |
|---|---|---|---|---|---|---|
| LOX/LH2 | 71 | 6.00 | **362** | 452.3 | 163,700 | 1.00 |
| LOX/CH4 | 423 | 3.60 | 833 | 380 | 316,700 | **x1.93** |
| LOX/RP-1 | 810 | 2.36 | **1,017** | 348 | 354,000 | **x2.16** |

LH2 wins Isp by **x1.30** and loses bulk density by **x2.81**. Per cubic metre of tank,
kerosene is worth **more than twice as much**.

### [RESULT] And the pump work is inverse in density

Pump power is `mdot*dp/(rho*eta)`. At the same pressure rise, a kilogram of hydrogen costs
**x11.4** the pump work of a kilogram of kerosene — exactly the density ratio, and
**independent of the efficiency assumed**, which is why it is the quotable number.

| engine | fuel pump | LOX pump | total modelled | published | error |
|---|---|---|---|---|---|
| RS-25 | **66.5 MW** | 24.8 MW | 91.3 MW | ~73 MW | **+25%** |
| Raptor | 16.7 MW | 22.3 MW | 39.0 MW | ~30 MW | **+30%** |
| Merlin | 1.9 MW | 3.1 MW | 5.0 MW | ~5 MW | — |

Both validated engines come out high **in the same direction**. That is the signature of an
assumed efficiency that is too low and generous discharge pressures — not of a broken model.
Scatter in both directions would be the warning. **Quote the ratios, where eta cancels.**

### Tank volume, which is what lands on M21

| pair | m3 per tonne | vs RP-1 |
|---|---|---|
| LOX/LH2 | **2.76** | **x2.81** |
| LOX/CH4 | 1.20 | x1.22 |
| LOX/RP-1 | 0.98 | x1.00 |

### [RESULT — unexpected] Methane exactly matches hydrogen

A tank's mass scales with the volume it encloses, so the x2.81 penalty lands straight on M21's
structural coefficient — the number M21 flagged as assumed and load-bearing. Give each pair
its own epsilon and rerun M21's two-stage GEO case:

| pair | Isp | epsilon | payload fraction | vs RP-1 |
|---|---|---|---|---|
| LOX/LH2 | 452.3 | **0.152** | **1.03%** | x1.54 |
| LOX/CH4 | 380 | 0.089 | **1.03%** | x1.55 |
| LOX/RP-1 | 348 | 0.080 | 0.66% | x1.00 |

**LH2's entire 19% specific-impulse advantage over CH4 is cancelled, to two decimal places, by
the tanks that advantage costs.** Hydrogen buys nothing here; it only moves where the mass
sits.

This was **not predicted before running it**, and it is the cleanest available explanation for
why the industry converged on methane for reusable vehicles: at equal payload you would rather
have the dense propellant, the small tanks and the 16 MW pump than the huge tanks and the
50 MW one. Both still beat kerosene by ~x1.5, so **Isp has not stopped mattering** — the
reversal lands specifically between hydrogen and methane.

[KNOWN_LIMIT] Storage densities at normal boiling point. No ullage, no insulation mass, **no
boil-off** — a real operational cost for hydrogen that nothing here models, so the hydrogen
case is flattered. Discharge pressures are estimated above chamber pressure and one pump
efficiency is assumed for every pump on every engine. `TANK_SHARE_OF_STRUCTURE` is a round
half; the stage comparison is a sensitivity study, not a design. Tank mass is taken
proportional to volume at fixed pressure — real tanks scale with surface area, so this
overstates the penalty for very large tanks and understates it for small ones.

## Acceleration — what intelligence can and cannot move (M23, `src/lib/acceleration.ts`)

M6-M22 assume IEA inertia or a labelled lambda. Neither says what happens if capability grows
fast. So sort every parameter by whether thinking harder moves it.

### [RESULT] The classification

| INELASTIC — cognition does not touch these | module |
|---|---|
| sigma*T^4 and the 192 TW crust ceiling | thermal.ts |
| Earth's land area | thermal.ts |
| the ~450 s chemical Isp ceiling | engine.ts |
| bulk propellant densities | density.ts |
| delta-v budgets, Tsiolkovsky | transfer.ts |
| the Landauer floor | reject.ts |
| the speed of light in a control loop | operator.ts |

| ELASTIC — design, materials, organisation | module |
|---|---|
| **industrial doubling time** (the leveraged one) | isru.ts |
| areal density | lift.ts |
| structural coefficient epsilon | staging.ts |
| array lifetime L | environment.ts |
| build rate R | collector.ts |
| compute efficiency | substitution.ts |

### [RESULT] Even the elastic ones have a thermodynamic floor

A self-replicating base of mass M at specific power p makes `M*p` watts. Building another M
kilograms costs `M*e` joules. **The mass cancels:**

    t_double = e / p        <- independent of scale

| regime | doubling time | 30 doublings | vs floor |
|---|---|---|---|
| **Physical floor `e/p`** | **7.7 days** | 0.63 yr | x1 |
| M11's industrial model | 263.7 days | 21.73 yr | x34 |
| What lambda = 0.62 implies | 1,225.6 days | 101.00 yr | **x159** |

At M11's 100 MJ/kg and M8's own 150 W/kg (337 W/m2 over 2.24 kg/m2). **The entire gap between
forecast and physics is organisational** — logistics, tooling, transport, allocation.

The 0.63-year Type I figure is a **reductio** exactly like M16's 101 MW. Nothing rebuilds an
industrial base in eight months. What it shows is that **the schedule is not protected by
physics.**

### [THE ANSWER] Intelligence moves the date, never the wall

M19's first wall is at **K = 0.828 and 3.29 doublings**. That is identical in every regime and
a test asserts it, because sigma*T^4 does not negotiate.

| regime | years to the first wall |
|---|---|
| IEA inertia, 1.8%/yr | **127.8 yr** |
| lambda = 0.62 | 11.0 yr |
| M11's industrial model | 2.4 yr |
| the physical floor | **25 days** |

> A fast takeoff does not deliver Type I. **It delivers the +0.1 K waste-heat ceiling,
> quickly.** It does not raise the ceiling; it shortens the runway to it.

[KNOWN_LIMIT] `e/p` is a bound and nothing more: energy binds, zero idle time, transport,
setup, tooling or allocation loss. Real industry is bound by material availability and by
carbon regolith does not have. **Nothing models the latency from cognition to design to working
hardware** — that is M24. No takeoff dynamics, no date for AGI, no claim any of it happens.

## Qualification — the latency nobody compresses (M24, `src/lib/qualification.ts`)

M23 named its own gap. This takes the part of that latency which is **physical** and finds it
dominates by two orders of magnitude.

### The Amdahl conversion

    speedup = 1 / ((1 - f) + f/s)        ceiling with free cognition = 1/(1-f)

With f the cognition-bound share of the schedule. M23 measured the organisational gap at x159,
so:

> **"AGI closes the organisational gap" IS the claim "99.37% of the schedule is thinking."**

That converts an adjective into a statement about the world. **The module never estimates f —
it only converts claims into claims.**

### [RESULT] Build 232 days, know it in 69 years

| | |
|---|---|
| Build 30 doublings at M23's floor | **232 days** |
| Verify M12's 69-year lifetime | **69 years** |
| **Verification dominates by** | **x109** |

M8's ceiling `A_max = R*L` is linear in a lifetime M12 derived **from mechanism and explicitly
did not observe** — "nothing this thin has flown for a decade, let alone three."

### What accelerated life testing buys, and what it does not

| mode | accelerable | why |
|---|---|---|
| Total ionising dose | **yes** | Known rate, known fluence. A decade in an afternoon. |
| Thermal cycling fatigue | **yes** | Damage is per-cycle and cycles are countable. |
| Coupled UV + AO + cycling + micrometeoroid | **no** | Documented as non-additive. Accelerating one changes which dominates. |
| The acceleration factor itself | **no** | Calibrated against real-time data. Somebody has to have waited. |
| A mechanism nobody modelled | **no** | LDEF flew 5.8 yr and returned surprises. |

**You can accelerate a mechanism you understand. You cannot accelerate finding the one you
missed.**

### What a plausible cognitive fraction buys, applied to lambda

| f | speedup ceiling | doubling | first wall | Type I |
|---|---|---|---|---|
| 50% | x2 | 1.68 yr | **5.5 yr** | 51 yr |
| 80% | x5 | 0.67 yr | 2.2 yr | 20 yr |
| 90% | x10 | 0.34 yr | 1.1 yr | 10 yr |
| 95% | x20 | 0.17 yr | 0.6 yr | 5 yr |

Even at a modest f = 50%, the +0.1 K ceiling arrives **inside a decade** while Type I stays
half a century out. M19 and M23 said the same thing; this says it a third time from a
different direction. **The wall is what arrives.**

### The escape, stated without moralising

All of this is avoidable by **flying unqualified hardware and finding out**. Fast actors take
that option. It is a **choice about risk, not a physics result**, and the acceleration is
available only to whoever makes it.

[KNOWN_LIMIT] f is not derivable here and is not estimated. Verification time is taken equal to
the lifetime being verified — **the pessimistic bound**; partial qualification, staged
deployment and fleet learning all shorten it and none is modelled. No prototype iteration, no
tooling, no supply chain, no regulatory time. The accelerable/unaccelerable split is a
judgement informed by how life testing is actually done, not a derivation.

## Learning — the gap that closes itself, in the wrong currency (M25, `src/lib/learning.ts`)

M24 named fleet learning as its first unmodelled item. It belongs here because learning shares
an axis with the build in a way nothing else in the chain does.

### Wright's law, and why the axis matters

    X(Q) = X0 * Q^(-b)        per doubling of CUMULATIVE PRODUCTION, X <- X*(1-r)

M11 established Type I as **30 industrial doublings** from a 100 t seed. Those are doublings of
cumulative production — **exactly Wright's x-axis**. So the build supplies thirty doublings of
learning for free.

### The tantalising arithmetic

| | |
|---|---|
| M14's areal density gap | **x505** |
| Doublings the build supplies | 30.1 |
| **Rate that would close it** | **18.7% per doubling** |
| Photovoltaic learning rate | **20-24%** |

The requirement lands *just inside* the best-documented learning curve in industrial history.

### [THE TRAP] Different quantities, and the chain's learns slowest

| curve | rate | quantity | 30 doublings buy | doublings needed | closes? |
|---|---|---|---|---|---|
| Photovoltaic modules | 22% | **$/W** | x1,770 | 25 | **yes** |
| Lithium-ion cells | 19% | $/kWh | x568 | 30 | yes |
| Wind turbines | 12% | $/kW | x47 | 49 | no |
| **Areal density, illustrative** | **6%** | **kg/m2** | **x6** | **101** | **no** |

Photovoltaics got cheap by getting cheap to **make** — thinner, mass-produced, higher yield —
not by getting **light**. Space array specific power: roughly 30 W/kg to 150 in three decades,
**x5 in total**, against x505 needed.

> This repo already refuses to let `grid-cost.ts` into a physics test because it is dated. The
> same rule applies here and harder: **a cost learning rate may not be used to close a mass
> gap.** It is the most tempting error available in this module and it would flatter the thesis
> by three orders of magnitude. A test enforces it: every entry in `CURVES` must be labelled
> with the quantity it learns on, and every one must be a cost curve.

### [RESULT] The requirement, not a prediction

> **r >= 18.7% per doubling, in areal density, sustained for thirty doublings.**

A falsifiable engineering target in the right units on the right axis. At 10% it takes **59
doublings against the 30 the build supplies** — so the gap closes only if **learning outpaces
construction**.

### And a fourth route to the same conclusion

Wright's x-axis is **units built**. Not years elapsed, not effort applied. A faster mind moves
it only by causing more units to exist — which is what M19, M23 and M24 each concluded by a
different route. **Building is what binds.**

### [CORRECTED] A negative zero the tests caught

`wrightExponent(0)` returned `-0`, because `-log2(1)` is negative zero in JavaScript. It
compares unequal to `0` under Object.is and becomes `-Infinity` if anyone reciprocates it.
Normalised in the module with `+ 0`, with the reason in the comment.

[KNOWN_LIMIT] Wright's law is **empirical, not physical** — no mechanism, and it saturates
against material floors nothing here models. Every published rate carried is a **cost** curve
and the module refuses to convert one into a mass rate. `ILLUSTRATIVE_MASS_RATE = 0.06` is a
stand-in, **not a measurement**: the cumulative-production series for space solar arrays is not
here, so **no mass learning rate is claimed**, and a test keeps it out of the published set.
Constant-rate learning over thirty doublings is five orders of cumulative production — nothing
has been observed to hold a rate that far except photovoltaics, which is the exception being
borrowed from.