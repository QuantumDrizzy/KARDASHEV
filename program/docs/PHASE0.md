# PHASE 0 — The Measurable Decade (2026–2040)
## Por dónde empieza de verdad el tramo K0.73 → K1

Nada aquí es opción de gusto: cada paso es (a) medible hoy, (b) financiado
hoy, o (c) una puerta física que hay que abrir antes de que lo demás sea
fundable. Bajo [STANDARD.md](STANDARD.md): tres clases de procedencia,
sensibilidad ×2 declarada.

---

## 1. LOS DOS DIALES (KPI-0 del programa)

Todo el tramo K0.73→K1 es gobernado por dos números medidos, públicos y
anuales. El programa empieza midiéndolos cada año (`data/kpi.csv`).

### Dial 1 — Potencia global primaria
- **Valor 2024: 592,2 EJ/año = 1,877×10¹³ W, +1,8 % interanual**
  `[MEASURED: Energy Institute Statistical Review 2025; análisis IEEJ]`
- → K = 0,727 (el HUD y los tests usan este valor medido, no el 2×10¹³
  redondeado de la serie).
- CAGR histórico reciente: ~1,5–2 %/año.
- **A tendencia medida, K1 (×500) llega en ~310–350 años (~año 2350).**
  Ese es el número brutal del que parte el programa: sin compresión, no
  hay Type I hasta el siglo XXIV.

### Dial 2 — Coste por kg a LEO
- Trayectoria medida: Shuttle ~$54.500/kg → Falcon 9 ~$2.600/kg público
  (~$629–1.500 en estimaciones internas/rideshare) → Starship objetivo
  $100–200/kg **(aún no logrado — [MEASURE] anual)**.
- La caída medida es ~×500 y va a la mitad del camino. Este dial es la
  **puerta de todo lo orbital**: energía solar espacial, industria lunar,
  la forja de Mercurio. A $10.000/kg nada de eso es un negocio; a $100/kg
  casi todo lo es.

**La aritmética que une los diales:** la potencia que falta hasta K1 es
+9,9×10¹⁵ W. Solar de superficie a ~20 W/m² medios realized →
5×10¹⁴ m² = 500×10⁶ km² — más de 3× toda la tierra emergida. **La
superficie terrestre no puede llevar el último tramo del K1: o fusión o
órbita.** Esa es la primera conclusión load-bearing de la Fase 0.

### Chequeo Hail Mary del calor residual (clase 1–2 de sensibilidad)
10¹⁶ W de rechazo térmico en la superficie = 0,02 W/m² globales ≈ 0,02 K
de forzamiento directo — sobrevivible globalmente, gestionable localmente
(los límites reales son térmicos locales: ríos, ciudades). Si el límite
está ×10 peor (0,2 K), sigue sobreviviendo. **El muro del K1 terrestre no
es el calor: son las FUENTES (suelo y combustible).**

---

## 2. LAS TRES PUERTAS DELANTERAS (acción real, esta década)

### Puerta 1 — POTENCIA (el lado terrestre)
- **Fisión:** parque SMR/GW en despliegue real. Sube el dial 1 ya.
- **Fisión de salvamento → fusión:** SPARC/ITER/privados; el hito físico
  (ignición neta sostenida) es el gate que decide si la década 2040–2060
  aporta el primer TW terrestre de fusión. [MEASURE anual: hitos NIF/SPARC]
- **Solar + storage:** la fuente dominante del ×1,5–2 de las próximas dos
  décadas. Techo honesto (arriba): ~K0,85–0,9 por sí sola.
- KPI: P(t) global, mix por fuente. Actualizar cada año (Statistical Review).

### Puerta 2 — LANZAMIENTO / INDUSTRIA ORBITAL (el boot espacial)
- Cadencia Starship operativa → dial 2 bajo $500/kg (hitos: primera
  reutilización completa de etapas, cadencia >100 vuelos/año clase).
- **Primeras demos de energía solar espacial** (lineaje SSPD-1, Caltech
  2023): demo MW → pilot GW. Es el puente físico entre el dial 2 y el
  dial 1: potencia orbital facturada en Tierra.
- **ISRU lunar piloto** (lineaje CLPS): masa lanzada desde la Luna a
  $/kg de mass driver (OIKOUMENE §1: 2,38 km/s, sin atmósfera) — el primer
  eslabón de la cadena que un día alimenta la forja de Mercurio.
- KPI: $/kg a LEO; primeros $/kWh-orbitales entregados.

### Puerta 3 — MEDIDA (la capa assay, ya pagada por otros)
Vuela sola; el programa la cosecha:
| Misión | Dato | Gate que desbloquea |
|---|---|---|
| BepiColombo (llegando) | Dopantes/registro de Mercurio | Forja (INVICTUS P1) |
| Psyche (2029) | Grados de mena metálica | Cola CERES |
| Europa Clipper (2030) / JUICE (2031) | Ocianos helados | OKEANOS P1–P2 |
| Dragonfly (2034) | Toxicología/geotecnia Titán | KRAKEN P1 (ruta D-D) |

---

## 3. SECUENCIA HONESTA DEL K1 (cuándo es fundable qué)

| Tramo | Qué se financia | Por qué ahí y no antes |
|---|---|---|
| 2026–2040 | Puertas 1–3: dial 1 ×1,4–1,5, dial 2 bajo $500/kg, fusion hitos físicos | Todo lo demás depende de estos tres |
| 2040–2070 | Pilotos: fusión piloto-plant, SSP GW→TW, ISRU lunar, ensamblaje orbital | Ya fundable si la década 1 cerró sus hitos |
| 2070–2120 | **El cruce**: potencia orbital + fusión barata → el bucle industrial INVICTUS arranca de verdad (forja Mercurio, cola Ceres, hives TANTALUS en horizonte) | Es cuando los programas de `programs.toml` pasan de spec a business case |
| **K1** | **ETA honesta: ~2150–2200 si las puertas abren; ~2350 si solo corre la tendencia medida** | La compresión ×2 es exactamente lo que este programa compra |

Los números de `programs.toml` Era I son la estructura del fin, no el
calendario del principio: mercury-forge y hive-fleet son puertas de la
década 2070+, no proyectos de 2030. El error de planificación que esto
evita: pedir financiación para una forja mercuriana antes de que el dial 2
haya bajado dos órdenes de magnitud.

---

## 4. QUÉ SE HACE ESTE AÑO (literal)

1. `data/kpi.csv` — semilla con los puntos medidos de arriba; actualizar
   cada año con Statistical Review + pricing de lanzadores.
2. Vigilancia de hitos: una fila por hito físico (SPARC Q, Starship
   reuso, SSP demo MW). Es la versión assay de la Fase 0.
3. Nada de hardware propio todavía: el programa aún no tiene músculo para
   mover diales; su trabajo 2026–2035 es **medir, documentar y estar
   posicionado** en cada gate. El músculo llega con el dial 2.
