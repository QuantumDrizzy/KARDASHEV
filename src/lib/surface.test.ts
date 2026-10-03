import assert from "node:assert/strict";
import test from "node:test";
import {
  G_MOON,
  POLE_TO_EQUATOR_M,
  ROLLING_RESISTANCE,
  VOLATILE_SHARE,
  V_ESCAPE,
  V_ORBITAL,
  LUNAR_DUST_ACCRETION,
  fleetComparison,
  fleetFor,
  hopDeltaV,
  hopEqualsEscapeRangeM,
  hopLaunchSpeed,
  rollJPerKg,
  transportCase,
  transportLadder,
} from "./surface.ts";
import { EMBODIED_J_PER_KG } from "./isru.ts";
import { MU_MOON, R_MOON_M } from "./constants.ts";

/**
 * M30 locks. The load-bearing one is the hop-versus-escape crossover: if hopping
 * ever became cheaper than orbit at long range, the transport architecture this
 * module derives would be the wrong one.
 */

test("[VALIDATION] the lunar constants come out right, derived not quoted", () => {
  // g, orbital and escape all fall out of MU and R. If these drift, every
  // trajectory below is wrong and nothing else in the module would show it.
  assert.ok(Math.abs(G_MOON - 1.625) < 0.005, `${G_MOON.toFixed(3)} m/s²`);
  assert.ok(Math.abs(V_ORBITAL - 1680) < 10, `${V_ORBITAL.toFixed(0)} m/s`);
  assert.ok(Math.abs(V_ESCAPE - 2376) < 10, `${V_ESCAPE.toFixed(0)} m/s`);
  assert.ok(Math.abs(V_ESCAPE / V_ORBITAL - Math.SQRT2) < 1e-12, "escape must be √2 orbital");
  assert.ok(Math.abs(G_MOON - MU_MOON / R_MOON_M ** 2) < 1e-12);
});

test("the range equation returns orbital velocity at the antipode", () => {
  // The check that it is the right relation: a minimum-energy shot halfway round
  // a sphere needs exactly circular orbital speed.
  const antipodal = Math.PI * R_MOON_M;
  assert.ok(Math.abs(hopLaunchSpeed(antipodal) - V_ORBITAL) / V_ORBITAL < 1e-6);
  // Short hops are cheap and monotone in range.
  assert.ok(hopLaunchSpeed(1e5) < hopLaunchSpeed(5e5));
  assert.ok(hopLaunchSpeed(1e5) < 500, "a 100 km hop is a few hundred m/s");
  // And the total is exactly twice the launch, because you have to land.
  assert.ok(Math.abs(hopDeltaV(1e6) - 2 * hopLaunchSpeed(1e6)) < 1e-12);
});

test("[RESULT] past 1,181 km, leaving the Moon is cheaper than hopping across it", () => {
  const crossover = hopEqualsEscapeRangeM();
  assert.ok(Math.abs(crossover / 1000 - 1181) < 20, `${(crossover / 1000).toFixed(0)} km`);
  // At the crossover the two are equal by construction.
  assert.ok(Math.abs(hopDeltaV(crossover) / V_ESCAPE - 1) < 1e-6);
  // Below it hopping wins, above it orbit does.
  assert.ok(hopDeltaV(crossover * 0.5) < V_ESCAPE);
  assert.ok(hopDeltaV(crossover * 2) > V_ESCAPE);
  // And the distance M29's conflict opens is on the wrong side of it.
  assert.ok(POLE_TO_EQUATOR_M > crossover * 2, "pole to equator must be well past the crossover");
  assert.ok(Math.abs(POLE_TO_EQUATOR_M / 1000 - 2729) < 5, `${(POLE_TO_EQUATOR_M / 1000).toFixed(0)} km`);
});

test("[RESULT] rolling is cheaper than hopping and negligible against embodied energy", () => {
  const c = transportCase(POLE_TO_EQUATOR_M);
  assert.ok(Math.abs(c.rollJPerKg / 1e6 - 0.44) < 0.03, `${(c.rollJPerKg / 1e6).toFixed(2)} MJ/kg`);
  assert.ok(c.rollAdvantageX > 4 && c.rollAdvantageX < 7, `×${c.rollAdvantageX.toFixed(1)}`);
  // Under half a percent of what M11 spends making the kilogram in the first place.
  assert.ok(c.shareOfEmbodied < 0.01, `${(c.shareOfEmbodied * 100).toFixed(2)}%`);
  assert.ok(Math.abs(c.shareOfEmbodied - c.rollJPerKg / EMBODIED_J_PER_KG) < 1e-12);
  // Rolling is linear in distance and in the resistance coefficient.
  assert.ok(Math.abs(rollJPerKg(2e6) / rollJPerKg(1e6) - 2) < 1e-12);
  assert.ok(Math.abs(rollJPerKg(1e6, 0.2) / rollJPerKg(1e6, 0.1) - 2) < 1e-12);
  assert.equal(ROLLING_RESISTANCE, 0.1);
});

test("[THE INVERSION] only the volatiles cross, so the fleet is thousands not millions", () => {
  const f = fleetComparison();
  // ~23,000 rovers for the volatile flow, at ten tonnes and 10 km/h.
  assert.ok(f.volatilesOnly.rovers > 15_000 && f.volatilesOnly.rovers < 35_000, `${f.volatilesOnly.rovers.toFixed(0)}`);
  // Against 143 million if everything had to move.
  assert.ok(f.everything.rovers > 1e8, `${f.everything.rovers.toExponential(2)}`);
  // And the ratio must be exactly M11's volatile share — that is the inversion.
  assert.ok(Math.abs(f.volatilesOnly.rovers / f.everything.rovers - VOLATILE_SHARE) < 1e-9);
  // A 23-day round trip at walking pace across a quarter of the Moon.
  assert.ok(Math.abs(f.volatilesOnly.roundTripDays - 22.7) < 1, `${f.volatilesOnly.roundTripDays.toFixed(1)} d`);
});

test("the fleet scales the way a logistics chain should", () => {
  const base = fleetFor(1e9);
  // Twice the flow, twice the vehicles. Twice the speed, half.
  assert.ok(Math.abs(fleetFor(2e9).rovers / base.rovers - 2) < 1e-9);
  assert.ok(Math.abs(fleetFor(1e9, { speedKmH: 20 }).rovers / base.rovers - 0.5) < 1e-9);
  // Twice the distance, twice the vehicles. Twice the payload, half.
  assert.ok(Math.abs(fleetFor(1e9, { rangeM: 2 * POLE_TO_EQUATOR_M }).rovers / base.rovers - 2) < 1e-9);
  assert.ok(Math.abs(fleetFor(1e9, { payloadKg: 2e4 }).rovers / base.rovers - 0.5) < 1e-9);
});

test("the ladder is ordered and crosses escape exactly once", () => {
  const ladder = transportLadder();
  for (let i = 1; i < ladder.length; i++) {
    assert.ok(ladder[i].rangeM > ladder[i - 1].rangeM);
    assert.ok(ladder[i].hopDeltaVMs > ladder[i - 1].hopDeltaVMs);
    assert.ok(ladder[i].versusEscape > ladder[i - 1].versusEscape);
    // Rolling always beats hopping, at every range.
    assert.ok(ladder[i].rollAdvantageX > 1, `${ladder[i].rangeM} m`);
  }
  const first = ladder.findIndex((c) => c.versusEscape >= 1);
  assert.ok(first > 0, "short hops must be cheaper than escaping");
  assert.ok(ladder.slice(first).every((c) => c.versusEscape >= 1), "and it must not cross back");
});

test("[KNOWN_LIMIT] no terrain, no thermal cycle, no dust", () => {
  // Stated because a great circle across the Moon is not a road, and dust
  // destroyed mechanisms on every Apollo surface mission. Guard: the module
  // exposes no route, grade or wear model that could be mistaken for one.
  const c = transportCase(POLE_TO_EQUATOR_M);
  for (const k of ["gradeRad", "routeM", "dustWear", "thermalCycles"]) {
    assert.ok(!(k in c), `${k} is not modelled and must not appear`);
  }
});

test("[CITED] Apollo dust accretion is an upper limit of order, not wear", () => {
  assert.equal(LUNAR_DUST_ACCRETION.upperLimitOfOrder, 100);
  assert.equal(LUNAR_DUST_ACCRETION.unit, "μg cm-2 yr-1");
  assert.equal(LUNAR_DUST_ACCRETION.printed, "an upper limit of order 100 μg cm-2 yr-1");
  assert.equal(LUNAR_DUST_ACCRETION.isWearRate, false);
  assert.equal(LUNAR_DUST_ACCRETION.doi, "10.1002/2013SW000978");
  assert.equal(ROLLING_RESISTANCE, 0.1);
  const c = transportCase(POLE_TO_EQUATOR_M);
  assert.ok(!("dustWear" in c));
  assert.ok(!("dustWear" in LUNAR_DUST_ACCRETION));
  // The wheel energy is still only mu*g*d. The flux is not in it.
  assert.ok(Math.abs(c.rollJPerKg - ROLLING_RESISTANCE * G_MOON * POLE_TO_EQUATOR_M) < 1e-6);
});
