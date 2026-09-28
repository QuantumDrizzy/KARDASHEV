import assert from "node:assert/strict";
import test from "node:test";
import { P_2023, P_I, tw } from "./kardashev.ts";
import { SIGMA, blackbodyWm2 } from "./physics.ts";
import { P_INTERCEPT } from "./facts.ts";
import {
  deltaTFromMix,
  groundSolarAreaM2,
  groundSolarLandFraction,
  groundSolarPlanetFraction,
  isNewHeat,
  EARTH_AREA_M2,
  EARTH_RADIATED_W,
  GREENHOUSE_FORCING_W_M2,
  OLR_W_M2,
  THERMAL_LADDER,
  T_EFFECTIVE_K,
  WHY_ORBIT,
  crustBudget,
  deltaTEffectiveExactK,
  deltaTEffectiveK,
  deltaTSurfaceK,
  greenhouseCrossoverW,
  localAnomaly,
  powerCeilingW,
  thermalPoint,
  wasteHeatFluxWm2,
} from "./thermal.ts";

test("the effective radiating temperature follows from sigma T^4 alone", () => {
  // 240 W/m^2 out => 255 K. Nothing here is quoted; it is inverted.
  assert.ok(Math.abs(T_EFFECTIVE_K - 255.1) < 0.2, `${T_EFFECTIVE_K}`);
  assert.ok(Math.abs(SIGMA * T_EFFECTIVE_K ** 4 - OLR_W_M2) < 1e-9);
  // The planet sheds ~122 PW, over the whole sphere, not the disk.
  assert.ok(Math.abs(EARTH_RADIATED_W / 1e15 - 122.4) < 0.5);
  // Sanity against facts.ts: the disk INTERCEPTS more than the sphere RADIATES,
  // because the intercept is before albedo and over a quarter of the area.
  assert.ok(P_INTERCEPT > EARTH_RADIATED_W);
  assert.ok(Math.abs(EARTH_AREA_M2 / (Math.PI * 6.371e6 ** 2) - 4) < 1e-9);
});

test("dT/T = (1/4) dP/P — the linearization holds where it is used", () => {
  // Exact and linear must agree while dP/P is small, and the exact form must be
  // the smaller of the two (T^0.25 is concave).
  for (const p of [P_2023, P_2023 * 10, P_2023 * 100]) {
    const lin = deltaTEffectiveK(p);
    const exact = deltaTEffectiveExactK(p);
    assert.ok(exact <= lin + 1e-12, "exact should not exceed the linearization");
    assert.ok(Math.abs(exact / lin - 1) < 0.05, `${p}: ${exact} vs ${lin}`);
  }
  // Doubling the power doubles the rise, in the regime that matters.
  const a = deltaTEffectiveK(P_2023 * 10);
  const b = deltaTEffectiveK(P_2023 * 20);
  assert.ok(Math.abs(b / a - 2) < 1e-12);
});

test("today waste heat really is negligible — which is why nobody cites it", () => {
  const now = thermalPoint("now", P_2023);
  assert.ok(now.deltaTEffK < 0.02, `${now.deltaTEffK} K`);
  assert.ok(now.fracOfOlr < 0.0005);
  // Greenhouse forcing beats direct heat by ~75x at present.
  assert.ok(now.versusGreenhouse < 0.02, `${now.versusGreenhouse}`);
  assert.ok(Math.abs(wasteHeatFluxWm2(P_2023) - 0.0385) < 0.002);
});

test("[RESULT] Type I on the crust is +5 K from waste heat alone", () => {
  const typeI = THERMAL_LADDER.find((p) => p.label === "Type I on the crust")!;
  assert.equal(typeI.powerW, P_I);
  // 8.2% of the outgoing flux.
  assert.ok(Math.abs(typeI.fracOfOlr - 0.082) < 0.002, `${typeI.fracOfOlr}`);
  assert.ok(typeI.deltaTEffK > 4.8 && typeI.deltaTEffK < 5.3, `${typeI.deltaTEffK} K`);
  // Surface warms slightly more, holding the greenhouse structure fixed.
  assert.ok(typeI.deltaTSurfaceK > typeI.deltaTEffK);
  assert.ok(typeI.deltaTSurfaceK > 5.5 && typeI.deltaTSurfaceK < 6.0);
  // And it dwarfs present greenhouse forcing by several times.
  assert.ok(typeI.versusGreenhouse > 5, `${typeI.versusGreenhouse}x`);
});

test("[RESULT] the crust can carry about 2% of Type I, so 98% must leave", () => {
  const b = crustBudget(0.1);
  assert.ok(Math.abs(tw(b.ceilingW) - 192) < 5, `${tw(b.ceilingW)} TW`);
  // Roughly ten times today's TES, and then thermodynamics stops you.
  assert.ok(b.headroomX > 9 && b.headroomX < 11);
  assert.ok(b.fracOfTypeI < 0.02);
  assert.ok(b.mustLeaveFrac > 0.98, `${b.mustLeaveFrac}`);
  // A ten-times looser budget buys ten times the power — linear, no escape.
  const loose = crustBudget(1.0);
  assert.ok(Math.abs(loose.ceilingW / b.ceilingW - 10) < 1e-9);
  // Even at +1 K, four fifths of Type I still cannot be terrestrial.
  assert.ok(loose.mustLeaveFrac > 0.8);
  assert.ok(powerCeilingW(0.1) === b.ceilingW);
});

test("the crossover where waste heat stops being a rounding error", () => {
  // At ~1,530 TW waste heat alone equals all of today's greenhouse forcing.
  const x = greenhouseCrossoverW();
  assert.ok(Math.abs(tw(x) - 1530) < 30, `${tw(x)} TW`);
  assert.ok(x / P_2023 > 70 && x / P_2023 < 85);
  assert.ok(Math.abs(wasteHeatFluxWm2(x) - GREENHOUSE_FORCING_W_M2) < 1e-9);
});

test("[CORRECTED] the limit is source-DEPENDENT, and each route fails differently", () => {
  // A first version claimed the constraint was a function of power alone. It is
  // not: insolation-derived power is already inside the budget and adds nothing.
  assert.equal(WHY_ORBIT.sourceIndependent, false);
  assert.equal(WHY_ORBIT.everyWattBecomesHeat, false);
  assert.equal(WHY_ORBIT.crustHasOneRadiator, true);
  // Every terrestrial route is closed, but by three different arguments.
  const r = WHY_ORBIT.terrestrialRoutesClosed;
  assert.ok(r.groundSolar.includes("geometry"));
  assert.ok(r.fusionOrFission.includes("thermal"));
  assert.ok(r.beamedFromOrbit.includes("thermal"));
  assert.ok(WHY_ORBIT.note.includes("Fusion does not help"));
});

test("[CORRECTION] recycled heat adds nothing; only new heat loads the radiator", () => {
  // Ground solar intercepts light already destined for absorption.
  assert.equal(isNewHeat("groundSolar"), false);
  assert.equal(isNewHeat("wind"), false);
  assert.equal(isNewHeat("hydro"), false);
  // Fusion is clean, not cold.
  assert.equal(isNewHeat("fusion"), true);
  assert.equal(isNewHeat("fission"), true);
  assert.equal(isNewHeat("fossil"), true);
  // Beamed power collects photons that would have missed Earth: new heat.
  assert.equal(isNewHeat("beamed"), true);

  // So today's figure drops once the renewable share is excluded...
  const all = deltaTEffectiveExactK(P_2023);
  const mixed = deltaTFromMix(P_2023);
  assert.ok(mixed < all, "the correction must reduce the number");
  assert.ok(Math.abs(mixed - 0.0086) < 0.0005, `${mixed} K`);
  // ...and an all-renewable civilization adds no waste heat at all.
  assert.equal(deltaTFromMix(P_2023, 0), 0);
  assert.ok(Math.abs(deltaTFromMix(P_I, 1) - deltaTEffectiveExactK(P_I)) < 1e-12);
});

test("[RESULT] ground solar fails on geometry, not on heat", () => {
  // 40 W/m^2 mean. Type I needs 250 million km^2.
  assert.ok(Math.abs(groundSolarAreaM2(P_I) / 1e12 - 250) < 10);
  // 1.7x all the land on Earth...
  assert.ok(groundSolarLandFraction(P_I) > 1.5, `${groundSolarLandFraction(P_I)}x land`);
  // ...or about half the entire planet, oceans included.
  assert.ok(Math.abs(groundSolarPlanetFraction(P_I) - 0.49) < 0.03);
  // And it is linear, so no efficiency gain of a plausible size rescues it.
  assert.ok(groundSolarLandFraction(P_I / 2) > 0.75);
});

test("orbit sheds to a 3 K sink and never enters this budget", () => {
  // The payoff, and the link to physics.ts: a 320 K radiator in vacuum sheds
  // hundreds of W/m^2 to space. That heat never joins Earth's 122 PW.
  const orbital = blackbodyWm2(320, 0.85);
  assert.ok(orbital > 490 && orbital < 520);
  // Two orders of magnitude more flux per m^2 than the planet manages.
  assert.ok(orbital / OLR_W_M2 > 2);
});

test("power density is a separate and worse problem than the global mean", () => {
  // 1 GW over 10 km^2 is 100 W/m^2 — a large fraction of the planetary flux,
  // concentrated. The global mean says nothing about this.
  const l = localAnomaly(1e9, 10);
  assert.equal(l.fluxWm2, 100);
  assert.ok(l.versusSolarAbsorbed > 0.4);
  assert.ok(l.deltaTLocalK > 20, `${l.deltaTLocalK} K local`);
  // Spread the same power over the planet and it vanishes.
  const global = deltaTEffectiveExactK(1e9);
  assert.ok(global < 1e-4);
});

test("the ladder is monotone and anchored on the canonical constants", () => {
  for (let i = 1; i < THERMAL_LADDER.length; i++) {
    assert.ok(THERMAL_LADDER[i].powerW > THERMAL_LADDER[i - 1].powerW);
    assert.ok(THERMAL_LADDER[i].deltaTEffK > THERMAL_LADDER[i - 1].deltaTEffK);
  }
  assert.equal(THERMAL_LADDER[0].powerW, P_2023);
  assert.equal(THERMAL_LADDER[THERMAL_LADDER.length - 1].powerW, P_I);
  assert.equal(deltaTSurfaceK(0), 0);
});
