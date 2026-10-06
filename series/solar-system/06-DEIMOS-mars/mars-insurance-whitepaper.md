# PROJECT DEIMOS — Mars, the Honest Middle Child
## The Insurance Civilization, the Mole Doctrine & the 10,000-Year Terraform

| | |
|---|---|
| **Version** | 1.0 — Sunday Solar System Series, vol. 6 (ORPHEUS → TANTALUS → KRAKEN → INVICTUS → OKEANOS → **DEIMOS**) |
| **Date** | 2026-10-04 |
| **Scope** | Mars settlement economics, the terraforming arithmetic everyone gets wrong, the moon-port economy, and the civilization-risk argument done with honest numbers |
| **Classification** | Local research artifact. Not for distribution. |
| **Flags** | `[MSL/Phoenix/RAD]` rover & lander data · `[EST]` engineering estimate · `[HYPOTHESIS]` speculative · `[KNOWN_LIMIT]` documented limitation · `[VERIFY]` compute before freeze · `[MEASURE]` no data exists |

> **Reading contract.** Same as the series. This volume is the *counterweight*: Mars is the most fictionalized world in the genre, so the arithmetic here is deliberately brutal. The verdict ahead of time: **Mars is simultaneously the overrated colony and the underrated node** — its surface is a worse habitat than Titan's and a worse mine than Phobos, but it is the only world with a 24.6-hour clock, solid ground, and a psychological *frontier* — and its moons are the best logistics real estate in the system. Sixth problem class: **insurance**.

---

## 0. EXECUTIVE SUMMARY & THE CORRECTION TABLE

**One-sentence verdict.** Mars is not the 100-year terraform — it is the **10,000-year one** (raising 6 mbar to breathable needs ~10²⁰ kg of imported volatiles that Mars does not possess), the settlement is a **civilization of moles** (radiation + 6 mbar + perchlorate dust force burial, suits, and fission baseload), the real economy lives on **Phobos and Deimos** (escape velocities of 11 and 5.6 m/s — the best ton-to-orbit real estate in the system), and the honest reason to go is neither energy nor minerals but **insurance: a second biosphere against civilization-level risk — an argument whose policy only pays out after ~100 years of population ramp and industrial closure.**

**The founding assumptions, corrected:**

| # | Assumption | Verdict | Correction |
|---|---|---|---|
| E1 | "Terraform Mars in a century" (the genre default) | **Off by two orders of magnitude in time.** Mars holds ~2.4×10¹⁶ kg of atmosphere (6.1 mbar). Total available crustal CO₂ ≈ 20 mbar max — sublimating *everything* polar buys a doubling `[Jakosky & Edwards 2018: "not enough CO₂ remaining"]`. Breathable needs ~10²⁰ kg of gas that **must be imported**. | Partial-pressure ladder priced honestly in §5 (12 → 20 → 100 → 300 mbar, each rung's real value). Full terraform = multi-millennium even at K2 launch rates. Mars is the *last* terraform, not the first. |
| E2 | "Solar + batteries will run it" | **The dust clause.** Global dust storms (2018-class: τ > 5 for weeks, opacity across the whole disc) collapse solar for season-scales; TOA flux is already 586 W/m². | **Fission is the baseload** (Kilopower-lineage); solar is the fair-weather supplement. MOXIE-proven SOXE electrolysis (5–15 kWh/kg O₂ `[VERIFY: instrument-scale → plant-scale]`) is the O₂ economy's engine. |
| E3 | "We'll live in domes on the surface" | **The mole doctrine.** Column mass is 164 kg/m² (1.6 % of Earth): surface dose 0.67 mSv/day (GCR) + lethal SEP events; thermal swing 130–300 K; 6 mbar of CO₂. | Habitats are **2–3 m burrows minimum**; the surface is a work-hours environment in suits; SEP storm shelters are the one non-negotiable room (§3). The psychology of underground life is a design input, not an afterthought. |
| E4 | "The moons are trivia" | **They are the economy.** Deimos (near-synchronous, v_esc = 5.6 m/s) is the natural *port*; Phobos (D-type carbonaceous — volatiles, v_esc = 11 m/s, orbiting *below* synchrony) is the *dry dock* — a captured asteroid already parked at Mars. | §4: the honest Mars economy is logistics through the moons; the Phobos tether is assessed honestly (borderline materials); and Phobos deorbits into a ring in 30–50 Myr — use it while it exists. |
| E5 | "A Mars colony is insurance, starting now" | **The policy has a ~100-year waiting period.** Until it closes its own industry (chip fabs, medicine, the periodic-table lesson of INVICTUS), the colony is *net risk-increasing*: dependent, isolated by 25.6-month launch windows, one supply chain from failure. | §6: the redundancy argument, quantified — closure needs ~10⁵–10⁶ people and a century. Insurance in 2150, not 2050. |
| E6 | "Mars has water, easy" | **Permafrost mining, not wells.** The inventory (polar layered deposits ~10⁶ km³-class + mid-lat ice sheets `[SWIM heritage]`) sits as ice in 130–200 K regolith: sublimation-mining economics, dusty and energy-hungry. | §2.3: the water ledger with real extraction costs; the polar caps are the aquifer. |
| E7 | "Perchlorate soil: fatal flaw (or ignored entirely)" | **Dual-use.** 0.5–1 wt% perchlorate is toxic to humans *and* is a pre-placed oxidizer reserve + chlorine chemical feedstock — the soil is partially pre-oxidized propellant. Nitrates exist too (0.03–0.11 wt% in Gale sediments `[MSL]`) — nitrogen for agriculture, locally. | Remediation doctrine (wash vs. biological reduction) in §3.5; the resource column in §2. |

**Headline numbers:**

- Surface: 6.1 mbar CO₂, T 130–300 K, g = 3.72 m/s², column 164 kg/m², dose 0.67 mSv/day `[RAD]`, day **24.62 h** — the single best human-factors clock off-Earth.
- Terraform gap: 6.1 mbar → 1 bar ≈ **10²⁰ kg of imported volatiles**; the N₂ warehouse of the inner system is **Venus** (~2.7 bar of N₂ above the CO₂ — ~1.7×10¹⁹ kg, ORPHEUS's leftover); launch-rate-bound at Mercury-swarm rates: **centuries**, energy-trivial at K2.
- Moon ports: Deimos v_esc = 5.6 m/s; Phobos v_esc = 11 m/s; Phobos orbital period 7.65 h (below synchrony — it *rises in the west*); Phobos doom: ring by ~30–50 Myr.
- Insurance closure: ~10⁵–10⁶ people, full industrial closure, ~100 yr `[HYPOTHESIS: the population figure is the honest spread from industrial-closure studies]`.
- P0 status: Mars is the *only* series world with humans already present — robotic presence continuous since 2004; MOXIE made O₂ on-site 2021–2023.

---

## 1. THE WORLD

### 1.1 Data table (the honest Mars)

| Property | Value | Notes |
|---|---|---|
| R / M / g | 3,389.5 km / 6.417×10²³ kg / 3.72 m/s² | μ = 4.283×10¹³ m³/s² |
| Orbit | 1.524 AU, 1.88 yr | Solar TOA 586 W/m² |
| Day | **24.62 h** | Circadian-compatible — one real gift |
| Pressure | 6.1 mbar (95 % CO₂, 2.6 % N₂, 1.9 % Ar) | At water's triple point — liquid water is marginal *everywhere* |
| T | 130–300 K, mean 210 K | Swing is the killer, not the mean |
| Column mass | 164 kg/m² | 1.6 % of Earth — radiation section (§3) |
| Atmosphere mass | 2.4×10¹⁶ kg | The terraform deficit: 10²⁰ kg (§5) |
| Water | polar ~10⁶ km³-class + mid-lat sheets `[MEASURE: SWIM maps]` | Permafrost mining, §2.3 |
| Soil | basaltic regolith + 0.5–1 % perchlorate + nitrates (local) | §3.5 |
| v_esc | 5.03 km/s | Cheap-ish; the moons are cheaper |
| Sun-sync altitude | 20,430 km | Phobos (9,376 km) below it, Deimos (23,463 km) just above |

### 1.2 The clock and the ground (why the middle child matters anyway)

Strip away the mythology and two facts remain, and they are psychological, not economic: **Mars has a human clock** (24.62 h — the circadian system barely notices; compare Titan's 16-day night or Mercury's 176-day day) **and a horizon** — solid ground, weather, seasons, a sky that changes. The series' honest observation: Titan is the better *habitat* and Mars the better *frontier*. These are different products, and the civilization will buy both for different reasons. The insurance argument (§6) is Mars's economic case; the frontier is its emotional one — and the document prices both, because both drive real allocation.

## 2. THE POWER & ISRU LEDGER

### 2.1 Fission baseload (E2)

- Global dust storms are the design driver: a 2018-class event (τ > 5 planet-wide for weeks) removes solar as a *reliable* source. Kilopower-lineage fission (10 kWe–10 MWe units, U imported from Earth or Mercury's trace seeds at scale `[INVICTUS §3.3]`) is the settlement baseload; solar is sized for *dust-climate average*, not peak.
- Waste heat is a *feature* on Mars (unlike the swarm): 10 MW-th of reject heat per settlement is district heating for the burrows — the colony's thermal economy runs *uphill* (210 K ambient vs. 293 K habitat), heat pumps and reject heat both find buyers.

### 2.2 The O₂ economy (MOXIE's arithmetic, scaled)

- SOXE from CO₂: 2 CO₂ → 2 CO + O₂; theoretical 4.9 kWh/kg O₂; MOXIE instrument-scale demonstrated ~5–15 kWh/kg `[VERIFY at plant scale]`. Per capita: 0.84 kg/day breathing + industry → **~1.5–2 kg/day/person** including losses → **8–30 kWh/day/person for O₂ alone.** Cheap in fission terms; the lesson of the series: O₂ is never the problem once you have power (KRAKEN §2.2 and here agree from opposite directions).
- CO by-product: carbon monoxide is fuel for O₂/CO combustion (0.5× the specific energy of CH₄/O₂) and a reduction agent for metallurgy — the *entire* propellant economy of Mars is atmosphere + power: **CH₄ imported or made from imported H₂ + local CO₂ (Sabatier), O₂ from SOXE.** The Starship-era ISRU logic survives the series' audit; its energy source (fission, not solar) does not.

### 2.3 The water ledger (E6)

| Source | Inventory | Extraction | Cost |
|---|---|---|---|
| Polar layered deposits | ~10⁶ km³-class ice `[MEASURE]` | Cap mining (the *cleanest* ice in the system) | logistics to equator |
| Mid-lat subsurface sheets | 10⁵–10⁶ km³-class `[SWIM]` | Sublimation mining in 130–200 K regolith (cover-dig-sublimate-capture) | 10⁷ J/kg-class thermal `[EST]` — energy-cheap, dust-hungry |
| Atmospheric | 2.4×10¹⁶ kg total (trivial H₂O fraction) | condensers | emergency only |

Per capita water budget (closed-loop, 95 % recycle): ~20 kg/day throughput → the settlement's water is a *mining* line item, not a scarcity — same verdict as KRAKEN, colder and dustier.

### 2.4 The resource column (E7's upside)

| Resource | Form | Use |
|---|---|---|
| Perchlorate (0.5–1 wt%) | Ca/Mg(ClO₄)₂ in regolith | **O₂ reserve via thermal reduction** (ClO₄⁻ → Cl⁻ + O₂, ~0.3 kg O₂ per kg perchlorate `[EST]`) — the soil is pre-oxidized propellant; chlorine chemistry feedstock |
| Nitrates (0.03–0.11 wt%, local) | nitrates in sediments | Agriculture N — local, washable, no Haber at seed-stage |
| Basalt | everywhere | Cast basalt: construction, fiber, armor — the "glass-from-rock" industry |
| Iron | ubiquitous oxides | The one honest bulk-metal surplus of the inner system besides Mercury |

---

## 3. THE MOLE CIVILIZATION (E3)

### 3.1 Radiation arithmetic

- GCR at surface: 0.67 mSv/day `[RAD]` ≈ 245 mSv/yr — above terrestrial career limits for decade-scale residence. SEP events: episodic, 1972-analog-class events are **lethal on the surface** without shelter.
- Regolith shielding: 2–3 m → dose ~0.05–0.1 mSv/day `[EST]` — Earth-normal-class living underground. **The habitat is a burrow; the burrow is the shield; regolith is free.**
- SEP storm shelters: one per settlement, water/regolith vault, 10 m H₂O-equivalent, sized for the whole population — the non-negotiable room.

### 3.2 Habitat architecture

- **Pressure doctrine:** 6 mbar outside → habitats at 0.5–0.7 bar O₂/N₂ (Earth-altitude-class). Differential is *outward* (vacuum semantics, not Titan semantics): breach = explosive decompression risk (§5 FM), the inverse of KRAKEN's crush doctrine. Double membranes, rubble berms, airlock discipline.
- **Thermal:** diurnal swing 170 K; burrows are thermally passive by burial; surface structures ride day-night with insulation + heat storage (regolith again).
- **Layout:** the "mole city" — vaults under 2–3 m of berm, greenhouses on the surface under pressure film (light is free above — the one thing Mars has that Titan doesn't), industry in the open (vacuum metallurgy, no pollution doctrine needed), life underground.

### 3.3 Agriculture (the light dividend)

- Solar is free at noon (300 W/m²-class surface) — greenhouses under pressure film use *real sunlight*, the one agricultural advantage over KRAKEN's all-electric farms. Dust coatings cost 5–20 % yield; storms cost seasons (hybrid: LED supplement, fission-backed).
- N from nitrates (local) + Haber loop from atmosphere N₂ (2.6 % of 6 mbar is thin — the Haber takes a big bite of settlement power; nitrates defer it `[MEASURE: nitrate deposit extent]`).
- Per-capita agriculture area: ~50–100 m² of greenhouse per person (Earth-intensive-farming analog) — surface-footprint-real, energy-moderate. **Agriculture is the reason the colony has a surface footprint at all.**

### 3.4 The suit doctrine (vs. the series)

| World | Outside doctrine | Breath | Dose |
|---|---|---|---|
| Titan | **mask + coat** (1.45 bar N₂) | mask | Earth-class |
| Mars | **full suit** (6 mbar) | suit | buried habitats |
| Mercury | suit (vacuum, thermal) | suit | belt-driven |
| Moon (ref.) | suit | suit | shielded habitats |

Mars is *not* the walk-outside world — Titan claimed that (vol. 3). Mars's suit is a thermal garment with a compressor, the lightest full-pressure suit in the system, but a suit it remains until the 100-mbar rung (§5.2).

### 3.5 Perchlorate remediation doctrine

- Wash: water-hungry, recovers Cl chemistry — for agriculture soil.
- Biological reduction: perchlorate-reducing microbes (terrestrial heritage) → O₂ + Cl⁻ at ambient — the long-term, self-replicating answer `[VERIFY: rates at 5–15 °C, low pressure]`.
- Doctrine: agriculture soil is *washed*; industrial ground is left raw; the oxidizer reserve is banked (§2.4) — never remediate a resource.

---

## 4. THE MOONS ARE THE ECONOMY (E4)

### 4.1 Phobos — the dry dock

- D-type carbonaceous (volatiles: H₂O, organics — a *captured asteroid* already delivered), M = 1.06×10¹⁶ kg, surface escape **11 m/s**: you *shovel* material into Mars orbit. Zero-Δv material source at the top of Mars's gravity well.
- Its orbit is below synchrony (7.65 h period): it crosses the sky west-to-east twice a day — the dry dock overhead schedule is *fast*.
- **The doom clause:** tidal decay brings Phobos inside the Roche limit in ~30–50 Myr → ring. The program treats Phobos as *borrowed inventory*: strip it on schedule, leave the ring as a monument (or resource). No conservation argument survives 30 Myr.
- **Phobos tether, honestly assessed:** a 5,800–6,000 km downward tether reaches Mars's upper atmosphere, tip-velocity matched to unload payloads at near-escape — needs ~10+ GPa tether materials at high taper: **borderline with current fibers** (Zylon-class 5.8 GPa is insufficient; CNT/hBN-class sufficient) `[VERIFY]`. The robust alternative needs no miracle materials: **electromagnetic catapults from Phobos surface** (v_esc = 11 m/s — the catapult is a truck ramp).

### 4.2 Deimos — the port

- Near-synchronous (30.3 h), R = 6.2 km, v_esc = **5.6 m/s** — the natural anchorage for interplanetary ships: arrive, dock, transfer, depart without touching Mars's well.
- The inner-system ↔ outer-system *waystation*: Mercury/Venus traffic (ORPHEUS/INVICTUS) and Jupiter/Saturn traffic (TANTALUS/KRAKEN/OKEANOS) both pass through Mars-space; Deimos is the toll booth with the fuel dump (CH₄/O₂ and H₂O from Phobos volatiles).
- Logistics ladder: Earth → Deimos → Phobos → Mars surface, with escape energies 0 → 1.6 → 8.5 → 12.6 MJ/kg respectively — each rung buys permanence at 2–8× the energy.

### 4.3 The honest Mars economy

The settlement sells: **position** (Deimos transit services), **volatiles** (Phobos/H₂O to passing ships — cheaper than Titan's for the inner system), **cast basalt and iron** (bulk, cheap), and **closure research** (the colony's industrial-closure program *is* INVICTUS's replicator ledger run with humans in the loop). Mars does *not* sell: energy (Mercury wins), science exclusivity (OKEANOS), or habitation comfort (Titan). Its GDP is logistics + insurance + frontier.

---

## 5. THE TERRAFORMING LEDGER (E1 — the arithmetic of the genre's favorite dream)

### 5.1 The deficit

Breathable-ish target (≥ 0.3 bar total, ≥ 0.15 bar O₂): Mars holds 2.4×10¹⁶ kg; target ~1.2×10¹⁸ kg total, **~4×10¹⁷ kg of N₂ that Mars does not have** (O₂ can be made from rock + power; nitrogen cannot). Import required: ~4×10¹⁷ kg N₂.

- **The warehouse is Venus** (~1.7×10¹⁹ kg of N₂ above the CO₂ — ORPHEUS's leftover inventory): capture, liquefy, launch at 10.36 km/s escape (~5.4×10⁷ J/kg — trivial energy at swarm scale: 4×10¹⁷ kg × 5.4×10⁷ = 2.2×10²⁵ J ≈ 2 months of 10 %-K2 output `[INVICTUS §2.2]`).
- **The binding constraint is launch rate, not energy:** at 10¹⁵ kg/yr (Mercury mass-driver fleet, §3.2 of vol. 4): **~400 years of steady hauling.** At 10¹⁶ kg/yr (the swarm's grown capacity): ~40 years. Energy was never the problem; *throughput* was — the series' most repeated lesson, applied to its most mythical project.
- ` [KNOWN_LIMIT]` Jakosky & Edwards (2018): even the *pessimist's* import program beats the *optimist's* in-situ sublimation — the "terraform from local CO₂" era is closed by measurement.

### 5.2 The pressure ladder (what each rung buys)

| Rung | Total P | What it buys | How |
|---|---|---|---|
| 0 (today) | 6.1 mbar | suits, moles | — |
| 1 | ~12–20 mbar | polar CO₂ sublimated; water's triple point *passed everywhere*: transient liquid in warm noons | local only |
| 2 | ~100 mbar | liquid water stable to 45 °C; dust-settling improves; suits simplify (warm garments + O₂ mask — Mars crosses into "Titan-lite" doctrine) | import ~4×10¹⁶ kg N₂/CO₂ |
| 3 | ~300 mbar | **no pressure suit** (3,000 m-Earth analog with O₂ enrichment); outdoor agriculture in film greenhouses | import ~10¹⁷ kg |
| 4 | ~0.5–1 bar + O₂ | walk-outside world; the 10,000-year finish line | import ~4×10¹⁷ kg N₂ + SOXE O₂ at civilizational scale |

The genre sells rung 4 in a century; the arithmetic prices it in **10³–10⁴ years** `[HYPOTHESIS: bounded by throughput, politics, and soil-oxidation chemistry — not by physics]`. The honest program: live at rung 0–1 while the swarm grows; treat rungs 2–3 as the *century-scale* realistic frontier (post-INVICTUS); rung 4 as the civilization's longest project.

### 5.3 What terraforming Mars is *not*

Not a greenhouse problem (Mars's CO₂ IS the greenhouse; it needs *mass*), not a mirror problem (insolation at 1.52 AU is adequate once pressure exists), not a magnetosphere problem (column mass beats field loss timescales at the 100-mbar rung `[VERIFY: loss-rate arithmetic at raised pressure — stripping timescales are 10⁶+ yr, human-relevant windows are safe]`). It is a *shipping* problem. The genre had the right dream and the wrong physics.

## 6. THE INSURANCE ARGUMENT, QUANTIFIED (E5)

### 6.1 What a second biosphere actually covers

| Risk class | Does a Mars colony mitigate it? | Condition |
|---|---|---|
| Natural extinction-class (impact, supervolcano) | **Yes** — geometry + independence | colony supply-independent |
| Engineered pandemic | Partial (physical isolation) | independent production of medicine |
| Runaway climate/ocean loss | Yes | same |
| Nuclear war | Partial | closure of *critical* industries |
| **AI/risk local to information systems** | **No** — a colony linked by 20-min comms inherits Earth's information catastrophes unless *also* closed | closure |
| Civilizational*irreversibility* (knowledge loss) | Yes — any self-sustaining population | — |

The honest reading: **the colony mitigates exactly the risks that a closed industry mitigates — nothing more, nothing less.** Until closure, Mars is a fragile *dependency* (25.6-month resupply windows, one supply chain): a liability class, not an insurance class. This is the volume's central arithmetic and the one the genre never runs.

### 6.2 The closure bill

- Population for full industrial closure: **10⁵–10⁶ people** `[HYPOTHESIS: spread across industrial-ecology estimates; chip fabs + pharma + precision optics are the long poles]`.
- Closure categories: semiconductors (the periodic-table lesson of INVICTUS §3.3, transplanted), medicine, precision metrology, high-T materials, and the *knowledge* closure (training pipelines without Earth's institutions).
- Timeline at historical settlement growth rates: **~100 yr** from first permanent base to functional closure. **The policy matures in 2150-ish, not 2050.** Before maturity, the honest insurance strategy is *dual-sourcing critical industries across worlds* (Earth + Titan + Mars), not geographic redundancy alone.

### 6.3 The frontier clause (the unpriced asset)

The 24.6-h clock, the horizon, the seasons, the *meaning* of a second home under a second sun — none of it is in the ledger, all of it is in the allocation. The document's honest position: the insurance argument *justifies* Mars; the frontier argument *fills* it. Both are real. Only one is arithmetic — and the series' contract says which one gets audited.

---

## 7. SIMULATION — ARCHITECTURE & MOCK-CODE

```
PROJECT DEIMOS-SIM :: module map
────────────────────────────────────────────────────────────────────
deimos-core/             (Rust workspace)
  ├─ dust/               Dust-weather model: storm climatology (2018-class
  │                      events), opacity vs. solar-yield, electrostatic
  │                      deposition on arrays & seals
  ├─ isru/               Plant dispatch: SOXE/Sabatier/water-mining chains,
  │                      energy ledger, cache policies vs. 25.6-mo windows
  ├─ burrow/             Habitat thermal/pressure: breach transients (FM-06),
  │                      radiation transport (GCR+SEP through regolith),
  │                      storm-shelter doctrine generator
  ├─ moons/              Phobos/Deimos logistics: catapult trajectories,
  │                      tether stress model (borderline-materials sweep),
  │                      transit-service queueing (Deimos as toll booth)
  ├─ terraform/          Pressure-ladder integrator: import schedules,
  │                      sublimation feedback, loss-rate arithmetic vs.
  │                      column mass, N₂ custody from Venus haulage
  └─ closure/            The insurance model: population ramp × industry
                         closure × risk-coverage curves (§6) — INVICTUS's
                         replicator ledger with humans in the loop
deimos-kernels/          (CUDA C++ via FFI)
deimos-py/               (Python) campaign DSL, V&V harness
```

### 7.1 Closure model (the volume's load-bearing sim)

```rust
// deimos-core/src/closure/insurance.rs
pub struct Colony { pub pop: f64, pub closure: [f64; N_SECTORS], pub supply_dep: f64 }

pub fn risk_coverage(c: &Colony, risks: &RiskTaxonomy) -> Coverage {
    // for each risk class: coverage = f(closure[sectors it depends on],
    //   supply_dep, communication latency class)
    // KEY OUTPUT: the waiting-period curve — coverage(t) under growth
    //   scenarios; the honest answer to "when does Mars pay out?"
    //   [HYPOTHESIS: the curve is flat-negative for ~50 yr — the model
    //   exists to show it, not to hide it (§6.1)]
}
```

### 7.2 V&V table (abridged)

| V&V | Test | Pass |
|---|---|---|
| dust | Storm radiative yield vs. 2018 event (Opportunity-era telemetry) | ±20 % |
| isru | SOXE energy vs. MOXIE flight data, scaled | ×2 |
| burrow | Dose vs. RAD measurements; shelter arithmetic vs. transport codes | ±30 % |
| moons | Catapult trajectories vs. analytic; tether stress vs. taper theory | exact |
| terraform | Loss-rates at raised pressure vs. escape/stripping models | ±2 orders flagged `[MEASURE]` |
| closure | Growth curves vs. historical analog settlements (frontier towns, polar stations) | scenario-banded |

---

## 8. FAILURE MODE CATALOG

| ID | Failure | Physics | Detection | Mitigation |
|---|---|---|---|---|
| FM-01 | **Global dust entrapment** | Storm kills solar mid-decade; caches sized wrong | dust/ climatology | Fission baseload margin ×2; cache discipline vs. 25.6-mo windows |
| FM-02 | **SEP storm kills a surface shift** | 1972-analog event, crew above ground | Space-weather watch | Shelter reach-time ≤ 10 min doctrine; the non-negotiable room (§3.1) |
| FM-03 | **Breach (vacuum semantics)** | Outward differential — explosive decompression, the inverse of Titan | burrow/ transients | Double membranes; berms; compartmentalization; the series' harshest breach mode |
| FM-04 | **Water-mining dust death** | Sublimation mining clogs heat exchangers with 1-µm regolith | Flow telemetry | Self-cleaning cyclone stacks; mining-rate derating |
| FM-05 | **Perchlorate chronic toxicity** | Long-term low-dose exposure indoors | Biomonitoring | §3.5 doctrine; agriculture soil washed, airlocks scrubbed |
| FM-06 | **Window stranded** | Asset failure at end-of-cycle; 25.6 months to spare parts | isru/ cache ledger | Redundancy at the *window* timescale, not the failure timescale — the colony's true inventory rule |
| FM-07 | **Phobos orbit corruption** | Catapult recoil / mass-export momentum shifts Phobos's already-decaying orbit | Ephemeris watch | Symmetric launch doctrine; the doom clock is watched (§4.1) |
| FM-08 | **Tether snap (borderline materials)** | FM-04 of TANTALUS, Mars edition — 10⁵ km... no: 10³ km of 10 GPa fiber | Stress telemetry | The tether is *optional* — catapults are the plan; the tether is the upgrade |
| FM-09 | **Terraform accounting fraud** | Rung-4 promises used to sell rung-0 budgets | terraform/ ledger | §5.2's ladder is the audit trail; the genre's error, institutionalized as a check |
| FM-10 | **Closure illusion** | Colony claims closure; critical sectors (pharma, optics) secretly Earth-dependent | closure/ sector audits | INVICTUS-style element/sector ledger with humans in the loop |
| FM-11 | **Frontier debt** | Growth outpacing burrow/shelter margins — the psychological pressure of underground life | Human-factors telemetry | The frontier clause (§6.3) is a *design input*: surface footprints, greenhouses, windows (real ones, at the surface) |
| FM-12 | **Deimos congestion** | The toll booth becomes the bottleneck of inner↔outer traffic | moons/ queueing | Second port (another captured-body import — the series' logistics loops) |
| FM-13 | **N₂ custody failure** | Venus haulage misdelivered — atmosphere-grade gas lost in transit (3.8×10¹⁷ kg programs have long tails) | terraform/ custody | Batch custody chain (OKEANOS heritage, applied to gas) |
| FM-14 | **Insurance lapse** | Colony sold as insurance *before* closure; a crisis on Earth bankrupts the "policy" | closure/ coverage curves | §6.1's honest curve is the sales document — negative coverage years disclosed up front |
| FM-15 | **The 24.6-hour tyranny** | The clock that comforts also chains: shift schedules locked to a non-Earth day, coordination lag with Earth (3–22 min) grows with colony size | — | Accept it: Mars is the *last* world governed by conversation (outer system is async) — a feature priced in §6.3 |

---

## 9. PHASES, POWER, VERDICT

### 9.1 Phases

| Phase | Era | Build | Gate |
|---|---|---|---|
| **P0 — Robotic** | now–2035 | Continuous rover/ISRU presence (already running); SWIM-class ice assay | Water ledger confirmed; perchlorate biology rates `[MEASURE]` |
| **P1 — Foothold** | 2035–2060 | First fission burrow settlements (10²–10³ people), Phobos catapult, Deimos fuel dump | One full ISRU chain closed for a year (FM-06's inventory rule proven) |
| **P2 — Town** | 2060–2120 | 10⁴–10⁵ people; cast-basalt industry; greenhouse agriculture; rung-1 pressure experiments | Closure ledger tracking (FM-10); risk-coverage curve published annually |
| **P3 — Closure** | 2120–2200s | 10⁵–10⁶ people; chip/pharma/optics closure; Venus N₂ haulage begins | **Insurance maturity** — coverage(t) crosses positive (§6.2) |
| **P4 — Ladder** | 2200s+ | Rungs 2–3; the 10,000-year project formally chartered | The genre's dream, rescheduled by arithmetic |

### 9.2 Power ledger

| Item | Power | Notes |
|---|---|---|
| Foothold settlement (10³) | 10–30 MW (fission) | O₂ + water + heat + greenhouses |
| Town (10⁵) | 1–3 GW | Basalt industry dominates |
| Closure city (10⁶) | 10–30 GW | Chip fabs are the long pole |
| Venus N₂ haulage (P4) | energy-trivial at K2; **throughput-bound** | 400 yr at 10¹⁵ kg/yr (§5.1) |
| **Kardashev position** | **K0.5–0.8 at maturity** | The cheapest of the series' big programs per unit of existential value |

### 9.3 Verdict (no hedging)

1. **Mars is the honest middle child: overrated as colony, underrated as node.** Its surface is a worse habitat than Titan's and a worse mine than its own moons — but it holds the system's only human clock, a real frontier, and the best logistics real estate (Deimos/Phobos) between the inner and outer halves of this series.
2. **The terraform dream survives, rescheduled:** it is a *shipping* problem (Venus's N₂, swarm throughput), not a greenhouse, mirror, or magnetosphere problem — rungs 1–3 are century-scale and real; rung 4 is the civilization's longest project, priced in millennia.
3. **The insurance argument is quantified and honest:** the policy has a ~100-year waiting period and a negative-coverage phase; it matures when closure matures — and until then, *dual-sourcing industries across worlds* beats geographic redundancy alone. The genre sells the policy; this document reads the exclusions.
4. **The moons are the GDP:** Deimos the port, Phobos the borrowed dry dock (30–50 Myr of inventory life — strip on schedule), catapults over tethers until materials improve.
5. **Series arc after six volumes:** control → extraction → habitation → foundation → restraint → **insurance**. Remaining: **Urano/Neptuno** (the tilted ice giants — the last unvisited frontier and the system's strangest interiors), the belt (the series' commercial layer), and Tritón. The system map is nearly complete.

---

## APPENDIX A — Constants & formulas (quick reference)

- Mars: 1.524 AU, TOA 586 W/m²; day 24.62 h; P = 6.1 mbar (95 % CO₂); column 164 kg/m²; dose 0.67 mSv/day `[RAD]`; g = 3.72 m/s²; v_esc = 5.03 km/s
- Atmosphere mass 2.4×10¹⁶ kg; terraform deficit ~10²⁰ kg (to 1 bar); N₂ import ~4×10¹⁷ kg (Venus warehouse: ~1.7×10¹⁹ kg N₂)
- Pressure ladder: 6 → 20 (local sublimation) → 100 → 300 mbar → 1 bar; rung-2 = "Titan-lite" suits; rung-4 = millennia
- SOXE: 4.9 kWh/kg O₂ theoretical, 5–15 measured-class `[VERIFY]`; per-capita O₂ 0.84 kg/day
- Water: polar ~10⁶ km³-class + mid-lat sheets; sublimation mining ~10⁷ J/kg-class `[EST]`
- Regolith shielding: 2–3 m → Earth-class dose; SEP shelters: 10 m H₂O-eq
- Phobos: 11 m/s escape, 7.65 h period (below sync), D-type, doom ~30–50 Myr; Deimos: 5.6 m/s, 30.3 h; sync altitude 20,430 km
- Closure: ~10⁵–10⁶ people, ~100 yr; windows every 25.6 months

## APPENDIX B — Reference anchors

- Curiosity/MSL RAD: surface dose (Hassler et al. 2014); MOXIE flight results (Hecht et al. 2022–23); nitrate detections (Stern et al.)
- Phoenix wet chemistry: perchlorate (Hecht et al. 2009); SWIM ice maps (NASAm heritage)
- Jakosky & Edwards 2018 (Nature Astronomy): the CO₂ inventory ceiling — E1's kill shot
- Kilopower/KRUSTY: fission flight heritage; Sabatier/SOXE ISRU literature
- Pearson-class Phobos tether analyses; catapult logistics studies
- Series cross-refs: INVICTUS §3.3 (closure ledger), KRAKEN §5.2 (breach-inverse doctrine), OKEANOS §5.1 (custody chains for gas), ORPHEUS §5.2 (the Venus N₂ warehouse)

*End of the insurance volume. Six problem classes, six worlds, one system map filling in: the genre's favorite planet finally audited — and its dream survives, with a new schedule and a shipping manifest. Next: the tilted ones. Urano y Neptuno — the worlds we have visited exactly once, forty years ago, and never explained. The system map wants its last giants. P0 is everyone's problem: nobody has funded the return ticket.*

