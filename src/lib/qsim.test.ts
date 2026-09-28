import assert from "node:assert/strict";
import test from "node:test";
import { ELECTRICITY_W } from "./facts.ts";
import { P_I } from "./kardashev.ts";
import {
  CACHE_SHOULDER_QUBITS,
  JOULES_PER_AMPLITUDE_GATE,
  JOULES_PER_BYTE_MOVED,
  QSIM_BENCH,
  QSIM_PROVENANCE,
  QUANTUM_DOES_NOT_RAISE_K,
  joulesPerGate,
  maxQubits,
  qubitsAtEnergyBudget,
  simulationWall,
  statevectorBytes,
} from "./qsim.ts";

test("the qubit wall on 16 GB is 29, and it is arithmetic not opinion", () => {
  // 2^29 x 16 B = 8.59 GB fits; 2^30 x 16 B = 17.2 GB against 15.9 GB free.
  assert.equal(statevectorBytes(29), 8_589_934_592);
  assert.equal(statevectorBytes(30), 17_179_869_184);
  assert.ok(statevectorBytes(30) > QSIM_PROVENANCE.vramFreeBytes);
  assert.equal(maxQubits(QSIM_PROVENANCE.vramFreeBytes), 29);
  // And the benchmark agrees with the arithmetic.
  assert.equal(QSIM_BENCH.find((p) => p.qubits === 29)!.fits, true);
  assert.equal(QSIM_BENCH.find((p) => p.qubits === 30)!.fits, false);
});

test("every extra qubit doubles both memory and time", () => {
  const above = QSIM_BENCH.filter((p) => p.fits && p.qubits >= CACHE_SHOULDER_QUBITS);
  for (let i = 1; i < above.length; i++) {
    assert.equal(above[i].bytes / above[i - 1].bytes, 2);
    const ratio = above[i].sPerGateHigh / above[i - 1].sPerGateHigh;
    assert.ok(Math.abs(ratio - 2) < 0.05, `${above[i].qubits}q: time ratio ${ratio}`);
  }
});

test("the kernel saturates memory, so the number is hardware not sloppiness", () => {
  const deep = QSIM_BENCH.filter((p) => p.fits && p.qubits >= CACHE_SHOULDER_QUBITS);
  for (const p of deep) {
    const frac = p.gbsHigh / QSIM_PROVENANCE.datasheetBandwidthGBs;
    assert.ok(frac > 0.8 && frac < 1.0, `${p.qubits}q at ${(frac * 100).toFixed(0)}% of peak`);
  }
});

test("[MEASURED] the coalescing guess was wrong: qubit 0 is not slower", () => {
  // The kernel comment originally predicted a penalty at t = 0. There is none —
  // for t = 0 the partner amplitudes are adjacent, so the warp is still
  // perfectly coalesced. Locked so the wrong claim cannot come back.
  for (const p of QSIM_BENCH.filter((x) => x.fits && x.qubits >= CACHE_SHOULDER_QUBITS)) {
    assert.ok(p.gbsLow >= p.gbsHigh * 0.98, `${p.qubits}q: low ${p.gbsLow} high ${p.gbsHigh}`);
  }
});

test("below the L2 shoulder the card looks faster than its own datasheet", () => {
  // 16 and 32 MB statevectors live in L2, so the apparent bandwidth exceeds
  // DRAM spec. Real, explainable, and excluded from the extrapolation.
  const cached = QSIM_BENCH.filter((p) => p.qubits < CACHE_SHOULDER_QUBITS);
  assert.ok(cached.length > 0);
  for (const p of cached) assert.ok(p.gbsHigh > QSIM_PROVENANCE.datasheetBandwidthGBs);
});

test("the energy constant is consistent with the timing and the power draw", () => {
  // 45.09 ms/gate x 86.4 W over 2^29 amplitudes.
  const at29 = QSIM_BENCH.find((p) => p.qubits === 29)!;
  const joules = at29.sPerGateHigh * QSIM_PROVENANCE.meanLoadW;
  assert.ok(Math.abs(joules / 2 ** 29 / JOULES_PER_AMPLITUDE_GATE - 1) < 0.01);
  // Per byte moved, read plus write.
  const perByte = joules / (2 ** 29 * 16 * 2);
  assert.ok(Math.abs(perByte / JOULES_PER_BYTE_MOVED - 1) < 0.01);
  // Memory-bound work does not reach TDP, which is itself the tell.
  assert.ok(QSIM_PROVENANCE.meanLoadW < QSIM_PROVENANCE.tdpW * 0.7);
});

test("[RESULT] brute-force simulation crosses Type I at ~80 qubits", () => {
  const w = simulationWall();
  assert.equal(w.measuredMaxQubits, 29);
  // One gate = one second of world electricity.
  assert.ok(w.worldElectricityQubits > 68 && w.worldElectricityQubits < 70);
  // One gate = one second of a Type I budget.
  assert.ok(w.typeIQubits > 79 && w.typeIQubits < 81);
  // Sanity: the two crossings are separated by log2(P_I / ELECTRICITY_W).
  assert.ok(
    Math.abs(w.typeIQubits - w.worldElectricityQubits - Math.log2(P_I / ELECTRICITY_W)) < 1e-9,
  );
});

test("the exponential is the point: 50 qubits is already petabytes", () => {
  assert.ok(statevectorBytes(50) / 1e15 > 15, "50 qubits should be tens of petabytes");
  // ~2.3 kWh for ONE gate at n = 50.
  const kWh = joulesPerGate(50) / 3.6e6;
  assert.ok(kWh > 1 && kWh < 5, `${kWh} kWh per gate at 50 qubits`);
  // Doubling the budget buys exactly one more qubit. That is the whole argument.
  const a = qubitsAtEnergyBudget(1e12);
  const b = qubitsAtEnergyBudget(2e12);
  assert.ok(Math.abs(b - a - 1) < 1e-9);
});

test("[DOCTRINE] avoided cost is not generated power, so K does not move", () => {
  // The invariant this whole module exists to support, kept as data so the UI
  // cannot drift into "quantum gets us to Type I".
  assert.equal(QUANTUM_DOES_NOT_RAISE_K.simulationIsExponential, true);
  assert.equal(QUANTUM_DOES_NOT_RAISE_K.hardwareAvoidsThatCost, true);
  assert.equal(QUANTUM_DOES_NOT_RAISE_K.affectsNumeratorOfK, false);
  assert.ok(QUANTUM_DOES_NOT_RAISE_K.properRoles.length >= 3);
});

test("the benchmark carries its provenance", () => {
  assert.ok(QSIM_PROVENANCE.device.includes("5060 Ti"));
  assert.equal(QSIM_PROVENANCE.bytesPerAmplitude, 16);
  assert.equal(QSIM_PROVENANCE.precision, "complex128");
  assert.ok(QSIM_PROVENANCE.peakLoadW > QSIM_PROVENANCE.meanLoadW);
});
