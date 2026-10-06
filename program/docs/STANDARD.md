# STANDARD — Procedencia de números (el contrato Hail Mary)

Referencia de vara: *Project Hail Mary*, *Interstellar*. Si un número de
soporte vital está mal, alguien muere. Aquí nadie muere todavía — pero el
plan se escribe como si fuera a hacerlo. **Cada detalle cuenta porque el
Type 1–3 no admite escatimar: si digo que hacen falta X kW, X se puede
derivar, medir o reclasificar. Nunca decorar.**

## Las tres clases de procedencia (etiqueta obligatoria)

| Clase | Qué es | Qué exige | Ejemplo en este repo |
|---|---|---|---|
| **[MEASURED]** | Trazable a un instrumento/dataset con fuente | URL/DOI + año; el check lo puede alcanzar | D/H de Titán = 1,35×10⁻⁴ (Cassini); potencia humana 2×10¹³ W |
| **[DERIVED]** | Calculado desde [MEASURED] con la derivación mostrada | Fórmula + unidades + constantes visibles, y **pinned por test** cuando sea código | Stock D de Titán = 1,2×10¹³ kg (cadena abajo) |
| **[ASSUMED]** | Elección de modelado, no derivada de medida | **Sensibilidad declarada: ¿qué sobrevive si está ×2 mal?** | τ = 3 años de la ley de doblamientos |

Un número sin una de estas tres etiquetas **no entra al repo**. "Me suena"
no es procedencia.

## La regla de sensibilidad (lo que separa plan de ornamento)

Cada número load-bearing responde una pregunta: **¿qué muere si este valor
está ×2 mal?** Tres respuestas posibles y todas válidas:
1. *Nada structural* — el número es un radio de ajuste.
2. *El calendario se duplica* — el plan se alarga, no muere.
3. *La ruta entera se cierra* — entonces este número es un **gate P0** y
   medirlo precede a todo lo que dependa de él.

Ejemplo: τ (doblamiento fabril) está ×2 mal → el calendario K2 pasa de ~110
a ~220 años → ruta viva, calendario muerto → clase 2. El ratio He-3/⁴He de
Júpiter ×2 mal → TANTALUS se re-escala entero → clase 3, gate P0 (por eso
BepiColombo y cada assay son ineludibles).

## K es la regla, no el objetivo

La escala K es **convención de reporting** (K = (log₁₀P − 6)/10, pineada por
tests). Los objetivos reales del plan son **vatios absolutos y programas**:
10¹⁶ W despachables, una flota de hives a 1 kg/s, un shell a 10²⁶ W. Si
mañana la convención cambia, el plan no cambia una línea: los vatios mandan.
Ningún documento de este repo puede tratar "K1" como si un número de
Kardashev de 1964 fuera un requisito físico.

## Trabajo hecho (demostración de cadena completa — la plantilla)

**Stock de deuterio de Titán** — la cadena completa, cada eslabón con su
clase:

```
1. Columna de masa atmosférica      P/g = 1,467e5 / 1,352 = 1,085e5 kg/m²   [MEASURED: Huygens P, g]
2. Área de Titán                    4πR² = 8,33e13 m² (R = 2.574,7 km)      [MEASURED: radiometría]
3. Masa atmosférica                 1,085e5 × 8,33e13 = 9,04e18 kg          [DERIVED]
4. Fracción efectiva de CH₄         ~2 % (cae con la altura)                [MEASURED: Huygens GCMS, perfil]
5. Masa de CH₄                      1,8e17 kg                               [DERIVED]
6. D/H en metano                    1,35e-4                                 [MEASURED: Cassini CIRS/INMS]
7. Fracción másica de D en CH₄      4×1,35e-4×2,014/16,043 = 6,78e-5        [DERIVED]
8. STOCK D                          1,8e17 × 6,78e-5 ≈ 1,2e13 kg            [DERIVED → PINNED por test]
```

`core_test.rs::deuterium_stock_matches_derivation` exige que el stock de
`elements.toml` coincida con esta cadena (±10 %). **Si alguien cambia el
stock a mano sin tocar la cadena, el test rompe.** Esa es la plantilla: todo
número [DERIVED] load-bearing lleva su cadena aquí y su test.

## Revisión Hail Mary (cada documento, antes de commit)

1. ¿Cada número tiene etiqueta de procedencia?
2. ¿Las cadenas [DERIVED] muestran unidades y constantes?
3. ¿Cada [ASSUMED] declara qué muere si está ×2 mal?
4. ¿Los gates clase-3 tienen su misión P0 asignada?
5. ¿El reporting en K distingue convención de físico?
