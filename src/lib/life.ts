/**
 * Biosphere + health. Type I is the planet as instrument — not HANPP.
 *
 * NPP: Field et al. ~105 Pg C/yr. ~39 kJ/gC → ~130 TW.
 * Metabolic humans: ~120 W × 8.2e9 ≈ 1 TW. Food system is larger.
 */

import { POPULATION as POPULATION_SHARED } from "./constants.ts";

export const POPULATION = POPULATION_SHARED;
export const LIFE_EXPECTANCY = 73.4;
export const HALE = 63.7;
export const HUMAN_WATT = 120;
export const BRAIN_WATT = 20;
export const METABOLIC_W = POPULATION * HUMAN_WATT;
export const NPP_TW = 130;
export const NPP_W = NPP_TW * 1e12;
export const HANPP_FRAC = 0.25;
export const HANPP_W = NPP_W * HANPP_FRAC;
export const OCEAN_NPP_FRAC = 0.47;
export const LEO_MSV_DAY = 0.5;
export const CAREER_SV = 1;
export const ISS_MSV_YR = 180;

export const BOUNDARIES = [
  {
    id: "climate",
    name: "Climate",
    status: "overshoot",
    note: "CO₂ ~425 ppm. Forcing ~2.7 W/m². Thermal Type I on the crust cooks the Holocene.",
  },
  {
    id: "biosphere",
    name: "Biosphere integrity",
    status: "overshoot",
    note: "Extinction 10–100× background. NPP is not a 10,000 TW stock.",
  },
  {
    id: "land",
    name: "Land use",
    status: "overshoot",
    note: "~75% of ice-free land altered. Desert solar ≠ clearing for HANPP.",
  },
  {
    id: "N",
    name: "Nitrogen",
    status: "overshoot",
    note: "Haber-Bosch already rivals the cycle. More food watts is not Type I.",
  },
  {
    id: "freshwater",
    name: "Freshwater",
    status: "risk",
    note: "The AGI ceiling on Earth is water, not FLOPS.",
  },
  {
    id: "ocean",
    name: "Acidification",
    status: "risk",
    note: "pH −0.1. AM0 in orbit does not acidify. Coal does.",
  },
] as const;

export const HEALTH = [
  { k: "Population", v: "8.2×10⁹", note: "UN 2025. The operator of K." },
  { k: "Lifespan", v: "73.4 yr", note: "UN e0. HALE 63.7 — years lived in health." },
  { k: "Metabolism", v: "0.98 TW", note: "8.2e9 × 120 W. All human flesh < 1 TW." },
  { k: "Brain", v: "20 W", note: "Per head. 0.16 TW of neurons. ASI does not fit there." },
  { k: "LEO dose", v: "0.3–1 mSv/d", note: "ISS ~180 mSv/yr. Career ~1 Sv. A body is not a five-year sat." },
  { k: "HALE gap", v: "9.7 yr", note: "Sick years. Raising K with broken operators is theatre." },
] as const;
