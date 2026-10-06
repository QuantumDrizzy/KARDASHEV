# KARDASHEV

**Taking civilization to Type I — in reality, not in a slide — and from there to Type II and Type III.**

Author: [QuantumDrizzy](https://github.com/QuantumDrizzy) · [X @Anthonyrdrgz](https://x.com/Anthonyrdrgz)

---

## What KARDASHEV is

The Kardashev scale ranks a civilization by the power it commands: **Type I** uses the energy of its
whole planet (10¹⁶ W), **Type II** the energy of its star (10²⁶ W), **Type III** the energy of its
galaxy (10³⁶ W).

KARDASHEV is the project to get there. Not a prediction and not a wish: a program. What has to be built,
in what order, at what cost, where each step can break -- and how we would know, every year, whether we
are on the way. Every number in it carries its source or is labeled an assumption, and anyone can check
it.

## Where we are

**K ≈ 0.727.** Humanity runs on **592 EJ a year, 1.88×10¹³ W** (Energy Institute, *Statistical Review
of World Energy* 2025, for 2024). Type I is not 27 % away: it is **×533 in watts**, nine doublings, and a
progress bar from 0.73 to 1.00 hides all of them.

```
K = (log10(P_watts) − 6) / 10
```

At today's measured growth (1.8 %/year), Type I arrives in the **2370s**. If the doors of this decade
open, around **2153–2236**. Which one it is gets decided by what is built now, and the program
re-publishes that date every year from data, not from faith.

## The road, rung by rung

| | what it takes | the gate | where it stands |
|---|---|---|---|
| **K0.73 → K1** | 10¹⁶ W dispatchable: launch cost down two orders of magnitude, energy and industry moving to orbit | the 2040 scoreboard | physics verified |
| **K1 → K1.5** | the doubling law: off-Earth factories that copy themselves every ≤ 3 years — Mercury, the belt, Jupiter | five consecutive doublings, proven | **one law never closed anywhere** |
| **K1.5 → K2** | the shell: a Dyson swarm managing the Sun's output at 0.3–0.5 AU | the Shell Referendum (governance, not physics) | physics verified |
| **K2 → K2.5** | the seeding: the first star systems — α Centauri, then TRAPPIST-1 | braking, feedstock, a library that survives the trip | designed, unflown |
| **K2.5 → K3** | the wavefront: ~10⁵ seeded systems, and black holes as the galaxy's batteries | none in physics; all temporal and governance: drift, fragmentation, the Silence | arithmetic verified, no precedent |

**The one-line read:** the physics holds at every rung. What stands between here and Type III is one
unproven law (the doubling), one decision (the shell), one machine never flown (the seed) -- and one kind
of shock, great-power war, that threatens all of them at once.
The full assurance table, rung by rung, is [`program/LADDER.md`](program/LADDER.md).

## This decade: 2026–2040

Everything after depends on three doors opening now:

1. **Power** -- the terrestrial side: fission deployed now, fusion's physics milestones, solar and
   storage carrying most of the next ×1.5–2.
2. **Launch and orbital industry** -- the door to everything orbital: launch below $500/kg, the first
   space-solar demonstrations, a lunar resource pilot.
3. **Measurement** -- the data layer others are already paying for: BepiColombo at Mercury, Psyche
   (2029), Europa Clipper and JUICE (2030–31), Dragonfly at Titan (2034). Each one unlocks a gate.

And four milestones that say, by 2040, whether the climb is accelerating or only drifting:

| | by 2040 | 2026 |
|---|---|---|
| S1 | primary energy growth above 2.5 %/year, sustained 2026–2040 | 1.8 % |
| S2 | launch below $500/kg at commercial cadence (100+ flights/year class) | in test |
| S3 | a fusion pilot delivering net electricity to the grid | on the way |
| S4 | space solar at MW scale, billing | first demonstrator flown in 2023 |

Two of four by 2040, or the acceleration thesis is wrong and the road is the slow one. The scoreboard is
in [`program/docs/ACCELERATION.md`](program/docs/ACCELERATION.md); the decade, door by door, in
[`program/docs/PHASE0.md`](program/docs/PHASE0.md).

## The worlds

The climb runs through the whole system and beyond, and each world got its own study, with its founding
assumptions stated and corrected: Venus brought under control, Jupiter as the fuel station, Titan as
the second home, a Dyson swarm anchored on Mercury, the ocean worlds, Mars as insurance, the ice giants,
the belt, Pluto, the home system -- then α Centauri, TRAPPIST-1, the Fermi question and black-hole
engineering, and Earth itself as the control sample. Fifteen studies, indexed in
[`series/`](series/).

## The tools

| | | |
|---|---|---|
| **the instrument** | `src/` | the web: where we are, and the first-order physics of every rung -- energy, AI, biology, health, space, quantum. 403 locked tests |
| **the program** | [`program/`](program/) | the ladder, its dossiers, the audit of every number it rests on, and a simulator |
| **the series** | [`series/`](series/) | the studies the program is budgeted from |
| **the game** | separate | the same numbers, played: your decisions, their real cost |

When a fuse fails on Jupiter in 2078, or a reactor on Mars in 2054, the game charges what this
repository computes -- and so is the decade you lose on the way to Type I.

## Join

KARDASHEV is open, and it gets better every time someone proves a number wrong. A correction with its
source, a study that is missing, a model that is too crude, an assumption that does not hold: that is
how you contribute. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) -- the rules are short and they are the
project's own.

---

## For builders

### Run it

```bash
npm install
npm test          # 403 physics locks: kardashev, orbit, grid, thermal, launch, ISRU, ...
npm run dev       # the instrument, locally (port 8080)
```

Node 24+ (the lockfile is written by npm 11). The physics runs in CI on Linux; the site builds on Windows.
Offline: no auth, no external APIs, no CDN.

`[KNOWN_LIMIT]` `npm run test:sandbox` runs the tests of the app-builder template's own tooling
(`scripts/`: PWA metadata, auth wiring, migration plans), separate from the physics. 15 of its 149 fail,
and failed before this repository changed them; they belong to the template, not to KARDASHEV.

### Layout

```
src/lib/          physics + catalogs (source of truth), each module with its tests
src/routes/       pages (TanStack file routes)
src/components/   Stage, benches, charts, HUD
public/media/     local video/poster (no CDN)
docs/             thesis, numbers, sources, roadmap -- read before editing
core/             the ledger in Rust
program/          the plan: the ladder K0.73 → K3, its dossiers, and the ladder simulator (Rust)
series/           the studies: the Solar System Series, the Interstellar Series, GAEA
```

### Doctrine

- Watts first. Parameters do not raise K.
- AGI trains on Earth. ASI is Type I. Inference may leave the crust.
- Vacuum only radiates. Design the radiator before the FLOP.
- Quantum: PQC and sensing. Not a shortcut to AGI.
- Offline. No auth. No external APIs.

### Tests that matter

`src/lib/kardashev.test.ts` — TES ~20 TW, Sagan rungs, gap ×509, λ=0.62 ~100 yr, AM0, Earth disk, kW/s.

`[KNOWN_LIMIT]` The instrument still runs on IEA 2023 (620 EJ, ×509); the project's reference is now
EI 2025 (592.2 EJ, ×533). The migration crosses the core, its wasm build, the golden tests and the game,
and is planned in [`docs/ADR-EI-2025.md`](docs/ADR-EI-2025.md).

If a number changes, the test must change with a source citation in the comment.

## License

Licensed under either of [Apache License, Version 2.0](LICENSE-APACHE) or [MIT license](LICENSE-MIT),
at your option. Contributors sign the [CLA](CLA.md) once, on their first pull request.

KARDASHEV, its doctrine and its direction are maintained by its author.
