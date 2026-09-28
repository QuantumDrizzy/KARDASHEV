import assert from "node:assert/strict";
import test from "node:test";
import {
  SCENARIOS,
  arrivalYear,
  gates,
  invertedGates,
  openGates,
  project,
  projections,
  unratioableGates,
} from "./route.ts";
import * as route from "./route.ts";
import { requiredArealRate } from "./learning.ts";
import { escapeThreshold } from "./substitution.ts";
import { arealDensityToGeoKgM2 } from "./transfer.ts";
import { firstWall } from "./sequence.ts";

/**
 * M26 locks. The load-bearing one is the refusal: no exported function may hand
 * back a date without being told what to assume. If that ever becomes possible,
 * the repo has started predicting and the whole discipline is gone.
 */

test("[THE REFUSAL] nothing returns a date without a scenario", () => {
  // Every export that could produce a year must require its assumptions. This
  // is the guard that stops "KARDASHEV says 2150" from ever being true.
  for (const [name, fn] of Object.entries(route)) {
    if (typeof fn !== "function") continue;
    if (!/year|project|arrival/i.test(name)) continue;
    // `projections` is allowed: it evaluates the PUBLISHED reference scenarios,
    // every one of which carries a source. What is forbidden is a date for
    // assumptions nobody stated.
    if (name === "projections") continue;
    assert.ok(fn.length >= 1, `${name} must require a scenario argument, not default one`);
  }
  // And the two that do the arithmetic must actually consume it.
  assert.ok(project.length >= 1);
  assert.ok(arrivalYear.length >= 1);
});

test("every scenario carries its source, or it is a guess", () => {
  assert.ok(SCENARIOS.length >= 4);
  for (const s of SCENARIOS) {
    assert.ok(s.source.length > 30, `${s.label} has no source`);
    assert.ok(s.doublingYears > 0 && s.cadencePerDay > 0);
    assert.ok(s.cognitiveFraction >= 0 && s.cognitiveFraction < 1);
    assert.ok(s.arealLearningRate >= 0 && s.arealLearningRate < 1);
  }
  // The floor scenario must be the fastest and must announce it is a bound.
  const floor = SCENARIOS.find((s) => s.label === "Thermodynamic floor")!;
  assert.ok(floor.doublingYears === Math.min(...SCENARIOS.map((s) => s.doublingYears)));
  assert.ok(/NOT a forecast/i.test(floor.source), "the bound must say it is not a forecast");
});

test("[THE GATES] each one is a real target with today beside it", () => {
  const gs = gates();
  assert.ok(gs.length >= 6);
  for (const g of gs) {
    assert.ok(g.owner.endsWith(".ts"), `${g.id} names no owner`);
    assert.ok(g.note.length > 50, `${g.id} has no note`);
    assert.ok(g.unit.length > 0, `${g.id} has no unit`);
    assert.ok(g.gapX >= 1, `${g.id} gap must be stated as a multiple ≥ 1`);
    assert.ok(Number.isFinite(g.today) && Number.isFinite(g.required));
  }
  // No gate may invent its own number — each must match its owning module.
  const areal = gs.find((g) => g.id === "areal-density")!;
  assert.ok(Math.abs(areal.required - arealDensityToGeoKgM2(100, 100)) < 1e-12);
  assert.ok(Math.abs(areal.gapX - 506) < 5, `×${areal.gapX.toFixed(0)}`);
  const thermal = gs.find((g) => g.id === "thermal-ceiling")!;
  assert.ok(Math.abs(thermal.required - firstWall().powerW) < 1e-6);
});

test("[INVERTED] the compute gate must stay shut, and is marked as such", () => {
  const inv = invertedGates();
  assert.equal(inv.length, 1);
  assert.equal(inv[0].id, "compute-efficiency-ceiling");
  assert.ok(Math.abs(inv[0].required - escapeThreshold(0.1).factor) < 1e-12);
  assert.ok(/SHUT/.test(inv[0].note), "it must say the gate needs to stay shut");
  // And it must never be counted among the ones we are trying to open.
  assert.ok(!openGates().some((g) => g.kind === "inverted"));
});

test("the open gates are the ones with real work behind them", () => {
  const open = openGates();
  // Areal density, load specific power, cadence, lifetime and lunar fraction.
  assert.ok(open.length >= 4, `${open.length} open gates`);
  for (const id of ["areal-density", "load-specific-power", "launch-cadence"]) {
    assert.ok(open.some((g) => g.id === id), `${id} should be open`);
  }
  // Among gates where a ratio means anything, the two mass ones lead by a wide
  // margin. The lunar fraction is excluded because it goes from zero — "×N
  // better" is not the frame, and the module flags it rather than faking a number.
  const sorted = open.filter((g) => g.ratioMeaningful).sort((a, b) => b.gapX - a.gapX);
  assert.ok(["load-specific-power", "areal-density"].includes(sorted[0].id), sorted[0].id);
  assert.ok(sorted[0].gapX > 400);
  assert.ok(unratioableGates().length === 1 && unratioableGates()[0].id === "lunar-fraction");
});

test("projections are ordered and the learning flag is honest", () => {
  const ps = projections();
  // Faster scenarios must arrive sooner, monotonically down the list.
  for (let i = 1; i < ps.length; i++) {
    assert.ok(ps[i].yearsToTypeI < ps[i - 1].yearsToTypeI, `${ps[i].scenario}`);
    assert.ok(ps[i].yearsToFirstWall < ps[i - 1].yearsToFirstWall);
  }
  // The wall always arrives before Type I, in every scenario. That is M19.
  for (const p of ps) assert.ok(p.yearsToFirstWall < p.yearsToTypeI, p.scenario);
  // Inertia must reproduce the ~349 years the repo has always quoted.
  const inertia = ps.find((p) => p.scenario === "IEA inertia")!;
  assert.ok(Math.abs(inertia.yearsToTypeI - 349) < 25, `${inertia.yearsToTypeI.toFixed(0)} yr`);
  // The areal flag must agree with M25's own threshold, not a copy of it.
  for (const s of SCENARIOS) {
    assert.equal(project(s).arealGapCloses, s.arealLearningRate >= requiredArealRate(), s.label);
  }
});

test("Amdahl is applied, and a cognitive fraction of zero changes nothing", () => {
  const base = SCENARIOS.find((s) => s.cognitiveFraction === 0)!;
  const p = project(base);
  assert.ok(Math.abs(p.speedupCeiling - 1) < 1e-12);
  assert.ok(Math.abs(p.effectiveDoublingYears - base.doublingYears) < 1e-12);
  // Half the schedule being cognition must halve the doubling time exactly.
  const half = project({ ...base, cognitiveFraction: 0.5 });
  assert.ok(Math.abs(half.effectiveDoublingYears / p.effectiveDoublingYears - 0.5) < 1e-9);
  // And it must clamp rather than divide by zero at f = 1.
  assert.ok(Number.isFinite(project({ ...base, cognitiveFraction: 1 }).yearsToTypeI));
});

test("arrivalYear is a calendar sum and nothing more", () => {
  const s = SCENARIOS.find((x) => x.label === "λ hypothesis")!;
  assert.ok(Math.abs(arrivalYear(s, 2026) - (2026 + project(s).yearsToTypeI)) < 1e-9);
  // Changing the epoch shifts the answer by exactly that much — no hidden model.
  assert.ok(Math.abs(arrivalYear(s, 2100) - arrivalYear(s, 2026) - 74) < 1e-9);
});
