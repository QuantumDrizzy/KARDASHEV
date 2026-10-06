# B-REDUCTION — The Home Program for Killing the Brittleness
## The playbook, function by function, with the cases that exist

| | |
|---|---|
| **Version** | 1.0 — FRAGILITY/GAEA follow-on: the rung-K1 maintenance program |
| **Date** | 2026-10-06 |
| **The registry** | `game/data/kpi.csv` B-rows (verified 2026-10-06): EUV 1.0 · chips 0.9 · launch 0.85 · sats 0.65 · compute 0.66 |
| **The rule** | A scoreboard gate does not count as open if its critical chain has B > 0.8 (FRAGILITY §4) — so this document is not optional: it is rung-K1 maintenance |

---

## 1. THE MITIGATION LADDER (six classes, cheapest first)

| Class | Mechanism | Speed | Cost | Weakness |
|---|---|---|---|---|
| 1. **Stockpile buffer** | hold N years of the function's output | weeks | low | finite; sized to the shock (FRAGILITY doctrine) |
| 2. **Unit redundancy** | more units from the SAME maker | fast | low | **does not reduce B** — it is not diversification |
| 3. **Substitution** | a different technology delivering the function | medium | perf cost | the substitute must be real (below: DUV-mp, SiC) |
| 4. **Maker redundancy** | a second qualified producer | 3–10 yr | high | qualification is the wall |
| 5. **Geographic redundancy** | same maker, new fabs | 3–5 yr/fab | very high | the maker's process still single-sources tools |
| 6. **Self-supply closure** | the M4/M5 program (TAU-GATE): local fab tier | decades | the K2-era program | the endgame — also cures τ (the convergence finding) |

**The cost-B rule:** dual-sourcing to B ≤ 0.7 is commercial pricing; B < 0.5 is strategic pricing; B < 0.3 is redundancy for its own sake. Program target: **B ≤ 0.7 on every rung-critical function** (consistent with the gate rule).

## 2. THE PLAYBOOK, FUNCTION BY FUNCTION

### 2.1 EUV lithography — B = 1.0 (irreducible this decade; reduce around it)
- **The honest statement:** ASML is the sole maker; no second EUV source reaches leading edge this decade (Nikon/Canon: DUV and nanoimprint only). **B(EUV) = 1.0 is structural until ~2035+** `[VERIFY: SMEE/SSMB domestic-EUV programs — years behind]`.
- **What actually reduces exposure:** (i) **the substitution class** — DUV multi-patterning reaches 7 nm-class without EUV (demonstrated: SMIC's 7 nm-class parts `[MEASURED 2022+]`) — slower, costlier, real; (ii) machine-stockpile doctrine (N+1 machines per fab lineage — the units are the scarce good: ~140 EUV/year ASML capacity `[MEASURE-approx]`); (iii) High-NA transitions planned with 2-vendor machine generations.
- **The lesson:** when B = 1.0 and the maker is allied, the mitigation is **buffer + substitute**, not diversification theater.

### 2.2 Advanced logic (B = 0.9 Taiwan) — the moving number
- **Verified:** Taiwan 92 % of <10 nm capacity (SIA/USITC 2023); 2025 estimates drift to 63–69 % for 7 nm-and-below as TSMC-Arizona, Samsung-Taylor, Intel-Ohio ramp `[MEASURE annually — the number moves]`.
- **The playbook is already running:** geographic redundancy classes 4–5 in flight (three-fab-generation program). The program's job: **register the leading-edge share by geography annually** (the B-row), and hold the stockpile at the shock timescale (12–24 months of leading-edge supply buffers the Taiwan-window shock — DEIMOS §4.3 arithmetic, transplanted).
- **Target trajectory:** B 0.9 → ≤ 0.7 by ~2030 if the fabs ramp to published schedules.

### 2.3 Launch upmass (B = 0.85 SpaceX) — the tension with the program's own dial
- **The honest conflict:** dial 2's collapse *increases* this B — cheap bulk launch is consolidating into one provider (and Starship concentrates the cheap tier further). FRAGILITY vs ACCELERATION, same dial.
- **The doctrine that resolves it:** **accept high B during the dial-2 collapse; require maker-redundancy at commercial cadence before rung-critical phases** (ERAS's crewed/seed phases never hang on a single provider): Neutron, New Glenn (flew 2025), Ariane 6, H3 — the second-provider watch is a registered KPI (max competitor cadence/year).
- **Starlink note:** upmass B is partly *self-supply* (Starlink cargo) — the external-customer B is lower than the raw upmass B. Report both: B_launch(total) and B_launch(external).

### 2.4 Internet constellations (B = 0.65) — falls by itself, differently
- Kuiper, Guowang, Qianfan ramping: owner-diversification is in flight. **The un-diversifiable fragility is the shared orbit environment** (Kessler/ASAT — FRAGILITY's shock taxonomy): the mitigation is debris doctrine + collision-avoidance data-sharing (registered, real: Space-Track heritage).
- B_constellation separates into **owner-B (falling)** and **environment-B (rising with density)** — track both; the second is the one that kills.

### 2.5 Compute (B = 0.66 hyperscaler trio) — the corrected number
- The "70 % of traffic" figure retracted as folklore (2026-10-06 verification); the defensible metric: hyperscaler trio ≈ 66 % of cloud.
- **The AI-demand force is the ally:** power constraints push data centers geographically apart (the buildout follows the megawatts) — compute B falls *as a side effect of the dial-1 program*. The home program and the ladder pull the same rope here (GAEA §3: the fuel swap is also the B fix for this function).

## 3. THE CONVERGENCE (why this is one program, not five)

The M4/M5 program of TAU-GATE (fab-tier closure) is the **class-6 endgame for functions 2.1 and 2.2 simultaneously** — the same fab-tier that gates τ gates B. The chapter's operational statement: **the B-reduction program's back half IS the doubling-law program.** Front half (stockpiles, substitution, second sources) is commercial-pricing work that starts now and needs nobody's permission.

## 4. THE REGISTRATION (what the program does this year)

1. `kpi.csv`: B-rows updated with verified sources (done, 2026-10-06); annual refresh with trajectory targets (B ≤ 0.7 per rung-critical function).
2. The buffer ledger: stockpile depth per function, sized to the FRAGILITY shock timescale — reported beside the B-rows.
3. The second-provider cadence KPI for launch (max competitor flights/yr) — the dial-2 tension made visible.
4. Every rung gate in ERAS checks its B-table row before opening (the gate rule, enforced).

---

*The program's home maintenance manual, in one line: buffers now, substitutes where physics allows, second makers where commerce allows, and the fab-tier closure as the endgame that pays two ledgers — because the house that hosts the fragile tier is also the house that writes the ledgers.*
