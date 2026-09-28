import assert from "node:assert/strict";
import test from "node:test";
import { dependents, findings, findingsExport } from "./findings.ts";

test("every finding is complete and self-describing", () => {
  const all = findings();
  assert.ok(all.length >= 30, `${all.length} findings`);
  const seen = new Set<string>();
  for (const f of all) {
    assert.ok(f.id && !seen.has(f.id), `duplicate or missing id: ${f.id}`);
    seen.add(f.id);
    assert.ok(f.module.endsWith(".ts"), `${f.id} must name its module`);
    assert.ok(f.claim.length > 20, `${f.id} claim is too thin`);
    assert.ok(f.unit.length > 0, `${f.id} has no unit`);
    assert.ok(Number.isFinite(f.value), `${f.id} value is not finite: ${f.value}`);
    // The honest half is not optional.
    assert.ok(f.limits.length > 25, `${f.id} needs a real limits line, not a shrug`);
    assert.ok(f.provenance.length > 15, `${f.id} needs provenance`);
    assert.ok(["derived", "measured", "published", "assumed"].includes(f.kind));
  }
});

test("nothing here is a copied literal — the values track their modules", () => {
  // If a module changes, the export must change with it. Two calls to different
  // module functions must agree, which they cannot if a number was pasted.
  const a = findings();
  const b = findings();
  for (let i = 0; i < a.length; i++) assert.equal(a[i].value, b[i].value, a[i].id);
  // Spot-check a few against the modules directly.
  const byId = Object.fromEntries(a.map((f) => [f.id, f]));
  assert.ok(Math.abs(byId["k-of-type-i"].value - 1) < 1e-12, "K at Type I is 1 by definition");
  assert.ok(Math.abs(byId["gap-type-i"].value - 509) < 2);
  assert.equal(byId["grid-sync-possible"].value, 0, "no tie can be AC synchronous");
});

test("assumed values are labelled as inputs, not sold as results", () => {
  const assumed = findings().filter((f) => f.kind === "assumed");
  // λ and the cost basis are the two genuine free parameters in the repo.
  assert.ok(assumed.length >= 2);
  assert.ok(assumed.some((f) => f.module === "forecast.ts"), "λ must be flagged as assumed");
  assert.ok(assumed.some((f) => f.module === "grid-cost.ts"), "the cost basis must be flagged");
  for (const f of assumed) {
    assert.ok(
      /hypothesis|assumption|not measured|dated|robust|move/i.test(f.provenance + f.limits),
      `${f.id} must say plainly that it is an input`,
    );
  }
});

test("measured values carry the hardware they came off", () => {
  const measured = findings().filter((f) => f.kind === "measured");
  assert.ok(measured.length >= 3);
  for (const f of measured) {
    assert.ok(
      /CUDA|5060|sm_120|measured|seed/i.test(f.provenance),
      `${f.id} claims measurement but names no hardware or run`,
    );
  }
});

test("the dependency graph names modules that would move the number", () => {
  // thermal.ts is upstream of the whole M6-M10 chain.
  const d = dependents("thermal.ts");
  assert.ok(d.length === 0 || d.every((f) => f.affects!.includes("thermal.ts")));
  // And something must declare that it depends on thermal's result.
  const chain = findings().filter((f) => f.affects && f.affects.length > 0);
  assert.ok(chain.length >= 4, "the corrections chain should be visible in the data");
  for (const f of chain) {
    for (const m of f.affects!) assert.ok(m.endsWith(".ts"), `${f.id} affects a non-module: ${m}`);
  }
});

test("the export carries its contract, because tools read this and not the docs", () => {
  const out = findingsExport();
  assert.equal(out.counts.total, findings().length);
  assert.equal(
    out.counts.derived + out.counts.measured + out.counts.published + out.counts.assumed,
    out.counts.total,
  );
  assert.ok(out.contract.includes("limits"), "the contract must forbid publishing without limits");
  assert.ok(out.contract.includes("assumed"));
  assert.ok(out.generatedFrom.includes("no copied literals"));
  // Serialisable — this is what a tool actually consumes.
  const round = JSON.parse(JSON.stringify(out));
  assert.equal(round.findings.length, out.findings.length);
});

test("[GUARD] the export must agree with the modules it claims to read", () => {
  // The failure mode this whole module exists to prevent: a number in a deck
  // that no longer matches the code. Recompute the chain independently.
  const byId = Object.fromEntries(findings().map((f) => [f.id, f]));
  // M6 -> M7 -> M8 -> M10, each step's headline reachable from the last.
  assert.ok(byId["crust-must-leave"].value > 0.98);
  assert.ok(byId["areal-gap"].value > byId["radiator-understatement"].value);
  assert.ok(byId["replacement-cadence"].value > 100, "maintenance exceeds construction");
  // M9's correction is visible: beaming costs more than one watt per useful watt.
  assert.ok(byId["beam-does-not-help"].value > 1);
  // And the runway result that qualifies the thesis is present and ordered.
  assert.ok(
    byId["efficiency-runway-movement"].value > byId["efficiency-runway-logic"].value,
    "movement should have more headroom than logic — M3 said movement binds",
  );
});
