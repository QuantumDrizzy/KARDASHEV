# DD-GATE — The Class-3 Physics Gate: D-D and D-³He
## What exists, what is missing, what would have to happen (and who is even trying)

| | |
|---|---|
| **Date** | 2026-10-06 · KARDASHEV / ERAS finding C dossier |
| **Gate class** | **3** (STANDARD.md: la ruta entera se cierra si este número no abre) |
| **Verdict up front** | K1's critical path does **not** require fusion (ERAS finding C: fission + SSP + dial 2). D-D catalytic is the *strategic* cycle (self-breeding, no fuel imports) and it has **never been demonstrated anywhere and is not scheduled anywhere**. D-³He is the clean amplifier, gated on a helium-3 supply that is a documented chicken-and-egg. Fusion is the plan's upside, not its dependency — and that distinction is load-bearing. |

---

## 1. THE FUEL LADDER (what each cycle demands, honestly)

| Cycle | T optimum | Triple product vs D-T | Neutronic energy | Ever demonstrated? | Strategic role |
|---|---|---|---|---|---|
| **D-T** | ~13,6 keV | 1× | ~80 % en neutrones de 14 MeV | **Ignición física: sí** (NIF 2024: 3,88 MJ / 2,05 MJ, ganancia diana ~1,9×; Q_wall-plug ~0,8 % — laboratorio, no planta) | El bootstrap de ingeniería |
| **D-D catalítico** (6D → 2α + 2p + 2n; sus propios T y ³He arden in situ) | ~50–100 keV `[EST-literature: 30–70× el triple producto de D-T según cierre del ciclo]` | 30–70× | ~⅓ en neutrones (2,45 + 14 MeV) | **Nunca como quemadura.** Plasmas D-D corren en máquinas solo como operaciones sin tritio, con rendimientos órdenes de magnitud por debajo | **El ciclo estratégico: se auto-alimenta.** Única ruta que no importa combustible más allá del deuterio (el libro mayor de KRAKEN) |
| **D-³He** | ~50–60 keV | ~7× | 5–15 % (la rama D-D lateral siempre está) | **Nada neto.** Helion: 150 M K (~13 keV) en feb-2026 — un cuarto del camino térmico a su objetivo (~600 M K) `[MEASURED milestone]` | El amplificador limpio; ³He = el chicken-and-egg (§4) |

## 2. WHAT EXISTS TODAY (verificado, con fecha)

- **NIF:** ignición física real y repetida (2022: 3,15 MJ; 2024: 3,88 MJ, ganancia diana ~1,9×) — pero láser de flashlampas con wall-plug < 1 % → **Q_de_red ≈ 0,008**. IFE requiere láseres diodo-pumped al ~50 % `[MEASURE: progreso anual — es el dial de la ruta inercial]`.
- **JET (cerrado 2023):** 69 MJ de D-T en 5 s, Q ~0,33 — el récord de energía total. Nadie ha hecho Q_eléctrico > 1 en ninguna máquina, jamás.
- **ITER:** D-T ~2039, Q_físico = 10 de diseño, **sin conversión eléctrica** en su línea base.
- **SPARC (CFS):** ~80 % construido; primer plasma **2027**; D-T con Q > 1 objetivo el mismo año; después **ARC, ~400 MWe** — el primer diseño de central conectada de la serie D-T. Es el G1 del §3 con fecha y fondo.
- **Helion:** FRC pulsado con **recuperación directa** (bobinas, sin turbina): Polaris operativa (mayores FRC de su historial), **150 M K en feb-2026**; PPA Microsoft de 50 MW para **2028** — el calendario más agresivo de la industria y el más dudado `[MEASURE anual: se cumple o se rescope]`. Su ciclo comercial es D-³He.

**Quién diseña para >25 keV (territorio D-D):** esencialmente nadie en público. ITER/STEP/DEMO son D-T. La única hoja de ruta que ni siquiera apunta a D-D catalítico es la aspiración de Helion (³He criado de sus propias ramas D-D). **El ciclo estratégico del plan no tiene patrocinador en el mundo.** Eso se escribe tal cual.

## 3. THE GATE SEQUENCE (qué tendría que pasar, en orden)

| Gate | Qué es | Quién lo intenta | Estado honesto |
|---|---|---|---|
| **G1** | Piloto D-T con electricidad neta conectada (Q_plug > 1) | CFS (SPARC→ARC), iteraciones nacionales | **Programado** ~2035±5 — es ingeniería pendiente, no física |
| **G2** | Confianza sostenida a 30–50 keV (régimen de presión/estabilidad inexplorado a escala burn) | nadie con máquina diseñada | Vacío físico-de-diseño |
| **G3** | **Quemadura D-D catalítica con Q_combustible > 1** — aunque sea a escala de laboratorio | **nadie, nada programado** | **El gate clase-3 real** |
| **G4** | Materiales: primera pared a cargas neutrónicas altas + temperaturas altas (sin resolver ni para D-T) | programas de materiales repartidos y crónicamente infradotados | Cuello universal |
| **G5** | ³He a escala industrial: decaimiento de T (kg–toneladas del complejo de armas), Luna (muerto — TANTALUS E2), gigantes gaseosos (TANTALUS entero) | Helion-planea criarlo de ramas D-D propias | El chicken-and-egg de §4 |

## 4. THE CHICKEN-AND-EGG (por qué D-D catalítico es el ciclo estratégico)

El ³He terrestre es inventario de decaimiento de tritio: suficiente para
experimentos, no para teravatios. La Luna es ppb (muerto por TANTALUS E2,
razón 4×10⁴). Los gigantes gaseosos son la mina real — pero las hives
necesitan clientes D-³He y los clientes necesitan ³He importado. El D-D
catalítico rompe el círculo **criando su propio T y ³He en el plasma**: es
el único ciclo que convierte deuterio (el libro mayor de KRAKEN: 1,2×10¹³
kg solo en la atmósfera de Titán) en el combustible completo. Por eso el
gate G3 — que nadie ha prometido — es el que el programa debería querer
comprar: es la diferencia entre una era de fusión *importada* y una era de
fusión *autárquica*.

## 5. SENSITIVITY (STANDARD: ¿qué muere si ×2 o si no abre nunca?)

- **Si D-D no abre nunca:** la ruta B muere; la ruta A queda reducida a
  *producción de combustible* (sin quemadores finales propios); el K1 no
  cambia (ERAS hallazgo C: fisión + SSP + dial 2 ya es la vía crítica
  declarada). Lo que muere de verdad: la **limpieza** (aneutrónico) y la
  **velocidad del K1.5+** espacial. Clase 3 para las rutas de fusión,
  clase 1–2 para K1. Es exactamente por eso que el plan no espera a la
  fusión — y por eso mismo puede decirlo sin prometerla.
- **Si D-D abre temprano (sorpresa Helion-clase, años 2030):** el stock D
  de KRAKEN se convierte en el tanque de la escalada; las rutas de
  combustible espacial se aceleran; el K1 baja dentro de su banda hacia
  2153. La banda 2153–2374 de ACCELERATION.md es, en parte, la apuesta
  sobre este gate.

## 6. WATCH MARKERS (anuales, junto al scoreboard S1–S4)

1. **SPARC:** primer plasma 2027 y Q > 1 D-T — si falla o se rescata, se
   mueve G1 entero.
2. **Helion:** la escalera térmica (150 → ~600 M K) y si el PPA de 2028 se
   cumple o se rescopa — es el único programa del mundo apuntando al
   régimen >25 keV.
3. **Cualquier anuncio serio de campaña D-D con Q_combustible** (G3): hoy
   la lista es vacía; que seguir siéndolo también es un dato.
4. **Láseres diodo-pumped** (ruta IFE): wall-plug hacia ~50 %.

---

*El plan no espera a D-D: esa fue la decisión de ERAS hallazgo C y este
dossier la confirma con los números. Pero la era de fusión autárquica —
deuterio de KRAKEN quemado en ciclos que crían su propio combustible —
empieza en un gate que hoy nadie sponsoriza. Registrarlo es el primer paso
para que dejar de ser verdad sea solo cuestión de tiempo.*
