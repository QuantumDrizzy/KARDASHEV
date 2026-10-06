# FRAGILITY — Choques sistémicos en la escalada (K0.73 → K1)
## El Índice de Fragilidad B aplicado al plan real

> Esto es el "apunta esto" de Antonio (2026-10-06): guerra, pandemia,
> terremoto en zona crítica de data centers, caída de satélites de
> internet. Formalizado: qué choques existen, cuánto cuestan en la
> escalada, qué función crítica tiene punto único de origen, y qué puede
> mitigar un programa que aún no tiene músculo. Enlaza con el B-index del
> collapse deck (type3-galactic-ladder §5) y la doctrina de doble fuente
> (DEIMOS §6.2).

---

## 1. El choque ya medido: la pandemia costó ~2 años de escalada

Dato duro del propio dial 1: el consumo primario cayó **−4,4 % en 2020**
(Energy Institute) — una pandemia borró ~2,5 años de crecimiento (a 1,8 %/
año) y la recuperación tardó dos más. Las cadenas de lanzamiento e
industriaespacial también titubeaban. **Clase 2 de sensibilidad: el
calendario se mueve, la ruta no muere.** Precio medido del choque: ~2–4
años de retraso en el ETA de K1.

## 2. El Índice de Fragilidad por función crítica (B = cuota del punto único mayor)

La métrica: para cada función que el tramo K0.73→K1 necesita, B = la
cuota del mayor origen único. B→1 = un solo punto puede apagar la
función. Números conocidos de la literatura industrial `[MEASURED-approx,
verificar al ingestar]`:

| Función crítica | Mayor punto único | Cuota | B |
|---|---|---|---:|
| Litografía EUV (sin ella, no hay chips avanzados) | ASML, Países Bajos — **único fabricante mundial** | 100 % | **1,0** |
| Chips lógicos avanzados (<10 nm) | Taiwán (TSMC) | ~90 % | **0,9** |
| Refino de tierras raras (imanes de motores, turbinas) | China | ~85–90 % | **0,9** |
| Masa lanzada a órbita | SpaceX (~80–90 % del upmass global 2023–24) | ~85 % | **0,85** |
| Constelación de internet | Starlink (~2/3 de satélites activos) | ~65 % | **0,65** |
| Tráfico intercontinental de datos | cables submarinos (~500, con estrangulaciones: Suez, Malacca, Dover) | — | **0,9** `[EST]` |
| Clúster de cómputo/trafico | Hiperscalers (trío ~66 % del mercado cloud); Loudoun es el mayor mercado DC único — **el "70 % del tráfico" es folclore sin fuente, retirado 2026-10-06 tras verificación** | ~66 % | **0,66** |

La lectura que importa: **el propio plan es frágil en sus dos diales.** El
dial 2 (lanzamiento) descansa en una empresa; la capa de cómputo que
alimenta el lazo watts→IA descansa en una isla sísmica y un fabricante de
EUV. No es retórica: es la auditoría de los dos números que gobiernan
todo.

## 3. Taxonomía de choques con su factura (contracción de la escalada)

| Choque | Mecanismo | Factura en la escalada | Clase | Precedente medido |
|---|---|---|---:|---|
| **Pandemia** | caída de demanda + cadena logística | −2 a −4 años | 2 | COVID 2020: −4,4 % `[EI]` |
| **Guerra regional que salpique a Taiwán** | B=0,9 en chips + B=1,0 en EUV: S2, S3 y S4 se paran a la vez | −5 a −15 años | **3** | Chi-Chi 1999 (fabs paradas meses); escasez de chips 2021–23 |
| **Terremoto en clúster de data centers** (el ejemplo) | B=0,7 de cómputo + latido del lazo watts→IA | −1 a −3 años | 2 | (ningún clúster mayor golpeado aún — la suert`[MEASURE]`) |
| **Tormenta solar clase Carrington** | grid + constelaciones + lanzamiento: la capa ESPACIAL es la más expuesta | −1 a −3 años | 2 | 2022: 38 Starlink perdidas por tormenta *moderada*; Carrington 1859 |
| **Cascada de satélites (Kessler local / guerra orbital)** | B=0,65 de internet + el dial 2 contaminado por basura | −3 a −10 años | 3 | ASAT 2021/2022 (debris fields reales) |
| **Corte de cables submarinos (múltiple)** | B=0,9 de backbone | semanas–meses de régimen degradado | 2 | Tonga 2022 (casi aislada semanas) |
| **Guerra entre grandes potencias** | todas las B a la vez | **el plan se pausa; no hay mitigación** | 3 | — es exactamente el argumento-aseguranza de DEIMOS apuntando a la Tierra |

## 4. La doctrina (qué puede hacer el programa sin músculo)

1. **Registrar B por función, cada año, junto al scoreboard** (nueva tabla
   en `kpi.csv`). Lo que se mide, baja: la concentración que aparece en la
   contabilidad consigue atención política que la concentración invisible
   no consigue.
2. **Doble fuente como regla de gate:** un gate del scoreboard S1–S4 no
   cuenta como "abierto" si su cadena crítica tiene B > 0,8. (SPARC es uno;
   que no lo sea el único.)
3. **Buffer al ritmo del choque, no al del fallo** (herencia DEIMOS §4.3):
   redundancia dimensionada para −4,4 % de un año y para un apagón de
   constelación, no para la probabilidad media.
4. **La verdad incómoda:** guerra entre grandes potencias no tiene
   mitigación técnica a K0.73. Es la razón por la que la pista
   aseguranza (DEIMOS) existe en el plan — y la única función cuya
   fragilidad se cura *avanzando* en la escalera, no protegiéndose de ella.

## 5. Qué NO es este documento

No es catastrofismo: cada choque listado tiene precedente o
concentración medida. No es política: se registran las B, no se eligen
gobiernos. Y no cambia el ETA central: los choques clase 2 mueven el
calendario (la banda 2153–2374 ya les deja sitio); los clase 3 son los que
justifican que el programa exista en primer lugar.
