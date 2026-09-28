import assert from "node:assert/strict";
import test from "node:test";
import { P_I } from "./kardashev.ts";
import { MU_EARTH, PANEL_W_M2, R_EARTH_M, STARSHIP_PAYLOAD_KG } from "./orbit.ts";
import {
  COLLECTOR_W_M2,
  EARTH_ROTATION_MS,
  FLEXIBLE_ARRAY_KG_M2,
  MU_MOON,
  R_MOON_M,
  STARSHIP,
  WHY_NOT_ENERGY,
  WORLD_CADENCE_PER_DAY,
  arealGapX,
  buildPlan,
  energyPayback,
  escapeEnergyPerKg,
  launchEnergyPerKg,
  liftVerdict,
  orbitalEnergyPerKg,
  requiredArealKgM2,
  rocketOverhead,
} from "./lift.ts";

test("the energy floor to orbit is derived, not quoted", () => {
  // eps = mu(1/R - 1/2a). At 550 km that is 33.8 MJ/kg.
  const e = orbitalEnergyPerKg(550);
  assert.ok(Math.abs(e / 1e6 - 33.8) < 0.3, `${e / 1e6} MJ/kg`);
  // Higher orbit costs more, monotonically.
  assert.ok(orbitalEnergyPerKg(1000) > orbitalEnergyPerKg(400));
  // The closed form must match a direct KE + PE construction.
  const a = R_EARTH_M + 550e3;
  const direct = MU_EARTH / R_EARTH_M - MU_EARTH / (2 * a);
  assert.ok(Math.abs(e - direct) < 1e-6);
  // Earth's spin is a rounding error against it.
  assert.ok(EARTH_ROTATION_MS ** 2 / 2 / e < 0.005);
});

test("a real rocket is ~15x the floor, and that turns out not to matter", () => {
  const real = launchEnergyPerKg(STARSHIP);
  assert.ok(Math.abs(real / 1e6 - 500) < 30, `${real / 1e6} MJ/kg`);
  const overhead = rocketOverhead();
  assert.ok(overhead > 12 && overhead < 18, `${overhead}x`);
  // Consistency: the vehicle's own numbers reproduce it.
  const perKgProp = STARSHIP.fuelJPerKg / (1 + STARSHIP.oxidiserRatio);
  assert.ok(Math.abs(real - (STARSHIP.propellantKg * perKgProp) / STARSHIP.payloadKg) < 1);
});

test("[RESULT] a collector repays its launch energy in about three weeks", () => {
  const p = energyPayback(FLEXIBLE_ARRAY_KG_M2);
  assert.ok(p.days > 15 && p.days < 30, `${p.days} days`);
  assert.ok(Math.abs(p.wattsPerM2 - COLLECTOR_W_M2) < 1e-9);
  assert.ok(Math.abs(COLLECTOR_W_M2 - 337) < 5);
  // Over a 5-year life that is an EROEI in the high tens.
  assert.ok(p.eroei > 50, `${p.eroei}`);
  // Lighter film pays back proportionally faster.
  assert.ok(Math.abs(energyPayback(0.6).days / p.days - 0.5) < 1e-9);
});

test("[RESULT] and the build takes millennia, which is the actual problem", () => {
  const plan = buildPlan(FLEXIBLE_ARRAY_KG_M2, 3);
  // The area of Africa, in orbit.
  assert.ok(Math.abs(plan.areaM2 / 1e12 - 29.7) < 1, `${plan.areaM2 / 1e12}e12 m2`);
  assert.ok(Math.abs(plan.massKg / 1e12 - 35.7) < 2, `${plan.massKg / 1e12} Gt`);
  assert.ok(plan.flights > 3e8, `${plan.flights} flights`);
  assert.ok(plan.years > 3e5, `${plan.years} years at 3/day`);
  // Even a hundredfold cadence leaves ten millennia.
  assert.ok(buildPlan(FLEXIBLE_ARRAY_KG_M2, 100).years > 9000);
  // Cadence is linear: it can never close a five-order-of-magnitude gap alone.
  assert.ok(
    Math.abs(buildPlan(FLEXIBLE_ARRAY_KG_M2, 300).years * 100 - buildPlan(FLEXIBLE_ARRAY_KG_M2, 3).years) < 1,
  );
});

test("[TARGET] a century at 100 flights/day demands 12 g/m²", () => {
  const req = requiredArealKgM2(100, 100);
  assert.ok(Math.abs(req * 1000 - 12.3) < 1, `${req * 1000} g/m2`);
  // Today's arrays are ~98x too heavy for that.
  const gap = arealGapX(100, 100);
  assert.ok(gap > 90 && gap < 110, `${gap}x`);
  // The inverse is exact: build at the required density and the deadline is met.
  const plan = buildPlan(req, 100);
  assert.ok(Math.abs(plan.years - 100) < 0.5, `${plan.years} years`);
  // Sanity: the area comes from Type I and the panel chain, not a constant.
  assert.ok(Math.abs(plan.areaM2 - P_I / PANEL_W_M2) < 1);
});

test("today's whole planet launches 0.7 times a day", () => {
  assert.ok(Math.abs(WORLD_CADENCE_PER_DAY - 0.684) < 0.02);
  // So "100 flights/day" is already ~150x the entire world, every day, for a century.
  assert.ok(100 / WORLD_CADENCE_PER_DAY > 140);
  assert.equal(buildPlan(1.2, 100).payloadKg, STARSHIP_PAYLOAD_KG);
});

test("[DOCTRINE] the binding constraint is logistics, not energy", () => {
  const v = liftVerdict();
  assert.equal(v.bindingConstraint, "logistics");
  assert.ok(v.paybackDays < 30, "payback should be weeks");
  assert.ok(v.yearsAtTodaysMass > 1000, "the build should be millennia");
  assert.ok(v.gapX > 50);
  assert.equal(WHY_NOT_ENERGY.paybackIsWeeks, true);
  assert.equal(WHY_NOT_ENERGY.rocketInefficiencyIrrelevant, true);
});

test("lunar material is twelve times cheaper to move, and that is arithmetic", () => {
  const moon = escapeEnergyPerKg(MU_MOON, R_MOON_M);
  assert.ok(Math.abs(moon / 1e6 - 2.82) < 0.1, `${moon / 1e6} MJ/kg`);
  const adv = liftVerdict().lunarAdvantageX;
  assert.ok(adv > 10 && adv < 14, `${adv}x`);
  // In-situ material is what the arithmetic leaves standing, not enthusiasm.
  assert.ok(moon < orbitalEnergyPerKg(550));
});
