import assert from "node:assert/strict";
import test from "node:test";
import {
  L_SUN_W,
  MID_IR_SENSITIVITY_JY,
  PARSEC_M,
  R_SUN_M,
  detectionDistancePc,
  earthTransitPpm,
  integratedRadiance,
  occultationDepthPpm,
  occultationSignature,
  planckBnu,
  radiatorAreaM2,
  spectralAdvantage,
  stefanBoltzmannRadiance,
  thermalSignature,
  totalArrayAreaM2,
  wienPeakHz,
  wienPeakM,
} from "./signature.ts";
import { P_I } from "./kardashev.ts";
import { radiatorFluxWm2 } from "./reject.ts";
import { TYPE_I_AREA_M2 } from "./collector.ts";

/**
 * M18 locks. The load-bearing one is the Planck-against-Stefan-Boltzmann
 * validation: if the spectral function is wrong every contrast here is wrong,
 * and integrating it is a yardstick that does not depend on this module.
 */

test("[VALIDATION] Planck integrates to sigma*T^4/pi", () => {
  // The independent check. Any error in the exponent or the prefactor shows up
  // here immediately, and nothing else in the module would reveal it.
  for (const T of [320, 400, 5772]) {
    const numeric = integratedRadiance(T);
    const exact = stefanBoltzmannRadiance(T);
    assert.ok(Math.abs(numeric / exact - 1) < 0.01, `at ${T} K: ${numeric} vs ${exact}`);
  }
});

test("Planck has the right limits on both tails", () => {
  const T = 320;
  const nuPeak = wienPeakHz(T);
  // Rayleigh-Jeans: far below the peak, B goes as nu^2.
  // Far enough down the tail that x << 1 actually holds: at nuPeak/100 the
  // ratio is already 3.91 rather than 4, which is the correction term, not an error.
  const lo = nuPeak / 1000;
  assert.ok(Math.abs(planckBnu(lo * 2, T) / planckBnu(lo, T) - 4) < 0.02, "low tail must go as nu^2");
  // Wien: far above, it falls exponentially and fast.
  assert.ok(planckBnu(nuPeak * 10, T) / planckBnu(nuPeak, T) < 1e-8);
  // Hotter is brighter at every frequency.
  for (const nu of [1e12, 1e13, 1e14]) assert.ok(planckBnu(nu, 400) > planckBnu(nu, 320));
});

test("Wien displacement and its frequency form agree", () => {
  // 320 K peaks at 9.06 µm; 5772 K at 502 nm, which is visible light.
  assert.ok(Math.abs(wienPeakM(320) * 1e6 - 9.06) < 0.05);
  assert.ok(Math.abs(wienPeakM(5772) * 1e9 - 502) < 3);
  assert.ok(Math.abs(wienPeakHz(320) * wienPeakM(320) - 299_792_458) < 1);
});

test("the radiator area comes from M10 and not from a second definition", () => {
  assert.ok(Math.abs(radiatorAreaM2(320) - P_I / radiatorFluxWm2(320)) < 1e-6);
  assert.ok(radiatorAreaM2(320) > 1.9e13 && radiatorAreaM2(320) < 2.1e13);
  assert.ok(Math.abs(totalArrayAreaM2(320) - (TYPE_I_AREA_M2 + radiatorAreaM2(320))) < 1e-6);
  // Hotter radiator, smaller area — T⁴.
  assert.ok(radiatorAreaM2(400) < radiatorAreaM2(320));
});

test("[RESULT] Type I is invisible in the infrared, by seven orders", () => {
  const s = thermalSignature(10, 320);
  // 26 parts per trillion bolometrically.
  assert.ok(Math.abs(s.bolometricContrast - P_I / L_SUN_W) < 1e-20);
  assert.ok(s.bolometricContrast < 1e-10);
  // ~29 parts per billion at the Wien peak — the best case, and hopeless.
  assert.ok(s.contrast > 1e-8 && s.contrast < 5e-8, `contrast ${s.contrast.toExponential(2)}`);
  // No photometry reaches parts per billion. State the gap against 1e-4.
  assert.ok(s.contrast * 1e4 < 1, "the contrast must be far below any photometric precision");
  // Absolute flux at 10 pc is sub-microjansky.
  assert.ok(s.arrayFluxJy < 1e-6, `${s.arrayFluxJy * 1e6} µJy`);
  assert.ok(s.starFluxJy > 1, "and the star is a few jansky");
});

test("[RESULT] going to the mid-IR buys three orders, and it is not enough", () => {
  // The whole reason mid-IR is the right band: a cold source against a hot
  // photosphere's Rayleigh-Jeans tail. Real, large, and insufficient.
  const advantage = spectralAdvantage(320);
  assert.ok(advantage > 700 && advantage < 1300, `×${advantage.toFixed(0)}`);
  // And it must actually be an improvement, not a regression.
  const s = thermalSignature(10, 320);
  assert.ok(s.contrast > s.bolometricContrast);
});

test("reach falls as 1/d^2 and is a handful of parsecs", () => {
  const reach = detectionDistancePc(MID_IR_SENSITIVITY_JY, 320);
  assert.ok(reach > 2 && reach < 4, `${reach.toFixed(2)} pc`);
  // Inverse square: quartering the sensitivity threshold doubles the reach.
  assert.ok(Math.abs(detectionDistancePc(MID_IR_SENSITIVITY_JY / 4, 320) / reach - 2) < 1e-6);
  // Flux itself must fall as 1/d².
  const near = thermalSignature(5, 320).arrayFluxJy;
  const far = thermalSignature(10, 320).arrayFluxJy;
  assert.ok(Math.abs(near / far - 4) < 1e-9);
});

test("[RESULT] occultation is six orders easier than emission", () => {
  const o = occultationSignature(320);
  // 32.5 ppm against Earth's 83.9 — about two fifths of an Earth transit.
  assert.ok(Math.abs(o.arrayPpm - 32.5) < 1.5, `${o.arrayPpm.toFixed(1)} ppm`);
  assert.ok(Math.abs(o.earthPpm - 83.9) < 0.5);
  assert.ok(o.versusEarth > 0.3 && o.versusEarth < 0.5);
  // The asymmetry: area ratio 3e-5 against luminosity ratio 3e-11.
  assert.ok(o.easierThanThermalX > 1e2, `occultation is only ×${o.easierThanThermalX.toFixed(0)} easier`);
  // And it must be inside reach of existing photometry, unlike the thermal case.
  assert.ok(o.arrayPpm > 10, "a 10 ppm-class instrument must be able to see it");
});

test("occultation is a pure area ratio and Earth's transit anchors it", () => {
  assert.ok(Math.abs(occultationDepthPpm(Math.PI * R_SUN_M ** 2) - 1e6) < 1e-6, "the whole disk is unity");
  assert.equal(occultationDepthPpm(0), 0);
  // Earth's depth must equal (R_earth/R_sun)^2 exactly.
  assert.ok(Math.abs(earthTransitPpm() - (6.371e6 / R_SUN_M) ** 2 * 1e6) < 1e-9);
});

test("[CORRECTED] running hot for mass makes every detection axis worse", () => {
  // The first version of this test asserted the opposite, from a scratch
  // calculation that held the radiator area fixed. A hotter radiator is smaller
  // as T^-4 while its peak radiance grows only as T^3, so the flux FALLS.
  const cold = thermalSignature(10, 320);
  const hot = thermalSignature(10, 500);
  assert.ok(hot.arrayFluxJy < cold.arrayFluxJy, "hotter is fainter at its own peak");
  assert.ok(hot.contrast < cold.contrast, "and worse against the star, which brightens as nu^2");
  assert.ok(detectionDistancePc(MID_IR_SENSITIVITY_JY, 500) < detectionDistancePc(MID_IR_SENSITIVITY_JY, 320));
  assert.ok(occultationSignature(500).arrayPpm < occultationSignature(320).arrayPpm, "and it blocks less light");
  // The exact scalings, which are what make this a physics result and not a
  // coincidence of two chosen temperatures.
  assert.ok(Math.abs(thermalSignature(10, 640).arrayFluxJy / cold.arrayFluxJy - 0.5) < 1e-3, "flux ∝ 1/T");
  const contrastRatio = thermalSignature(10, 640).contrast / cold.contrast;
  assert.ok(contrastRatio > 0.11 && contrastRatio < 0.17, "contrast ∝ ~1/T³");
});

test("a parsec is a parsec", () => {
  // The one place a unit slip would silently move every distance in the module.
  assert.ok(Math.abs(PARSEC_M - 3.0857e16) < 1e12);
  assert.ok(Math.abs(PARSEC_M / 9.4607e15 - 3.262) < 0.01, "≈3.26 light years");
});
