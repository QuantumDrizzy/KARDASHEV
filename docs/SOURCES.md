# Sources

Cited in `/about#sources` and in lib comments. Order-of-magnitude is allowed if labeled.

| Item | Where we use it | Cite |
|---|---|---|
| Sagan K | `kardashev.ts` | Sagan, C. 1973. *The Cosmic Connection* / Icarus logarithmic scale |
| Type I = 10¹⁶ W | `P_I` | Sagan convention, not Kardashev 1964 4×10¹² W |
| TES 620 EJ | `TES_2023_EJ` | IEA World Energy Outlook / Key World Energy Statistics, 2023 TES |
| 1.8%/yr | `GROWTH` | IEA TES 2013–2023 approximate CAGR |
| Electricity 30,000 TWh | `facts.ts` | IEA electricity |
| Datacentres 460 TWh | `facts.ts` | IEA 2024 estimate |
| L☉ 3.826e26 W | `L_SUN` | IAU 2015 Resolution B3 |
| AM0 1361 W/m² | `physics.ts` | IAU TSI |
| μ⊕ | `orbit.ts` | EGM2008 / IAU |
| NPP ~130 TW | `life.ts` | Field et al. NPP; ~39 kJ/gC conversion, order-of-mag |
| HANPP ~25% | `life.ts` | Haberl et al. |
| Planetary boundaries | `life.ts` | Rockström / Richardson updates |
| e0 / HALE | `life.ts` | UN / WHO order-of-mag |
| Career Sv | `life.ts` | NASA / ESA career limits, order-of-mag |
| σ | `physics.ts` | CODATA |
| Starmind / AI1 / Suncatcher / Starcloud | `programs.ts` `roadmap.ts` | Public filings / reporting; **not** partnership; dates are targets not promises |

If you change a constant: update the test, the comment, this table, and `/about#sources` in the same PR.

## Lunar roving vehicle mobility (M31)

- NASA NTRS 19730008090 — *Mobility performance of the lunar roving vehicle: Terrestrial studies*, MSFC, 1973 (87 pp. PDF hashed at `data/raw/lrv/lrv-mobility-terrestrial.pdf`, sha256 prefix `dd1d815e287b8509`). The Bekker/LLD soil-vehicle model vs the LRV's onboard ampere-hour integrators, Apollo 15: RMS deviation per km **11.4–16.0 %** across the LLL soil-value spectrum (Table 7); the WES variant overestimates, median ~30 %. Anchors `src/lib/lrv.ts`.
- NASA NTRS 20250011301 — *Apollo Lunar Roving Vehicle as Traversed Performance Metrics* (2025). Not fetched; the modern re-analysis of the same traverses.
