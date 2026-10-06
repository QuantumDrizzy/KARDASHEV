# RITUAL — The Annual Cycle
## How the program breathes (one page, as contracted)

**The rule:** the program's ETA and scoreboard are re-published from data every year. Faith does not enter the repo.

## The calendar

| When | What | Source |
|---|---|---|
| **June–July (annual)** | Primary-power dial: new Statistical Review figures → `kpi.csv` row | Energy Institute Statistical Review (published June) |
| **Rolling** | Launch $/kg: each provider's published pricing + internal estimates | provider announcements, SEC filings |
| **Rolling** | Scoreboard markers S1–S4: growth rate, Starship cadence/price, fusion pilot milestones, SSP demos | the four watch programs |
| **Rolling** | Fusion ladder (DD-GATE §6): SPARC/ITER/Helion temperature-and-Q ladder | mission updates |
| **Rolling** | B-rows: leading-edge capacity share by geography, launch upmass shares, constellation ownership | SIA/USITC, BryceTech-class trackers, constellation registries |
| **Rolling** | Closure milestones (TAU-GATE M1–M5): lights-out records, in-situ closure demos, vitamin ledger | industry tracking |
| **Rolling** | Vault markers (TARTAROS appendix): LVK census, X-ray-binary catalog, evaporating-PBH bounds, kugelblitz literature | the observatories are already running |
| **July (annual, closes the cycle)** | Re-run `cargo test -p kardashev-core` + a `score` pass → **append `kpi_report_YYYY.md`**: K(t) re-published, scoreboard verdict, ETA re-computed at 1.8/2.5/3/4/5 %, B-table diff, one-paragraph honest commentary | the repo itself |

## The rules of the ritual

1. Every number enters with its provenance class or it does not enter.
2. Corrections go to `AUDIT.md`'s failure log — including self-corrections (the log's proudest entries are ours: the K-scale, the D-flow, the 70 % folklore).
3. The ETA is re-published from `data/kpi.csv` — never from memory, never from mood.
4. A shock event (FRAGILITY taxonomy) may trigger an off-cycle update; the annual cycle never skips.
5. The report is appended, never edited backwards — history is read-only.

## The exception clause

A mid-year *physical* milestone (SPARC Q, Starship cadence, a fusion first, a shock event) may add a dated row immediately — the scoreboard does not wait for July to notice the world. The July pass is the audit; the rolling rows are the pulse.
