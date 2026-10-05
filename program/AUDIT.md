# AUDIT — KARDASHEV

**Este repo es el programa real, no material de juego.** La escalera es el plan hacia Type III; el simulador (`game/`) es una herramienta de exploración del plan. Estándar: producción. Cada cambio en `data/` exige (1) tests en verde y (2) esta página al día.

Verificación:
```bat
cargo test -p kardashev-core     :: 7/7 (5 escala K + 2 integridad del libro mayor)
python -m kardashev              :: no aplica aún (prototype en game/crates/kardashev-app)
```

## Estado de los números que soportan el plan

| Número | Estado | Ancla |
|---|---|---|
| Escala K = (log₁₀P − 6)/10; K1=10¹⁶, K2=10²⁶, K3=10³⁶ W | **PINNED** (tests) | OIKOUMENE §2; Sol = K2.06 |
| K0.727 = humanidad 2024 (592,2 EJ/año = 1,877×10¹³ W, +1,8 %/año) | **MEASURED + PINNED** (tests, 2026-10-06) | EI Statistical Review 2025; docs/PHASE0.md dial 1 |
| **ETA honesto a K1: 2374 a tendencia medida (1,8 %/año); banda acelerada 2153–2236 según crecimiento de demanda (2,5–4 %); scoreboard 2040 con 4 hitos falsables** | **DERIVED** (t = ln(500)/ln(1+r)) + scoreboard | docs/PHASE0.md + docs/ACCELERATION.md |
| **Techo de la solar de superficie: ~K0,85–0,9** (10¹⁶ W piden 5×10¹⁴ m² a 20 W/m² > 3× la tierra emergida) | **DERIVED** — el último tramo del K1 es fusión u órbita | docs/PHASE0.md §1 |
| Calor residual del K1 en superficie: 0,02 W/m² (~0,02 K) — sobrevivible | **DERIVED** (sensibilidad ×10: sigue sobreviviendo, clase 1–2) | docs/PHASE0.md §1 |
| Dial lanzamiento: Shuttle 54.500 → F9 ~2.600 → Starship objetivo 100–200 $/kg (no logrado) | **MEASURED (parcial)** — objetivo anual [MEASURE] | data/kpi.csv |
| Presupuestos Era I (assays, forja Mercurio, hive TANTALUS 5,9×10¹⁴ W, rutas D-D) | **TRACED** (campo `source` en cada fila) | Volúmenes 1–10 de la serie |
| Flujo de deuterio: producción 1,2×10¹⁰ ≥ demanda 1,17×10¹⁰ kg/año | **PINNED** (test de integridad, 2026-10-06) | KRAKEN §3.2 / FM-07 |
| Stock D = 1,2×10¹³ kg | **DERIVED + PINNED** (cadena STANDARD.md, test) | KRAKEN §3.2 `[MEASURE]` clatratos al alza |
| Semilla 10⁵ kg → 10²¹ kg, τ=3 a, ~160 a hasta K2-local | **EST** — ley de doblamientos, sin ecosistema cerrado jamás construido | type3-ladder §3.1 `[HYPOTHESIS]` |
| Frente de colonización v_eff ≈ 0,02c, galaxia en ~1–3 Myr | **EST** | type3-ladder §4.1 |
| Índice de Fragilidad B | **DEFINICIÓN SOLA** — sin calibración contra casos reales | type3-ladder §5 `[HYPOTHESIS]` |
| Experiments 12–16 (ROADMAP.md) | **PROPUESTAS** — cada una entra por claim→probe→bundle | docs/ROADMAP.md |

## Capas (separación estricta)

- **PROGRAMA** (real): `data/ladder.toml`, `data/programs.toml`, `data/elements.toml`, `era1-mechanics.md` (los programas, no la narrativa), `type3-galactic-ladder.md` (física), `type3-galactic-ladder.md` §3 (diseño de semilla).
- **SIMULADOR** (herramienta): `game/` (core Rust + prototype terminal), baraja de eventos `data/events.toml`, mecánicas de colapso (§5 del ladder), `data-schema.md` como contrato de extracción.
- **JUEGO** (downstream, Unreal, otro equipo): todo lo anterior es su base de datos — nada del juego reescribe el programa.

## Fallos encontrados y corregidos (log)

| Fecha | Fallo | Corrección |
|---|---|---|
| 2026-10-04 | Escala K escrita como log₁₀(P)/10 → humanidad daba K1.33 | Fórmula canónica (log₁₀P − 6)/10, K1 = 10¹⁶ W; pineada con tests |
| 2026-10-06 | Flujo D: suministro 1,0×10¹⁰ < demanda 1,17×10¹⁰ kg/año → hamuna silenciosa con ambas rutas a plena potencia | Suministro a 1,2×10¹⁰ + test de integridad del libro mayor (production ≥ consumption) |
| 2026-10-06 | **Hallazgo A:** el árbol de Era I no contenía el P0 de TANTALUS (sonda ratio He-3/⁴He) — la ruta de hives se construía sobre un número supuesto | Añadida `assay-jupiter-he3` (~2040) como requisito duro de `jupiter-hive-1` |
| 2026-10-06 | **Hallazgo B:** los 5,9×10¹⁴ W-equivalentes por hive son potencia entregada SOLO con reactores D-³He downstream listados como consumidores | Marcado en `programs.toml` y ERAS.md; re-cuadre pendiente de la fase de reactores |
| 2026-10-06 | **Hallazgo C (física, clase 3):** la ruta B y la combustión final de la ruta A dependen de D-D/D-³He (física sin demostrar), no D-T | ERAS.md §0/§3: plan alternativo K1 = fisión + SSP + dial 2 hasta que D-D abra |

## Huecos declarados (no tapados)

1. **Sin modelo de financiación ni calendario real**: Era I mezcla lo accionable ya (misiones assay con fechas reales: BepiColombo, Psyche, Clipper, JUICE, Dragonfly) con lo contingente (forja de Mercurio, hives). El plan lo dice; falta separarlo por décadas con dependencias.
2. **Ley de doblamientos sin precedente**: τ = 3 a es una hipótesis de trabajo; ningún ecosistema fabril autónomo se ha cerrado nunca. Es el gate de la Fase 2 (INVICTUS).
3. **Feedstock TOLIMAN** `[MEASURE]`: sin disco de escombros confirmado en A/B.
4. **B sin calibrar**: el Índice de Fragilidad necesita casos históricos antes de ser métrica.
5. **D más allá de la atmósfera** `[MEASURE]`: reservorios de clatratos sin medir (al alza, no al riesgo).
