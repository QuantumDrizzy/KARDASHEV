# KARDASHEV

An instrument that measures civilization in watts.

**K ≈ 0.73** (Sagan 1973, IEA TES 2023 ≈ 620 EJ ≈ 19.6 TW).  
Type I = 10¹⁶ W = 10,000 TW. Gap ×509. A model, not a grid meter.

```
K = (log10(P_watts) − 6) / 10
```

Energy · AI · Biology · Health · Space · Quantum. First-order physics. Labeled assumptions. No partners. No cloud.

Author: [QuantumDrizzy](https://github.com/QuantumDrizzy) · [X @Anthonyrdrgz](https://x.com/Anthonyrdrgz)

---

## What KARDASHEV is

Humanity sits at **K ≈ 0.73**. Type I is not 27 % away. It is **×509 in watts**, nine doublings, and a
progress bar from 0.73 to 1.00 hides all of them. KARDASHEV is the instrument that refuses to hide them.
It answers one question with arithmetic instead of slogans: **what has to be built, in watts, for a
civilization to climb, and where does each step break?**

It does three things:

- **Measures.** Where we are, from public energy data (IEA TES), not from a feeling.
- **Models.** Every rung of the climb as first-order physics: capturing the watts (solar on the crust and
  in orbit), moving them (a federated, self-healing grid), spending them (the energy cost of
  intelligence), and the heat, mass, orbits and materials that bound all three. Each module is a
  pure-TypeScript model with locked tests, and every number carries its source or is labeled an
  assumption.
- **Shows.** A local web instrument -- Energy, AI, Biology, Health, Space, Quantum -- where every chart
  is the model running, not a picture of it.

## Its role

KARDASHEV is the **open, community** part of the project: the physics and the data are public, so
anyone can check a number, challenge an assumption, or add the module that is missing. A model of
civilization-scale engineering is only as good as the people trying to break it.

It is also the **source of truth for the KARDASHEV game** (a separate project): the game runs on these
numbers, so when a fuse fails on Jupiter in 2078, or a reactor on Mars in 2054, the cost of that
failure is the one this repository computes -- and so is the decade you lose on the way to Type I.

## Run it

```bash
npm install
npm test          # 403 physics locks: kardashev, orbit, grid, thermal, launch, ISRU, ...
npm run dev       # the instrument, locally (port 8080)
```

Node 22.6+ (the tests run TypeScript with `--experimental-strip-types`). Offline: no auth, no external APIs, no CDN.

## Layout

```
src/lib/          physics + catalogs (source of truth), each module with its tests
src/routes/       pages (TanStack file routes)
src/components/   Stage, benches, charts, HUD
public/media/     local video/poster (no CDN)
docs/             thesis, numbers, sources, roadmap -- read before editing
core/             the ledger in Rust
program/          the plan: the ladder K0.73 → K3, its dossiers, and the ladder simulator (Rust)
```

## Doctrine

- Watts first. Parameters do not raise K.
- AGI trains on Earth. ASI is Type I. Inference may leave the crust.
- Vacuum only radiates. Design the radiator before the FLOP.
- Quantum: PQC and sensing. Not a shortcut to AGI.
- Offline. No auth. No external APIs.

## Tests that matter

`src/lib/kardashev.test.ts` — TES ~20 TW, Sagan rungs, gap ×509, λ=0.62 ~100 yr, AM0, Earth disk, kW/s.

If a number changes, the test must change with a source citation in the comment.

## Contributing

Corrections with a source, a module that is missing, an assumption shown wrong: that is what this
repository wants. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) first -- the rules are short and they are
the project's own.

## License

Licensed under either of [Apache License, Version 2.0](LICENSE-APACHE) or [MIT license](LICENSE-MIT),
at your option. Unless you explicitly state otherwise, any contribution intentionally submitted for
inclusion in KARDASHEV by you, as defined in the Apache-2.0 license, shall be dual licensed as above,
without any additional terms or conditions.

KARDASHEV, the instrument, its doctrine and its direction are maintained by its author.
