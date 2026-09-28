import assert from "node:assert/strict";
import test from "node:test";
import {
  ASSUMED_DUTY_CYCLE,
  EARTH_DISK_M2,
  GEO_RADIUS_M,
  climateFloorRadiusM,
  dutyCycleGeometric,
  eclipseFraction,
  nonShadingBand,
  placementLadder,
  shadingDeltaTK,
  shadingFraction,
  skyCoverageFraction,
  skyCoverageSquareDeg,
  sunwardCapFraction,
} from "./placement.ts";
import { R_EARTH_M } from "./constants.ts";
import { T_EFFECTIVE_K, deltaTEffectiveK } from "./thermal.ts";
import { TYPE_I_AREA_M2 } from "./collector.ts";
import { P_I } from "./kardashev.ts";

/**
 * M13 locks. The load-bearing ones are the identity between shading and sky
 * coverage (which validates the exact cap formula against a closed form) and the
 * climate floor landing at GEO.
 */

test("the sunward cap fraction has the right limits", () => {
  // At the surface, half the shell is on the sunward side and all of it is
  // inside the cylinder.
  assert.ok(Math.abs(sunwardCapFraction(R_EARTH_M) - 0.5) < 1e-12);
  // Far away it vanishes as (R/a)²/4.
  const far = 1e10;
  const approx = (R_EARTH_M / far) ** 2 / 4;
  assert.ok(Math.abs(sunwardCapFraction(far) / approx - 1) < 1e-3);
  // Monotone decreasing in radius.
  let prev = 1;
  for (let a = R_EARTH_M; a < 1e9; a *= 1.3) {
    const f = sunwardCapFraction(a);
    assert.ok(f < prev);
    prev = f;
  }
});

test("[IDENTITY] shading equals sky coverage for a >> R_earth", () => {
  // Expanding (1-cos θ)/2 ≈ R²/4a² makes the Earth-disk denominator cancel, so
  // the array blocks the same fraction of incoming sunlight as of outgoing IR.
  // If the exact cap formula is ever mistyped, this diverges immediately.
  for (const a of [GEO_RADIUS_M, 1e8, 1e9]) {
    const ratio = shadingFraction(a) / skyCoverageFraction(a);
    assert.ok(Math.abs(ratio - 1) < 0.01, `at a=${a} the identity is off by ${((ratio - 1) * 100).toFixed(2)}%`);
  }
  // And it must NOT hold at LEO, where the small-angle expansion is invalid.
  assert.ok(shadingFraction(R_EARTH_M + 400e3) / skyCoverageFraction(R_EARTH_M + 400e3) > 1.1);
});

test("[RESULT] an isotropic Type I shell in LEO cools Earth into an ice age", () => {
  const iss = R_EARTH_M + 408e3;
  const blocked = shadingFraction(iss);
  assert.ok(blocked > 0.06 && blocked < 0.09, `blocked ${blocked}`);
  const cooling = shadingDeltaTK(iss);
  assert.ok(cooling > 4 && cooling < 6, `cooling ${cooling} K`);
  // The mirror of M6: Type I on the crust heats by a comparable amount. Same
  // scale, opposite sign, and the only variable between them is placement.
  const crustHeating = deltaTEffectiveK(P_I);
  assert.ok(Math.abs(cooling / crustHeating - 1) < 0.3, "the two should be the same order — check both if not");
});

test("[RESULT] the climate budget alone derives an orbit, and it is GEO", () => {
  const floor = climateFloorRadiusM(0.1);
  // 38,900 km against a geostationary radius of 42,164 km.
  assert.ok(floor / GEO_RADIUS_M > 0.85 && floor / GEO_RADIUS_M < 1.0, `floor/GEO = ${floor / GEO_RADIUS_M}`);
  assert.ok(Math.abs(floor / 1000 - 38_900) < 500, `floor at ${(floor / 1000).toFixed(0)} km`);
  // GEO itself must clear the budget, and low orbit must not.
  assert.ok(shadingDeltaTK(GEO_RADIUS_M) < 0.1);
  assert.ok(shadingDeltaTK(R_EARTH_M + 2000e3) > 0.1);
  // A tighter budget pushes the floor out, monotonically.
  assert.ok(climateFloorRadiusM(0.01) > floor);
  assert.ok(climateFloorRadiusM(1.0) < floor);
});

test("the floor scales as sqrt(area), because shading is A/4*pi*a^2", () => {
  // Quadrupling the array must double the required radius. This is the whole
  // reason placement is leveraged: the constraint is geometric, not thermal.
  const a1 = climateFloorRadiusM(0.1, TYPE_I_AREA_M2);
  const a4 = climateFloorRadiusM(0.1, TYPE_I_AREA_M2 * 4);
  assert.ok(Math.abs(a4 / a1 - 2) < 0.02, `ratio ${a4 / a1}`);
});

test("[CORRECTION] the repo-wide 0.96 duty cycle is a dawn-dusk assumption", () => {
  // An isotropic shell gives nothing like 0.96 in low orbit.
  const leo = dutyCycleGeometric(R_EARTH_M + 400e3);
  assert.ok(leo < 0.7, `LEO duty ${leo} — physics.ts assumes ${ASSUMED_DUTY_CYCLE}`);
  assert.ok(ASSUMED_DUTY_CYCLE / leo > 1.35, "the assumption is optimistic by more than a third at 400 km");
  // At GEO the geometry is better than the assumption, not worse.
  assert.ok(dutyCycleGeometric(GEO_RADIUS_M) > ASSUMED_DUTY_CYCLE);
  // Eclipse and duty must be complementary by construction.
  for (const a of [7e6, 2e7, GEO_RADIUS_M]) {
    assert.ok(Math.abs(eclipseFraction(a) + dutyCycleGeometric(a) - 1) < 1e-12);
  }
});

test("[RESULT] the non-shading band exists everywhere, and its price is the fill", () => {
  const leo = nonShadingBand(R_EARTH_M + 800e3);
  // ~27° of half-width, 46% of the shell, and Type I needs a tenth of it.
  assert.ok(leo.halfWidthDeg > 20 && leo.halfWidthDeg < 35);
  assert.ok(leo.shellFraction > 0.4 && leo.shellFraction < 0.5);
  assert.ok(leo.fillFraction > 0.05 && leo.fillFraction < 0.2, `LEO fill ${leo.fillFraction}`);
  // At GEO the band is nearly the whole shell and the fill is negligible.
  const geo = nonShadingBand(GEO_RADIUS_M);
  assert.ok(geo.shellFraction > 0.98);
  assert.ok(geo.fillFraction < 0.005);
  // So shading never forces a high orbit by itself — it forces a choice.
  assert.ok(leo.fillFraction / geo.fillFraction > 50);
});

test("Earth's disk is the cross-section, not the sphere", () => {
  // A one-character slip here would quietly quarter every result in the module.
  assert.ok(Math.abs(EARTH_DISK_M2 / (Math.PI * R_EARTH_M ** 2) - 1) < 1e-12);
  assert.ok(Math.abs(EARTH_DISK_M2 - 1.275e14) / 1.275e14 < 0.01);
});

test("sky coverage at GEO is tens of square degrees", () => {
  const sq = skyCoverageSquareDeg(GEO_RADIUS_M);
  assert.ok(sq > 20 && sq < 120, `${sq} sq deg`);
  // Stated as solid angle only — no brightness claim is made anywhere.
  assert.ok(skyCoverageFraction(GEO_RADIUS_M) < 0.002);
});

test("the ladder is ordered and self-consistent", () => {
  const ladder = placementLadder();
  assert.ok(ladder.length >= 8);
  for (let i = 1; i < ladder.length; i++) {
    assert.ok(ladder[i].altitudeKm > ladder[i - 1].altitudeKm, "ladder must climb");
    assert.ok(ladder[i].coolingK < ladder[i - 1].coolingK, "cooling must fall with altitude");
    assert.ok(ladder[i].dutyCycle > ladder[i - 1].dutyCycle, "duty cycle must rise with altitude");
  }
  // The budget flag must flip exactly once, and at GEO or just below it.
  const firstOk = ladder.findIndex((r) => r.withinClimateBudget);
  assert.ok(firstOk > 0, "low orbits must fail the budget");
  assert.ok(ladder.slice(firstOk).every((r) => r.withinClimateBudget), "and it must not flip back");
  assert.equal(ladder[firstOk].label, "GEO", "the climate budget should first be met at GEO");
});

test("[KNOWN_LIMIT] equilibrium only — no feedbacks, and they run the wrong way", () => {
  // Stated so nobody quotes -4.9 K as a climate model output. Ice-albedo
  // feedback makes a real answer larger, so this figure is a floor on the harm,
  // not an estimate of it. The test exists to keep the caveat load-bearing.
  const cooling = shadingDeltaTK(R_EARTH_M + 408e3);
  assert.ok(Math.abs(cooling - 0.25 * shadingFraction(R_EARTH_M + 408e3) * T_EFFECTIVE_K) < 1e-12);
});
