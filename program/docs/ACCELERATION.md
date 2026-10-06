# ACCELERATION — Does the acceleration buy the Type I?
## The demand loop, the gate compression, and the 2040 scoreboard

> Pregunta: 1990–2000 no había nada de lo actual; la IA y la cuántica
> aceleran todo. ¿Cuánto compra esa aceleración en la escalera?
> Respuesta corta: mueve el K1 de **~2375 a ~2150–2240** — si el lazo
> watts→inteligencia→valor se sostiene. Este doc formaliza por qué, con
> qué sensibilidad, y qué scoreboard de 2040 lo falsa.

---

## 1. Las dos aceleraciones (y la trampa entre ellas)

### 1.1 Demanda: watts → cómputo → inteligencia → valor (nueva, real, medida)
Históricamente la energía crecía por población + PIB per cápita: un tirón
lento y geopolítico. Lo nuevo: **existe por primera vez un demandante que
monetiza vatios directamente**. Los data centers pasaron de curiosidad a
cliente nuclear: Microsoft/Three Mile Island, Google/Kairos, Amazon/
X-energy — contratos firmados 2024 `[MEASURED]`. IEA: electricidad de data
centers 415 TWh (2024) → ~945 TWh (2030), ~15 %/año `[MEASURED projection]`.

Consecuencia estructural: **la energía deja de ser cost-center y pasa a ser
product-line.** Eso cambia la política (quién financia el K1) más que la
física. Es el primer motor de la historia que paga su propia escalada.

### 1.2 Oferta: la IA como compresor de ingeniería
- Control de plasma por RL en tokamaks (DeepMind+EPFL, TCV 2022) `[MEASURED demo]`
- Descubrimiento de materiales a escala (GNoME: 2,2 M de cristales) `[MEASURED]`
- Diseño de chips, de lanzadores, de fábricas — cada gate de PHASE0 tiene
  un factor de compresión IA candidato `[ASSUMED: factor 1,5–2× por gate;
  sensibilidad: ±10–20 años por gate, no siglos]`

### 1.3 La trampa (el contrapeso honesto)
**Los átomos son más lentos que los bits.** La aceleración informacional
no traduce 1:1 a energía: un tokamak, una PSP de GW y una mina lunar tienen
colas de construcción físicas y regulatorias que ningún LLM comprime.
La aceleración real opera por **apertura de gates**, no por incremento del
% de crecimiento como deseo. Y el dial 1 medido sigue en +1,8 %: la
demanda-IA aún es ~0,5 % del primario. El 2040 dirá si es ruido o régimen.

## 2. Escenarios (la aritmética completa, t = ln(500)/ln(1+r))

| r (crecimiento sostenido) | Años hasta K1 | Año K1 | Qué lo produce |
|---|---:|---:|---|
| 1,8 % (tendencia medida) | 348 | **2374** | negocio como siempre |
| 2,5 % | 252 | 2278 | Global Sur + electrificación plena |
| 3,0 % | 210 | 2236 | el lazo watts→IA se sostiene `[ASSUMED]` |
| 4,0 % | 158 | 2185 | lazo + fusión a mitad de siglo + SSP a escala |
| 5,0 % | 127 | 2153 | todo lo anterior + bucle industrial espacial τ<10 a |

Lectura honesta: **el dial que más compra no es la IA-oferta sino el
crecimiento de la demanda** (de 1,8 % a 3 % compra ~140 años). La IA-oferta
(apertura de gates) compra décadas. Las dos juntas: **2150–2240 es la banda
acelerada honesta**, contra 2374 de tendencia.

`[CORRECTION LOG 2026-10-06]`: PHASE0 decía "~2350" para la tendencia
medida; la aritmética exacta da 348 años → **2374**. Corregido aquí y en
PHASE0/AUDIT. El estándar se aplica a este repo también.

## 3. El scoreboard 2040 (cómo se falsa la tesis de aceleración)

Cuatro hitos, medibles, con fecha. La tesis aceleracionista exige **≥2 de 4
para 2040**; menos de 2 = la demanda-IA era ruido y volvemos a la línea de
tendencia:

| # | Hito 2040 | Dial que mueve | Estado 2026 |
|---|---|---|---|
| S1 | Crecimiento primario sostenido > 2,5 %/año (media 2026–2040) | 1 | 1,8 % hoy |
| S2 | Lanzamiento <$500/kg a cadencia comercial (>100 vuelos/año clase) | 2 | en test |
| S3 | Un piloto de fusión con electricidad neta conectada | 1 | SPARC/ITER en camino |
| S4 | Demo de energía solar espacial a nivel MW facturando | 1–2 | SSPD-1 (2023) fue el primer ladrillo |

El scoreboard es **el primer instrumento del programa**: cada año se marca
la trayectoria contra estos cuatro, y la ETA de K1 se re-publica con los
datos, no con la fe. Es el mismo contrato de `data/kpi.csv`, con fecha.

## 4. El evento real de aceleración: el bucle industrial (τ del espacio)

La aceleración definitiva no es el % anual terrestre — es que el bucle de
INVICTUS se encienda antes de 2100: lanzamiento → industria orbital →
lanzamiento más barato → más industria. La condición de cruce, medible:

$$\$/\mathrm{kWh}_{orbital} < \$/\mathrm{kWh}_{terrestre\ marginal}$$

Hoy el orbital está a ×10–100 `[EST]`. Cada mitad en el dial 2 acerca el
cruce. Cuando cruza, el crecimiento deja de ser demanda-pull terrestre y
pasa a ser oferta-pull industrial con su propio τ — ese es el instante en
que la escalera deja de depender de la política terrestre. **La IA es
candidata a ser lo que enciende ese bucle** (ensamblaje autónomo, fábricas
robotizadas), y por eso esta doc y PHASE0 le dan peso doble a S2.

## 5. Qué cambia HOY por la aceleración (prioridades, no fe)

1. **Peso doble a S2 y S3** (lanzamiento y fusión): son los dos gates que
   la IA comprime más y que más años compran.
2. **La demanda-IA se deja crecer** (no es un enemigo del clima, es el
   cliente que financia la escalada — con el chequeo de calor residual de
   PHASE0 como límite honesto).
3. **Los P0 assay no cambian**: la información vale igual.
4. **Scoreboard anual**: kpi.csv + los cuatro S; la ETA de K1 se re-publica
   con datos. Fe no entra en el repo.

## 6. Veredicto

**Le tiramos — y la aceleración es real pero compra bandas, no milagros:**
tendencia 2374 → lazo de demanda sostenido 2236 → lazo + gates abiertos
2153–2185. La diferencia entre 2374 y 2153 no la decide la fe en la IA: la
deciden cuatro números medibles antes de 2040. El programa ya los está
mirando.
