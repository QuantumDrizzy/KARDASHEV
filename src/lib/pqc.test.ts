import assert from "node:assert/strict";
import test from "node:test";
import {
  CLASSICAL_HANDSHAKE,
  C_VACUUM,
  PQC_CONSERVATIVE,
  PQC_HANDSHAKE,
  PQC_VERDICT,
  SUITES,
  handshakeBytes,
  linkBudget,
  rateForOverhead,
  sizePenalty,
  suite,
} from "./pqc.ts";

test("the catalogue carries published FIPS parameters, not estimates", () => {
  assert.equal(suite("ml-kem-768").fips, 203);
  assert.equal(suite("ml-kem-768").publicKeyBytes, 1184);
  assert.equal(suite("ml-kem-768").payloadBytes, 1088);
  assert.equal(suite("ml-dsa-65").fips, 204);
  assert.equal(suite("ml-dsa-65").payloadBytes, 3309);
  assert.equal(suite("slh-dsa-128s").fips, 205);
  // Hash-based: tiny keys, enormous signatures. The trade that defines it.
  assert.equal(suite("slh-dsa-128s").publicKeyBytes, 32);
  assert.ok(suite("slh-dsa-128s").payloadBytes > 7000);
  // Every FIPS suite is quantum resistant; every classical one is not.
  for (const s of SUITES) assert.equal(s.quantumResistant, s.fips !== null);
});

test("the post-quantum handshake is 50x the classical one", () => {
  assert.equal(CLASSICAL_HANDSHAKE.bytes, 256);
  assert.equal(PQC_HANDSHAKE.bytes, 12_794);
  assert.ok(Math.abs(sizePenalty() - 50) < 0.5);
  assert.equal(PQC_HANDSHAKE.quantumResistant, true);
  assert.equal(CLASSICAL_HANDSHAKE.quantumResistant, false);
  assert.equal(handshakeBytes(suite("ml-kem-768"), suite("ml-dsa-65")), 12_794);
});

test("an ISL runs in vacuum, not glass — unlike every link in grid.ts", () => {
  const b = linkBudget(PQC_HANDSHAKE, { distanceKm: 5000 });
  assert.ok(Math.abs(b.propagationMs - (5000e3 / C_VACUUM) * 1000) < 1e-9);
  assert.ok(Math.abs(b.propagationMs - 16.678) < 0.01);
  // Fibre would be 1.47x slower over the same distance. Space has no cladding.
  assert.equal(C_VACUUM, 299_792_458);
});

test("[RESULT] on a fast link the handshake is latency bound, not size bound", () => {
  const fast = linkBudget(PQC_HANDSHAKE, { distanceKm: 5000, rateBps: 1e9 });
  assert.ok(fast.pqcOverheadFrac < 0.002, `${fast.pqcOverheadFrac}`);
  assert.ok(fast.propagationMs > fast.transmissionMs * 100, "propagation should dominate");
  // Longer link, smaller share: the geometry grows and the payload does not.
  const far = linkBudget(PQC_HANDSHAKE, { distanceKm: 40_000, rateBps: 1e9 });
  assert.ok(far.pqcOverheadFrac < fast.pqcOverheadFrac);
});

test("[CAVEAT] on a slow link it is the opposite, and telemetry is slow", () => {
  // The panel would be lying by omission without this.
  const slow = linkBudget(PQC_HANDSHAKE, { distanceKm: 5000, rateBps: 1e6 });
  assert.ok(slow.pqcOverheadFrac > 0.5, `${slow.pqcOverheadFrac} at 1 Mbps`);
  // The crossover is the honest number to publish.
  const tenPct = rateForOverhead(0.1);
  assert.ok(tenPct > 1e7 && tenPct < 2e7, `${tenPct} bps`);
  assert.ok(Math.abs(PQC_VERDICT.freeAboveBps - tenPct) < 1);
  // Tighter budget, faster link required. Monotone.
  assert.ok(rateForOverhead(0.01) > rateForOverhead(0.1));
  assert.ok(rateForOverhead(0.5) < rateForOverhead(0.1));
});

test("hash-based signatures disqualify themselves exactly where links are thin", () => {
  assert.ok(PQC_CONSERVATIVE.bytes > PQC_HANDSHAKE.bytes);
  // It needs a faster link to hit the same overhead budget.
  assert.ok(rateForOverhead(0.1, PQC_CONSERVATIVE) > rateForOverhead(0.1, PQC_HANDSHAKE));
});

test("[DOCTRINE] crypto is load, and it does not move K either", () => {
  assert.equal(PQC_VERDICT.affectsNumeratorOfK, false);
  assert.equal(PQC_VERDICT.reason, "harvest-now-decrypt-later");
  // The module must never be turned into a crypto implementation.
  assert.equal(PQC_VERDICT.doNotImplementHere, true);
  assert.ok(PQC_VERDICT.caveat.includes("59%"));
});

test("handshake energy is microjoules — too small to be an argument", () => {
  const b = linkBudget(PQC_HANDSHAKE);
  assert.ok(b.joules < 1e-3, `${b.joules} J`);
  assert.ok(b.joules > 1e-6);
});
