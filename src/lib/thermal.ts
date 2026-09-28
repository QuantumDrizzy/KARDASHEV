/**
 * THERMAL — why the watts have to leave the crust. M6.
 *
 * `docs/THESIS.md` says the singularity is "the moment watts leave the crust".
 * The repo argues that from capture (AM0 beats a desert), from cost (kg/W) and
 * from the grid. It has never argued it from thermodynamics, which is the only
 * argument that cannot be negotiated with.
 *
 * ── The whole module in three lines ──────────────────────────────────────────
 *
 * Every watt a civilization uses ends up as heat. Earth sheds heat by radiating,
 * and Stefan-Boltzmann says P ∝ T⁴, so
 *
 *     ΔT / T  =  (1/4) · ΔP / P
 *
 * The planet currently sheds **122 PW**. Type I is **10¹⁶ W = 8.2% of that**.
 * Run it on the crust from a NEW-heat source and the radiating temperature rises
 * **+5.1 K** — before a single molecule of CO₂ is considered. Which sources
 * count as new is the correction below, and it matters.
 *
 * ── Why nobody talks about this today ────────────────────────────────────────
 *
 * Because today it is genuinely negligible. TES at 19.6 TW is 0.02% of the
 * outgoing flux: **+0.010 K**. Anthropogenic radiative forcing is ~3 W/m²
 * against waste heat's 0.038 W/m², so greenhouse beats direct heat by ~75×.
 * Waste heat is a rounding error and treating it as one is correct — now.
 *
 * It stops being correct at scale, and the crossover is computable: at
 * **~1,530 TW** waste heat alone equals all of today's greenhouse forcing.
 *
 * ── The consequence for Type I ───────────────────────────────────────────────
 *
 * Under a +0.1 K thermal budget the terrestrial ceiling is **192 TW** — about
 * ten times today. The gap to Type I is ×509. So the crust can carry roughly
 * **2% of Type I** and no more.
 *
 * **Type I is a 98% orbital problem** — but read the next section before
 * quoting Stefan-Boltzmann as the whole reason, because it is not.
 *
 * What helps is putting the load where it radiates to a 3 K sink instead of
 * into Earth's budget — which is exactly what `physics.ts` costs out in kg/W.
 * This module is why that bench matters.
 *
 * ── [CORRECTION] Not every watt is new heat ──────────────────────────────────
 *
 * A first version of this module computed ΔT from *total* power. That is only
 * right for sources that release energy which was not already entering the
 * atmosphere-surface system. Split them:
 *
 *   NEW heat      fossil, fission, fusion, geothermal — and **anything beamed
 *                 down from orbit**, because those photons would have missed
 *                 Earth entirely.
 *   RECYCLED heat ground solar, wind, hydro, wave. All insolation-derived. A
 *                 ground panel intercepts light that was going to be absorbed
 *                 anyway, converts a fifth of it to electricity, and that
 *                 electricity becomes heat within hours. **Net addition ≈ 0.**
 *
 * So today's +0.010 K is really **+0.0086 K** once the 16% renewable share is
 * excluded, and a hypothetical all-renewable civilization adds no waste heat at
 * all. `deltaTFromMix()` is the honest entry point; `deltaTEffectiveK()` is the
 * all-new-heat case and is now documented as such.
 *
 * ── The conclusion survives, by a different road ─────────────────────────────
 *
 * That correction does not rescue terrestrial Type I; it changes which argument
 * closes it, and there is one for every route:
 *
 *   ground solar   **does not fit**. At 40 W/m² mean it needs 250 million km²
 *                  — 1.7× all the land on Earth, or 49% of the entire planet
 *                  including oceans. Geometry, not thermodynamics.
 *   fusion/fission **+5.1 K**. This is genuinely new heat and the original
 *                  argument applies exactly.
 *   beamed from orbit  **+5.1 K and worse**, because the beam's atmospheric and
 *                  rectenna losses land here too. See `beam.ts`.
 *
 * All three terrestrial-load routes are closed. The only one left is moving the
 * **load** off-planet — which is what the thesis said, and now for stated
 * reasons rather than one over-general one.
 *
 * [KNOWN_LIMIT] Equilibrium, no feedbacks. Water-vapour and ice-albedo
 * feedbacks amplify any forcing, so **+5.1 K is a floor, not an estimate**.
 * Fixed albedo — and covering a large fraction of the planet in panels would
 * change albedo substantially, a forcing this module does not model. Global mean
 * only; power density is a separate and locally worse problem (`localAnomaly`).
 */

import { P_I, P_2023, tw } from "./kardashev.ts";
import { SIGMA } from "./physics.ts";
import { R_EARTH_M } from "./facts.ts";

/** Whole sphere. A rotating planet radiates from all of it. */
export const EARTH_AREA_M2 = 4 * Math.PI * R_EARTH_M ** 2;

/** Outgoing longwave radiation, W/m². CERES/IPCC top-of-atmosphere value. */
export const OLR_W_M2 = 240;

/** What the planet currently sheds to space. ~122 PW. */
export const EARTH_RADIATED_W = OLR_W_M2 * EARTH_AREA_M2;

/** Effective radiating temperature, from σT⁴ = OLR. ~255 K. */
export const T_EFFECTIVE_K = (OLR_W_M2 / SIGMA) ** 0.25;

/** Mean surface temperature. The greenhouse gap is T_S − T_EFF ≈ 33 K. */
export const T_SURFACE_K = 288;

/**
 * Present-day anthropogenic radiative forcing, W/m². Included only to show how
 * far waste heat currently is from mattering, and where that stops being true.
 */
export const GREENHOUSE_FORCING_W_M2 = 3.0;

// ───────────────────────────────────────────────────────────────── the physics

/** Waste-heat flux added to the planet's budget by a given total power. */
export function wasteHeatFluxWm2(powerW: number) {
  return powerW / EARTH_AREA_M2;
}

/**
 * Equilibrium rise in the effective radiating temperature, treating ALL of the
 * given power as new heat. Correct for fossil/fission/fusion/beamed; use
 * `deltaTFromMix` when part of the supply is insolation-derived.
 * P ∝ T⁴ ⇒ ΔT/T = (1/4)·ΔP/P.
 */
export function deltaTEffectiveK(powerW: number) {
  return (T_EFFECTIVE_K / 4) * (powerW / EARTH_RADIATED_W);
}

/** The same without linearizing, for the large-ΔP end. */
export function deltaTEffectiveExactK(powerW: number) {
  return T_EFFECTIVE_K * ((1 + powerW / EARTH_RADIATED_W) ** 0.25 - 1);
}

/**
 * Surface warming, holding the greenhouse structure fixed: if T_S/T_EFF is
 * unchanged then ΔT_S = ΔT_EFF · (T_S/T_EFF). [ASSUMPTION] and a floor —
 * feedbacks only amplify.
 */
export function deltaTSurfaceK(powerW: number) {
  return deltaTEffectiveExactK(powerW) * (T_SURFACE_K / T_EFFECTIVE_K);
}

/** Total power a given temperature budget allows on the crust. */
export function powerCeilingW(deltaTK: number) {
  return ((4 * deltaTK) / T_EFFECTIVE_K) * EARTH_RADIATED_W;
}

/** Power at which waste heat alone matches present greenhouse forcing. */
export function greenhouseCrossoverW() {
  return GREENHOUSE_FORCING_W_M2 * EARTH_AREA_M2;
}

// ─────────────────────────────────────────────────────────────── the verdict

export type ThermalPoint = {
  label: string;
  powerW: number;
  powerTW: number;
  /** Share of the planet's outgoing radiation. */
  fracOfOlr: number;
  fluxWm2: number;
  deltaTEffK: number;
  deltaTSurfaceK: number;
  /** Ratio against today's greenhouse forcing. */
  versusGreenhouse: number;
};

export function thermalPoint(label: string, powerW: number): ThermalPoint {
  return {
    label,
    powerW,
    powerTW: tw(powerW),
    fracOfOlr: powerW / EARTH_RADIATED_W,
    fluxWm2: wasteHeatFluxWm2(powerW),
    deltaTEffK: deltaTEffectiveExactK(powerW),
    deltaTSurfaceK: deltaTSurfaceK(powerW),
    versusGreenhouse: wasteHeatFluxWm2(powerW) / GREENHOUSE_FORCING_W_M2,
  };
}

export const THERMAL_LADDER: ThermalPoint[] = [
  thermalPoint("TES today", P_2023),
  thermalPoint("×10 today", P_2023 * 10),
  thermalPoint("×100 today", P_2023 * 100),
  thermalPoint("Type I on the crust", P_I),
];

export type CrustBudget = {
  deltaTBudgetK: number;
  ceilingW: number;
  ceilingTW: number;
  /** How many times today's TES that ceiling is. */
  headroomX: number;
  /** Share of Type I that fits under the budget. */
  fracOfTypeI: number;
  /** Share of Type I that therefore cannot be on the crust. */
  mustLeaveFrac: number;
};

export function crustBudget(deltaTBudgetK: number): CrustBudget {
  const ceilingW = powerCeilingW(deltaTBudgetK);
  return {
    deltaTBudgetK,
    ceilingW,
    ceilingTW: tw(ceilingW),
    headroomX: ceilingW / P_2023,
    fracOfTypeI: ceilingW / P_I,
    mustLeaveFrac: 1 - ceilingW / P_I,
  };
}

// ──────────────────────────────────────────── new heat vs recycled heat

export type HeatClass = "new" | "recycled";

export type Source = { id: string; label: string; heat: HeatClass; why: string };

export const SOURCES: Source[] = [
  { id: "fossil", label: "Fossil", heat: "new", why: "Releases stored chemical energy into the current budget." },
  { id: "fission", label: "Fission", heat: "new", why: "Releases nuclear binding energy." },
  { id: "fusion", label: "Fusion", heat: "new", why: "Releases nuclear binding energy. Being clean does not make it cold." },
  { id: "geothermal", label: "Geothermal", heat: "new", why: "Moves interior heat to the surface faster than it would arrive." },
  { id: "beamed", label: "Solar beamed from orbit", heat: "new", why: "Collects photons that would have missed Earth entirely." },
  { id: "groundSolar", label: "Ground solar", heat: "recycled", why: "Intercepts light already destined to be absorbed." },
  { id: "wind", label: "Wind", heat: "recycled", why: "Insolation-derived; the energy was already in the system." },
  { id: "hydro", label: "Hydro", heat: "recycled", why: "Insolation-derived, via evaporation." },
];

export const isNewHeat = (id: string) => SOURCES.find((s) => s.id === id)?.heat === "new";

/** Present split of world TES. [ASSUMPTION] order of magnitude. */
export const TODAY_NEW_HEAT_FRACTION = 0.84;

/** Only the new-heat share loads the planet's radiator. */
export function netNewHeatW(powerW: number, newHeatFraction = TODAY_NEW_HEAT_FRACTION) {
  return powerW * newHeatFraction;
}

/** The honest ΔT: total power, minus the part that was already in the budget. */
export function deltaTFromMix(powerW: number, newHeatFraction = TODAY_NEW_HEAT_FRACTION) {
  return deltaTEffectiveExactK(netNewHeatW(powerW, newHeatFraction));
}

// ─────────────────────────────────── the other terrestrial ceiling: geometry

/** Mean insolation at the surface on usable land, W/m². [ASSUMPTION] */
export const LAND_INSOLATION_W_M2 = 200;
export const GROUND_PV_EFFICIENCY = 0.2;
/** Earth land area, m². */
export const LAND_AREA_M2 = 1.49e14;

/**
 * Ground solar does not run into a thermal wall — it runs into the planet.
 * [RESULT] Type I needs 250 million km² of panel: 1.7x all the land there is.
 */
export function groundSolarAreaM2(powerW: number) {
  return powerW / (LAND_INSOLATION_W_M2 * GROUND_PV_EFFICIENCY);
}

export function groundSolarLandFraction(powerW: number) {
  return groundSolarAreaM2(powerW) / LAND_AREA_M2;
}

export function groundSolarPlanetFraction(powerW: number) {
  return groundSolarAreaM2(powerW) / EARTH_AREA_M2;
}

/**
 * Local power density is a separate and worse problem: a datacentre campus or a
 * city dumps its heat into a patch, not into 5.1×10¹⁴ m². Returns the flux and
 * the local equilibrium anomaly for a given power over a given footprint.
 * [KNOWN_LIMIT] Ignores advection, which is what actually saves cities.
 */
export function localAnomaly(powerW: number, areaKm2: number) {
  const fluxWm2 = powerW / (areaKm2 * 1e6);
  return {
    fluxWm2,
    versusSolarAbsorbed: fluxWm2 / OLR_W_M2,
    deltaTLocalK: T_EFFECTIVE_K * ((1 + fluxWm2 / OLR_W_M2) ** 0.25 - 1),
  };
}

/**
 * Orbital compute never enters this budget: it radiates to a 3 K sink through
 * `physics.ts`'s σT⁴ radiators. That is the physical content of "watts leave
 * the crust" — not a preference, a heat-rejection path.
 */
export const WHY_ORBIT = {
  crustHasOneRadiator: true,
  /** [CORRECTED] Only new-heat sources load the radiator. */
  everyWattBecomesHeat: false,
  /** [CORRECTED] It very much depends on the source — that is the whole point. */
  sourceIndependent: false,
  /** Every terrestrial route is closed, but each by a different argument. */
  terrestrialRoutesClosed: {
    groundSolar: "geometry — 1.7x all Earth land",
    fusionOrFission: "thermal — +5.1 K of genuinely new heat",
    beamedFromOrbit: "thermal — +5.1 K, plus the beam losses land here too",
  },
  note:
    "Fusion does not help: its output is new heat. Ground solar does not add " +
    "heat at all — it recycles insolation already in the budget — but Type I " +
    "from it needs 1.7x the planet's land. Orbit sheds to 3 K and never loads " +
    "Earth's budget, and only if the LOAD is there, not just the generation.",
} as const;
