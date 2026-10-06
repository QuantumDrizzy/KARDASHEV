# The program

The instrument (the rest of this repository) measures where civilization is and models each rung.
This folder is the **plan**: the ladder from K0.73 to Type III, every transition with its gates,
instruments, fallbacks and stated confidence.

| | |
|---|---|
| [`LADDER.md`](LADDER.md) | the master assurance document, K0.73 → K3 |
| [`AUDIT.md`](AUDIT.md) | the state of every number the plan rests on: pinned, measured, derived, or hypothesis |
| [`docs/STANDARD.md`](docs/STANDARD.md) | the provenance contract every number obeys |
| [`docs/`](docs/) | the dossiers: PHASE0 (the measurable decade), ERAS, ACCELERATION, FRAGILITY, the physics gates (DD-GATE, TAU-GATE), COST, RITUAL |
| [`type3-galactic-ladder.md`](type3-galactic-ladder.md), [`data-schema.md`](data-schema.md) | the far end of the ladder, and the data format |
| [`game/`](game/) | the **ladder simulator** (Rust): the plan's data in `game/data/`, its ledger in `kardashev-core` |

```bash
cd program/game && cargo test     # the ladder's arithmetic and the ledger's integrity
```

Some anchors cite the author's solar-system whitepaper series by volume and section; those volumes
are not part of this repository. Where a number rests on one, the dossier says so.
