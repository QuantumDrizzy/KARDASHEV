/**
 * BEAM — power transmission, and the question M6 forgot to ask. M9.
 *
 * `thermal.ts` was written with a hole in it, listed as a KNOWN_LIMIT: no power
 * beaming. Closing it turned out not to be an omission but a **coupling**, and
 * it changed what M6 is allowed to claim.
 *
 * ── The question M6 never asked ──────────────────────────────────────────────
 *
 * M6 costed **generation**. But the thermal constraint is on **dissipation**.
 * Generate 1,000 TW in orbit and beam it to Earth for terrestrial use, and the
 * waste heat is identical to generating it here: +0.52 K either way, plus the
 * beam's own losses landing in the atmosphere on top.
 *
 *     **Beaming does not relax the thermal limit. Only moving the LOAD does.**
 *
 * The chain M6 → M7 → M8 had an unstated premise: that the *load* leaves, not
 * just the generation. It is stated now, and it is the difference between
 * space-based solar power and the thesis. They are not the same architecture.
 *
 * ── And beaming puts solar on the wrong side of the ledger ───────────────────
 *
 * Ground solar adds no net heat: it intercepts photons already destined to be
 * absorbed. Orbital solar collects photons that **would have missed Earth
 * entirely**, so every watt that lands is new heat. Beamed solar is thermally
 * the *worst* solar there is — a fact that only appears once you separate new
 * heat from recycled heat, which `thermal.ts` now does.
 *
 * ── What beaming IS good for ─────────────────────────────────────────────────
 *
 * Land and continuity, not thermodynamics. A rectenna designed at 230 W/m²
 * continuous is ~3.8× more land-efficient than ground PV at 40 W/m² mean, and
 * it works at night and in winter. That is a real argument. It is just not an
 * argument about K.
 *
 * ── What stops it being easy: diffraction ────────────────────────────────────
 *
 * The classic SPS relation, √(A_t·A_r) = τ·λ·D with τ ≈ 2 for ~95% capture:
 *
 *   2.45 GHz from GEO   1 km² transmitter → **77 km² rectenna**, ~10 km across
 *   5.8 GHz from GEO    1 km² transmitter → 14 km², ~4 km across
 *   2.45 GHz from LEO   1 km² transmitter → 0.02 km²  … but LEO does not hover
 *
 * That is the actual trade: GEO gives continuous coverage and demands kilometre
 * apertures at both ends; LEO makes the optics trivial and gives you a few
 * minutes per pass. Diffraction, not engineering appetite, sets it.
 *
 * [KNOWN_LIMIT] No pointing or safety analysis, no ionospheric heating, no
 * rain fade budget, no beam-safety exclusion zone, no economics. Optical
 * wavelengths make diffraction trivial and are omitted from the recommendation
 * because clouds are not.
 */

import { deltaTEffectiveExactK } from "./thermal.ts";
import { C } from "./constants.ts";

/** Re-exported from constants.ts so the two cannot drift apart. */
export const C_LIGHT = C;

/** τ in √(A_t·A_r) = τ·λ·D. τ ≈ 2 captures ~95% of the main lobe. */
export const TAU_95 = 2;

export type Band = { id: string; label: string; hz: number; note: string };

export const BANDS: Band[] = [
  { id: "s", label: "2.45 GHz", hz: 2.45e9, note: "ISM band, the classic SPS choice. Rain-immune." },
  { id: "c", label: "5.8 GHz", hz: 5.8e9, note: "Quarter the aperture product. Slightly more rain sensitive." },
  { id: "k", label: "35 GHz", hz: 35e9, note: "Small apertures, but real rain fade." },
];

export const wavelengthM = (hz: number) => C_LIGHT / hz;

/** Orbits worth beaming from, altitude in metres. */
export const ORBITS = { leo: 550e3, meo: 20_200e3, geo: 35_786e3 } as const;

/**
 * √(A_t·A_r) = τ·λ·D  ⇒  the product of the two apertures. Diffraction sets
 * this; no amount of phased-array cleverness moves it.
 */
export function apertureProductM4(hz: number, distanceM: number, tau = TAU_95) {
  return (tau * wavelengthM(hz) * distanceM) ** 2;
}

/** Receiver area implied by a chosen transmitter aperture. */
export function receiverAreaM2(hz: number, distanceM: number, transmitterAreaM2: number, tau = TAU_95) {
  return apertureProductM4(hz, distanceM, tau) / transmitterAreaM2;
}

export const diameterM = (areaM2: number) => 2 * Math.sqrt(areaM2 / Math.PI);

// ─────────────────────────────────────────────────── the efficiency chain

/**
 * Where each loss lands matters more than its size, because only the terms that
 * land on Earth join the planet's heat budget.
 * [ASSUMPTION] Published order-of-magnitude figures; end-to-end lands at ~63%,
 * inside the 50-60% usually quoted for a whole system with margin.
 */
export const CHAIN = {
  dcToRf: { eta: 0.8, lossLandsOn: "orbit" as const },
  beamCapture: { eta: 0.95, lossLandsOn: "orbit" as const },
  atmosphere: { eta: 0.98, lossLandsOn: "earth" as const },
  rfToDc: { eta: 0.85, lossLandsOn: "earth" as const },
};

export type BeamBudget = {
  orbitalW: number;
  deliveredW: number;
  endToEndEta: number;
  /** Loss dumped in orbit — radiates to 3 K, never joins Earth's budget. */
  lostInOrbitW: number;
  /** Loss dumped in the atmosphere and at the rectenna. This one counts. */
  lostOnEarthW: number;
  /** Delivered power becomes heat once used, so Earth's total load is both. */
  earthHeatW: number;
  /** Earth heat per useful watt delivered. > 1 is the penalty for beaming. */
  earthHeatPerUsefulW: number;
};

export function beamBudget(orbitalW: number): BeamBudget {
  const afterDc = orbitalW * CHAIN.dcToRf.eta;
  const afterCapture = afterDc * CHAIN.beamCapture.eta;
  const lostInOrbitW = orbitalW - afterCapture;
  const afterAtmos = afterCapture * CHAIN.atmosphere.eta;
  const deliveredW = afterAtmos * CHAIN.rfToDc.eta;
  const lostOnEarthW = afterCapture - deliveredW;
  return {
    orbitalW,
    deliveredW,
    endToEndEta: deliveredW / orbitalW,
    lostInOrbitW,
    lostOnEarthW,
    // Delivered power is used and becomes heat too.
    earthHeatW: deliveredW + lostOnEarthW,
    earthHeatPerUsefulW: (deliveredW + lostOnEarthW) / deliveredW,
  };
}

/**
 * [RESULT] The thermal comparison M6 could not make.
 *
 * Delivering the same useful power: ground solar adds ~nothing (recycled heat),
 * beamed solar adds the delivered watt plus its Earth-side losses (all new).
 */
export function thermalComparison(usefulW: number) {
  const orbitalW = usefulW / beamBudget(1).endToEndEta;
  const b = beamBudget(orbitalW);
  return {
    usefulW,
    orbitalGeneratedW: orbitalW,
    beamedEarthHeatW: b.earthHeatW,
    groundSolarEarthHeatW: 0,
    beamedDeltaTK: deltaTEffectiveExactK(b.earthHeatW),
    groundSolarDeltaTK: 0,
    /** Earth heat per useful watt. Ground solar is 0; beaming is >1. */
    penaltyPerUsefulW: b.earthHeatPerUsefulW,
  };
}

// ───────────────────────────────────────────────────────── rectenna land

/** Design flux at the rectenna, W/m². Set by safety, not by physics. */
export const RECTENNA_W_M2 = 230;
/** Ground PV mean delivered flux: 1361 × 22% efficiency × 20% capacity factor. */
export const GROUND_PV_W_M2 = 1361 * 0.22 * 0.2;

export function rectennaAreaM2(deliveredW: number) {
  return deliveredW / RECTENNA_W_M2;
}

/** How much less land a rectenna needs than ground PV for the same output. */
export const LAND_ADVANTAGE_X = RECTENNA_W_M2 / GROUND_PV_W_M2;

export const BEAM_VERDICT = {
  /** The correction this module forced on thermal.ts. */
  relaxesThermalLimit: false,
  /** Because the constraint is on dissipation, not generation. */
  loadMustLeaveNotJustGeneration: true,
  /** Beamed solar is new heat; ground solar is recycled. */
  worseThanGroundSolarThermally: true,
  /** What it is actually for. */
  realCase: ["land use", "continuity through night and winter"],
  note:
    "Space-based solar power and the thesis are different architectures. SBSP " +
    "moves the generation and leaves the load — which changes nothing about the " +
    "planet's radiator, and adds the beam's Earth-side losses on top. Only " +
    "moving the load off-planet touches K.",
} as const;
