# ADR — One reference for civilization's power: EI Statistical Review 2025

**Status:** accepted 2026-10-06 (owner's decision); front page done, instrument migration planned below
**Decider:** the author

## Context

Two sources for the same number lived in this repository:

| where | source | primary energy | power | K | gap to Type I |
|---|---|---|---|---|---|
| the instrument (`core/src/lib.rs`, `src/lib/`, the site, the game) | IEA, total energy supply 2023 | 620 EJ/yr | 1.965×10¹³ W | 0.729 | ×509 |
| the program (`program/AUDIT.md`, `program/docs/PHASE0.md`) | Energy Institute, *Statistical Review of World Energy* 2025 (year 2024) | 592.2 EJ/yr | 1.877×10¹³ W | 0.727 | ×533 |

They differ by ~5 %, which is ordinary between primary-energy accountings, but a project whose rule is
"every number can be checked" cannot carry two answers to its first question.

## Decision

**EI Statistical Review 2025 is the reference**, for the year 2024: 592.2 EJ/yr, 1.877×10¹³ W,
K = 0.727, Type I at ×533 (9.06 doublings). Growth stays 1.8 %/yr. The README states it now.

Note on the ETA: `program/AUDIT.md` quotes 2374 using t = ln(500)/ln(1.018); with ×533 from 2024 the
same formula gives 2376. The front page says "the 2370s", true under both.

## The migration (not yet done)

Ordered so that every step can be checked before the next:

1. **Core** (`core/src/lib.rs`): `TES_2023_EJ = 620.0` → the EI 2024 value, renamed to its year;
   `P_2023` → `P_2024`; the module comment cites EI 2025. `cargo test` in `core/`.
2. **Golden port**: regenerate `core/tests/golden_ts.json` (`scripts/core-golden.ts`); the Rust and
   TypeScript sides must still agree bit for bit.
3. **wasm**: rebuild the wasm32 core and re-embed it (`scripts/embed-core.ts`).
4. **Instrument tests**: `kardashev.test.ts` (×509 → ×533 and K), and every test that pins a value
   derived from P; each changed number with the EI citation in its comment (CONTRIBUTING rule).
   `npm run synthesis` to regenerate `docs/SYNTHESIS.md`; `docs/NUMBERS.md` and the site copy
   (`src/routes/`) where ×509 / 19.6 TW / 620 EJ are written.
5. **Game**: `tools/sync_cores.py` in the game repository; its automation test compares against the
   signed Unibit chain, so the chain entries for K must be re-signed with the new core before that test
   can pass. That step lives outside this repository.

Done when: `npm test`, `cargo test` (core, program/game) and the game's `Unibit.Core` tests are green on
the EI 2025 value, and no file in this repository still says 620 EJ, 19.6 TW or ×509 except this ADR.
