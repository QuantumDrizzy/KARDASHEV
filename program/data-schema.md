# KARDASHEV — Data Schema
## The whitepapers as the content database

**Principle.** The ten whitepapers are the source of truth. The game reads TOML data tables extracted from them; every number keeps its volume cross-reference and its flag. `[HYPOTHESIS]`/`[EST]` numbers carry a `variance` field — the honesty layer's hidden variance comes from here, not from the code.

**Rule of extraction.** SI units everywhere, one concept per table, `source` field mandatory (`"TANTALUS §3.2"`), flags preserved verbatim.

---

## Tables

### `ladder.toml` — the K-scale
```toml
[[rung]]
id = "k2"
power_watts = 1.0e26
name = "Stellar Era (Type II)"
gate = "The Shell Referendum"        # INVICTUS §4.3 / FM-13
```

### `programs.toml` — every series program as a build item
```toml
[[program]]
id = "jupiter-hive-fleet"
name = "TANTALUS fleet — 170 hives"
era = 1
class = "Extraction"
power_watts = 1.0e17                 # §8.2 ledger
build_years = 30.0
requires = ["jupiter-hive-1", "ceres-dopant-tail"]
elements_drain = { deuterium = 2.7e9 }   # kg/yr, FM-07; negative = supply
source = "TANTALUS §8.1 P3"
```
Semantics: `elements_drain` positive = consumption, negative = production. Prerequisites are program/mission ids. `class` is the problem class (era mechanic).

### `elements.toml` — the closure ledger
```toml
[[element]]
id = "deuterium"
stock_kg = 1.2e13                    # Titan atmospheric CH₄ inventory — KRAKEN §3.2
```

### `events.toml` — the FM catalogs as a deck
```toml
[[event]]
id = "element-famine"
era = 1
name = "Element Famine"
severity = "critical"                # nuisance | serious | critical
physics = "Dopant/volatile stock exhausted mid-doubling (INVICTUS FM-07)"
mitigation = "2-yr-cover rule; import contracts; dopant-light compute hedge"
```

### `worlds.toml` / `missions.toml` (Era II+)
Worlds carry their audit numbers (g, v_esc, dose, T, column) for the orbital map; missions carry real-date timers (`arrival_year`) for the P0 unlock loop.

---

## Rust mirror (the actual structs in `kardashev-core`)

```rust
pub struct Rung    { id, power_watts: f64, name, gate }
pub struct Program { id, name, era: u32, class, power_watts: f64, build_years: f64,
                     available_from_year: Option<f64>, requires: Vec<String>,
                     elements_drain: BTreeMap<String, f64>, source }
pub struct Event   { id, era: u32, name, severity, physics, mitigation }
pub struct ElementStock { stock_kg: f64, annual_drain_kg: f64 }   // cover_years() derived
```

`GameState` composes the four loaders + the tick (power accrual, queue completion, element drain/famine, event roll) — see `crates/kardashev-core/src/lib.rs`.

**Next extraction pass (Era II+):** per-volume numbers become variance ranges, not point values — the tables above already carry the fields for it.
