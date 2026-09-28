import assert from "node:assert/strict";
import test from "node:test";
import {
  ASCENT_LOSSES_MS,
  ISP_VACUUM_S,
  arealDensityToGeoKgM2,
  biEllipticDeltaV,
  circularSpeed,
  ascentDeltaV,
  deltaVFromSurface,
  deltaVToGeo,
  destinationCost,
  destinationPenalty,
  lunarDelivery,
  massRatio,
  sourcingAdvantage,
  transferComparison,
  transferLadder,
} from "./transfer.ts";
import { R_EARTH_M, G0 } from "./constants.ts";
import { geoAltitudeKm, hohmann } from "./orbit.ts";
import { requiredArealKgM2 } from "./lift.ts";

/**
 * M14 locks. The load-bearing ones are the bi-elliptic crossover (which
 * validates both transfer formulas against a classical result) and the direction
 * of the sourcing advantage as the destination rises.
 */

test("circular speed matches the sidereal-day derivation at GEO", () => {
  // orbit.ts derives GEO altitude from the rotation period. If this module's
  // vis-viva disagrees with that, one of the two is wrong.
  const v = circularSpeed(R_EARTH_M + geoAltitudeKm() * 1000);
  const period = (2 * Math.PI * (R_EARTH_M + geoAltitudeKm() * 1000)) / v;
  assert.ok(Math.abs(period - 86_164.0905) < 1, `period ${period} s, expected a sidereal day`);
});

test("Tsiolkovsky is the exponential the rest of the repo lacks", () => {
  assert.equal(massRatio(0), 1);
  // A Δv of exactly one exhaust velocity must give e.
  assert.ok(Math.abs(massRatio(ISP_VACUUM_S * G0) - Math.E) < 1e-9);
  // And it must compose: two burns multiply, they do not add.
  assert.ok(Math.abs(massRatio(3000) * massRatio(4000) - massRatio(7000)) < 1e-6);
});

test("the Δv budgets land on the published figures", () => {
  const leo = deltaVFromSurface(550);
  // ~9.4 km/s to LEO is the standard number; with our loss and rotation terms
  // we should be within a few hundred m/s of it.
  assert.ok(leo > 8500 && leo < 9600, `Earth→LEO ${leo} m/s`);
  // LEO→GEO Hohmann is ~3.9 km/s.
  const transfer = hohmann(R_EARTH_M + 550e3, R_EARTH_M + geoAltitudeKm() * 1000).dv;
  assert.ok(transfer > 3600 && transfer < 4100, `LEO→GEO ${transfer} m/s`);
  assert.ok(Math.abs(deltaVToGeo() - (leo + transfer)) < 1e-6);
  // Losses must actually be additive, not baked in twice.
  assert.ok(Math.abs(ascentDeltaV(550, 0) - (leo - ASCENT_LOSSES_MS)) < 1e-9);
  // [REGRESSION] Direct injection at circular speed made 2,000 km look cheaper
  // than 550 km, because circular speed falls with radius. Climbing must cost.
  assert.ok(deltaVFromSurface(2000) > leo, "a higher destination must cost Earth more");
  assert.ok(circularSpeed(R_EARTH_M + 2000e3) < circularSpeed(R_EARTH_M + 550e3), "which is why");
});

test("[VALIDATION] Hohmann beats bi-elliptic below the classical crossover", () => {
  const r1 = R_EARTH_M + 550e3;
  const rGeo = R_EARTH_M + geoAltitudeKm() * 1000;
  // LEO→GEO is a radius ratio of ~6.1, well inside Hohmann's regime (<11.94).
  const c = transferComparison(r1, rGeo);
  assert.ok(c.radiusRatio > 5.5 && c.radiusRatio < 6.5);
  assert.ok(c.hohmannWins, "Hohmann must win at a ratio of 6");
  // ...and must LOSE far above the upper crossover (~15.58), with a distant
  // apoapsis. If this fails, one of the two formulas has a sign error.
  const far = transferComparison(r1, r1 * 60, 400);
  assert.ok(!far.hohmannWins, "bi-elliptic must win at a ratio of 60");
  // Bi-elliptic must improve monotonically as the apoapsis is pushed out.
  const near = biEllipticDeltaV(r1, r1 * 60, r1 * 60 * 5);
  const distant = biEllipticDeltaV(r1, r1 * 60, r1 * 60 * 500);
  assert.ok(distant < near);
});

test("[RESULT] energy is linear in altitude and delivery is not", () => {
  const p = destinationPenalty();
  // lift.ts sees ×1.71. A vehicle pays ×2.77.
  assert.ok(Math.abs(p.energyRatio - 1.71) < 0.05, `energy ratio ${p.energyRatio}`);
  assert.ok(Math.abs(p.payloadPenalty - 2.77) < 0.1, `payload penalty ${p.payloadPenalty}`);
  // Reasoning in joules understates the cost by more than half.
  assert.ok(p.understatement > 0.5, `understatement ${p.understatement}`);
  // The exponential must always exceed the linear term — that is the point.
  assert.ok(p.payloadPenalty > p.energyRatio);
});

test("[TIGHTENS M7] the areal density requirement gets 2.8x harder", () => {
  const leo = requiredArealKgM2(100, 100);
  const geo = arealDensityToGeoKgM2(100, 100);
  assert.ok(Math.abs(leo * 1000 - 12.3) < 0.5, `M7 said ${(leo * 1000).toFixed(1)} g/m²`);
  assert.ok(Math.abs(geo * 1000 - 4.44) < 0.2, `to GEO ${(geo * 1000).toFixed(2)} g/m²`);
  // The gap against a real wing widens from ×183 to ×505.
  const gapLeo = 2.24 / leo;
  const gapGeo = 2.24 / geo;
  assert.ok(gapLeo > 170 && gapLeo < 195);
  assert.ok(gapGeo > 470 && gapGeo < 540, `gap ×${gapGeo.toFixed(0)}`);
  // M7's energy conclusion must nonetheless survive: still trivial payback.
  const energy = destinationCost("GEO", geoAltitudeKm()).energyJPerKg;
  assert.ok(energy / 1e6 < 100, "GEO orbital energy is still under 100 MJ/kg");
});

test("[RESULT] a higher destination is cheaper from the Moon, not dearer", () => {
  const toLeo = lunarDelivery(550);
  const toGeo = lunarDelivery(geoAltitudeKm());
  // Earth pays more to go higher; the Moon pays less, because it arrives from
  // outside and only has to shed energy.
  assert.ok(toGeo.totalMs < toLeo.totalMs, "Moon→GEO must be cheaper than Moon→LEO");
  assert.ok(toLeo.totalMs - toGeo.totalMs > 2000, "and by kilometres per second");
  assert.ok(toGeo.arrivalMs < toLeo.arrivalMs, "arrival speed falls with radius");
  // Escape from the Moon is the same either way — it is the capture that moves.
  assert.ok(Math.abs(toLeo.escapeMs - toGeo.escapeMs) < 1e-9);
  assert.ok(Math.abs(toGeo.escapeMs - 2376) < 5, `lunar escape ${toGeo.escapeMs}`);
});

test("[STRENGTHENS M11] the lunar advantage grows with the destination", () => {
  const leo = sourcingAdvantage(550);
  const geo = sourcingAdvantage(geoAltitudeKm());
  assert.ok(Math.abs(leo.advantageX - 1.8) < 0.2, `LEO advantage ×${leo.advantageX.toFixed(2)}`);
  assert.ok(Math.abs(geo.advantageX - 10.4) < 0.6, `GEO advantage ×${geo.advantageX.toFixed(2)}`);
  assert.ok(geo.advantageX / leo.advantageX > 4);
  // The honest counterweight: aerobraking is available at LEO and not at GEO.
  // The conclusion must survive giving the Moon that advantage at LEO too.
  const leoBraked = sourcingAdvantage(550, { aerobrake: true });
  assert.ok(leoBraked.advantageX > leo.advantageX, "aerobraking must help the LEO case");
  assert.ok(geo.advantageX > leoBraked.advantageX * 1.5, "and GEO must still win clearly");
});

test("the ladder is monotone in both directions at once", () => {
  const ladder = transferLadder();
  for (let i = 1; i < ladder.length; i++) {
    // Earth pays more as the destination rises...
    assert.ok(ladder[i].earthDeltaVMs > ladder[i - 1].earthDeltaVMs, `${ladder[i].label} earth`);
    // ...and the Moon pays less. The scissors is the whole finding.
    assert.ok(ladder[i].moonDeltaVMs < ladder[i - 1].moonDeltaVMs, `${ladder[i].label} moon`);
    assert.ok(ladder[i].advantageX > ladder[i - 1].advantageX);
  }
  assert.equal(ladder[ladder.length - 1].label, "GEO");
});

test("[KNOWN_LIMIT] mass ratios are dry-mass-free, so only ratios may be quoted", () => {
  // A single-stage Tsiolkovsky with no structure gives absurd absolute numbers.
  // The guard: the module's conclusions must be invariant to Isp, because they
  // are ratios. If a conclusion moves with Isp, it is quoting a payload.
  const a380 = sourcingAdvantage(geoAltitudeKm()).advantageX;
  assert.ok(massRatio(9000, 380) > 10, "absolute mass ratios are large and not to be published");
  // Advantage at a different Isp must still be decisively above the LEO figure.
  const leo380 = sourcingAdvantage(550).advantageX;
  assert.ok(a380 > leo380 * 4, "the direction of the result is what survives");
});
