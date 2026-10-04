// ADR-LRV-ANCHOR -- the rolling-resistance assumption, bounded by the only measured
// lunar wheels.
//
// surface.ts carries ROLLING_RESISTANCE = 0.1 marked [ASSUMED]. This module does not
// defend the decimal; it bounds what its uncertainty can do to the verdict, using the
// only validation that exists: MSFC's Bekker/LLD soil-vehicle model against the LRV's
// onboard ampere-hour integrators during the Apollo 15 traverse
// (NTRS 19730008090, hashed in data/raw/lrv/).
//
// The report's own conclusions, quoted in ADR-LRV-ANCHOR:
//   - RMS deviation per km, computed vs measured, across the LLL soil-value spectrum:
//     11.4-16.0 % (Table 7). "Large variations in LLL soil values do not appear to
//     influence appreciably the energy consumption results."
//   - The WES-derived variant OVERESTIMATES the onboard readings, median ~30 %: the
//     error direction is conservative (modelled requirement above the real one).
//
// Consequence for the rover chain: the soil-value uncertainty moves E/m by at most
// the sourced band, and the hop crossover sits 4.5 energy-ratios away. The soil does
// not reach it. dustWear stays absent -- the refusal in surface.ts stands.

import { POLE_TO_EQUATOR_M, hopJPerKg, rollJPerKg } from "./surface.ts";

export const LRV_REPORT_NTRS_ID = 19730008090;

/** Table 7: RMS deviation per km between computed and measured energy consumption,
 * across the LLL soil-value spectrum, Apollo 15. */
export const APOLLO15_RMS_DEVIATION_PCT = [11.4, 16.0] as const;

/** The WES variant's median deviation. The direction matters: the model
 * OVERESTIMATES the onboard integrators, so the band is conservative. */
export const WES_MEDIAN_OVERESTIMATE_PCT = 30;

/** surface.ts's baseline E/m at the assumed 0.1: ~0.442 MJ/kg pole to equator. */
export function wheelEnergyJPerKg(mu: number): number {
  return rollJPerKg(POLE_TO_EQUATOR_M, mu);
}

/** The soil-uncertainty band on that E/m, from the sourced RMS deviation. */
export function lrvBand(mu: number): [number, number] {
  const e = wheelEnergyJPerKg(mu);
  const hi = APOLLO15_RMS_DEVIATION_PCT[1] / 100;
  const lo = APOLLO15_RMS_DEVIATION_PCT[0] / 100;
  return [e * (1 - lo), e * (1 + hi)];
}

/** The hop's launch energy at the same traverse (surface.ts's own model), which is
 * the crossover energy: hopping pays launch, and landing is a crash. */
export function hopEnergyJPerKg(): number {
  return hopJPerKg(POLE_TO_EQUATOR_M);
}

/** The margin between the hop and the worst-case soil band. Above 1, rolling stays
 * the answer even at the top of the sourced soil uncertainty. */
export function crossoverMargin(mu: number): number {
  const [, hi] = lrvBand(mu);
  return hopEnergyJPerKg() / hi;
}

/** The factor by which the assumed 0.1 would have to be wrong before hopping wins
 * over the worst-case band. */
export function muFlipFactor(mu: number): number {
  return crossoverMargin(mu);
}
