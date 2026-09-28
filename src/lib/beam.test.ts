import assert from "node:assert/strict";
import test from "node:test";
import { deltaTEffectiveExactK } from "./thermal.ts";
import {
  BANDS,
  BEAM_VERDICT,
  CHAIN,
  C_LIGHT,
  GROUND_PV_W_M2,
  LAND_ADVANTAGE_X,
  ORBITS,
  RECTENNA_W_M2,
  TAU_95,
  apertureProductM4,
  beamBudget,
  diameterM,
  receiverAreaM2,
  rectennaAreaM2,
  thermalComparison,
  wavelengthM,
} from "./beam.ts";

test("[THE POINT] beaming does not relax the thermal limit", () => {
  // M6 costed generation; the constraint is on dissipation. Generate in orbit,
  // use on Earth, and the waste heat is the same as generating it here.
  const useful = 1e15; // 1000 TW delivered
  const c = thermalComparison(useful);
  assert.ok(c.beamedEarthHeatW >= useful, "delivered power still becomes heat here");
  assert.ok(c.beamedDeltaTK > 0.4, `${c.beamedDeltaTK} K`);
  // Same order as generating it terrestrially from a new-heat source.
  assert.ok(Math.abs(c.beamedDeltaTK / deltaTEffectiveExactK(useful) - 1) < 0.35);
  assert.equal(BEAM_VERDICT.relaxesThermalLimit, false);
  assert.equal(BEAM_VERDICT.loadMustLeaveNotJustGeneration, true);
});

test("[RESULT] beamed solar is thermally worse than ground solar", () => {
  // Ground solar recycles insolation already in the budget: net zero.
  // Beamed solar collects photons that would have missed Earth: all new, plus
  // the Earth-side losses on top.
  const c = thermalComparison(1e12);
  assert.equal(c.groundSolarEarthHeatW, 0);
  assert.equal(c.groundSolarDeltaTK, 0);
  assert.ok(c.penaltyPerUsefulW > 1, `${c.penaltyPerUsefulW} per useful W`);
  assert.ok(c.penaltyPerUsefulW < 1.5, "the penalty should be tens of percent, not multiples");
  assert.equal(BEAM_VERDICT.worseThanGroundSolarThermally, true);
});

test("the loss chain is bookkept by WHERE each loss lands", () => {
  const b = beamBudget(1e9);
  // End to end lands in the 50-70% band that whole-system estimates quote.
  assert.ok(b.endToEndEta > 0.5 && b.endToEndEta < 0.7, `${b.endToEndEta}`);
  // Everything is conserved.
  assert.ok(Math.abs(b.deliveredW + b.lostOnEarthW + b.lostInOrbitW - b.orbitalW) < 1);
  // Orbit-side losses radiate to 3 K and never join Earth's budget.
  assert.ok(b.lostInOrbitW > 0);
  assert.equal(CHAIN.dcToRf.lossLandsOn, "orbit");
  assert.equal(CHAIN.rfToDc.lossLandsOn, "earth");
  // Earth's heat load is the delivered power plus the Earth-side losses.
  assert.ok(Math.abs(b.earthHeatW - (b.deliveredW + b.lostOnEarthW)) < 1e-6);
});

test("diffraction sets the aperture product, and nothing else moves it", () => {
  // sqrt(At*Ar) = tau * lambda * D.
  const hz = 2.45e9;
  const prod = apertureProductM4(hz, ORBITS.geo);
  assert.ok(Math.abs(Math.sqrt(prod) - TAU_95 * wavelengthM(hz) * ORBITS.geo) < 1);
  // 1 km^2 transmitter at GEO on 2.45 GHz needs a ~77 km^2 rectenna, ~10 km across.
  const ar = receiverAreaM2(hz, ORBITS.geo, 1e6);
  assert.ok(Math.abs(ar / 1e6 - 76.7) < 3, `${ar / 1e6} km2`);
  assert.ok(Math.abs(diameterM(ar) / 1000 - 9.9) < 0.5);
  // Quadratic in wavelength: 5.8 GHz cuts it by (2.45/5.8)^2.
  const ar58 = receiverAreaM2(5.8e9, ORBITS.geo, 1e6);
  assert.ok(Math.abs(ar58 / ar - (2.45 / 5.8) ** 2) < 1e-9);
  // Quadratic in distance too — LEO makes the optics trivial.
  assert.ok(receiverAreaM2(hz, ORBITS.leo, 1e6) / ar < 0.001);
  assert.equal(wavelengthM(C_LIGHT), 1);
  assert.ok(BANDS.length >= 3);
});

test("the real case for beaming is land and continuity, not K", () => {
  // A rectenna at 230 W/m^2 continuous beats ground PV at ~60 W/m^2 mean.
  assert.ok(Math.abs(GROUND_PV_W_M2 - 59.9) < 1);
  assert.ok(Math.abs(LAND_ADVANTAGE_X - 3.8) < 0.2, `${LAND_ADVANTAGE_X}x`);
  // 1 TW delivered needs ~4,350 km^2 of rectenna.
  assert.ok(Math.abs(rectennaAreaM2(1e12) / 1e6 - 4348) < 50);
  assert.equal(RECTENNA_W_M2, 230);
  assert.deepEqual([...BEAM_VERDICT.realCase], ["land use", "continuity through night and winter"]);
});

test("[DOCTRINE] SBSP and the thesis are different architectures", () => {
  // SBSP moves the generation and leaves the load. The thesis moves the load.
  // Only the second one touches K.
  assert.ok(BEAM_VERDICT.note.includes("different architectures"));
  assert.ok(BEAM_VERDICT.note.includes("Only"));
  assert.equal(BEAM_VERDICT.loadMustLeaveNotJustGeneration, true);
});
