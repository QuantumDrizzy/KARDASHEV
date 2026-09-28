/**
 * REJECT — heat rejection at Type I scale, and the thermodynamic runway. M10.
 *
 * M9 closed the chain: the **load** has to be in orbit, not just the generation.
 * `physics.ts` costs heat rejection for one satellite. Nobody had scaled it, and
 * scaling it does two things — it corrects M7/M8, and it puts a number on how
 * long efficiency can substitute for watts.
 *
 * ── [CORRECTION] M7 and M8 costed half the system ────────────────────────────
 *
 * If the load is in orbit then essentially all the power collected becomes heat
 * that must be radiated. At a 320 K radiator that is **19.8 million km²**
 * against the collector's 29.7 — the same order, not a detail. And `physics.ts`
 * puts radiators at 3.5 kg/m² against a 2.24 kg/m² collector wing, so:
 *
 *     collector  29.7e12 m² × 2.24 = 66.6 Gt
 *     radiator   19.8e12 m² × 3.50 = 69.3 Gt
 *
 * **The radiator is heavier than the collector.** Every flight count in M7 and
 * M8 is therefore ×2.04 too low. The A_max ceiling in M8 is unaffected — it is a
 * ratio — but the cadence to reach any given fraction doubles.
 *
 * ── The T⁴ lever is real, and pumping does not capture it ────────────────────
 *
 * σT⁴ says a hotter radiator is dramatically smaller: 320 K → 400 K shrinks it
 * ×2.44. That invites an active heat pump to lift rejection above the junction
 * temperature. Optimising total mass with Carnot work included:
 *
 *     passive at Tj = 350 K              114.9 Gt
 *     pumped, optimum at 430 K           107.9 Gt   — 6% better
 *
 * Six percent, on a surface that is flat from 350 to 500 K. The reason is that
 * **the pump work becomes heat you also have to reject**, so most of the T⁴ gain
 * pays for its own lift. The lever exists but it is not for sale.
 *
 * What is for sale is the junction temperature itself. Raising it from 350 K to
 * 400 K, passively, takes the total from 114.9 Gt to **95.0 Gt — 17%**, for
 * free. **High-temperature electronics beat heat pumps by about three to one.**
 * That is a semiconductor programme, not a thermal one, and it is the actionable
 * finding here.
 *
 * ── How far is real hardware from thermodynamics? ────────────────────────────
 *
 * Landauer: kT·ln2 per irreversible bit operation, 2.87e-21 J at 300 K.
 *
 *     logic, H100 FP8      ~3.5e-16 J/bit-op   ~10⁵ × Landauer
 *     against a practical 100 kT reliability floor      ~10³ of headroom
 *     DRAM movement, measured in qsim.ts      2.8e-11 J/bit   ~10¹⁰ × Landauer
 *
 * ── The challenge this puts to the thesis ────────────────────────────────────
 *
 * `THESIS.md` says ASI is an energy event. That holds only if efficiency stops
 * improving. There are **three orders of magnitude of headroom in logic** and
 * **ten in data movement** before physics intervenes — and M3 established that
 * the binding constraint today *is* data movement, which is the term furthest
 * from its floor.
 *
 * So the honest form of the thesis is narrower: watts become the constraint
 * **after** the efficiency runway is spent, not before. Three orders of compute
 * growth can arrive without a single extra watt. That is roughly ten doublings —
 * decades at any plausible rate. The energy event is real and it is deferred.
 *
 * [KNOWN_LIMIT] Radiator areal density is the `physics.ts` satellite figure;
 * thin-film concepts claim far less and would shift the balance back toward the
 * collector. No view factors, no radiator-to-radiator reabsorption in a dense
 * swarm, no deployment structure, no coolant loop mass. Carnot is an upper bound
 * on any real heat pump, so the 6% is itself optimistic.
 */

import { P_I } from "./kardashev.ts";
import { SIGMA } from "./physics.ts";
import { COLLECTOR_W_M2 } from "./lift.ts";
import { SPECIFIC_POWER, wingArealKgM2 } from "./collector.ts";
import { BOLTZMANN as BOLTZMANN_SI } from "./constants.ts";

export const BOLTZMANN = BOLTZMANN_SI;

/** Radiator emissivity and areal mass, from `physics.ts`'s satellite bench. */
export const RADIATOR_EMISSIVITY = 0.85;
export const RADIATOR_KG_M2 = 3.5;
/** Deep space. σT⁴ at 3 K is ~5e-6 W/m² — genuinely negligible. */
export const T_SPACE_K = 3;

/** Flux a radiator sheds at temperature T. εσ(T⁴ − T_space⁴). */
export function radiatorFluxWm2(tK: number, emissivity = RADIATOR_EMISSIVITY) {
  return emissivity * SIGMA * (tK ** 4 - T_SPACE_K ** 4);
}

/** Radiator area to reject a given thermal load at a given temperature. */
export function radiatorAreaM2(thermalW: number, tK: number, emissivity = RADIATOR_EMISSIVITY) {
  return thermalW / radiatorFluxWm2(tK, emissivity);
}

export type SystemMass = {
  junctionK: number;
  radiatorK: number;
  /** Carnot COP for lifting heat above the junction. Infinity when passive. */
  cop: number;
  pumpWorkW: number;
  collectorAreaM2: number;
  radiatorAreaM2: number;
  collectorKg: number;
  radiatorKg: number;
  totalKg: number;
  /** Total deployed area, which M7/M8 only counted half of. */
  totalAreaM2: number;
};

/**
 * Total system mass for a Type I orbital load.
 *
 * If `radiatorK > junctionK` a heat pump is implied and its Carnot work is
 * added to BOTH the collector (it has to be supplied) and the radiator (it has
 * to be rejected). That double charge is why pumping barely pays.
 */
export function systemMass(
  o: {
    loadW?: number;
    junctionK?: number;
    radiatorK?: number;
    radiatorKgM2?: number;
    specificPowerWKg?: number;
    emissivity?: number;
  } = {},
): SystemMass {
  const loadW = o.loadW ?? P_I;
  const junctionK = o.junctionK ?? 350;
  const radiatorK = o.radiatorK ?? junctionK;
  const radiatorKgM2 = o.radiatorKgM2 ?? RADIATOR_KG_M2;
  const collectorKgM2 = wingArealKgM2(o.specificPowerWKg ?? SPECIFIC_POWER.today);

  const cop = radiatorK <= junctionK ? Infinity : junctionK / (radiatorK - junctionK);
  const pumpWorkW = Number.isFinite(cop) ? loadW / cop : 0;
  const rejectW = loadW + pumpWorkW;
  const supplyW = loadW + pumpWorkW;

  const collectorAreaM2 = supplyW / COLLECTOR_W_M2;
  const radArea = radiatorAreaM2(rejectW, radiatorK, o.emissivity);
  const collectorKg = collectorAreaM2 * collectorKgM2;
  const radiatorKg = radArea * radiatorKgM2;

  return {
    junctionK,
    radiatorK,
    cop,
    pumpWorkW,
    collectorAreaM2,
    radiatorAreaM2: radArea,
    collectorKg,
    radiatorKg,
    totalKg: collectorKg + radiatorKg,
    totalAreaM2: collectorAreaM2 + radArea,
  };
}

/** How much M7/M8 understated the system by ignoring heat rejection. */
export function massUnderstatementX(junctionK = 320) {
  const s = systemMass({ junctionK });
  return s.totalKg / s.collectorKg;
}

/**
 * Best radiator temperature for a given junction, scanning the pumped range.
 * [RESULT] The optimum is shallow — pumping is worth ~6% and the surface is
 * flat over 150 K. Raising the junction itself is worth ~17% and is free.
 */
export function optimalRadiatorK(junctionK = 350, o: { maxK?: number; stepK?: number } = {}) {
  const maxK = o.maxK ?? 700;
  const stepK = o.stepK ?? 1;
  let best = systemMass({ junctionK, radiatorK: junctionK });
  for (let t = junctionK + stepK; t <= maxK; t += stepK) {
    const s = systemMass({ junctionK, radiatorK: t });
    if (s.totalKg < best.totalKg) best = s;
  }
  return best;
}

/** Mass saved by pumping, versus by simply running the silicon hotter. */
export function leverComparison(baseJunctionK = 350, hotterJunctionK = 400) {
  const passive = systemMass({ junctionK: baseJunctionK });
  const pumped = optimalRadiatorK(baseJunctionK);
  const hotter = systemMass({ junctionK: hotterJunctionK });
  return {
    passiveKg: passive.totalKg,
    pumpedKg: pumped.totalKg,
    pumpedAtK: pumped.radiatorK,
    hotterKg: hotter.totalKg,
    pumpingSaves: 1 - pumped.totalKg / passive.totalKg,
    hotterSaves: 1 - hotter.totalKg / passive.totalKg,
  };
}

// ─────────────────────────────────────────────── the thermodynamic runway

/** kT·ln2 per irreversible bit operation. 2.87e-21 J at 300 K. */
export function landauerJPerBit(tK = 300) {
  return BOLTZMANN * tK * Math.LN2;
}

/**
 * Reliable switching needs margin over kT. ~100 kT is the usual practical
 * floor; below it error rates make the operation useless. [ASSUMPTION]
 */
export const RELIABILITY_MARGIN_KT = 100;

export function practicalFloorJPerBit(tK = 300) {
  return RELIABILITY_MARGIN_KT * landauerJPerBit(tK);
}

/** Bit-operations per FLOP. Order of magnitude only. [ASSUMPTION] */
export const BIT_OPS_PER_FLOP = 1000;

export type Runway = {
  jPerBitOp: number;
  landauerX: number;
  /** Orders of magnitude left before the practical floor. */
  headroomX: number;
  ordersOfMagnitude: number;
};

export function runway(jPerBitOp: number, tK = 300): Runway {
  const floor = practicalFloorJPerBit(tK);
  return {
    jPerBitOp,
    landauerX: jPerBitOp / landauerJPerBit(tK),
    headroomX: jPerBitOp / floor,
    ordersOfMagnitude: Math.log10(jPerBitOp / floor),
  };
}

/** H100 FP8: 700 W / 1979 TFLOPS, spread over ~1000 bit-ops per FLOP. */
export const LOGIC_J_PER_BIT_OP = 700 / 1979e12 / BIT_OPS_PER_FLOP;
/** Measured on an RTX 5060 Ti in qsim.ts: 0.227 nJ per byte moved. */
export const MOVEMENT_J_PER_BIT = 2.267e-10 / 8;

export const THESIS_CHALLENGE = {
  /** "ASI is an energy event" holds only after the efficiency runway is spent. */
  energyEventIsDeferred: true,
  logicOrdersLeft: runway(LOGIC_J_PER_BIT_OP).ordersOfMagnitude,
  movementOrdersLeft: runway(MOVEMENT_J_PER_BIT).ordersOfMagnitude,
  note:
    "Three orders of compute growth can arrive with no extra watts, and the " +
    "term that actually binds today — data movement — is the one furthest from " +
    "its thermodynamic floor. The energy event is real and it is deferred.",
} as const;

export const REJECT_VERDICT = {
  /** The lever is the junction temperature, not a heat pump. */
  hotSiliconBeatsHeatPumps: true,
  /** M7/M8 counted the collector only. */
  liftAndCollectorUnderstatedX: massUnderstatementX(320),
  note:
    "The radiator is heavier than the collector, so every flight count in M7 " +
    "and M8 is about half what it should be. Pumping heat above the junction " +
    "buys 6% because the pump work must also be rejected; running the silicon " +
    "50 K hotter buys 17% and costs nothing.",
} as const;
