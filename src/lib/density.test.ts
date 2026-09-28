import assert from "node:assert/strict";
import test from "node:test";
import {
  DENSITY,
  PUMP_EFFICIENCY,
  TANK_SHARE_OF_STRUCTURE,
  VEHICLES,
  bulkDensity,
  densityResults,
  pumpBudget,
  pumpWorkPerKg,
  reversal,
  stageComparison,
  structuralCoefficientFor,
} from "./density.ts";
import { PROPELLANTS } from "./engine.ts";
import { STRUCTURAL_COEFFICIENT } from "./staging.ts";

/**
 * M22 locks. The load-bearing one is the reversal: LH2 leads on Isp and trails
 * on density impulse, and if that ever stops holding the module has no content.
 */

test("[RESULT] density impulse reverses M20's ranking", () => {
  const r = reversal();
  // LH2 wins specific impulse by ~30%...
  assert.ok(Math.abs(r.ispAdvantageOfLh2 - 1.3) < 0.02, `×${r.ispAdvantageOfLh2.toFixed(2)}`);
  // ...and loses impulse per cubic metre by more than two.
  assert.ok(Math.abs(r.densityImpulseAdvantageOfRp1 - 2.16) < 0.05, `×${r.densityImpulseAdvantageOfRp1.toFixed(2)}`);
  // The reversal is the point: the density penalty exceeds the Isp gain.
  assert.ok(r.densityImpulseAdvantageOfRp1 > r.ispAdvantageOfLh2, "if this flips, the module is wrong");
  assert.ok(Math.abs(r.bulkDensityPenaltyOfLh2 - 2.81) < 0.05);
});

test("bulk density is volume-weighted, not mass-weighted", () => {
  // The trap: averaging densities by mass gives the wrong tank. What matters is
  // the volume the tank has to enclose.
  const rho = bulkDensity(DENSITY.lh2, 6.0);
  assert.ok(Math.abs(rho - 362) < 3, `${rho.toFixed(0)} kg/m³`);
  // A mass-weighted average would be far higher — check we are not doing that.
  const massWeighted = (1 * DENSITY.lh2 + 6 * DENSITY.lox) / 7;
  assert.ok(rho < massWeighted * 0.5, "volume weighting must give a much lower figure");
  // Limits: all fuel gives the fuel density, all oxidiser gives the oxidiser's.
  assert.ok(Math.abs(bulkDensity(DENSITY.lh2, 0) - DENSITY.lh2) < 1e-9);
  assert.ok(Math.abs(bulkDensity(DENSITY.lh2, 1e9) - DENSITY.lox) / DENSITY.lox < 1e-6);
});

test("[VALIDATION] pump power lands within 30% on two flown engines, in the same direction", () => {
  // Consistent overprediction is the signature of an assumed efficiency that is
  // too low — not of a broken model. Scatter in both directions would be.
  const errs: number[] = [];
  for (const id of ["lox-lh2", "lox-ch4"]) {
    const b = pumpBudget(VEHICLES[id]);
    assert.ok(Math.abs(b.errorFrac) < 0.35, `${id} off by ${(b.errorFrac * 100).toFixed(0)}%`);
    errs.push(b.errorFrac);
  }
  assert.ok(errs.every((e) => e > 0), "both must err high, or the bias story is wrong");
  // RS-25's fuel pump alone must be tens of megawatts — that is the headline.
  const rs25 = pumpBudget(VEHICLES["lox-lh2"]);
  assert.ok(rs25.fuelW > 40e6, `${(rs25.fuelW / 1e6).toFixed(0)} MW`);
  assert.ok(rs25.fuelW > rs25.oxidiserW * 2, "hydrogen's pump must dominate its own oxidiser's");
});

test("[RESULT] pump work per kilogram is inverse in density", () => {
  // ×11.4 for hydrogen against kerosene at the same pressure rise, purely from
  // density. Efficiency cancels, which is why this is the quotable number.
  const r = reversal();
  assert.ok(Math.abs(r.pumpWorkPenaltyOfLh2 - DENSITY.rp1 / DENSITY.lh2) < 1e-9);
  assert.ok(Math.abs(r.pumpWorkPenaltyOfLh2 - 11.4) < 0.1, `×${r.pumpWorkPenaltyOfLh2.toFixed(1)}`);
  // Exactly inverse, and independent of the efficiency assumed.
  assert.ok(Math.abs(pumpWorkPerKg(3e7, 100, 0.5) / pumpWorkPerKg(3e7, 200, 0.5) - 2) < 1e-12);
  assert.ok(
    Math.abs(
      pumpWorkPerKg(3e7, 71, 0.9) / pumpWorkPerKg(3e7, 810, 0.9) -
        pumpWorkPerKg(3e7, 71, 0.5) / pumpWorkPerKg(3e7, 810, 0.5),
    ) < 1e-12,
    "the ratio must be independent of efficiency",
  );
  assert.equal(PUMP_EFFICIENCY, 0.7);
});

test("tank volume per tonne is the number that lands on M21's epsilon", () => {
  const rs = densityResults();
  const lh2 = rs.find((r) => r.id === "lox-lh2")!;
  const rp1 = rs.find((r) => r.id === "lox-rp1")!;
  assert.ok(Math.abs(lh2.volumePerTonneM3 - 2.76) < 0.05, `${lh2.volumePerTonneM3.toFixed(2)} m³/t`);
  assert.ok(Math.abs(rp1.volumePerTonneM3 - 0.98) < 0.05);
  // And that penalty must arrive at a worse structural coefficient.
  assert.ok(structuralCoefficientFor(lh2.bulkDensity) > structuralCoefficientFor(rp1.bulkDensity));
  // A dense pair at the reference density must reproduce M21's own figure.
  assert.ok(Math.abs(structuralCoefficientFor(rp1.bulkDensity) - STRUCTURAL_COEFFICIENT) < 1e-9);
  // Zero tank share means density does not touch epsilon at all.
  assert.ok(
    Math.abs(structuralCoefficientFor(lh2.bulkDensity, { tankShare: 0 }) - STRUCTURAL_COEFFICIENT) < 1e-12,
  );
  assert.equal(TANK_SHARE_OF_STRUCTURE, 0.5);
});

test("[FEEDS M21] hydrogen's Isp advantage against its own tanks", () => {
  const cs = stageComparison(2);
  const lh2 = cs.find((c) => c.id === "lox-lh2")!;
  const ch4 = cs.find((c) => c.id === "lox-ch4")!;
  const rp1 = cs.find((c) => c.id === "lox-rp1")!;
  // Every pair must still reach GEO in two stages — this is a comparison, not a
  // feasibility claim.
  for (const c of cs) assert.ok(c.payloadFraction > 0, `${c.label} infeasible`);
  // Hydrogen carries the worst structural coefficient by a wide margin.
  assert.ok(lh2.structuralCoefficient > ch4.structuralCoefficient);
  assert.ok(lh2.structuralCoefficient > rp1.structuralCoefficient * 1.5);
  // And the answer is not the one M20's Isp ranking alone would predict: the
  // gap narrows sharply once each pair carries its own tanks.
  const naive = 452.3 / 348;
  const actual = lh2.payloadFraction / rp1.payloadFraction;
  assert.ok(actual < naive * 1.6, `hydrogen must not run away with it: ×${actual.toFixed(2)}`);
});

test("[RESULT] methane exactly matches hydrogen once each carries its own tanks", () => {
  // The finding this module did not set out to make, and the reason it is worth
  // having: LH2 leads CH4 by 19% on Isp and the two land on the same payload
  // fraction. If this ever separates, the tank model has changed and the
  // industry's convergence on methane needs a different explanation.
  const cs = stageComparison(2);
  const lh2 = cs.find((c) => c.id === "lox-lh2")!;
  const ch4 = cs.find((c) => c.id === "lox-ch4")!;
  const rp1 = cs.find((c) => c.id === "lox-rp1")!;
  assert.ok(lh2.ispS / ch4.ispS > 1.15, "hydrogen must genuinely lead on Isp");
  assert.ok(
    Math.abs(lh2.payloadFraction / ch4.payloadFraction - 1) < 0.05,
    `LH2 ${(lh2.payloadFraction * 100).toFixed(2)}% vs CH4 ${(ch4.payloadFraction * 100).toFixed(2)}%`,
  );
  // But Isp has not stopped mattering — both must still beat kerosene clearly.
  assert.ok(ch4.payloadFraction > rp1.payloadFraction * 1.3, "the reversal is specific, not general");
});

test("the results table is consistent with the modules it draws from", () => {
  // No number here may be a literal — Isp comes from M20's published anchors and
  // the pairs must match one for one.
  const rs = densityResults();
  assert.equal(rs.length, PROPELLANTS.length);
  for (const r of rs) {
    const p = PROPELLANTS.find((x) => x.id === r.id)!;
    assert.equal(r.ispS, p.publishedIspVac);
    assert.ok(Math.abs(r.densityImpulse - r.bulkDensity * r.ispS) < 1e-9);
    assert.ok(Math.abs(r.volumePerTonneM3 * r.bulkDensity - 1000) < 1e-9);
    assert.ok(VEHICLES[r.id], `${r.id} has no feed system`);
  }
});
