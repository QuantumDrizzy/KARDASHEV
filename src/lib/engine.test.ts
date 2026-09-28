import assert from "node:assert/strict";
import test from "node:test";
import {
  BEYOND_CHEMICAL,
  CHEMICAL_CEILING_S,
  PROPELLANTS,
  R_UNIVERSAL,
  chainConsequences,
  characteristicVelocity,
  evaluate,
  ispForMassRatio,
  pressureRatioForAreaRatio,
  results,
  specificImpulse,
  thrustCoefficient,
  vandenkerckhove,
} from "./engine.ts";
import { G0 } from "./constants.ts";
import { ISP_VACUUM_S, deltaVToGeo, massRatio } from "./transfer.ts";

/**
 * M20 locks. The load-bearing one is c* against published values: it is a pure
 * combustion property with no nozzle in it, so it isolates whether the
 * thermodynamics is right from whether the nozzle model is.
 */

test("[VALIDATION] c* lands within 3% of published for every pair", () => {
  // The yardstick. A units slip here is invisible in any self-consistency check
  // and immediately obvious against a published number — the first run of this
  // module was out by exactly sqrt(1000), from dividing by kg/mol instead of
  // g/mol, and this is what caught it.
  for (const r of results()) {
    assert.ok(Math.abs(r.cStarErrorFrac) < 0.03, `${r.label}: c* off by ${(r.cStarErrorFrac * 100).toFixed(1)}%`);
  }
  const lh2 = results().find((r) => r.id === "lox-lh2")!;
  assert.ok(Math.abs(lh2.cStar - 2296) < 15, `${lh2.cStar}`);
});

test("[VALIDATION] vacuum Isp lands near each engine's published figure", () => {
  // Looser than c* on purpose: Isp carries the nozzle, and area ratios differ
  // between every engine ever flown. Within 10% is the honest claim.
  for (const r of results()) {
    assert.ok(Math.abs(r.ispErrorFrac) < 0.1, `${r.engine}: Isp off by ${(r.ispErrorFrac * 100).toFixed(1)}%`);
  }
  // RS-25 is the tightest, because its chamber conditions are the best known.
  const rs25 = results().find((r) => r.engine === "RS-25")!;
  assert.ok(Math.abs(rs25.ispErrorFrac) < 0.02, `RS-25 ${(rs25.ispErrorFrac * 100).toFixed(1)}%`);
  assert.ok(rs25.ispVacS > 440 && rs25.ispVacS < 465);
});

test("[RESULT] the lever is molar mass, not chamber temperature", () => {
  const rs = results();
  const lh2 = rs.find((r) => r.id === "lox-lh2")!;
  const rp1 = rs.find((r) => r.id === "lox-rp1")!;
  const lh2p = PROPELLANTS.find((p) => p.id === "lox-lh2")!;
  const rp1p = PROPELLANTS.find((p) => p.id === "lox-rp1")!;
  // Hydrogen burns COOLER than kerosene and still wins, decisively.
  assert.ok(lh2p.chamberK < rp1p.chamberK, "LH2 must be the cooler flame");
  assert.ok(lh2.cStar > rp1.cStar, "and still the higher c*");
  // Because the group that matters is T/M, and hydrogen's exhaust is light.
  assert.ok(lh2.temperatureOverMolarMass > rp1.temperatureOverMolarMass * 1.5);
  // c* must scale as the square root of that group, at fixed gamma.
  const a = characteristicVelocity(3600, 13.5, 1.2);
  const b = characteristicVelocity(3600 * 4, 13.5, 1.2);
  assert.ok(Math.abs(b / a - 2) < 1e-12, "c* ∝ √T");
  const c = characteristicVelocity(3600, 13.5 * 4, 1.2);
  assert.ok(Math.abs(c / a - 0.5) < 1e-12, "c* ∝ 1/√M");
});

test("the area-ratio inversion round-trips", () => {
  // pressureRatioForAreaRatio is a bisection, so it needs its own check rather
  // than being trusted.
  for (const gamma of [1.15, 1.2, 1.25]) {
    for (const ar of [10, 40, 69, 165]) {
      const pr = pressureRatioForAreaRatio(ar, gamma);
      const back =
        vandenkerckhove(gamma) /
        Math.sqrt(((2 * gamma) / (gamma - 1)) * pr ** (2 / gamma) * (1 - pr ** ((gamma - 1) / gamma)));
      assert.ok(Math.abs(back / ar - 1) < 1e-6, `γ=${gamma} AR=${ar} → ${back}`);
      assert.ok(pr > 0 && pr < 1);
    }
  }
  // Bigger bell, lower exit pressure. Monotone, or the solve is meaningless.
  assert.ok(pressureRatioForAreaRatio(165, 1.2) < pressureRatioForAreaRatio(10, 1.2));
});

test("the nozzle behaves: bigger bells win in vacuum and lose at sea level", () => {
  const lh2 = PROPELLANTS.find((p) => p.id === "lox-lh2")!;
  // In vacuum, area ratio always helps.
  assert.ok(specificImpulse(lh2, { areaRatio: 165 }) > specificImpulse(lh2, { areaRatio: 20 }));
  // With ambient pressure, an over-expanded vacuum bell is worse than a small one.
  const amb = 1 / 200; // one bar of ambient against a 200 bar chamber
  const big = specificImpulse(lh2, { areaRatio: 165, ambientOverChamber: amb });
  const small = specificImpulse(lh2, { areaRatio: 20, ambientOverChamber: amb });
  assert.ok(big < small, "at sea level the big bell must lose");
  // And ambient pressure can only reduce thrust, never raise it.
  assert.ok(specificImpulse(lh2, { ambientOverChamber: amb }) < specificImpulse(lh2));
  assert.ok(thrustCoefficient(1.2, 69) > 1.5 && thrustCoefficient(1.2, 69) < 2.1, "Cf is order 2");
});

test("[RESULT] chemistry cannot do M14's Earth→GEO at a sane mass ratio", () => {
  const dv = deltaVToGeo();
  const cases = chainConsequences(dv);
  // What M14 assumed is reproduced: mass ratio 30.4 is exactly 380 s.
  const asAssumed = cases.find((c) => Math.abs(c.massRatio - 30.4) < 0.1)!;
  assert.ok(Math.abs(asAssumed.requiredIspS - ISP_VACUUM_S) < 5, `${asAssumed.requiredIspS} vs ${ISP_VACUUM_S}`);
  assert.ok(asAssumed.reachableChemically, "380 s is chemical, so M14's assumption was at least self-consistent");
  // But a single stage at mass ratio 3 needs ×2.6 the chemical ceiling.
  const sane = cases.find((c) => c.massRatio === 3)!;
  assert.ok(Math.abs(sane.requiredIspS - 1181) < 20, `${sane.requiredIspS} s`);
  assert.ok(!sane.reachableChemically);
  assert.ok(Math.abs(sane.versusChemicalCeiling - 2.62) < 0.1);
  // And it is inside nuclear-thermal territory, which is the honest next rung.
  assert.ok(sane.requiredIspS > BEYOND_CHEMICAL.nuclearThermal);
  assert.ok(sane.requiredIspS < BEYOND_CHEMICAL.ionElectric);
});

test("the Isp inversion is exactly Tsiolkovsky, read backwards", () => {
  // If these two ever disagree, one of M14 or M20 has the rocket equation wrong.
  for (const [dv, mr] of [
    [9000, 5],
    [12724, 30.4],
    [4000, 2],
  ] as [number, number][]) {
    const isp = ispForMassRatio(dv, mr);
    assert.ok(Math.abs(massRatio(dv, isp) - mr) / mr < 1e-9, `dv=${dv} mr=${mr}`);
  }
  assert.ok(Math.abs(ispForMassRatio(G0 * 100, Math.E) - 100) < 1e-9, "one e-fold is one exhaust velocity");
});

test("[KNOWN_LIMIT] the ceiling is a round figure, and the gas constant is per kmol", () => {
  // Stated so nobody reads 450 s as a derived bound on all chemistry.
  assert.equal(CHEMICAL_CEILING_S, 450);
  const best = Math.max(...results().map((r) => r.ispVacS));
  assert.ok(best < CHEMICAL_CEILING_S + 10, "no modelled pair may exceed the stated ceiling by much");
  // And the units trap that cost the first run: R_u here is J/(kmol·K), which is
  // what lets molar mass stay in g/mol. Off by 1000 and c* is off by √1000.
  assert.ok(Math.abs(R_UNIVERSAL - 8314.462618) < 1e-6);
  assert.ok(Math.abs(R_UNIVERSAL / 8.314462618 - 1000) < 1e-9);
});
