/**
 * QSIM — M4. What it costs to simulate a quantum state classically.
 *
 * `/quantum` says quantum does not raise K. That is a claim about energy, so it
 * is measured here rather than asserted.
 *
 * The simulator is `native/qsim/qsim.cu` — a CUDA statevector engine on sm_120.
 * A state over n qubits is 2^n complex amplitudes and every gate touches all of
 * them, so the thing is memory-bandwidth bound (the same roofline as LLM decode
 * in compute-energy.ts) and exponential in n. Only the *results* live here; the
 * website stays dependency-free.
 *
 * Physics was validated before any timing was believed — a statevector
 * simulator with wrong amplitudes is a memcpy benchmark in a lab coat:
 *
 *   Bell state           exact to 1e-12
 *   GHZ-20               leakage outside the two poles exactly 0
 *   QFT of a basis state flat in magnitude to 2.3e-17
 *   Unitarity            norm 0.999999999999999 after 300 random gates
 *
 * ── What the measurement says ────────────────────────────────────────────────
 *
 * The wall on 16 GB is **29 qubits** in complex128. Not 30: 2^30 x 16 B is
 * 17.2 GB against 15.9 GB free. Each extra qubit doubles both memory and time,
 * which is the whole point.
 *
 * Sustained 381 GB/s against a 448 GB/s datasheet — 85% of peak, so the number
 * is a property of the hardware and not of a sloppy kernel. Below 22 qubits the
 * statevector fits in L2 and the measured rate jumps to ~650 GB/s; that cache
 * shoulder is visible in the data and is why the extrapolation uses n >= 22.
 *
 * ── The Kardashev consequence ────────────────────────────────────────────────
 *
 * At 7.26 nJ per amplitude-update, measured, a single gate at n qubits costs
 * 2^n x 7.26 nJ. Extrapolating that constant:
 *
 *   n = 68.7  one gate costs a full second of world electricity (3.42 TW)
 *   n = 80.2  one gate costs a full second of a Type I budget (1e16 W)
 *
 * So brute-force simulation of ~80 qubits is a Type I-scale act, and a real
 * quantum processor does that gate for microwatts.
 *
 * That is exactly why it does not move K. Quantum advantage is an **avoided
 * cost**, not a power source: it removes an expense that only exists if you
 * insisted on simulating. Avoiding a bill you chose to incur does not generate
 * watts, and K counts watts generated. The right slot for quantum on this
 * instrument is unchanged — PQC on the channel, sensing, metrology — and none
 * of those are on the numerator of K either.
 *
 * [ASSUMPTION] The extrapolation holds one measured joules-per-byte constant
 * fixed across 50 orders of magnitude of memory. It is an order-of-magnitude
 * statement about the exponential, not a forecast of anyone's datacentre.
 * Better memory technology moves the crossing by a few qubits; it cannot bend
 * a 2^n.
 */

import { ELECTRICITY_W } from "./facts.ts";
import { P_I } from "./kardashev.ts";

export const QSIM_PROVENANCE = {
  source: "native/qsim/qsim.cu",
  device: "NVIDIA RTX 5060 Ti 16GB, sm_120",
  toolchain: "CUDA 13.0, MSVC 2022 BuildTools",
  ranOn: "2026-08-25",
  precision: "complex128",
  bytesPerAmplitude: 16,
  vramTotalBytes: 17_102_733_312,
  vramFreeBytes: 15_910_043_648,
  /** Board power under load, sampled with nvidia-smi during the sweep. */
  meanLoadW: 86.4,
  peakLoadW: 102.2,
  tdpW: 180,
  datasheetBandwidthGBs: 448,
} as const;

/** One row per qubit count from `qsim.exe --bench`. */
export type QsimPoint = {
  qubits: number;
  bytes: number;
  fits: boolean;
  /** Seconds per Hadamard on the most significant qubit. */
  sPerGateHigh: number;
  /** Same on qubit 0. Kept because the coalescing guess was checkable. */
  sPerGateLow: number;
  sPerCnot: number;
  gbsHigh: number;
  gbsLow: number;
};

export const QSIM_BENCH: QsimPoint[] = [
  { qubits: 20, bytes: 16_777_216, fits: true, sPerGateHigh: 5.19407988e-5, sPerGateLow: 5.19951999e-5, sPerCnot: 1.91008002e-5, gbsHigh: 646.013, gbsLow: 645.3371 },
  { qubits: 21, bytes: 33_554_432, fits: true, sPerGateHigh: 1.01454401e-4, sPerGateLow: 1.01332796e-4, sPerCnot: 7.92288005e-5, gbsHigh: 661.4682, gbsLow: 662.262 },
  { qubits: 22, bytes: 67_108_864, fits: true, sPerGateHigh: 3.53310394e-4, sPerGateLow: 3.50462389e-4, sPerCnot: 3.51200008e-4, gbsHigh: 379.8862, gbsLow: 382.9733 },
  { qubits: 23, bytes: 134_217_728, fits: true, sPerGateHigh: 7.03987217e-4, sPerGateLow: 7.00387192e-4, sPerCnot: 7.04648018e-4, gbsHigh: 381.3073, gbsLow: 383.2672 },
  { qubits: 24, bytes: 268_435_456, fits: true, sPerGateHigh: 1.40613918e-3, sPerGateLow: 1.40157604e-3, sPerCnot: 1.40655518e-3, gbsHigh: 381.805, gbsLow: 383.048 },
  { qubits: 25, bytes: 536_870_912, fits: true, sPerGateHigh: 2.81722889e-3, sPerGateLow: 2.80180645e-3, sPerCnot: 2.81717129e-3, gbsHigh: 381.134, gbsLow: 383.232 },
  { qubits: 26, bytes: 1_073_741_824, fits: true, sPerGateHigh: 5.64239845e-3, sPerGateLow: 5.60429611e-3, sPerCnot: 5.63811836e-3, gbsHigh: 380.5977, gbsLow: 383.1853 },
  { qubits: 27, bytes: 2_147_483_648, fits: true, sPerGateHigh: 1.1280555e-2, sPerGateLow: 1.12131042e-2, sPerCnot: 1.12770691e-2, gbsHigh: 380.7408, gbsLow: 383.0311 },
  { qubits: 28, bytes: 4_294_967_296, fits: true, sPerGateHigh: 2.2542099e-2, sPerGateLow: 2.24001678e-2, sPerCnot: 2.25549683e-2, gbsHigh: 381.0619, gbsLow: 383.4763 },
  { qubits: 29, bytes: 8_589_934_592, fits: true, sPerGateHigh: 4.50863739e-2, sPerGateLow: 4.48328125e-2, sPerCnot: 4.5135495e-2, gbsHigh: 381.0435, gbsLow: 383.1986 },
  { qubits: 30, bytes: 17_179_869_184, fits: false, sPerGateHigh: 0, sPerGateLow: 0, sPerCnot: 0, gbsHigh: 0, gbsLow: 0 },
];

/** Measured at n = 29: 45.09 ms/gate at 86.4 W over 2^29 amplitudes. */
export const JOULES_PER_AMPLITUDE_GATE = 7.256e-9;
/** The same energy expressed per byte actually moved (read + write). */
export const JOULES_PER_BYTE_MOVED = 2.267e-10;
/** Where the L2 shoulder ends; the extrapolation only uses points above this. */
export const CACHE_SHOULDER_QUBITS = 22;

export function statevectorBytes(qubits: number, bytesPerAmplitude = 16) {
  return 2 ** qubits * bytesPerAmplitude;
}

/** Largest n whose statevector fits, leaving the measured 10% workspace margin. */
export function maxQubits(vramBytes: number, bytesPerAmplitude = 16) {
  return Math.floor(Math.log2((vramBytes * 0.9) / bytesPerAmplitude));
}

/** Energy of one dense gate at n qubits, from the measured constant. */
export function joulesPerGate(qubits: number) {
  return 2 ** qubits * JOULES_PER_AMPLITUDE_GATE;
}

/** Qubit count at which one gate costs `seconds` of running at `watts`. */
export function qubitsAtEnergyBudget(watts: number, seconds = 1) {
  return Math.log2((watts * seconds) / JOULES_PER_AMPLITUDE_GATE);
}

export type SimulationWall = {
  /** Hard wall on this machine, measured. */
  measuredMaxQubits: number;
  /** One gate = one second of today's world electricity. */
  worldElectricityQubits: number;
  /** One gate = one second of a Type I budget. */
  typeIQubits: number;
};

export function simulationWall(): SimulationWall {
  return {
    measuredMaxQubits: 29,
    worldElectricityQubits: qubitsAtEnergyBudget(ELECTRICITY_W),
    typeIQubits: qubitsAtEnergyBudget(P_I),
  };
}

/**
 * The doctrine line, kept as data so the UI cannot drift off it.
 *
 * Simulating a quantum state is exponentially expensive; running one is not.
 * But the saving is an avoided cost, and K counts watts *generated*. Not paying
 * a bill you chose to incur produces no power.
 */
export const QUANTUM_DOES_NOT_RAISE_K = {
  simulationIsExponential: true,
  hardwareAvoidsThatCost: true,
  /** The load side of the ledger, never the generation side. */
  affectsNumeratorOfK: false,
  properRoles: ["PQC on the channel", "sensing and metrology", "simulation of chemistry"],
  note:
    "Quantum advantage removes an expense that only exists if you insisted on " +
    "simulating. Avoided cost is not generated power, so it cannot move K.",
} as const;
