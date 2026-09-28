/**
 * M22 — DENSITY. The property M20 called a lever, seen from the other side.
 *
 * M20's result was that `c* ∝ √(T_c/M)`, so **the lever is molar mass** — light
 * exhaust, fast exhaust, and that is why LOX/LH2 leads every chemical pair on
 * specific impulse. M20 then listed what it did not model and named the honest
 * gap: "no chamber pressure limit, which is what actually decides whether an
 * engine is buildable."
 *
 * This module closes it, and finds that the answer is the *same property*
 * measured on the other side of the tank wall.
 *
 * **Hydrogen is light. That is exactly why its exhaust is fast and exactly why
 * its tank is enormous.** One atomic fact, helping in the nozzle and hurting
 * everywhere upstream of it.
 *
 * **[RESULT] Density impulse reverses the ranking.**
 *
 * The figure of merit that carries both effects is `ρ_bulk · Isp` — how much
 * impulse a cubic metre of loaded propellant is worth, rather than a kilogram:
 *
 *     pair        ρ_bulk    Isp     ρ·Isp     vs LH2
 *     LOX/LH2     362       452.3   163,700   1.00
 *     LOX/CH4     833       380     316,700   **1.93**
 *     LOX/RP-1   1,017      348     354,000   **2.16**
 *
 * LH2 wins Isp by **×1.30** and loses bulk density by **×2.81**. On volume, RP-1
 * is worth **more than twice as much per cubic metre**, and that is the whole
 * reason kerosene and methane first stages exist.
 *
 * **[RESULT] And the pump work is brutal.** Pump power is `ṁ·Δp/(ρ·η)`, so it is
 * inversely proportional to density. At the same pressure rise, moving a
 * kilogram of hydrogen costs **×11.4** the pump work of a kilogram of kerosene.
 * That is why an RS-25 needs a 50 MW-class fuel turbopump to feed a 2 MN engine.
 *
 * **[VALIDATION] Against two flown engines, consistently.** The model gives
 * 91 MW total pump power for RS-25 against ~73 MW published, and 39 MW for
 * Raptor against ~30 MW. Both **over by 25–30%**, in the same direction — which
 * is the signature of an assumed efficiency that is too low and discharge
 * pressures that are generous, not of a broken model. As in M14: **only the
 * ratios are quoted**, and η cancels out of every one of them.
 *
 * **[FEEDS M21] Does hydrogen's Isp advantage survive its own tanks?**
 *
 * A tank's mass scales with the volume it encloses, so a ×2.81 volume penalty
 * lands directly on M21's structural coefficient ε — the number M21 flagged as
 * assumed and load-bearing. Run M21's two-stage GEO case with each pair carrying
 * its own ε and the answer is not the one M20 alone would predict.
 *
 * The answer is sharper than expected, and it was not predicted before running it:
 *
 *     pair        Isp     ε        payload fraction to GEO
 *     LOX/LH2    452.3   0.152     **1.03%**
 *     LOX/CH4    380     0.089     **1.03%**
 *     LOX/RP-1   348     0.080     0.66%
 *
 * **Methane exactly matches hydrogen.** LH2's whole 19% specific-impulse
 * advantage over CH4 is cancelled, to two decimal places, by the tanks that
 * advantage costs. Hydrogen buys nothing here — it only moves where the mass
 * sits.
 *
 * That is not a result this module set out to find, and it is the cleanest
 * available explanation for why the industry converged on methane for
 * reusable vehicles: at equal payload you would rather have the dense
 * propellant, the small tanks and the 16 MW pump than the huge tanks and the
 * 50 MW one.
 *
 * Both still beat kerosene, so Isp has not stopped mattering — the reversal is
 * specific and it lands exactly between hydrogen and methane.
 *
 * [KNOWN_LIMIT] Storage densities at normal boiling point, no ullage, no
 * insulation mass, no boil-off — and boil-off is a real operational cost for
 * hydrogen that nothing here models. Mixture ratios are each engine's own.
 * Discharge pressures are estimated from chamber pressure, and pump efficiency
 * is a single assumed figure for every pump on every engine.
 */

import { PROPELLANTS } from "./engine.ts";
import { STRUCTURAL_COEFFICIENT, stagedFlight } from "./staging.ts";
import { deltaVToGeo } from "./transfer.ts";

/** [PUBLISHED] Storage densities at normal boiling point, kg/m³. */
export const DENSITY = {
  lh2: 71,
  ch4: 423,
  rp1: 810,
  lox: 1141,
} as const;

/** [ASSUMED] Turbopump total efficiency. Cancels out of every ratio here. */
export const PUMP_EFFICIENCY = 0.7;

export type Vehicle = {
  id: string;
  fuelDensity: number;
  /** Oxidiser-to-fuel mass ratio, each engine's own. */
  mixtureRatio: number;
  /** [PUBLISHED] Total propellant mass flow, kg/s. */
  massFlowKgS: number;
  /** [ASSUMED] Pump discharge pressure, Pa — estimated above chamber pressure. */
  dischargePa: number;
  /** [PUBLISHED] Total turbopump shaft power, W. The validation anchor. */
  publishedPumpW: number;
};

/** Each engine's feed system, keyed to the propellant pairs M20 already models. */
export const VEHICLES: Record<string, Vehicle> = {
  "lox-lh2": {
    id: "lox-lh2",
    fuelDensity: DENSITY.lh2,
    mixtureRatio: 6.0,
    massFlowKgS: 514,
    dischargePa: 450e5,
    publishedPumpW: 73e6,
  },
  "lox-ch4": {
    id: "lox-ch4",
    fuelDensity: DENSITY.ch4,
    mixtureRatio: 3.6,
    massFlowKgS: 650,
    dischargePa: 350e5,
    publishedPumpW: 30e6,
  },
  "lox-rp1": {
    id: "lox-rp1",
    fuelDensity: DENSITY.rp1,
    mixtureRatio: 2.36,
    massFlowKgS: 236,
    dischargePa: 150e5,
    publishedPumpW: 5e6,
  },
};

/**
 * Bulk density of a loaded propellant pair, kg/m³.
 *
 * Volume-weighted, not mass-weighted: `(1+MR) / (1/ρ_f + MR/ρ_ox)`. This is what
 * the tank actually has to hold.
 */
export function bulkDensity(fuelDensity: number, mixtureRatio: number, oxDensity: number = DENSITY.lox): number {
  return (1 + mixtureRatio) / (1 / fuelDensity + mixtureRatio / oxDensity);
}

/** Pump work per kilogram, J/kg: `Δp/(ρ·η)`. Inversely proportional to density. */
export function pumpWorkPerKg(dischargePa: number, density: number, efficiency: number = PUMP_EFFICIENCY): number {
  return dischargePa / (density * efficiency);
}

export type PumpBudget = {
  fuelW: number;
  oxidiserW: number;
  totalW: number;
  publishedW: number;
  errorFrac: number;
};

/** Shaft power to feed an engine, split by side. */
export function pumpBudget(v: Vehicle, efficiency: number = PUMP_EFFICIENCY): PumpBudget {
  const fuelFlow = v.massFlowKgS / (1 + v.mixtureRatio);
  const oxFlow = v.massFlowKgS - fuelFlow;
  const fuelW = fuelFlow * pumpWorkPerKg(v.dischargePa, v.fuelDensity, efficiency);
  const oxidiserW = oxFlow * pumpWorkPerKg(v.dischargePa, DENSITY.lox, efficiency);
  return {
    fuelW,
    oxidiserW,
    totalW: fuelW + oxidiserW,
    publishedW: v.publishedPumpW,
    errorFrac: (fuelW + oxidiserW) / v.publishedPumpW - 1,
  };
}

export type DensityResult = {
  id: string;
  label: string;
  bulkDensity: number;
  ispS: number;
  /** ρ_bulk · Isp — impulse per cubic metre rather than per kilogram. */
  densityImpulse: number;
  /** Cubic metres of tank per tonne of propellant. */
  volumePerTonneM3: number;
  pump: PumpBudget;
};

export function densityResults(): DensityResult[] {
  return PROPELLANTS.map((p) => {
    const v = VEHICLES[p.id];
    const rho = bulkDensity(v.fuelDensity, v.mixtureRatio);
    return {
      id: p.id,
      label: p.label,
      bulkDensity: rho,
      ispS: p.publishedIspVac,
      densityImpulse: rho * p.publishedIspVac,
      volumePerTonneM3: 1000 / rho,
      pump: pumpBudget(v),
    };
  });
}

/**
 * [RESULT] The reversal, as one number.
 *
 * LH2 leads on Isp and trails on density impulse. Both ratios matter and they
 * point opposite ways, which is the entire content of this module.
 */
export function reversal() {
  const rs = densityResults();
  const lh2 = rs.find((r) => r.id === "lox-lh2")!;
  const rp1 = rs.find((r) => r.id === "lox-rp1")!;
  return {
    ispAdvantageOfLh2: lh2.ispS / rp1.ispS,
    densityImpulseAdvantageOfRp1: rp1.densityImpulse / lh2.densityImpulse,
    bulkDensityPenaltyOfLh2: rp1.bulkDensity / lh2.bulkDensity,
    pumpWorkPenaltyOfLh2: pumpWorkPerKg(300e5, DENSITY.lh2) / pumpWorkPerKg(300e5, DENSITY.rp1),
  };
}

// ────────────────────────────────────────────────────────── back into M21

/**
 * [ASSUMED] Share of a stage's structural coefficient that scales with tank
 * volume rather than with thrust structure, engines and avionics. Half is a
 * round figure and the conclusion is swept against it.
 */
export const TANK_SHARE_OF_STRUCTURE = 0.5;

/**
 * Structural coefficient implied by a propellant's bulk density.
 *
 * M21's ε = 0.08 is calibrated on a dense-propellant stage. The tank-driven part
 * of it scales inversely with bulk density, so a low-density pair carries a
 * heavier stage for the same propellant mass.
 */
export function structuralCoefficientFor(
  bulkDensityKgM3: number,
  o: { reference?: number; base?: number; tankShare?: number } = {},
): number {
  const reference = o.reference ?? bulkDensity(DENSITY.rp1, 2.36);
  const base = o.base ?? STRUCTURAL_COEFFICIENT;
  const tankShare = o.tankShare ?? TANK_SHARE_OF_STRUCTURE;
  return base * (1 - tankShare) + base * tankShare * (reference / bulkDensityKgM3);
}

export type StageComparison = {
  id: string;
  label: string;
  ispS: number;
  structuralCoefficient: number;
  payloadFraction: number;
};

/**
 * [FEEDS M21] Each pair run through M21's two-stage GEO case, carrying its own
 * density-implied ε rather than a single assumed one.
 *
 * This is the question M20 alone could not answer: does hydrogen's specific
 * impulse survive its own tanks?
 */
export function stageComparison(stages = 2, deltaVMs: number = deltaVToGeo()): StageComparison[] {
  return densityResults().map((r) => {
    const eps = structuralCoefficientFor(r.bulkDensity);
    return {
      id: r.id,
      label: r.label,
      ispS: r.ispS,
      structuralCoefficient: eps,
      payloadFraction: stagedFlight(deltaVMs, stages, { ispS: r.ispS, structuralCoefficient: eps }).payloadFraction,
    };
  });
}

export const DENSITY_VERDICT = {
  headline: "Hydrogen is light: that is why its exhaust is fast and why its tank is enormous. One fact, twice.",
  /** The result the module did not expect to find. */
  methaneMatchesHydrogen:
    "Carrying its own density-implied structural coefficient, LOX/CH4 gives the same payload " +
    "fraction to GEO as LOX/LH2. Hydrogen's 19% Isp advantage is exactly cancelled by its tanks.",
  correctsNothing:
    "M20's molar-mass result stands. This is the same property costed on the other side of the tank wall.",
  /**
   * [KNOWN_LIMIT]
   *
   *  - Storage densities at normal boiling point. No ullage, no insulation mass,
   *    no boil-off — and boil-off is a real operational cost for hydrogen that
   *    nothing here models, so the hydrogen case is flattered.
   *  - Discharge pressures are estimated above chamber pressure, and one pump
   *    efficiency is assumed for every pump on every engine. Absolute pump power
   *    comes out 25-30% high on both validated engines, consistently; quote the
   *    ratios, where efficiency cancels.
   *  - `TANK_SHARE_OF_STRUCTURE` is a round half. The stage comparison is a
   *    sensitivity study, not a design.
   *  - Tank mass is taken proportional to volume at fixed pressure. Real tanks
   *    scale with surface area, so this overstates the penalty for very large
   *    tanks and understates it for small ones.
   */
  limits: "boiling-point densities, no boil-off, one assumed pump efficiency, tank share is a round half",
} as const;
