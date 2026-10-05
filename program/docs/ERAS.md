# ERAS — Calendario con dependencias (2026 → K1)
## Del hueco nº1 del AUDIT a un DAG con fechas

Regla del documento: **nada entra aquí sin su dependencia dura declarada**
(dial, misión o física). Un programa sin dependencia es una fantasía con
presupuesto. Procedencia bajo [STANDARD.md](STANDARD.md).

---

## 0. Los dos hallazgos de esta pasada (auditoría viva)

**Hallazgo A — falta la misión que gobierna la ruta A.** El árbol de Era I
no contenía el P0 de TANTALUS: la sonda que mide el ratio He-3/⁴He joviano
(FM-11: ×2 de error re-escala todo el programa). Sin ella, `jupiter-hive-1`
se construye sobre un número supuesto. **Añadida** (`assay-jupiter-he3`,
requisito duro de la ruta de hives).

**Hallazgo B — el crédito de potencia de las hives asume reactores que
cuentan el plan pero no lista.** Los 5,9×10¹⁴ W-equivalentes por hive solo
son potencia **entregada** si existe capacidad D-³He downstream quemando ese
He-3. El plan debe listar la construcción de reactores como consumidor
explícito del producto, o el K1 de la ruta A es un error de contabilidad.
[Estado: marcado en AUDIT; el re-cuadre entra con la Fase de reactores.]

**Hallazgo C (física, clase 3):** la ruta B (`titan-dd-reactor`) y la
combustión final de la ruta A dependen de **D-D / D-³He**, no D-T. D-T es
ingeniería pendiente; D-D es física pendiente (temperaturas ×5, sección
eficaz menor). Es el gate más duro de toda la Era I y no aparece en ningún
calendario oficial porque nadie lo ha prometido. Declarado: si D-D no abre,
la ruta a K1-Watts orbitales pasa por **fisión + SSP + el dial 2**, y las
rutas de fusión quedan como amplificador posterior.

## 1. La cadena de dependencias dura (DAG)

```
DIAL-2 ($/kg LEO)  ──► todo lo orbital
  <$1.000/kg ──► moon-lava-outpost (OIKOUMENE §1: materiales de hoy)
  <$300/kg  ──► ceres-dopant-tail      (tras assay-psyche 2029)
  <$200/kg  ──► mercury-forge          (tras assay-bepicolombo 2026)
  <$100/kg  ──► ensamblaje a escala ──► venus-rijke-10, estructuras hive

DIAL-1 (potencia global, S1 del scoreboard) ──► financia todo
  S3 (fusión neta) ──► titan-dd-supply ──► titan-dd-reactor [GATE FÍSICA D-D]

MISSIONS (ya volando o programadas)
  BepiColombo 2026 ──► mercury-forge
  Psyche 2029     ──► ceres-dopant-tail
  Dragonfly 2034  ──► titan-beachhead ──► titan-dd-supply
  assay-jupiter-he3 (nueva, ~2040) ──► jupiter-hive-1 (con forge+tail)
```

## 2. El mapa por décadas

| Década | Se abre | Gate que manda | Programas que se activan |
|---|---|---|---|
| **2026–2035** | Scoreboard S1–S4 en marcha; assays gratis (BepiColombo, Psyche, Clipper/JUICE, Dragonfly); dial 2 < $500/kg (S2) | Dial 2 | assays; NADA de industria orbital — medir y posicionarse |
| **2035–2050** | Post-Luna: outpost real si Artemis/clatratos/herencia CLPS lo sostienen; primera SSP GW | Dial 2 < $300/kg + S4 (demo MW facturando) | moon-lava-outpost; venus-rijke-10 **si** el ensamblaje orbital existe (si no, 2050s) |
| **2050–2075** | La cadena metálica: Psyche/CEntros → dopantes; forja piloto en Mercurio; Titan beachhead (fisión importada) | Dial 2 < $200/kg; fusión D-T neta (S3) | ceres-dopant-tail, mercury-forge, titan-beachhead |
| **2075–2100** | Fusión madura; **el cruce orbital** ($/kWh orbital < terrestre marginal); assay-jupiter-he3 devuelve el número | El cruce | titan-dd-supply; jupiter-hive-1 (con reactores D-³He downstream listados); venus-fleet |
| **2100–K1 (~2150–2240)** | Fleets y escala: hive-fleet, dd-reactor (si D-D abrió), venus-fleet a 10¹⁵ W | Todos los anteriores + bucle τ | K1 |

## 3. Qué NO es programable (declarado, no escondido)

- **D-D / D-³He netos**: física sin demostrar. Clase 3 del STANDARD: hasta
  que exista, la ruta A vende combustible (no potencia) y la ruta B no existe.
  El plan alternativo K1: fisión + SSP + dial 2.
- **El cruce orbital**: función del dial 2 y del coste de ensamblaje; hoy
  ×10–100 `[EST]`. Es EL evento del siglo XXI para este plan.
- **Financiación**: fuera de alcance deliberado — el plan da dependencias y
  vatios; quién paga es política. (El lazo watts→IA→valor de ACCELERATION.md
  es el primer cliente que se paga solo.)

## 4. Actualizaciones aplicadas con esta pasada

1. `programs.toml`: añadida `assay-jupiter-he3` (available ~2040, sin
   drenajes) como requisito duro de `jupiter-hive-1`.
2. `AUDIT.md`: Hallazgos A/B/C registrados con estado.
3. `data/kpi.csv`: filas S1–S4 del scoreboard añadidas.
