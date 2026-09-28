import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { findings } from "./findings.ts";
import { END, START, buildTable, formatValue, renderDoc } from "../../scripts/sync-synthesis.mjs";

/**
 * The synthesis document quotes numbers in prose, and prose drifts. These tests
 * are what stop `docs/SYNTHESIS.md` from becoming a museum of numbers that were
 * true once.
 *
 * The generated table is the contract. The prose is checked more loosely — a
 * handful of load-bearing figures must literally appear in the text — because a
 * document nobody can edit is a document nobody maintains.
 */

const DOC = "docs/SYNTHESIS.md";
const doc = () => readFileSync(DOC, "utf8");

test("the generated numbers table is in sync with the code", () => {
  // This is the whole point: run `npm run synthesis` and this passes again.
  assert.equal(renderDoc(doc()), doc(), "docs/SYNTHESIS.md is stale — run: npm run synthesis");
});

test("the table covers every finding, with its kind visible", () => {
  const table = buildTable();
  const all = findings();
  for (const f of all) {
    assert.ok(table.includes(`\`${f.id}\``), `${f.id} missing from the table`);
    assert.ok(table.includes(`\`${f.module}\``), `${f.module} missing from the table`);
  }
  // A reader must be able to see at a glance what is assumed rather than derived.
  for (const kind of ["derived", "measured", "published", "assumed"]) {
    assert.ok(table.includes(kind), `kind '${kind}' never appears`);
  }
  assert.ok(table.startsWith(START) && table.endsWith(END));
});

test("the load-bearing numbers in the prose match the code", () => {
  // Not every number — the ones the argument turns on. If any of these move,
  // the sentence around them has to be rewritten, and this test says so.
  const text = doc();
  const byId = Object.fromEntries(findings().map((f) => [f.id, f]));
  const claims: [string, string][] = [
    ["gap-type-i", "×509"],
    ["type-i-crust-delta-t", "+5.06 K"],
    ["crust-must-leave", "98.1%"],
    ["areal-gap", "×183"],
    ["radiator-understatement", "×2.04"],
    ["sustainable-fraction", "5%"],
    ["grid-settle-vs-arrest", "1.61 s"],
    ["grid-single-year-optimism", "×26"],
    ["wh-per-response-local", "0.456 Wh"],
    ["wh-per-response-frontier", "0.323 Wh"],
    ["qubit-wall", "29 qubits"],
    ["operator-latency", "1,315 ms"],
    ["lunar-advantage", "×106, not ×12"],
    ["isru-transport-share", "4.5%"],
    ["max-earth-fraction", "0.016%"],
    ["type-i-doublings", "30 doublings from a 100 t seed"],
    ["lambda-as-doubling-time", "doubles every 3.4 years"],
    ["film-thickness", "8.7 µm film"],
    ["film-perforations", "~198 perforations"],
    ["ao-bare-film-life", "2.3 months"],
    ["debris-impact-rate", "9.4 times a second"],
    ["array-vs-earth-cross-section", "23% of Earth's own cross-section"],
    ["array-vs-mass-launched", "5.1 million times"],
    ["environment-lifetime", "**69 yr — what the environment supports**"],
    ["shading-leo", "7.7% of the insolation"],
    ["shading-cooling-leo", "−4.89 K"],
    ["climate-floor-radius", "38,960 km"],
    ["climate-floor-vs-geo", "**92% of GEO**"],
    ["band-fill-leo", "fills **10%**"],
    ["sky-coverage-geo", "54.9 square degrees"],
    ["geo-payload-penalty", "×2.77"],
    ["energy-understates-delivery", "understates it by **62%**"],
    ["areal-density-geo", "**4.4 g/m²**"],
    ["areal-gap-geo", "**×505**"],
    ["moon-to-geo-dv", "3,982 m/s"],
    ["lunar-advantage-geo", "**×10.4**"],
    ["load-mass-rack", "**10¹⁴ kg**"],
    ["load-centuries-of-launch", "**759 centuries**"],
    ["radiator-specific-power", "**144 W/kg**"],
    ["self-radiating-specific-power", "**10,591 W/kg**"],
    ["load-specific-power-required", "**75,900 W/kg**"],
    ["die-thickness-required", "**14 µm die at 400 K**"],
    ["climate-floor-corrected", "**50,290 km, or 119% of GEO**"],
    ["escape-threshold", "**f = 52.1**"],
    ["logic-runway", "**×1,232**"],
    ["compute-power-at-logic-floor", "**8.1 TW**"],
    ["brain-lead-over-silicon", "**×17.7**"],
    ["type-i-responses-per-person", "**1,050 frontier responses per living"],
    ["type-i-in-brains", "**61,000 brain-equivalents each**"],
    ["industry-runway", "**×2.31**"],
    ["ammonia-runway", "**×1.72**"],
    ["compute-anomaly", "**Logic has 534 times the headroom"],
    ["required-compute-share", "**f_c ≥ 95.8%**"],
    ["required-share-best-case", "**95.6%**"],
    ["reduction-at-todays-mix", "**×2.31** — not ×52"],
    ["compute-share-today", "**0.27%**"],
    ["type-i-ir-contrast", "**2.5e-8**, one part in 41 million"],
    ["type-i-bolometric-contrast", "**26 parts per trillion**"],
    ["ir-spectral-advantage", "**×943**"],
    ["type-i-detection-reach", "**3.1 pc**"],
    ["type-i-occultation-ppm", "**32.6 ppm**"],
    ["occultation-vs-earth", "**39% of an Earth transit**"],
    ["first-wall-k", "**0.828**"],
    ["first-wall-multiple", "**×9.8**"],
    ["first-wall-doublings", "3.3 doublings away, not nine"],
    ["first-wall-sooner", "**2.7× sooner**"],
    ["cstar-lox-lh2", "2,299 m/s"],
    ["isp-rs25-derived", "454.6 s"],
    ["molar-mass-lever", "**×1.69**"],
    ["isp-for-sane-stage", "**1,181 s**"],
    ["beyond-chemistry", "**×2.6 the chemical ceiling**"],
    ["falcon9-validation", "**0.9% agreement against a real rocket**"],
    ["geo-payload-fraction", "**1.21%**"],
    ["minimum-stages-to-geo", "| 1 | **impossible** |"],
    ["launcher-share-of-mass", "**98.8% of what you launch is the launcher.**"],
    ["density-impulse-reversal", "**×2.16**"],
    ["hydrogen-pump-penalty", "**×11.4**"],
    ["methane-matches-hydrogen", "**Methane exactly matches hydrogen.**"],
    ["hydrogen-structural-penalty", "| 0.152 |"],
    ["doubling-floor-days", "**7.7 days**"],
    ["organisational-gap", "**×159**"],
    ["wall-arrival-inertial", "**~128 years**"],
    ["wall-arrival-fastest", "~25 days"],
    ["wall-doublings-invariant", "**3.29 doublings**"],
    ["verification-dominance", "**×109**"],
    ["cognitive-fraction-implied", "99.37% of the schedule is thinking"],
    ["speedup-at-half-cognition", "| 50% | ×2 |"],
    ["wall-at-half-cognition", "**5.5 yr**"],
    ["required-learning-rate", "**18.7% per doubling**"],
    ["pv-cost-learning-rate", "| 22% | **$/W** |"],
    ["gap-at-mass-like-rate", "**×6**"],
    ["doublings-at-ten-percent", "it takes **59"],
    ["hardest-gate", "**×759**"],
    ["power-doublings-to-type-i", "**9.0 power doublings**"],
    ["inertial-years-to-type-i", "**349 yr"],
    ["open-gates", "**seven falsifiable gates**"],
    ["loop-growth-exponent", "**t^1.43**"],
    ["no-learning-years", "**50,490 years**"],
    ["learning-leverage", "worth ×470 on the schedule"],
    ["lambda-mechanism-years", "**107**, against the fitted 101"],
    ["required-closure", "requires 99.984%"],
    ["proposed-closure", "roughly 90–96%"],
    ["closure-import-gap", "**×252 in import flow**"],
    ["years-at-proposed-closure", "**3,505 yr**"],
    ["regolith-per-kg-carbon", "ten thousand kilograms of regolith per kilogram of carbon"],
    ["carbon-extraction-energy", "**10 GJ per kilogram of carbon**"],
    ["volatile-power-tax", "**5% of the lunar industrial power**"],
    ["polar-ice-advantage", "×124 better"],
    ["peak-of-light-share", "**0.06%** of the industry"],
    ["lunar-array-area", "**16,450 km²**"],
    ["hop-escape-crossover", "**1,181 km**"],
    ["lunar-roll-energy", "**0.44 MJ/kg**"],
    ["roll-vs-hop", "**×5.3 cheaper than hopping**"],
    ["volatile-rover-fleet", "**22,913 rovers**"],
    ["everything-rover-fleet", "143,000,000 rovers"],
  ];
  for (const [id, phrase] of claims) {
    assert.ok(byId[id], `${id} is quoted in the prose but no longer exists`);
    assert.ok(text.includes(phrase), `the prose no longer says "${phrase}" for ${id}`);
  }
});

test("the document states what it is, and what would falsify it", () => {
  const text = doc();
  // Professional honesty is structural here, not decorative.
  assert.ok(/not peer-reviewed/i.test(text), "the document must say what it is not");
  assert.ok(text.includes("## 5. What we got wrong"), "the corrections section is load-bearing");
  assert.ok(text.includes("## 6. What would falsify this"));
  assert.ok(text.includes("## 7. What is not modelled"));
  // The corrections table must actually list corrections, not gesture at them.
  const corrections = text.split("## 5. What we got wrong")[1].split("## 6.")[0];
  assert.ok((corrections.match(/\n\|/g) ?? []).length >= 7, "at least seven corrections are documented");
});

test("the two assumed inputs are named as assumptions in the prose", () => {
  const text = doc();
  const assumed = findings().filter((f) => f.kind === "assumed");
  assert.ok(assumed.length >= 2);
  // λ is the only free parameter in the forecast and must never be shown alone.
  assert.ok(/λ = 0\.62/.test(text));
  assert.ok(/hypothesis/i.test(text), "λ must be called a hypothesis in the text");
  assert.ok(/inertial one beside it|~350 years/.test(text), "the inertial figure must be present");
});

test("formatValue is stable, so the table does not churn", () => {
  // Cosmetic drift would make the sync check fire on every run and train
  // everyone to ignore it.
  assert.equal(formatValue(0.729), "0.729");
  assert.equal(formatValue(508.994), "509");
  assert.equal(formatValue(3.4223e12), "3.422e+12");
  assert.equal(formatValue(1.35e7), "1.350e+7");
  assert.equal(formatValue(0), "0.000");
  // Idempotent: rendering twice changes nothing.
  assert.equal(renderDoc(renderDoc(doc())), renderDoc(doc()));
});
