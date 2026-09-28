/**
 * Playable binding order for /gates.
 *
 * Composes the modules that already computed the chain. No new physics.
 * Heritage has no setter: flight heritage is unmeasured. Dust has no wear
 * rate: Grün's 1 AU meteoroid flux is not imported and is not applied.
 * A cost-learning rate is recorded and never applied to areal density.
 * λ and the 1.8%/yr years are labels. They are not a win condition.
 *
 * Roadmap order: docs/ROADMAP.md §2 (the numbered rows). The watt web is
 * the heat path plus K of the counted watts. Type II and Type III use the
 * Sagan floors and open only when those watts are actually counted.
 */

import { organisationalGap } from "./acceleration.ts";
import { R_EARTH_M } from "./constants.ts";
import { wingArealKgM2 } from "./collector.ts";
import { AASM_1980_CLOSURE, proposedVersusRequired, requiredClosure } from "./closure.ts";
import { LAMBDA, yearsAccelerating, yearsInertial } from "./forecast.ts";
import { earthShareCeiling } from "./isru.ts";
import { P_I, P_II_SAGAN, P_III_SAGAN, P_NOW, kOf } from "./kardashev.ts";
import {
  CURVES,
  ILLUSTRATIVE_MASS_RATE,
  arealGapToGeo,
  gapCases,
  requiredArealRate,
} from "./learning.ts";
import { WORLD_CADENCE_PER_DAY, liftVerdict } from "./lift.ts";
import {
  SPECIFIC_POWER_W_KG,
  floorCorrection,
  loadCase,
  requiredSpecificPowerWKg,
  requirementRoutes,
  selfRadiatingSpecificPowerWKg,
} from "./load.ts";
import { GEO_RADIUS_M } from "./placement.ts";
import { fractionImpliedByClosingTheGap, unaccelerable, verification } from "./qualification.ts";
import { gates } from "./route.ts";
import { firstWall } from "./sequence.ts";
import { minimumStages, stagedFlight } from "./staging.ts";
import { POLE_TO_EQUATOR_M, ROLLING_RESISTANCE, transportCase } from "./surface.ts";
import { arealDensityToGeoKgM2, deltaVToGeo } from "./transfer.ts";

/** load.ts loadLadder / requirementRoutes: 100 µm reference die, not the requirement. */
const REFERENCE_DIE_M = 100e-6;

export type PlayInput = {
  /** Allocated industry power, W. */
  powerW: number;
  /** Radiator orbital radius from Earth's centre, m. */
  radiatorRadiusM: number;
  /** Committed collector areal density, kg/m². */
  arealKgM2: number;
  /**
   * Cost-learning rate on a $/W axis. Stored so the UI can show it.
   * Not an input to any gate.
   */
  costRate: number;
  /** Die thickness, m. */
  dieThicknessM: number;
  /** Junction temperature, K. */
  junctionK: number;
  /** Flights per day the player has built. */
  cadencePerDay: number;
  /** Lunar mass fraction of the mix, 0–1. */
  lunarFraction: number;
};

export type StepMark = "met" | "shut" | "unmeasured" | "absent";

export type PlayStep = {
  n: number;
  id: string;
  title: string;
  mark: StepMark;
};

export type PlayReport = {
  todayW: number;
  wall: {
    powerW: number;
    k: number;
    multipleOfToday: number;
    doublings: number;
    budgetK: 0.1;
  };
  allocatedW: number;
  countedW: number;
  k: number;
  heatPath: boolean;
  stranded: boolean;
  typeI: boolean;
  typeIFloorW: number;
  planetaryWeb: boolean;
  typeII: { open: boolean; floorW: number; k: number };
  typeIII: { open: boolean; floorW: number; k: number };
  radiator: {
    earthRadiusM: number;
    floorM: number;
    versusGeo: number;
    geoRadiusM: number;
    playerM: number;
    counts: boolean;
  };
  mass: {
    exists: boolean;
    floorKgM2: number;
    committedKgM2: number;
    wingKgM2: number;
    filedGapX: number;
    remainingX: number;
    met: boolean;
    costRate: number;
    costQuantity: string;
    appliedToMass: false;
    requiredArealRate: number;
    illustrativeMassRate: number;
    illustrativeCloses: boolean;
  };
  chip: {
    exists: boolean;
    achievedWKg: number;
    requiredWKg: number;
    rackWKg: number;
    gapX: number;
    centuriesOfLaunch: number;
    filedJunctionK: number;
    filedThicknessM: number;
    /** load.ts 100 µm reference. The slider starts here; it is not the requirement. */
    referenceThicknessM: number;
    packagingIncluded: false;
    met: boolean;
  };
  cadence: {
    exists: boolean;
    playerPerDay: number;
    requiredPerDay: number;
    worldPerDay: number;
    filedGapX: number;
    remainingX: number;
    payloadFraction: number;
    paybackDays: number;
    energyBinds: boolean;
    met: boolean;
  };
  heritage: {
    exists: boolean;
    measured: false;
    label: "UNMEASURED";
    verifyYears: number;
    dominanceX: number;
    cognitiveFractionEstimated: false;
    impliedFractionIfGapClaimed: number;
    organisationalGapX: number;
    modesThatDoNotAccelerate: readonly string[];
    met: false;
  };
  lunar: {
    exists: boolean;
    playerFraction: number;
    closureFraction: number;
    materialsFraction: number;
    studyFraction: number;
    studyMeets: boolean;
    fractionMeets: boolean;
    importGapX: number;
    moonIndustry: boolean;
    webOfSpace: boolean;
  };
  dust: {
    wearRate: null;
    bonus: 0;
    mu: number;
    rollJPerKg: number;
    note: "no wear rate — cite a flux, then measure";
  };
  clock: {
    lambda: number;
    inertialYears: number;
    inertialLabel: "extrapolation";
    acceleratingYears: number;
    acceleratingLabel: "hypothesis";
    wins: false;
  };
  steps: PlayStep[];
};

function filedCadencePerDay(): number {
  const row = gates().find((g) => g.id === "launch-cadence");
  if (!row) throw new Error("launch-cadence missing from route.ts gates()");
  return row.required;
}

function pvCostCurve() {
  const row = CURVES.find((c) => c.id === "pv-cost");
  if (!row) throw new Error("pv-cost curve missing from learning.ts");
  return row;
}

function illustrativeMassCase() {
  const row = gapCases().find((c) => c.id === "mass-illustrative");
  if (!row) throw new Error("mass-illustrative curve missing from learning.ts");
  return row;
}

export function initialPlay(): PlayInput {
  const thin = requirementRoutes().byThinning[0];
  if (!thin) throw new Error("load.ts requirementRoutes returned no thinning route");
  return {
    powerW: P_NOW,
    radiatorRadiusM: GEO_RADIUS_M,
    arealKgM2: wingArealKgM2(),
    costRate: pvCostCurve().rate,
    dieThicknessM: REFERENCE_DIE_M,
    junctionK: thin.tK,
    cadencePerDay: WORLD_CADENCE_PER_DAY,
    lunarFraction: 0,
  };
}

export function evaluatePlay(input: PlayInput): PlayReport {
  const wall = firstWall();
  const floor = floorCorrection();
  const heatPath = input.radiatorRadiusM >= floor.correctedFloorM;
  const allocatedW = input.powerW;
  const countedW = heatPath ? allocatedW : Math.min(allocatedW, wall.powerW);
  const k = kOf(countedW);
  const stranded = allocatedW > wall.powerW && !heatPath;
  const typeI = heatPath && k >= kOf(P_I);
  const typeIIOpen = heatPath && k >= kOf(P_II_SAGAN);
  const typeIIIOpen = heatPath && k >= kOf(P_III_SAGAN);

  const floorKg = arealDensityToGeoKgM2();
  const committedKg = input.arealKgM2;
  const massExists = heatPath;
  const massMet = massExists && committedKg <= floorKg;
  const illustrative = illustrativeMassCase();
  const pv = pvCostCurve();

  const chipRoutes = requirementRoutes();
  const filedThin = chipRoutes.byThinning[0];
  if (!filedThin) throw new Error("load.ts requirementRoutes returned no thinning route");
  const requiredWKg = requiredSpecificPowerWKg();
  const achievedWKg = selfRadiatingSpecificPowerWKg(input.junctionK, input.dieThicknessM);
  const rack = loadCase("datacentre rack (today)", SPECIFIC_POWER_W_KG.rack);
  const chipExists = massMet;
  const chipMet = chipExists && achievedWKg >= requiredWKg;

  const requiredCadence = filedCadencePerDay();
  const cadenceExists = chipMet;
  const cadenceMet = cadenceExists && input.cadencePerDay >= requiredCadence;
  const stagesToGeo = minimumStages();
  const payloadFraction = stagedFlight(deltaVToGeo(), stagesToGeo).payloadFraction;
  const lift = liftVerdict();

  const verify = verification();
  const heritageExists = cadenceMet;
  const closureFraction = requiredClosure();
  const materialsFraction = earthShareCeiling().minLunarFraction;
  const studyFraction = AASM_1980_CLOSURE.high;
  const fractionMeets =
    input.lunarFraction >= closureFraction && input.lunarFraction >= materialsFraction;
  const studyMeets = studyFraction >= closureFraction && studyFraction >= materialsFraction;
  // Flight heritage is not an input. The lunar stage cannot be paid while it
  // is unmeasured, whatever mix the player commits.
  const heritageMeasured = false;
  const lunarExists = heritageMeasured;
  const moonIndustry = lunarExists && fractionMeets;

  const pole = transportCase(POLE_TO_EQUATOR_M);

  const steps: PlayStep[] = [
    { n: 1, id: "heat", title: "Heat wall", mark: heatPath ? "met" : "shut" },
    { n: 2, id: "radiator", title: "Radiator", mark: heatPath ? "met" : "shut" },
    { n: 3, id: "mass", title: "Mass at GEO", mark: massMet ? "met" : "shut" },
    { n: 4, id: "chip", title: "Chip", mark: chipMet ? "met" : "shut" },
    { n: 5, id: "cadence", title: "Cadence", mark: cadenceMet ? "met" : "shut" },
    { n: 6, id: "heritage", title: "Heritage", mark: "unmeasured" },
    { n: 7, id: "lunar", title: "Lunar mix", mark: moonIndustry ? "met" : "shut" },
    { n: 8, id: "dust", title: "Dust", mark: "absent" },
  ];

  return {
    todayW: P_NOW,
    wall: {
      powerW: wall.powerW,
      k: wall.k,
      multipleOfToday: wall.multipleOfToday,
      doublings: wall.doublingsFromToday,
      budgetK: 0.1,
    },
    allocatedW,
    countedW,
    k,
    heatPath,
    stranded,
    typeI,
    typeIFloorW: P_I,
    planetaryWeb: typeI,
    typeII: { open: typeIIOpen, floorW: P_II_SAGAN, k: kOf(P_II_SAGAN) },
    typeIII: { open: typeIIIOpen, floorW: P_III_SAGAN, k: kOf(P_III_SAGAN) },
    radiator: {
      earthRadiusM: R_EARTH_M,
      floorM: floor.correctedFloorM,
      versusGeo: floor.versusGeo,
      geoRadiusM: GEO_RADIUS_M,
      playerM: input.radiatorRadiusM,
      counts: heatPath,
    },
    mass: {
      exists: massExists,
      floorKgM2: floorKg,
      committedKgM2: committedKg,
      wingKgM2: wingArealKgM2(),
      filedGapX: arealGapToGeo(),
      remainingX: committedKg / floorKg,
      met: massMet,
      costRate: input.costRate,
      costQuantity: pv.quantity,
      appliedToMass: false,
      requiredArealRate: requiredArealRate(),
      illustrativeMassRate: ILLUSTRATIVE_MASS_RATE,
      illustrativeCloses: illustrative.closes,
    },
    chip: {
      exists: chipExists,
      achievedWKg,
      requiredWKg,
      rackWKg: SPECIFIC_POWER_W_KG.rack,
      gapX: requiredWKg / SPECIFIC_POWER_W_KG.rack,
      centuriesOfLaunch: rack.centuriesOfLaunch,
      filedJunctionK: filedThin.tK,
      filedThicknessM: filedThin.thicknessM,
      referenceThicknessM: REFERENCE_DIE_M,
      packagingIncluded: false,
      met: chipMet,
    },
    cadence: {
      exists: cadenceExists,
      playerPerDay: input.cadencePerDay,
      requiredPerDay: requiredCadence,
      worldPerDay: WORLD_CADENCE_PER_DAY,
      filedGapX: requiredCadence / WORLD_CADENCE_PER_DAY,
      remainingX: input.cadencePerDay >= requiredCadence ? 1 : requiredCadence / input.cadencePerDay,
      payloadFraction,
      paybackDays: lift.paybackDays,
      energyBinds: lift.bindingConstraint === "energy",
      met: cadenceMet,
    },
    heritage: {
      exists: heritageExists,
      measured: false,
      label: "UNMEASURED",
      verifyYears: verify.verifyYears,
      dominanceX: verify.dominanceX,
      cognitiveFractionEstimated: false,
      impliedFractionIfGapClaimed: fractionImpliedByClosingTheGap(),
      organisationalGapX: organisationalGap(),
      modesThatDoNotAccelerate: unaccelerable().map((m) => m.label),
      met: false,
    },
    lunar: {
      exists: lunarExists,
      playerFraction: input.lunarFraction,
      closureFraction,
      materialsFraction,
      studyFraction,
      studyMeets,
      fractionMeets,
      importGapX: proposedVersusRequired().importFlowX,
      moonIndustry,
      webOfSpace: moonIndustry,
    },
    dust: {
      wearRate: null,
      bonus: 0,
      mu: ROLLING_RESISTANCE,
      rollJPerKg: pole.rollJPerKg,
      note: "no wear rate — cite a flux, then measure",
    },
    clock: {
      lambda: LAMBDA,
      inertialYears: yearsInertial(),
      inertialLabel: "extrapolation",
      acceleratingYears: yearsAccelerating(),
      acceleratingLabel: "hypothesis",
      wins: false,
    },
    steps,
  };
}
