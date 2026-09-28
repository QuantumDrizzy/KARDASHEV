import assert from "node:assert/strict";
import test from "node:test";
import {
  AO_FLUENCE_400KM,
  CELL_DEGRADATION_PER_YEAR,
  arrayAsObject,
  atomicOxygen,
  combinedLifetimeYr,
  debrisDensityPerKm3,
  debrisExposure,
  dustAccretion,
  filmDamage,
  filmThicknessM,
  grainDiameterM,
  grunFlux,
  grunFluxPerYear,
  lifetimeCases,
  lifetimeLeverage,
  perforationSensitivity,
  ripstopMassKgM2,
  ripstopPitchM,
  M7_AREAL_KG_M2,
} from "./environment.ts";
import { sustainableFractionOfTypeI } from "./collector.ts";

/**
 * M12 locks. The load-bearing one is the Grün validation: if those constants are
 * ever "tidied", the peak diameter moves off 200 µm and this fails loudly.
 */

test("[VALIDATION] Grun reproduces the measured dust peak at ~200 um", () => {
  const d = dustAccretion();
  const peakMicrons = d.peakDiameterM * 1e6;
  // Love & Brownlee 1993 put the mass-carrying peak at ~200 um. This tests the
  // SHAPE of the distribution, which is what every conclusion here rests on.
  assert.ok(peakMicrons > 140 && peakMicrons < 260, `peak at ${peakMicrons.toFixed(0)} um, expected ~200`);
});

test("[VALIDATION] the integrated mass influx sits inside the published spread", () => {
  const d = dustAccretion();
  // Love & Brownlee central value is 4e7 kg/yr, but published estimates span
  // ~5e6 to ~3e8 depending on method. We land at ~1.2e7 — inside the spread and
  // 3.4x under the central value. Recorded as a PARTIAL validation, not a pass.
  assert.ok(d.focusedKgPerYear > 5e6 && d.focusedKgPerYear < 3e8);
  assert.ok(d.focusedKgPerYear < 4e7, "we are under the central value, not over — state it that way");
  assert.ok(d.focusedKgPerYear > d.bareKgPerYear, "gravitational focusing must increase the influx");
});

test("the Grun flux is monotonically decreasing in mass", () => {
  // A cumulative flux of particles heavier than m cannot rise with m. This is
  // the cheapest possible guard against a mistyped exponent.
  let prev = Infinity;
  for (let e = -18; e <= 3; e += 0.25) {
    const f = grunFlux(10 ** e);
    assert.ok(f < prev, `flux rose at 1e${e} g`);
    assert.ok(f > 0);
    prev = f;
  }
});

test("grain diameter inverts mass correctly", () => {
  // 1e-6 g of 2500 kg/m3 rock is a ~91 um grain. Round-trip the geometry.
  const d = grainDiameterM(1e-6);
  assert.ok(Math.abs(d * 1e6 - 91.4) < 1);
  const massKg = ((4 / 3) * Math.PI * (d / 2) ** 3) * 2500;
  assert.ok(Math.abs(massKg * 1e3 - 1e-6) / 1e-6 < 1e-9);
});

test("M7's areal density is an 8.7 um film", () => {
  // The number this whole module exists to interrogate.
  assert.ok(Math.abs(filmThicknessM(M7_AREAL_KG_M2) * 1e6 - 8.66) < 0.05);
});

test("[RESULT] micrometeoroids do not set the lifetime, by five orders of magnitude", () => {
  const d = filmDamage();
  // Hundreds of holes per square metre per year...
  assert.ok(d.perforationsPerM2Yr > 100 && d.perforationsPerM2Yr < 400);
  // ...and essentially no area lost.
  assert.ok(d.areaLossFracPerYr < 1e-6, `area loss ${d.areaLossFracPerYr}`);
  assert.ok(d.yearsToLoseTenth > 1e4, "a film should take millennia to lose a tenth of its area");
  // Against the ~1%/yr that actually binds.
  assert.ok(CELL_DEGRADATION_PER_YEAR / d.areaLossFracPerYr > 1e4);
});

test("[ROBUSTNESS] the negative result survives the whole parameter range", () => {
  const sweep = perforationSensitivity();
  assert.equal(sweep.length, 9);
  const losses = sweep.map((s) => s.areaLossFracPerYr);
  const spread = Math.max(...losses) / Math.min(...losses);
  assert.ok(spread < 20, `sweep spread ${spread.toFixed(1)}x — too wide to call this robust`);
  // Every corner, not just the default, must be negligible.
  for (const s of sweep) assert.ok(s.areaLossFracPerYr < 1e-5, JSON.stringify(s));
});

test("[DESIGN] ripstop pitch is centimetres and costs almost nothing", () => {
  const pitch = ripstopPitchM(30);
  assert.ok(pitch > 0.005 && pitch < 0.05, `pitch ${pitch} m`);
  const mass = ripstopMassKgM2(30);
  assert.ok(mass / M7_AREAL_KG_M2 < 0.01, "ripstop must be under 1% of the mass budget");
  // Longer life needs a finer grid — the relation must not be backwards.
  assert.ok(ripstopPitchM(100) < ripstopPitchM(10));
});

test("[RESULT] atomic oxygen is the one real bite, and a coating pays for it", () => {
  const ao = atomicOxygen();
  // 45 um/yr at 400 km eats an 8.7 um bare film in a couple of months.
  assert.ok(ao.erosionMPerYear * 1e6 > 30 && ao.erosionMPerYear * 1e6 < 60);
  assert.ok(ao.bareFilmYears < 0.3, `bare film lasted ${ao.bareFilmYears} yr`);
  // And the fix is affordable inside M7's binding constraint.
  assert.ok(ao.coatingShareOfBudget < 0.03, "a 100 nm silica coat must cost under 3% of the budget");
  // Scaling: half the fluence, twice the life.
  const half = atomicOxygen({ fluencePerM2Yr: AO_FLUENCE_400KM / 2 });
  assert.ok(Math.abs(half.bareFilmYears / ao.bareFilmYears - 2) < 1e-9);
});

test("debris density derived from the catalogue lands in the published order", () => {
  const n = debrisDensityPerKm3();
  // Published peak spatial density near 800 km is order 1e-8 /km3. An
  // independent derivation from catalogue count over shell volume must agree to
  // an order of magnitude or one of the two is wrong.
  assert.ok(n > 1e-9 && n < 1e-7, `derived ${n}`);
});

test("[RESULT] the array is struck continuously and does not care", () => {
  const d = debrisExposure();
  assert.ok(d.impactsPerSecond > 1, `${d.impactsPerSecond}/s — expected several per second`);
  // ...but a sheet has nothing to destroy, so the area cost is negligible again.
  assert.ok(d.areaLossFracPerYr < 1e-5);
  // The conclusion must survive two orders of magnitude of density error.
  const hundredthDensity = debrisExposure({ densityPerKm3: debrisDensityPerKm3() / 100 });
  assert.ok(hundredthDensity.impactsPerYear > 1e6, "still millions of impacts a year at 1% density");
});

test("[REFRAME] the array is an Earth-scale object", () => {
  const a = arrayAsObject();
  // ~23% of Earth's own cross-section, and millions of times all mass launched.
  assert.ok(a.shareOfEarthCrossSection > 0.2 && a.shareOfEarthCrossSection < 0.3);
  assert.ok(a.versusAllMassEverLaunched > 1e6);
  assert.ok(a.srpForceN > 1e8, "an Africa-sized sail feels a very large SRP force");
});

test("[CORRECTION to M8] no modelled mechanism supports a 5-year life", () => {
  const cases = lifetimeCases();
  // Ranked by annual loss, radiation damage must come first.
  assert.equal(cases[0].mechanism, "cell radiation damage");
  for (const c of cases) assert.ok(c.yearsToEol > 5, `${c.mechanism} gives ${c.yearsToEol} yr — under 5`);
  // Even with every mechanism running at once the array lasts decades.
  const combined = combinedLifetimeYr();
  assert.ok(combined > 20, `combined life ${combined} yr`);
  assert.ok(combined < 200, "and it is not unlimited either");
});

test("[RESULT] A_max = R*L is linear, so the lifetime moves the whole ceiling", () => {
  const rows = lifetimeLeverage();
  // Linearity is the entire argument — check it rather than assuming it.
  const five = rows.find((r) => r.lifetimeYr === 5)!;
  const fifty = rows.find((r) => r.lifetimeYr === 50)!;
  assert.ok(Math.abs(fifty.sustainableFractionOfTypeI / five.sustainableFractionOfTypeI - 10) < 1e-9);
  // M8's assumed 5 years gives ~5% of Type I...
  assert.ok(Math.abs(five.sustainableFractionOfTypeI - 0.05) < 0.01);
  // ...and what the environment supports gives ~30%.
  const thirty = rows.find((r) => r.lifetimeYr === 30)!;
  assert.ok(thirty.sustainableFractionOfTypeI > 0.25 && thirty.sustainableFractionOfTypeI < 0.35);
  // Cross-check straight against M8 so the two modules cannot drift apart.
  assert.equal(thirty.sustainableFractionOfTypeI, sustainableFractionOfTypeI(100, 30));
});

test("[KNOWN_LIMIT] the array still cannot outlive a century-long build", () => {
  // M8's convergence condition is L >= T_build. Even the optimistic lifetime
  // here does not reach 100 years, so the condition is not satisfied — it is
  // only brought within argument. Do not let the prose overclaim this.
  assert.ok(combinedLifetimeYr() < 100, "if this ever passes 100 yr, M8's verdict must be rewritten");
});

test("flux helpers agree between per-second and per-year", () => {
  const m = 1e-9;
  assert.ok(Math.abs(grunFluxPerYear(m) / grunFlux(m) - 365.25 * 86400) < 1e-6);
});
