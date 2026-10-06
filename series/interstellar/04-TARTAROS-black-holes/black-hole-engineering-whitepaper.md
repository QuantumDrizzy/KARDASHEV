# PROJECT TARTAROS — Black Hole Engineering
## Kerr Batteries, Hawking Furnaces & the Energy Sources of K2.5+

| | |
|---|---|
| **Version** | 1.0 — Interstellar Series, vol. 4 (TOLIMAN → TRAPPIST → ARGOS → **TARTAROS**) |
| **Date** | 2026-10-06 |
| **Scope** | The K2.5+ energy chapter: rotational extraction (Penrose/Blandford–Żnajek), accretion as nature's power plant, Hawking furnaces, and the honest census of where the fuel actually is |
| **Classification** | Local research artifact. Not for distribution. |
| **Flags** | `[MEASURED]` (astrophysics) · `[EST]` · `[HYPOTHESIS]` · `[KNOWN_LIMIT]` · `[VERIFY]` |

> **Reading contract.** Same as the series. This is the chapter past the Sun: the energy sources that a Type II civilization graduates into when one star stops being enough. Everything here is standard general relativity plus engineering extrapolations declared as such — and the chapter opens by killing its own most romantic idea (kugelblitz) with a 2024 result, because that is the house style.

---

## 0. EXECUTIVE SUMMARY & THE CORRECTION TABLE

**One-sentence verdict.** The galaxy is already full of black-hole power plants — **10⁸ stellar-mass Kerr batteries at ~5×10⁴⁷ J of extractable rotational energy each** (4,000 Sun-lifetimes apiece), accretion plants that nature runs at 10³¹ W (Cygnus X-1), and an extraction efficiency ladder that climbs from fusion's 0.7 % to Kerr's ~29 % to Hawking's ~100 % — and the honest program finding is that **K1–K2 does not need any of this** (the Sun suffices, INVICTUS §0): black holes are the K2.5+ *storage and portability* layer, whose one great unresolved question is whether the small furnaces (10⁹–10¹² kg Hawking radiators) exist or can be made.

**The founding assumptions, corrected:**

| # | Assumption | Verdict | Correction |
|---|---|---|---|
| E1 | "Black holes are bottomless energy wells" | **Bottomless, no. Deep, precisely.** Extractable energy is bounded and finite: maximal Kerr spin holds ~29 % of mass-energy (`~26 %` at the astrophysical Thorne limit); accretion onto a maximal-Kerr BH converts mass at up to 42 %; Hawking radiation converts *any* fed matter at ~100 % in the steady state. | The ladder: fusion 0.7 % → accretion 6–42 % → Kerr spin ~29 % of *total* mass-energy → Hawking ~100 %. Each step is not mysticism; it is GR bookkeeping (§1). |
| E2 | "Hawking plants are fantasy" | **The physics is a textbook formula and it closes:** P = 3.6×10³²/M² W (M in kg). A **1.9×10⁹ kg** black hole radiates **10¹⁴ W** (a K1.5 plant) for **~18,000 years**, fed at ~1 gram/second of *anything* — no isotope, no ore grade, any matter. | Mass of a mountain, width of a proton (r_s ≈ 3×10⁻¹⁸ m), gravity at 1 km: 10⁻⁷ m/s² — station-keeping is trivial; the plant is a subatomic object you orbit, not a monster you chain (§3.2). |
| E3 | "Kugelblitz — make the furnace from light" | **Probably dead, 2024.** Pair-production dissipation arguments (QED: γ→e⁺e⁻ shreds the photon focus before horizon closure) indicate black-hole formation from light may not be achievable at any practical scale `[Álvarez-Domínguez et al. 2024 lineage — VERIFY: young result, review pending]`. | The furnace must be **found, not made** — which hands the question to the primordial-black-hole census (§3.3, `[MEASURE: microlensing + Fermi-LAT evaporating-PBH bounds]`). |
| E4 | "Penrose extraction is exotic speculation" | **Nature runs it in public.** Blandford–Żnajek magnetic extraction powers AGN jets at 10³⁸–10⁴⁵ W; X-ray binaries are accretion plants at 10³¹ W (Cygnus X-1: ~10⁴ L☉ in X-rays). The universe has been demo-running the mechanism for Gyr at every mass scale. | The engineering question is never "does it work" — it is "can a *tended* plant replace a *wild* one" (§3.1). |
| E5 | "You can't control a black hole" | **Control is trivial at plant masses.** A 1.9×10⁹ kg BH's gravity at 1 km is 10⁻⁷ m/s² — it is payload, not predator. The real hazards are operational: feed precision, spin-down bookkeeping, and the death-spiral geometry (§7/FM-01–02). | The monster narrative dies by arithmetic; the maintenance narrative is what survives. |
| E6 | "Primordial black holes are the dark matter, so fuel is everywhere" | **Half-open.** The asteroid-mass window (~10¹⁴–10²⁰ kg) remains a live dark-matter candidate `[MEASURE: microlensing campaigns ongoing]` — but the *useful furnace* masses (10⁹–10¹² kg, radiating 10⁸–10¹⁴ W) sit at/below the window's edge, and newborn furnace-mass PBHs would be in their final millennia *today*, shining as characteristic gamma point sources that **Fermi-LAT has not found** `[MEASURE: evaporating-PBH bounds]`. | The furnace census is empty so far. The Kerr-battery census is full (§2). The plan treats them as different assets (§5). |
| E7 | "This powers K1–K2" | **No — and that is fine.** K1–K2 is the Sun's chapter (INVICTUS; ERAS finding C: fusion is upside, not dependency). Black holes are the **K2.5+ portability layer**: a Kerr battery is 5×10⁴⁷ J packed in a ~6-km object — the only form in which that much energy travels between stars (§5). | Sequential honesty: Sun first, Kerr second, Hawking third — each rung's gate is the previous rung's success. |

---

## 1. THE EXTRACTION LADDER (GR bookkeeping, stated once)

| Mechanism | Efficiency | Fuel | Where nature demos it |
|---|---|---|---|
| Chemical | ~10⁻⁹ | anything that burns | — |
| Fission | ~0.09 % | U/Th | reactors |
| **Fusion (D-T/D-D)** | **~0.7 %** | H isotopes | stars |
| **Accretion, Schwarzschild** | **5.7 %** | any matter | X-ray binaries |
| **Accretion, maximal Kerr** | **up to 42 %** | any matter | quasars (`[MEASURED]` — the most efficient engines in nature) |
| **Kerr rotation (Penrose/B–Żnajek)** | **up to ~29 % of total mass-energy** | the spin itself | AGN jets `[MEASURED at 10³⁸–10⁴⁵ W]` |
| **Hawking (evaporation)** | **~100 %** (steady-state feed) | **any matter, no grade** | nothing — no small BHs found `[MEASURE]` |

The Hawking line is the punchline and the cliff: a steady-state Hawking furnace is a **universal mass-to-energy converter** — the end of ore grades, isotope economics, and fuel logistics. It is also the one rung with zero natural demos, which is why §3 is a census chapter and not a design chapter.

## 2. THE KERR BATTERY (the K2.5+ storage layer)

- **The asset:** one stellar-mass BH (3–10 M☉) at astrophysical spin: extractable ~26 % → **(3–5)×10⁴⁷ J**. For scale: the Sun's *entire main-sequence output* is ~1.2×10⁴⁴ J. **One battery = 4,000 Sun-lifetimes.**
- **The census:** ~10⁸ stellar-mass BHs in the Milky Way alone `[EST from population synthesis]`. The galaxy is a warehouse of unclaimed batteries; the limiter is not existence but *tending* (§3.1).
- **The extraction:** Blandford–Żnajek at industrial scale — magnetize the ergosphere (a superconducting flux anchor on a keplerian ring), extract as a collimated flow, capture at the jet terminal. Nature's jets are the proof of mechanism; the tendable-plant question is capture efficiency and jet containment `[EST: the largest engineering gap in this chapter]`.
- **Portability is the point:** 5×10⁴⁷ J in a 6-km-radius object that *is* its own containment. An interstellar city's power supply is a black hole towed at a distance — the tow is gravitational (it pulls you; you position), the mass is the ballast, and the fuel is the spin: **the only transportable gigayear-class energy storage physics offers.**

## 3. THE FURNACE QUESTION (small BHs: found or made, maybe neither)

### 3.1 Accretion plants (the tendable ones)

Feed any matter into an accretion flow: 6–42 % conversion, continuous. Nature's version (Cygnus X-1) runs 10³¹ W. The tendable version's problem is not the physics — it is that a productive accretion disk around a stellar BH is a *solar-system-scale* structure: this is a plant you **tend**, occupying a system, not one you build. K2.5-class: accretion plants are the industrial base of a multi-system civilization, the way coal regions were ours.

### 3.2 Hawking furnaces (the perfect ones, pending a specimen)

The plant table `[DERIVED from P = 3.6×10³²/M² W; τ = 8.4×10⁻¹⁷·M³ s]`:

| M (kg) | Power | Lifetime | Feed rate | Note |
|---|---:|---:|---:|---|
| 1.9×10⁹ | **10¹⁴ W** | 18,000 yr | 1.1 g/s | **the K1.5-class plant** — one per colony |
| 10¹¹ | 3.6×10¹⁰ W | 2.7 Gyr | 0.04 g/s | primordial survivors of this mass shine *today* in gamma `[MEASURE: Fermi-LAT bounds, none found]` |
| 5×10¹¹ | 1.4×10⁹ W | ~0.1 Gyr | — | the "evaporating today" class — their absence is itself a measurement |

**Everything you feed it becomes power at ~mc²** — the end of fuel logistics. Its gravity is negligible; its hazards are feed precision and the oscillating-predation geometry (§7/FM-01). **The open question is supply:** manufacture looks dead (E3, kugelblitz 2024); the primordial census has found no furnace-mass specimen `[MEASURE]`; the newborn class would announce itself in gamma and hasn't. **Status: the perfect plant, with no known specimen. The chapter's whole census question in one line.**

### 3.3 The census program (what is actually measured)

- Microlensing (OGLE/EROS/ICARUS-lineage): constrains PBH dark matter in the asteroid window year by year `[MEASURE, ongoing]`.
- Fermi-LAT evaporating-PBH bounds: constrain the newborn furnace class `[MEASURE, ongoing]`.
- Gravitational-wave population (LVK): maps the stellar-BH battery inventory — every detection is a *warehouse audit entry* `[MEASURE, accumulating]`.

The black-hole chapter, operationally, is a **survey chapter**: know where the batteries and (if they exist) the furnaces are. The §5 plant designs assume the census's success; the plan's K1–K2 does not.

## 4. THE BLACK HOLE RAMJET (the honest starship of the K2.5 era)

The Bussard ramjet died on fusion (the scoop was fine; the reactor wasn't). Replace the reactor with a Hawking furnace and the ship closes:

- Power for cruise at K2.5-class colony speeds: P = 10¹⁵ W → feed = 11 g/s of interstellar medium.
- ISM density ~10⁶ particles/m³ (~1.7×10⁻²¹ kg/m³) → scoop area = 1.1×10⁻² kg/s ÷ (ρ·v), v = 0.01c = 3×10⁶ m/s → A ≈ 2×10¹¹ m² → **radius ~250 km**. A magnetic funnel of 250 km radius, feeding a furnace that eats 11 grams per second of whatever the galaxy is made of.
- The point is not the drag arithmetic — it is that **the fuel constraint disappears**: no anticmatter factory, no fusion isotope ledger, no KRAKEN-style D bookkeeping. Mass is fuel; the galaxy is the tank. `[EST: drag-vs-thrust matching at the funnel rim is the design's real study — flagged, not solved]`

## 5. WHERE THE RUNGS SIT (sequential honesty)

| Rung | Energy source | Black holes needed? |
|---|---|---|
| K1 (10¹⁶ W) | fission + SSP + dial 2 (ERAS C) | no |
| K2 (10²⁶ W) | the Sun's shell (INVICTUS) | no |
| K2.5+ (multi-star) | **Kerr batteries as portable storage; accretion plants as regional industry; Hawking furnaces as the perfection layer if a specimen exists** | **yes — as storage and transport, not as the home fire** |

The ladder's own lesson applied one last time: each rung's energy source is chosen by *what travels* — sunlight stays home, He-3 ships in tanks, and at K2.5 the only tank that holds 10⁴⁷ J is a black hole. TARTAROS is not the fire; it is the **vault**.

## 6. SIMULATION (compact)

```
PROJECT TARTAROS-SIM :: modules (Rust core / CUDA kernels / Python V&V)
  ├─ kerr/       Blandford-Znajek extraction: flux-anchor models, jet
  │              capture efficiency bounds vs. AGN luminosity functions
  │              [VERIFY: tendable-plant scaling is unreferenced anywhere]
  ├─ hawking/    Plant table engine (P, tau, feed vs M), evaporation
  │              endgame management (the last-decade power spike),
  │              feed-precision Monte Carlo (FM-01)
  ├─ census/     PBH microlensing + Fermi-LAT bounds ingestion; GW
  │              population as battery-warehouse audit (LVK feed)
  └─ ramjet/     Scoop/furnace matching at 0.01-0.02c, ISM density
                 envelopes, drag-thrust closure (FM-07)
V&V: Hawking P(M) vs textbook; Kerr extractable vs 26-29% bounds;
     Cygnus X-1-class accretion reproduction; ramjet scoop vs MHD
     literature scaling [EST throughout — no flight heritage exists]
```

## 7. FAILURE MODE CATALOG

| ID | Failure | Physics | Mitigation |
|---|---|---|---|
| FM-01 | **Feed overshoot** | ṁ above plant steady-state grows the BH and drops P (P ∝ M⁻²) | Feed metering closed-loop on P; the plant is a carburetor, not a bonfire |
| FM-02 | **Oscillating predation** | A BH passing through matter accretes negligibly but *oscillates* — a loose plant inside a habitat ring re-crosses every cycle | Launch geometry doctrine: plant orbits exclude habitat volumes, forever |
| FM-03 | **Jet misfire** | A B-Z extraction flare is a collimated sterilization beam | Jet-axis exclusion zones; the plant's "exhaust stack" is aimed at nothing, always |
| FM-04 | **Spin-down bankruptcy** | Kerr batteries deplete: 29 % spent, the asset is a Schwarzschild rock | Battery dispatch accounting; spin is fuel — the vault keeps ledgers (house style) |
| FM-05 | **Kugelblitz dead-end confirmed** | QED pair-production kills light-to-horizon manufacture | Furnaces: census-only strategy (§3.3); design assumes none exist |
| FM-06 | **PBH non-existence** | Microlensing + gamma bounds close every window | Kerr batteries and accretion carry K2.5 alone — slower, dirtier, alive |
| FM-07 | **Ramjet drag-lock** | Scoop drag exceeds thrust at low feed density | Density-envelope routing (galactic cloudy zones); arrive slow |
| FM-08 | **The endgame spike** | Final-decade evaporation: power rises as the plant dies | Scheduled replacement; the last-year furnace is a scheduled supernova, managed like one |
| FM-09 | **Vault theft** | A portable 10⁴⁷ J object is a strategic asset by definition | The FRAGILITY doctrine at K2.5: vault B-index, custody chains (OKEANOS v2 heritage) |
| FM-10 | **Accretion-zone ecology** | Tended disks evolve (instabilities, QPO shifts) — wild disks are studied, tended ones are new | Plant health telemetry vs. AGN/QPO baselines |
| FM-11 | **Gravitational infrastructure** | Everything nearby orbits the plant: habitats, scoops, anchors — three-body homes | The binary-orbit doctrine (TOLIMAN §1.2, transplanted to the plant's well) |
| FM-12 | **Hawking spectrum hazards** | The furnace radiates *everything* — gammas, all species; no spectral mercy | Distance + conversion blankets; crew behind regolith, as always |
| FM-13 | **Census error compounding** | Building K2.5 logistics on PBHs that microlensing later excludes | Census-gated phasing (§3.3): no furnace-dependent assets before a specimen |
| FM-14 | **The TARTAROS temptation** | The vault's power invites K2.5 ambitions before the K2 referendum (INVICTUS FM-13) | Series rule: sequence is sequence; the Sun is first |
| FM-15 | **GR edge-case drift** | Plant designs at extremes of the parameter space where our GR numerics were never validated | kerr/ module V&V against AGN data before every design freeze |

## 8. K-ACCOUNTING & VERDICT

| Asset | Energy | Role |
|---|---|---|
| Stellar Kerr battery (3–10 M☉) | (3–5)×10⁴⁷ J extractable | K2.5+ portable storage — 4,000 Sun-lifetimes in a 6-km vault |
| Accretion plant (tended) | 6–42 % conversion, continuous | Regional industry at multi-system scale |
| Hawking furnace (1.9×10⁹ kg) | 10¹⁴ W × 18 kyr, any-matter feed | The colony plant — **pending a specimen** |
| PBH gamma census | — | `[MEASURE]`: the furnace supply question, answered only by watching |

**Verdict.** The black-hole chapter is where the series stops being a story about worlds and becomes a story about wells. The galaxy holds ~10⁸ unclaimed Kerr batteries — four thousand Sun-lifetimes each, portable, waiting for a civilization that can tend a magnetosphere. The perfect furnace exists as an equation and has no known specimen. And the ladder holds its shape one final time: **K1–K2 belongs to the Sun; TARTAROS is what the climb graduates into** — the vault of the Type III ladder's storage layer, the starship furnace that eats eleven grams of galaxy per second, and the deepest pit in the myth, now carrying a parts list.

---

## APPENDIX A — Constants & quick reference

- Kerr extractable: ~29 % (ideal a=1), ~26 % (astrophysical a*=0.998); accretion: 5.7 % (Schwarzschild) → 42 % (max Kerr)
- Hawking: P = 3.6×10³²/M² W; τ = 8.4×10⁻¹⁷·M³ s → M = 1.9×10⁹ kg: **10¹⁴ W, 18,000 yr, feed 1.1 g/s**; r_s ≈ 3×10⁻¹⁸ m
- Kerr battery (3–10 M☉): (3–5)×10⁴⁷ J = 4,000 Sun-lifetimes; r ≈ 6 km; galaxy census ~10⁸ `[EST]`
- B–Żnajek: AGN jets 10³⁸–10⁴⁵ W `[MEASURED]`; X-ray binaries ~10³¹ W (Cygnus X-1 ~10⁴ L☉ in X-rays)
- Ramjet: 10¹⁵ W → 11 g/s ISM → scoop r ≈ 250 km at 0.01c `[EST]`
- Kugelblitz: QED pair-production dissipation argues against practical formation `[2024 result — VERIFY: young]`

## APPENDIX B — Reference anchors

- Penrose (1969): rotational extraction; Blandford & Żnajek (1977): magnetic extraction — the AGN jet mechanism
- Cygnus X-1 and the X-ray binary population: nature's running accretion plants `[MEASURED]`
- Page & Thorne (1974): thin-disk accretion efficiency (5.7 % → 42 %)
- Hawking (1974–75): the evaporation formula — the furnace's founding equation
- Álvarez-Domínguez et al. (2024): QED constraints on light-induced horizon formation (kugelblitz skepticism)
- PBH census campaigns: OGLE/EROS microlensing; Fermi-LAT evaporating-PBH bounds; LVK population papers (the warehouse audit)
- Series cross-refs: INVICTUS (the Radiator Theorem governs every plant's waste heat — Kerr and Hawking included), ERAS finding C (fusion is upside, not dependency — TARTAROS extends the same logic one octave), type3-ladder §3.2 (the portfolio: TARTAROS assets are the vault layer), FRAGILITY (FM-09: the vault's custody doctrine)

*End of volume. The ladder's final storage layer: batteries you tow, plants you tend, furnaces you hunt for, and a ramjet that drinks the galaxy eleven grams at a time. The pit has a parts list. The climb decides whether we ever build it — and by the arithmetic of every volume before this one, the climb comes first.*

