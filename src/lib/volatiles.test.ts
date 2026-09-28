import assert from "node:assert/strict";
import test from "node:test";
import {
  LUNAR_ARRAY_W_M2,
  MAJOR_ELEMENTS,
  POLAR_ICE_FRACTION,
  TRACE_VOLATILES,
  extractionJPerKg,
  polarAdvantageX,
  regolithPerKg,
  sitingConflict,
  volatileBudget,
  volatileCases,
} from "./volatiles.ts";
import { EMBODIED_J_PER_KG, earthShareCeiling, typeISystemMassKg } from "./isru.ts";

/**
 * M29 locks. The load-bearing one is the siting conflict: if peaks of light
 * could ever run the industry, the volatile problem would be a chemistry problem
 * and this module would have no content.
 */

test("[COMPOSITION] regolith has the structure and not the chemistry", () => {
  // Everything the collector, radiator and structure need is in weight percent.
  for (const e of ["O", "Si", "Al", "Fe"] as const) {
    assert.ok(MAJOR_ELEMENTS[e] > 0.05, `${e} should be abundant`);
  }
  // Everything alive is in parts per million, four orders down.
  for (const e of ["C", "H", "N"] as const) {
    assert.ok(TRACE_VOLATILES[e] < 2e-4, `${e} should be a trace`);
    assert.ok(MAJOR_ELEMENTS.Si / TRACE_VOLATILES[e] > 1000, `${e} vs Si`);
  }
  // Majors must roughly account for the rock; if they sum past 1 the table is wrong.
  const sum = Object.values(MAJOR_ELEMENTS).reduce((a, b) => a + b, 0);
  assert.ok(sum > 0.9 && sum <= 1.0, `majors sum to ${sum.toFixed(3)}`);
});

test("[RESULT] ten thousand kilograms of regolith per kilogram of carbon", () => {
  assert.ok(Math.abs(regolithPerKg(TRACE_VOLATILES.C, 1) - 1e4) < 1, "at perfect yield");
  // With a 70% yield it is worse, not better.
  assert.ok(regolithPerKg(TRACE_VOLATILES.C) > 1e4);
  // Hydrogen is the worst of the three, being the rarest.
  const cases = volatileCases();
  const h = cases.find((c) => c.element === "H")!;
  const c = cases.find((c) => c.element === "C")!;
  assert.ok(h.regolithPerKg > c.regolithPerKg);
  // And a smaller mass fraction is always a bigger ratio. Exactly inverse.
  assert.ok(Math.abs(regolithPerKg(1e-4, 1) / regolithPerKg(2e-4, 1) - 2) < 1e-9);
});

test("[RESULT] extraction costs a hundred times the system's embodied energy per kg", () => {
  const j = extractionJPerKg(TRACE_VOLATILES.C);
  assert.ok(Math.abs(j / 1e9 - 10) < 1, `${(j / 1e9).toFixed(1)} GJ/kg`);
  // Against M11's 100 MJ/kg for the whole system.
  assert.ok(Math.abs(j / EMBODIED_J_PER_KG - 100) < 10, `×${(j / EMBODIED_J_PER_KG).toFixed(0)}`);
  // Better yield is cheaper, proportionally.
  assert.ok(Math.abs(extractionJPerKg(TRACE_VOLATILES.C, { yieldFrac: 1.0 }) / j - 0.7) < 1e-9);
});

test("[RESULT] but the total is affordable — about 5% of the lunar industry", () => {
  const b = volatileBudget();
  // 18.4 Mt of volatiles, from M11's own import fraction.
  const expected = typeISystemMassKg() * (1 - earthShareCeiling(100).minLunarFraction);
  assert.ok(Math.abs(b.massKg - expected) < 1e-6);
  assert.ok(b.massKg > 1e10 && b.massKg < 3e10, `${(b.massKg / 1e9).toFixed(1)} Mt`);
  // ~188 GW over a 31-year build.
  assert.ok(b.powerW > 1e11 && b.powerW < 3e11, `${(b.powerW / 1e9).toFixed(0)} GW`);
  assert.ok(b.shareOfLunarIndustry > 0.02 && b.shareOfLunarIndustry < 0.1, `${b.shareOfLunarIndustry}`);
  // A longer build spreads it, so the power falls.
  assert.ok(volatileBudget({ buildYears: 100 }).powerW < b.powerW);
});

test("[RESULT] polar ice is two orders better as a hydrogen source", () => {
  const adv = polarAdvantageX();
  assert.ok(Math.abs(adv - 124) < 10, `×${adv.toFixed(0)}`);
  assert.ok(POLAR_ICE_FRACTION > 0.01, "LCROSS found percent-level water, not a trace");
  // And it turns the 5% energy tax into a rounding error.
  const fromIce = volatileBudget({ jPerKg: extractionJPerKg(TRACE_VOLATILES.C) / adv });
  assert.ok(fromIce.shareOfLunarIndustry < 0.001, `${fromIce.shareOfLunarIndustry}`);
});

test("[THE CONFLICT] peaks of light cannot run the industry", () => {
  const s = sitingConflict();
  // 3.8 TW at ~231 W/m² needs sixteen thousand square kilometres of array.
  assert.ok(Math.abs(s.requiredArrayM2 / 1e6 - 16_450) < 500, `${(s.requiredArrayM2 / 1e6).toFixed(0)} km²`);
  // A handful of 1 km² ridges delivers a fraction of a percent of it.
  assert.ok(s.peakShareOfIndustry < 0.001, `${(s.peakShareOfIndustry * 100).toFixed(3)}%`);
  assert.ok(s.sitesNeeded > 10_000, `${s.sitesNeeded.toFixed(0)} sites of 1 km² needed`);
  // Which is the whole module: the ice is where the Sun never reaches, and the
  // power must be where it always does. If this ever passes, there is no problem.
  assert.ok(s.peakSitePowerW < 1e10, "peaks are gigawatt-class at most, not terawatt");
  assert.ok(Math.abs(LUNAR_ARRAY_W_M2 - 1361 * 0.2 * 0.85) < 1e-9);
});

test("[KNOWN_LIMIT] nothing here sites a base or moves anything on the Moon", () => {
  // The conflict is stated; the resolution is not modelled, and transport inside
  // the Moon is absent from the entire chain. Guard: no distance anywhere.
  const s = sitingConflict();
  assert.ok(!("transportKm" in s), "lunar transport is not modelled and must not look like it is");
  assert.ok(!("siteLatitude" in s));
});
