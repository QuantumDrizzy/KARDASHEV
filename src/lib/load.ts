/**
 * M15 — THE LOAD. Weighing the thing the whole thesis is about.
 *
 * The thesis is one sentence: *the singularity is the moment watts leave the
 * crust*. Nine modules have costed the power station that makes those watts —
 * collector area, radiator mass, lift, sourcing, environment, placement,
 * transfer. **Not one of them has weighed the load.**
 *
 * That is a hole in the middle of the argument, and it is the largest number in
 * the repo.
 *
 * Any load dissipating 10¹⁶ W has mass, and its mass is `P / (W/kg)`. At the
 * specific power of a real datacentre rack — ~100 W/kg including memory,
 * interconnect and power delivery — the load masses **10¹⁴ kg**. Against what a
 * century at 100 flights/day can actually put at GEO (M14: 1.32e11 kg) that is
 *
 *     **759 centuries of launch, for the load alone.**
 *
 * [CORRECTED] The first draft of this said the power station was "a rounding
 * error against the thing it powers". It is not, and the test caught it. Against
 * the collector built from *real* hardware — 29.7e12 m² at 2.24 kg/m², 66.5 Gt —
 * the load is **×1.5**, and against M10's collector-plus-radiator system it adds
 * **74%**. Comparable, not dominant. The ×759 is against the *deliverable*
 * budget, which is the right denominator for feasibility and the wrong one for
 * comparing two pieces of hardware. Both numbers are true and they answer
 * different questions; the mistake was quoting one where the other belonged.
 *
 * What is fair to say is narrower and still damning: **every mass total in the
 * chain was ~40% low, because the load was missing from all of them.**
 *
 * **[RESULT] And the load's mass is almost entirely an architecture choice.**
 * At rack specific power the load is 150% of the collector; as a self-radiating
 * die it is **1.4%**. The same 10¹⁶ W, a factor of a hundred apart in mass,
 * decided by how the heat leaves the silicon.
 *
 * **The lever is architectural, and M10 half-named it already.** A
 * radiator at 3.5 kg/m² and 320 K rejects 505 W/m², so it caps the system at
 * **144 W/kg** — whatever the chip does. But a *thinned die radiating from its
 * own two faces* at 400 K and 100 µm reaches **10,591 W/kg**, which is **×73
 * better**. At Type I scale you do not bolt chips to radiators. **You make the
 * chip the radiator**, and M10's radiator mass becomes an artefact of the wrong
 * architecture.
 *
 * **What it would take.** Fitting the load inside one century of launch — with
 * nothing left over for the collector — needs **75,900 W/kg**. By self-radiation
 * that is a **14 µm die at 400 K**, or 10 µm at 368 K, or 100 µm at 654 K. The
 * first two are thinner than any die in production and the third is far past
 * where silicon logic works. So the wall is real, but it is made of **die
 * thinning and junction temperature**, not of thermodynamics — the same lever
 * M10 found for the radiator, pushed much harder.
 *
 * **[CORRECTS M13] And the array cannot be geostationary.** M13 solved the
 * climate floor using the collector area alone. M10's radiator adds 19.8e12 m²
 * to the same shell, the floor scales as √A, and it moves from 38,960 km to
 * **50,290 km — 119% of GEO**. Two modules that were each right in isolation
 * were never multiplied together.
 *
 * **Where this leaves the chain.** The load has to be built off-planet too, for
 * the same reason the collector does — a third independent road to M11. But M11's
 * ≥99.98%-lunar requirement was posed for a *solar film*, where regolith supplies
 * silicon, aluminium and oxygen. Posed for **semiconductors** it is a far harder
 * question, and this module does not answer it.
 */

import { P_I } from "./kardashev.ts";
import { SIGMA } from "./constants.ts";
import { TYPE_I_AREA_M2 } from "./collector.ts";
import { RADIATOR_EMISSIVITY, RADIATOR_KG_M2, radiatorFluxWm2 } from "./reject.ts";
import { climateFloorRadiusM } from "./placement.ts";
import { destinationPenalty } from "./transfer.ts";

/** [PUBLISHED] Silicon density, kg/m³. */
export const SILICON_DENSITY = 2330;

/**
 * [ASSUMED] Reference specific powers for computing hardware, W/kg.
 *
 * `rack` is a real datacentre rack including chassis, memory, interconnect and
 * power delivery — the only one of these that is a measured system. `board` and
 * `die` strip layers away and are stated as bounds on where the mass could go,
 * not as achieved figures.
 */
export const SPECIFIC_POWER_W_KG = {
  rack: 100,
  board: 1000,
  die: 7000,
} as const;

// ────────────────────────────────────────────────── what a kilogram can shed

/**
 * The system ceiling M10 implies without stating: a radiator at `RADIATOR_KG_M2`
 * and temperature T rejects `εσT⁴` per m², so it can only ever carry
 * `εσT⁴ / (kg/m²)` watts per kilogram — **144 W/kg at 320 K**, whatever the
 * electronics attached to it can do.
 */
export function radiatorSpecificPowerWKg(tK = 320, kgM2: number = RADIATOR_KG_M2): number {
  return radiatorFluxWm2(tK) / kgM2;
}

/**
 * [RESULT] A die that radiates from its own two faces: `2εσT⁴ / (ρ·t)`.
 *
 * At 400 K and 100 µm this is 10,591 W/kg — **×73 the radiator ceiling above**.
 * The reason is simply that a thinned die is 0.23 kg/m² against a radiator's
 * 3.5, and it has two faces. This is the mass-optimal architecture for an
 * orbital load and it makes M10's separate radiator unnecessary.
 */
export function selfRadiatingSpecificPowerWKg(
  tK = 400,
  thicknessM = 100e-6,
  o: { density?: number; emissivity?: number; faces?: number } = {},
): number {
  const density = o.density ?? SILICON_DENSITY;
  const faces = o.faces ?? 2;
  const emissivity = o.emissivity ?? RADIATOR_EMISSIVITY;
  return (faces * emissivity * SIGMA * tK ** 4) / (density * thicknessM);
}

/** Junction temperature a given thickness needs to reach a target W/kg. */
export function temperatureForSpecificPowerK(
  targetWKg: number,
  thicknessM = 100e-6,
  o: { density?: number; emissivity?: number; faces?: number } = {},
): number {
  const density = o.density ?? SILICON_DENSITY;
  const faces = o.faces ?? 2;
  const emissivity = o.emissivity ?? RADIATOR_EMISSIVITY;
  return ((targetWKg * density * thicknessM) / (faces * emissivity * SIGMA)) ** 0.25;
}

/** Die thickness a given temperature needs to reach a target W/kg. */
export function thicknessForSpecificPowerM(
  targetWKg: number,
  tK = 400,
  o: { density?: number; emissivity?: number; faces?: number } = {},
): number {
  const density = o.density ?? SILICON_DENSITY;
  const faces = o.faces ?? 2;
  const emissivity = o.emissivity ?? RADIATOR_EMISSIVITY;
  return (faces * emissivity * SIGMA * tK ** 4) / (targetWKg * density);
}

// ─────────────────────────────────────────────────────────── the mass itself

/** Mass of a load dissipating `powerW` at a given specific power. */
export function loadMassKg(specificPowerWKg: number, powerW: number = P_I): number {
  return powerW / specificPowerWKg;
}

/**
 * What a century of launch actually delivers to GEO.
 *
 * M7's cadence, corrected by M14's payload penalty. This is the denominator
 * every mass in the chain should have been divided by.
 */
export function deliverableMassKg(
  o: { years?: number; cadencePerDay?: number; payloadKg?: number; toGeo?: boolean } = {},
): number {
  const toLeo = (o.cadencePerDay ?? 100) * 365.25 * (o.years ?? 100) * (o.payloadKg ?? 100_000);
  return (o.toGeo ?? true) ? toLeo / destinationPenalty().payloadPenalty : toLeo;
}

export type LoadCase = {
  label: string;
  specificPowerWKg: number;
  massKg: number;
  /** Multiples of a century of launch at 100 flights/day, delivered to GEO. */
  centuriesOfLaunch: number;
  /** Against the collector's own mass at M8's real areal density. */
  versusCollector: number;
};

export function loadCase(label: string, specificPowerWKg: number, powerW: number = P_I): LoadCase {
  const massKg = loadMassKg(specificPowerWKg, powerW);
  return {
    label,
    specificPowerWKg,
    massKg,
    centuriesOfLaunch: massKg / deliverableMassKg(),
    versusCollector: massKg / (TYPE_I_AREA_M2 * 2.24),
  };
}

/**
 * [RESULT] The ladder that motivates the module.
 *
 * Today's rack puts the load at 759 centuries of launch. Even a bare
 * self-radiating die at 100 µm and 400 K is 7.2. Nothing in the chain has
 * anywhere to put that.
 */
export function loadLadder(): LoadCase[] {
  return [
    loadCase("datacentre rack (today)", SPECIFIC_POWER_W_KG.rack),
    loadCase("M10 radiator ceiling, 320 K", radiatorSpecificPowerWKg()),
    loadCase("board level", SPECIFIC_POWER_W_KG.board),
    loadCase("bare die, conducted", SPECIFIC_POWER_W_KG.die),
    loadCase("self-radiating 100 µm @ 400 K", selfRadiatingSpecificPowerWKg(400, 100e-6)),
    loadCase("self-radiating 10 µm @ 500 K", selfRadiatingSpecificPowerWKg(500, 10e-6)),
  ];
}

/**
 * [RESULT] Inverting for the requirement, the way M7 inverted for areal density.
 *
 * Fitting the load into a share of one century of launch needs `P / (share ×
 * deliverable)`. At the whole century — leaving nothing for the collector —
 * that is **75,900 W/kg**.
 */
export function requiredSpecificPowerWKg(shareOfBudget = 1, powerW: number = P_I): number {
  return powerW / (deliverableMassKg() * shareOfBudget);
}

/** The two ways to reach the requirement, and how far past silicon each is. */
export function requirementRoutes(shareOfBudget = 1) {
  const target = requiredSpecificPowerWKg(shareOfBudget);
  return {
    target,
    byThinning: [400, 450].map((tK) => ({ tK, thicknessM: thicknessForSpecificPowerM(target, tK) })),
    byHeating: [10e-6, 30e-6, 100e-6].map((thicknessM) => ({
      thicknessM,
      tK: temperatureForSpecificPowerK(target, thicknessM),
    })),
  };
}

// ────────────────────────────────────────────── what the radiator does to M13

export type FloorCorrection = {
  collectorAreaM2: number;
  radiatorAreaM2: number;
  totalAreaM2: number;
  /** M13's floor, computed from the collector alone. */
  collectorOnlyFloorM: number;
  /** The floor once M10's radiator is on the same shell. */
  correctedFloorM: number;
  /** Corrected floor over geostationary radius. */
  versusGeo: number;
};

/**
 * [CORRECTS M13] The array cannot be geostationary.
 *
 * M13 solved the climate floor from the collector area alone. M10 established
 * that an orbital load must also carry 19.8e12 m² of radiator, which sits on the
 * same shell and shades the same sunlight. Shading scales as area and the floor
 * as √A, so 1.67× the area moves the floor 1.29× — from 38,960 km to **50,290
 * km, or 119% of geostationary radius**.
 *
 * Both modules were right in isolation. Nobody had multiplied them.
 *
 * [KNOWN_LIMIT] The radiator also emits toward Earth. From GEO, Earth intercepts
 * 0.57% of an isotropic emission, so 10¹⁶ W of rejection delivers 5.7e13 W to
 * Earth — **+0.030 K**, which partially offsets the extra shading. Not netted
 * here, because the split depends on radiator orientation, which nothing in this
 * repo models.
 */
export function floorCorrection(radiatorTK = 320): FloorCorrection {
  const radiatorAreaM2 = P_I / radiatorFluxWm2(radiatorTK);
  const totalAreaM2 = TYPE_I_AREA_M2 + radiatorAreaM2;
  const collectorOnlyFloorM = climateFloorRadiusM(0.1, TYPE_I_AREA_M2);
  const correctedFloorM = climateFloorRadiusM(0.1, totalAreaM2);
  return {
    collectorAreaM2: TYPE_I_AREA_M2,
    radiatorAreaM2,
    totalAreaM2,
    collectorOnlyFloorM,
    correctedFloorM,
    versusGeo: correctedFloorM / 4.2164e7,
  };
}

/** Warming from the radiator's own infrared reaching Earth, K. */
export function radiatorWarmingK(orbitRadiusM = 4.2164e7, powerW: number = P_I): number {
  const earthShare = (1 - Math.cos(Math.asin(6.371e6 / orbitRadiusM))) / 2;
  return 0.25 * ((powerW * earthShare) / 1.22e17) * 255.06;
}

export const LOAD_VERDICT = {
  headline: "The chain weighed the power station and never weighed the load. The load is 759 centuries of launch.",
  /**
   * [KNOWN_LIMIT] What this does not do.
   *
   *  - No architecture. "The load" is treated as a mass that dissipates 10¹⁶ W,
   *    with no claim about what it computes. M3 owns Wh/token; this owns kg/W.
   *  - Specific powers are reference points, not a technology forecast. Only
   *    `rack` is a measured system; `board` and `die` are bounds.
   *  - The self-radiating die is pure `2εσT⁴/ρt` geometry. No power delivery, no
   *    interconnect, no substrate, no packaging — all of which carry mass, so
   *    every self-radiating figure here is an optimistic ceiling.
   *  - Silicon logic stops working well before 654 K. This module states the
   *    temperature the mass budget demands and does not claim it is available.
   *  - No radiation tolerance. Chips degrade far faster than M12's film, and at
   *    GEO that is a shorter lifetime feeding straight back into A_max = R·L.
   *  - Whether regolith can make a semiconductor is not modelled anywhere. It is
   *    the question M11 is now carrying and cannot yet answer.
   */
  limits: "no architecture, ceilings not forecasts, no packaging mass, no radiation tolerance",
} as const;
