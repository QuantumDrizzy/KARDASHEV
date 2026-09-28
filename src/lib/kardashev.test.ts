import assert from "node:assert/strict";
import test from "node:test";
import { GAP_I, L_SUN, P_2023, P_I, kOf, powerAt, tw, yearsTo } from "./kardashev.ts";
import { AM0, DEFAULT_BENCH, SIGMA, blackbodyWm2, evaluate } from "./physics.ts";
import {
  DATACENTER_W,
  ELECTRICITY_W,
  NUCLEAR_W,
  P_INTERCEPT,
  TYPE_I_OF_DISK,
  twhYrToW,
  wattsPerSecond,
} from "./facts.ts";
import {
  LAMBDA,
  doublingsBetween,
  powerCompressed,
  yearsAccelerating,
  yearsCompressed,
  yearsInertial,
} from "./forecast.ts";

test("IEA 2023 TES is ~20 TW", () => {
  assert.ok(P_2023 > 1.9e13 && P_2023 < 2.05e13);
  assert.equal(Math.round(tw(P_2023)), 20);
});

test("Sagan rungs", () => {
  assert.equal(kOf(P_I), 1);
  assert.equal(kOf(1e26), 2);
  assert.equal(kOf(1e36), 3);
});

test("gap to Type I is ~509× not 27 points", () => {
  assert.ok(GAP_I > 500 && GAP_I < 520);
});

test("Sun is Sagan K ≈ 2.06", () => {
  assert.ok(kOf(L_SUN) > 2.05 && kOf(L_SUN) < 2.07);
});

test("1.8%/yr from 2024 does not hit Type I in 2030", () => {
  const y = yearsTo(P_I, P_2023);
  assert.ok(y > 300 && y < 400);
  assert.ok(powerAt(Date.UTC(2030, 0, 1)) < 3e13);
});

test("λ=1 compressed years equals inertial", () => {
  const n = doublingsBetween(P_2023, P_I);
  const a = yearsCompressed(n, 1);
  const b = yearsInertial();
  assert.ok(Math.abs(a - b) < 1);
});

test("λ=0.62 is ~100 years to Type I", () => {
  const y = yearsAccelerating(P_2023, P_I, LAMBDA);
  assert.ok(y > 95 && y < 110);
  assert.ok(y < yearsInertial() * 0.4);
});

test("powerCompressed at t=0 is P0", () => {
  assert.equal(powerCompressed(0, 0.7), P_2023);
});

test("AM0 and σ", () => {
  assert.equal(AM0, 1361);
  assert.ok(Math.abs(SIGMA - 5.670374419e-8) < 1e-15);
  const bb = blackbodyWm2(320, 0.85);
  assert.ok(bb > 490 && bb < 520);
});

test("default sat: solar covers compute", () => {
  const r = evaluate(DEFAULT_BENCH);
  assert.ok(r.solarMargin > 1.1, `margin ${r.solarMargin}`);
  assert.ok(r.radiatorM2 > 200 && r.radiatorM2 < 400);
  assert.equal(r.constellationKw, 81 * 120);
});

test("Earth intercepts ~1.74e17 W; Type I is ~6% of the disk", () => {
  assert.ok(P_INTERCEPT > 1.7e17 && P_INTERCEPT < 1.78e17);
  assert.ok(TYPE_I_OF_DISK > 0.05 && TYPE_I_OF_DISK < 0.07);
});

test("TWh/yr is Wh, not J — the 3600 that used to be missing", () => {
  // 1 TWh/yr over a year is 1e12 Wh / 3.156e7 s = 114.1 MW.
  assert.ok(Math.abs(twhYrToW(1) - 1.1408e8) / 1.1408e8 < 1e-3);
  // Electricity ~30,000 TWh/yr = ~3.4 TW, an order under the ~20 TW of TES.
  assert.ok(ELECTRICITY_W > 3.3e12 && ELECTRICITY_W < 3.6e12);
  assert.ok(ELECTRICITY_W < P_2023 / 5);
  // NUMBERS.md: 460 TWh of datacentres is "order of 50 GW".
  assert.ok(DATACENTER_W > 4.5e10 && DATACENTER_W < 6e10);
  // 2,700 TWh of nuclear electricity ~ 308 GW.
  assert.ok(NUCLEAR_W > 2.9e11 && NUCLEAR_W < 3.3e11);
});

test("inertial TES adds ~11 kW every second", () => {
  const wps = wattsPerSecond(P_2023);
  assert.ok(wps > 8e3 && wps < 1.5e4);
});
