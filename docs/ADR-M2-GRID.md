# ADR M2 — Federated bulkheads (`src/lib/grid.ts`)

Status: **implemented (lib + tests)**. Bench UI and route pending.
Scope: `docs/NEXT-MODULES.md` §M2. Thesis under test: `docs/THESIS.md` §2.

---

## Context

The thesis says Type I needs a **federated, predictive, self-healing grid**, not one
global synchronous mesh, and that **latency is physics**: a Berlin node cannot close a
Sydney control loop.

That claim was never checked against numbers. M2 is the bench that checks it. It has to
be able to come back and say the thesis is wrong.

## Decision 1 — three timescales, three separate models

A grid argument that mixes them produces slideware. Kept apart:

| Layer | Step | What decides the outcome | Latency matters? |
|---|---|---|---|
| Geography | — | great circle, `c/n`, route factor | it *is* the layer |
| Energy | 1 h | capacity, storage, HVDC loss, intertie size | **no** — 100 ms / 3600 s = 3e-5 |
| Control | 0.02 s | swing equation, inertia, UFLS, gen trip | **yes** |

Consequence: the hourly dispatch does **not** model latency, and says so. Faking a
latency effect at the hourly scale would have been the easy lie.

## Decision 2 — anchor the totals on a constant that already exists

The five clusters' mean load sums **exactly** to `facts.ts ELECTRICITY_W` (~3.42 TW).
`loadShare` is an order-of-magnitude split of world electricity, normalized to 1. No new
civilization-scale constant was invented. A test locks the identity.

Note the layer: this module is about **electrons (~3.4 TW)**, not TES (~19.6 TW). Do not
let the UI blur the two.

## Decision 3 — derive, do not assert

- Solar capacity factor is **`1/π`**, the exact mean of the clamped-sine day, not a
  quoted number. Test integrates it numerically.
- Load shape has mean **exactly 1**; longitude shifts phase only.
- Link distances come from haversine on real hub coordinates. Nothing is hardcoded.
- Latency comes from `c / 1.4682` (SMF-28 group index) × a 1.6 route factor, calibrated
  on the one publicly measured pair I could check (FRA–SIN: 92 ms great-circle round
  trip in fiber vs ~150–160 ms measured).
- HVDC loss compounds — `1 − e^(−αL)`, α from 3%/1000 km. The linear form breaks past
  20,000 km (it exceeded 60%, then 100%).
- Storage requirement is **solved**, not chosen: `sizeIslandStorageHours()` bisects on an
  islanded sim.

## Decision 4 — greedy allocator behind a seam

`Allocator` is a function type. `greedyAllocator` is cheapest-link-first, surplus only,
no wheeling. A QUBO-class block allocator drops in behind the same seam and **must be
measured against greedy on unserved energy, not asserted to be better**.

`noTradeAllocator` is what makes the islanding test possible.

**M2c ran that measurement. Result in §6: greedy is optimal, and the QUBO is a category
error on a problem this small. The seam stays; the default does not change.**

---

## What the model actually says

Run: `npm test`. Numbers below are from `src/lib/grid.ts` at default settings.

### 1. A global synchronous pool is not a design choice — it is excluded

AC submarine cable dies at ~100 km on capacitive charging current. Every one of the six
ties is 6,300–14,900 km. All must be HVDC, and HVDC is **asynchronous by construction**.
`grid.synchronousPossible === false`, and the test asserts it link by link.

This is the strongest leg of the thesis and it needs no simulation. ERCOT,
Hydro-Québec and the Japanese 50/60 Hz split are asynchronous ties in production today.

### 2. Latency forbids sub-second arbitration, permits everything slower

One-way 53–121 ms (RTT 107–242 ms — **the 80–200 ms in NEXT-MODULES reads as RTT, not
one-way**). Delay-limited crossover ω_c = 0.6/RTT, settling 4τ → **0.7–1.6 s**.

| Loop | Window | Verdict |
|---|---|---|
| RoCoF arrest | 0.5 s | **fails on every link** |
| FCR full activation | 30 s | passes |
| Economic dispatch | 900 s | passes |

So: inter-region ties carry **energy and schedule**, never frequency. Exactly the thesis
wording ("surplus and ledger only"), now with a number behind it.

### 3. Long-haul transport: the loss is not a constant

**[CORRECTION]** Earlier revisions charged a fixed loss percentage per 1000 km. Wrong. On
a DC line at constant voltage the current is the same all along the conductor, so

    P_loss = I²R,  P = V·I   =>   loss fraction = I·R/V = P·R/V²

The loss **fraction is proportional to the power you push** and to 1/V². A line at 15% of
rating loses 15% of its rated loss. The ties looked decorative partly because they were
being charged rated losses at a fraction of rated flow.

Three consequences the model now gets right:

- Overbuilding a cable makes it **more** efficient at a given flow (¼ the loss for 2× the
  copper). Fat conductors are not a luxury, they are the loss budget.
- Every line has a **maximum deliverable power at exactly 50% efficiency** — classic
  maximum power transfer. Past that point, extra current is pure heat.
- A long tie must be run far below rating. AP–NA is 73% loss at nameplate and a perfectly
  ordinary cable at its 14% design loading, delivering ~6.4 GW.

### 3b. And it still does not matter — the M2d result

Sweeping intertie capacity (capShare 0.08 → 1.00) and pole voltage (±800 → ±1100 kV, both
built today) takes peak import from **2.8% to 38% of load**. The tie becomes structural by
any definition. What it buys:

| | storage for <1% unserved |
|---|---|
| No ties at all | **7.43 h** of mean load |
| Planetary ring, capShare 1.00 | **7.37 h** |

**The entire cable is worth 0.06 hours of battery. Three and a half minutes.**

The reason is structural, not numerical: the diurnal deficit is a *bulk-energy* problem
(hours × GW) and a cable is a *power-rated* asset. Covering AP's night needs ~11,000 GWh
in one sitting; the daylit clusters do not have that to give at that instant, and what
they do have arrives across a line whose loss climbs with every watt.

This does not make federation safer. It makes it the **default**: at planetary scale there
is very little to federate. The energy case for a single world grid is weak on its own
terms, before anyone argues about control latency or blast radius.

**The attack was run. See §3d.** The M2d conclusion was flagged as vulnerable to weather,
because the real case for interconnection is smoothing *correlated* weather rather than
the day/night cycle. Weather is now in the model. The conclusion held, and hardened.

### 3d. M2e — weather, seasons, and a wire that cannot exist

Real astronomy, opt-in via `simulate({ weather: true })`, annual energy normalized so the
experiment tests the *distribution* of energy and not an accidental change in how much
there is. Wind gets mid-latitude winter uplift. Dunkelflaute is scripted, one region at a
time — justified because wind-power correlation e-folds at ~600 km and the clusters are
6,300–14,900 km apart, so ρ ≈ 10⁻⁶ and they are independent.

**Seasonality hurts, exactly where obliquity says it should.** EU (50.1°N) gets 6× less
daily insolation in December than in June and goes from 0.14% unserved to 3.3%. NA
(39.8°N) from 0.66% to 4.1%. AF and AP, on the equator, do not move at all — 0.00 and
−0.01 pp. The penalty tracks |latitude| and nothing else. The annual storage bill goes
from 7.4 h of mean load to **~358 h**: fifteen days, 1,225 TWh at today's scale, roughly
4,000× the world's installed grid battery fleet. No chemistry does that.

**And the cable still does not help.**

| | annual unserved |
|---|---|
| Islanded, no ties at all | 3.875% |
| Real ring at capShare 1.0, ±1100 kV | 3.484% (−0.39 pp) |
| A wire with **infinite capacity and zero loss** | 3.431% (−0.45 pp) |

The decisive number is the last row. A physically impossible wire buys 0.45 pp, and the
real ring already captures **88%** of it. Transmission is not the binding constraint —
not because our cable is too thin or too lossy, but because **at the moment a cluster is
short, nobody else has a surplus to send**. During a five-day European Dunkelflaute the
flow limiter reported by the allocator is "no surplus", not capacity and not maximum
power transfer; raising capShare from 1.0 to 4.0 changes imports by 3%.

**What does work is overbuild.** Multiplying every generation share by 1.5 — islanded, no
cable at all — takes the annual storage requirement from ~358 h to ~3.4 h and unserved
energy to zero, at the cost of ~42% curtailment. The entire planetary ring, at any
capacity and any voltage, is worth ~0.7 h of that.

So the ranking of levers for the distribution layer, by physical effectiveness:

    overbuild  >>  storage  >>  transmission

### 3e. M2f — seasonal demand, and the first thing that makes the cable matter

M2e flagged its own gap: no seasonal load. Winter heating was missing, which flattered
winter and therefore understated the mid-latitude problem. It is now modeled, with two
terms that scale oppositely with latitude because they are different physics — heating
∝ |sin φ| peaking in the local winter (compounding with the insolation minimum), cooling
∝ cos φ peaking in the local summer (cancelling against it). A single sinusoid would have
got the southern hemisphere backwards. Anchored on EU 50°N winter/summer = 1.20 today and
an equatorial cooling peak of 1.15, both hit to five decimals, annual mean exactly 1.

`heatElectrification` ∈ [0,1] moves the first anchor to 2.00: a continent that has put its
heat on the grid. On the way to Type I that is not a detail, it is most of the new load.

| annual unserved, 7.43 h storage | today | heat electrified |
|---|---|---|
| Islanded, no ties | 4.949% | **7.860%** |
| Real ring, capShare 1.0, ±1100 kV | 4.328% (−0.62 pp) | 6.788% (−1.07 pp) |
| Wire with infinite capacity, zero loss | 4.117% (−0.83 pp) | 6.384% (−1.48 pp) |
| Ring captures, of the impossible | 75% | 73% |

**This is the first result that moves against M2d/M2e.** The cable's value roughly doubles.
More telling than the level is the *gap*: the distance between the real ring and an
impossible wire widens from 0.21 pp to 0.40 pp, which is the signature of transmission
starting to bind rather than sitting idle. Building a better cable finally begins to pay.

EU in December, fully electrified: load **1.52× its own generation**. In June, 0.71×. That
is a structural half-year deficit, and it is exactly the shape a cable to the tropics or
the other hemisphere is for.

**And overbuild still wins.** Islanded, no cable at all: ×1.5 clears it today, ×2.0 clears
it with heat electrified. The whole planetary ring is worth ~0.7 h of storage against
that. The ranking survives — but the margin narrows as heat moves onto the grid, and that
is the direction the world is going.

**[SUPERSEDED]** The M2e figures quoted above (islanded 3.875%, magic wire −0.45 pp) were
computed without seasonal demand. `simulate({ weather: true })` now always includes it.
The M2f table is the current answer.

**[KNOWN_LIMIT]** This is a physical model, not an economic one. It ranks levers by
effectiveness, not cost; whether 42% curtailment beats 11.6 TWh of battery or a 30,000 km
ring is a $/W vs $/kWh vs $/kW·km question this module does not answer, and the answer
moves every year. No stochastic weather. One scripted Dunkelflaute at a time. And **no
seasonal load** — addressed in §3e.

### 3c. Scale

The model is linear in total load, so every fraction — unserved, peak import, storage
hours — is **identical at Type I**. The architecture is scale-free; nothing about it
breaks on the way from 3.42 TW to 10¹⁶ W. What changes is absolute: 7.43 h of Type I is a
**~74,000 TWh** tank, more than twice the world's entire annual electricity output today.
That is the real Type I bill for the distribution layer, and it is storage, not cable.

### 4. The bulkhead invariant holds — but read the metric carefully

**[CORRECTION]** An earlier revision of this ADR quoted "survivors move < 0.02 pp" after a
kill. That number was an artefact and is withdrawn. It came from subtracting
`SimResult.unservedFrac` (all five clusters) from `SimResult.survivorUnservedFrac` (four
clusters) — different region sets, different denominators. The subtraction manufactures a
delta of ±0.1–0.3 pp out of nothing, with a sign that depends only on whether the killed
cluster sat above or below the population mean. Two independent reviewers made exactly
this mistake on this module before it was caught, which is why `killContainment()` now
exists and why `grid.test.ts` locks the naive value as *known-wrong*.

Measured like for like — same window, same four survivors — the delta is **0.0000 pp** in
every protocol tried (72 h/no warmup, 48 h/24 h warmup, 48 h/no warmup, 72 h/24 h warmup).

**And that zero is close to vacuous.** `sizeIslandStorageHours()` sizes each cluster with
`noTradeAllocator`, i.e. to be self-sufficient. Killing a cluster nobody depended on is a
tautology, not a demonstration: in the sized grid AP trades **nothing at all**
(`vacuous: true`), and trade is worth at most 0.074 pp to any cluster. The sizing step and
the containment claim are not independent.

The demo with something to lose runs on the **undersized (4 h) grid**, where clusters do
lean on the ties. There, killing the net exporter (NA) costs the others **+0.05 pp** against
a 7% baseline, and killing anyone else costs exactly zero. That is the honest headline:
*the only cluster whose death is felt is the exporter, and it is felt as a rounding error.*

### 4b. Capacity and import share

Intertie capacity ≤ 8% of the smaller endpoint. Across a 72 h run, peak import never
exceeds **5.7%** of a cluster's load. Import is garnish — see §4 for what that
does, and does not, let you claim about killing a cluster.

### 5. Today's storage does not island

At 4 h (roughly today's fleet), the default build fails **6.7%** of demand. Solved
requirement for <1% unserved, islanded:

| | NA | SA | EU | AF | AP |
|---|---|---|---|---|---|
| hours of mean load | 8.3 | 9.6 | **2.9** | **8.3** | 6.9 |

Non-obvious result worth keeping: **wind and firm buy you storage**. EU (45% wind, 35%
firm) needs 2.9 h. AF (75% solar) needs 8.3 h. The tank is priced by how solar-heavy the
mix is, not by how big the cluster is.

---

## Where the thesis is wrong, or at least overstated

I could not reproduce the "global sync would have cascaded, bulkheads did not" demo as
written, and I am not going to fake it.

**a. A bigger synchronous pool is genuinely safer on RoCoF.** Shared inertia is physical
and instantaneous — it needs no comms, so latency cannot take it away. 20% generation
trip in AP: pooled RoCoF −0.67 Hz/s vs federated −1.25 Hz/s. The pool is **1.9× better**,
and the ratio is `serving_total / serving_AP` regardless of the inertia constant. That is
why interconnection exists, and the module reports it rather than hiding it.

**b. What federation actually buys on that shock is footprint, not frequency.** The pool
socializes the shed: UFLS drops 15% of *world* load. Federation drops 20% of *one*
cluster = 10.7% of world load. **Better frequency, wider blackout** vs **worse frequency,
contained blackout**. That is the honest trade, and it is a better line than the strawman.

**c. "Kill one cluster" is not a frequency event at all.** A cluster that goes dark takes
its load *and* its generation with it. The pool only loses its net export — which the
bulkhead rule already caps at 8%. The kill demo belongs to the **energy** timescale
(where it works cleanly, §4), not the seconds timescale.

**d. A common-mode fault is architecture-neutral in the frequency domain.** Trip the same
*fraction* everywhere and RoCoF is identical whatever the pool size — the test asserts
equality to float precision. The federation argument here is **blast radius of the
control plane**: one compromised control plane reaches 100% of world load pooled, versus
46% federated (`controlPlaneBlastRadius`). That is a systems-and-security argument, not a
swing equation, and it should be stated as one.

**Net:** the doctrine survives, on legs (a) exclusion-by-physics, (b) contained blast
radius, (c) latency forbidding sub-second arbitration. It does **not** survive on "the
global pool would cascade". Drop that framing from the copy. The exclusion argument is
airtight and does not need it.

---

## Files

| Path | State |
|---|---|
| `src/lib/grid.ts` | new — no deps beyond `facts.ts`; `killContainment()` is the only correct way to measure a kill |
| `src/lib/grid.test.ts` | new — 20 locks |
| `src/lib/facts.ts` | **fixed**: TWh/yr → W was missing ×3600 |
| `src/lib/kardashev.test.ts` | + lock on the three TWh figures |
| `package.json` | + `grid.test.ts` in `npm test` |

### Bug found on the way

`facts.ts` converted TWh/yr to watts as `twh * 1e12 / SECONDS_PER_YEAR`, treating **Wh as
joules**. Every electricity figure was **3600× too small**: `/energia` was rendering
`Electricity 0.0 TW`, `Datacenters 0.00 TW`, `Nuclear 0.0 TW`. `docs/NUMBERS.md` already
carried the correct value ("460 TWh → ~50 GW"), so the docs were right and the code was
wrong. Now `twhYrToW()`, with a test.

## Sequence from here

| | | |
|---|---|---|
| M2a | lib + tests | **done** |
| M2b | bench component + `/grid` or `/energia` section | Grok's lane — contract below |
| M2c | QUBO-class block allocator behind `Allocator`, measured against greedy | later |

### Bench contract (for the UI, so no physics is invented in JSX)

Everything comes from `grid.ts`. No literals in the component except labels.

```ts
buildGrid()            // 5 nodes, 6 links: km, latencyMs, loss, capacityW, control{...}
sizedGrid(0.01)        // the same, with storage solved so each cluster islands
simulate({ grid, hours: 72, kill: { regionId, atHour } })
                       // -> steps[], perRegion{unservedFrac, peakImportFrac}, survivorUnservedFrac
compareArchitectures(shock, { hourUtc, grid })
                       // -> federated vs pooled: minHz, worstRocofHzS, lostLoadFrac, collapsed[]
                       //    + blastRadiusFederated / blastRadiusPooled
```

Four stats worth the `DataStrip`: **worst link latency (ms)** · **worst settling (s) vs
0.5 s arrest** · **peak import (% of load)** · **survivor unserved after kill (%)**.

Sliders that change the answer: storage hours, `capShare`, inertia H (2–6 s), shock
fraction, hour UTC. Kill switch per node.

Copy guardrails: no "global grid would collapse". Say **"same kernel, different
hardware. Offline-stable."** and **"ties carry energy, never frequency."**

---

## 6. M2c — the QUBO, measured against ground truth

`src/lib/grid-qubo.ts`. Three allocators, so the comparison has a yardstick and not just
two opinions:

| | what it is |
|---|---|
| `greedy` | continuous flows, cheapest link first, O(L log L). The incumbent. |
| `exhaustive` | the **quantized optimum**, by enumeration over block counts. Ground truth. |
| `qubo` | a real Q matrix over binary variables, solved by simulated annealing. |

### The formulation

Unary ("thermometer") encoding of flow: `n_ℓ = Σ_b x_{ℓb}`, `f_ℓ = (u_ℓ/B)·n_ℓ`. Unary is
right here because the objective is quadratic in flow, so `(Σx)²` expands into a genuine
quadratic form with no auxiliary products.

    H = Σ_j ( d_j − Σ_{ℓ→j} a_ℓ n_ℓ )²              demand matching per deficit node
      + P · Σ_i ( Σ_{ℓ←i} g_ℓ n_ℓ + σ_i − s_i )²    surplus budget, unary slack

Slack turns the surplus inequality into an equality — the textbook QUBO move. Squaring the
demand term penalises over-delivery too, which is correct: power pushed at a node that
cannot use it is curtailed after paying the full transport loss.

**The one compromise:** transport loss is `f·(1 − m·f)`, so delivered power is quadratic in
flow and the squared demand term would be *quartic* in x — not a QUBO. Loss is therefore
linearized about an operating point and the solve is iterated. Standard practice, and also
the catch: the encoding cannot represent the physics exactly.

### Verification before conclusion

The first run had the QUBO losing, and the tempting write-up was "QUBO underperforms". That
would have been wrong. Isolating the machinery first:

| check | result |
|---|---|
| `quboEnergy` vs naive quadratic form | exact |
| `addSquare` expansion, using x² = x | exact |
| annealer vs brute-forced ground state | **8/8**, and 4/4 on random 12-var QUBOs |
| **QUBO ground state vs the problem optimum** | **0/8** |

So the solver was perfect and the *formulation* was wrong. A penalty/slack sweep found why:

| penalty | slack bits | mean excess over optimum |
|---|---|---|
| 8 | 3 | **1.93%** |
| 2 | 5 | 1.23% |
| 0.5 | 3 | 0.44% |
| 0.5 | 8 | **0.00%** |

Coarse slack cannot satisfy the surplus equality at the points the objective wants, so a
heavy penalty drags the solution off the optimum. **The penalty-tuning tax is real and it
never appears in a QUBO pitch.** Defaults are now `penalty 0.5`, `slackBits 8` — tuned by
sweep, not guessed.

### The result

| allocator | unserved (30 d) | gap | wall clock |
|---|---|---|---|
| greedy | 12.175187% | — | **15 ms** |
| exhaustive B=8 | 12.175187% | 0.000000 pp | 18 ms |
| qubo, tuned | 12.175191% | 0.000005 pp | **621 ms** |

Over a full year greedy sits **0.0002 pp** off the enumerated optimum.

### Why: there is no combinatorial problem

Active arcs per hour — links with a surplus at one end and a deficit at the other:

| arcs | hours (of 720) |
|---|---|
| 0 | **627 (87%)** |
| 1 | 83 (12%) |
| 2 | **10 (1.4%)** |
| 3+ | never |

Eighty-seven percent of hours have no trade opportunity at all. Twelve percent have exactly
one link, which is a one-dimensional continuous problem greedy solves exactly. The instance
never gets big enough to have combinatorial structure.

**Verdict: greedy stays the default.** The QUBO is kept because the formulation, the Q
matrix and the annealer are correct and reusable, and because the negative result is worth
more than the feature would have been. What M2c actually demonstrates is method: build the
ground truth, verify the machinery before blaming the method, and publish the measurement
even when it kills your own module.

[KNOWN_LIMIT] Single-hop only — no wheeling through a third cluster, in either allocator,
so the comparison is fair but both share the limit. A denser topology or a genuinely
multi-commodity problem could still have structure worth solving. This one does not.
