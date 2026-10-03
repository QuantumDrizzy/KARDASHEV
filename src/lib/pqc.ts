/**
 * PQC — post-quantum crypto as a CHANNEL budget. M4b.
 *
 * `docs/NEXT-MODULES.md` §M4: PQC belongs on this instrument as the channel for
 * inter-satellite links and telemetry — not as a QPU, and not as a way to raise
 * K. M4a measured why simulating a quantum state is exponential; this measures
 * what defending against one actually costs a link.
 *
 * **This module implements no cryptography and must never be asked to.** It is
 * a parameter catalogue and a link budget. Hand-rolled lattice code is how you
 * get a timing side channel; the sizes below are public FIPS parameters, and an
 * implementation belongs in a vetted library, on the ground, outside a website.
 *
 * ── The result ───────────────────────────────────────────────────────────────
 *
 * A post-quantum handshake is **50x** the bytes of an X25519 + Ed25519 one:
 * 12,794 B against 256 B. Whether that matters is entirely a property of the
 * link, and the answer is not the one a headline would give:
 *
 *   1 Gbps optical ISL, 5,000 km   PQC costs **0.15%** of handshake wall time
 *   1 Mbps telemetry, same range   PQC costs **59%**
 *
 * Above ~13.5 Mbps the extra bytes stay under 10% of the handshake. Below that
 * they dominate, and small-satellite telemetry lives below that. So the useful
 * statement is a **crossover**, not a verdict — `rateForOverhead()`. On a fast
 * link the handshake is latency bound, which is the same lesson the grid module
 * learned about HVDC ties, for the same reason: geometry beats payload.
 *
 * The reason to migrate is not performance anyway. It is
 * harvest-now-decrypt-later: traffic captured today is decrypted whenever a
 * cryptographically relevant quantum computer arrives, and telemetry with a
 * 20-year archive life is exactly the wrong thing to be relaxed about.
 *
 * Note where this sits on the ledger, consistent with M4a: crypto is **load**,
 * not generation. It cannot move K either. It is simply too small to argue about.
 */

import { C } from "./constants.ts";
import { JOULES_PER_AMPLITUDE_GATE, simulationWall } from "./qsim.ts";

/** Vacuum, not fibre. An ISL has no glass in it — see grid.ts for the contrast. */
export const C_VACUUM = C;

export type SuiteRole = "kem" | "signature";

export type Suite = {
  id: string;
  name: string;
  role: SuiteRole;
  /** FIPS number, or null for classical / not yet final. */
  fips: number | null;
  /** NIST security category, 1/2/3/5. Null for classical. */
  nistLevel: number | null;
  publicKeyBytes: number;
  secretKeyBytes: number;
  /** Ciphertext for a KEM, signature for a signature scheme. */
  payloadBytes: number;
  quantumResistant: boolean;
  note?: string;
};

/**
 * Published FIPS parameters. Sizes are exact and checkable; nothing here is
 * derived or estimated.
 */
export const SUITES: Suite[] = [
  // ── classical baselines ────────────────────────────────────────────────────
  {
    id: "x25519",
    name: "X25519",
    role: "kem",
    fips: null,
    nistLevel: null,
    publicKeyBytes: 32,
    secretKeyBytes: 32,
    payloadBytes: 32,
    quantumResistant: false,
    note: "Broken by Shor on a CRQC. Baseline for the size comparison.",
  },
  {
    id: "ed25519",
    name: "Ed25519",
    role: "signature",
    fips: null,
    nistLevel: null,
    publicKeyBytes: 32,
    secretKeyBytes: 64,
    payloadBytes: 64,
    quantumResistant: false,
  },
  {
    id: "rsa2048",
    name: "RSA-2048",
    role: "signature",
    fips: null,
    nistLevel: null,
    publicKeyBytes: 256,
    secretKeyBytes: 1190,
    payloadBytes: 256,
    quantumResistant: false,
  },
  // ── FIPS 203, key encapsulation ────────────────────────────────────────────
  { id: "ml-kem-512", name: "ML-KEM-512", role: "kem", fips: 203, nistLevel: 1, publicKeyBytes: 800, secretKeyBytes: 1632, payloadBytes: 768, quantumResistant: true },
  { id: "ml-kem-768", name: "ML-KEM-768", role: "kem", fips: 203, nistLevel: 3, publicKeyBytes: 1184, secretKeyBytes: 2400, payloadBytes: 1088, quantumResistant: true, note: "The sensible default." },
  { id: "ml-kem-1024", name: "ML-KEM-1024", role: "kem", fips: 203, nistLevel: 5, publicKeyBytes: 1568, secretKeyBytes: 3168, payloadBytes: 1568, quantumResistant: true },
  // ── FIPS 204, lattice signatures ───────────────────────────────────────────
  { id: "ml-dsa-44", name: "ML-DSA-44", role: "signature", fips: 204, nistLevel: 2, publicKeyBytes: 1312, secretKeyBytes: 2560, payloadBytes: 2420, quantumResistant: true },
  { id: "ml-dsa-65", name: "ML-DSA-65", role: "signature", fips: 204, nistLevel: 3, publicKeyBytes: 1952, secretKeyBytes: 4032, payloadBytes: 3309, quantumResistant: true, note: "The sensible default." },
  { id: "ml-dsa-87", name: "ML-DSA-87", role: "signature", fips: 204, nistLevel: 5, publicKeyBytes: 2592, secretKeyBytes: 4896, payloadBytes: 4627, quantumResistant: true },
  // ── FIPS 205, hash-based signatures ────────────────────────────────────────
  {
    id: "slh-dsa-128s",
    name: "SLH-DSA-SHA2-128s",
    role: "signature",
    fips: 205,
    nistLevel: 1,
    publicKeyBytes: 32,
    secretKeyBytes: 64,
    payloadBytes: 7856,
    quantumResistant: true,
    note: "Tiny keys, huge signatures. Security rests only on the hash — the conservative pick for long-lived roots.",
  },
  {
    id: "slh-dsa-256s",
    name: "SLH-DSA-SHA2-256s",
    role: "signature",
    fips: 205,
    nistLevel: 5,
    publicKeyBytes: 64,
    secretKeyBytes: 128,
    payloadBytes: 29_792,
    quantumResistant: true,
  },
];

export const suite = (id: string) => SUITES.find((s) => s.id === id)!;

// ────────────────────────────────────────────────────────── handshake budget

export type Handshake = {
  label: string;
  kem: Suite;
  signature: Suite;
  /** Bytes on the wire for one mutually authenticated handshake. */
  bytes: number;
  quantumResistant: boolean;
};

/**
 * One mutually authenticated handshake: both ends send a signing public key and
 * a signature, the initiator sends a KEM public key, the responder a ciphertext.
 * [ASSUMPTION] Bare protocol cost, no certificate chain, no transcript padding.
 * A real X.509 chain adds a few kB to BOTH columns, so the ratio moves toward 1.
 */
export function handshakeBytes(kem: Suite, sig: Suite) {
  return kem.publicKeyBytes + kem.payloadBytes + 2 * (sig.publicKeyBytes + sig.payloadBytes);
}

export function handshake(label: string, kemId: string, sigId: string): Handshake {
  const kem = suite(kemId);
  const signature = suite(sigId);
  return {
    label,
    kem,
    signature,
    bytes: handshakeBytes(kem, signature),
    quantumResistant: kem.quantumResistant && signature.quantumResistant,
  };
}

export const CLASSICAL_HANDSHAKE = handshake("Classical", "x25519", "ed25519");
export const PQC_HANDSHAKE = handshake("Post-quantum", "ml-kem-768", "ml-dsa-65");
export const PQC_CONSERVATIVE = handshake("Post-quantum, hash-based sig", "ml-kem-1024", "slh-dsa-128s");

/** How much fatter the post-quantum handshake is. 50x on the bare protocol. */
export function sizePenalty(pq: Handshake = PQC_HANDSHAKE, classical: Handshake = CLASSICAL_HANDSHAKE) {
  return pq.bytes / classical.bytes;
}

// ──────────────────────────────────────────────────────────────── link budget

export type LinkBudget = {
  distanceKm: number;
  rateBps: number;
  /** One-way light delay in vacuum. No glass on an ISL. */
  propagationMs: number;
  /** Time to clock the handshake bytes onto the link. */
  transmissionMs: number;
  /** Round trips the handshake needs. */
  roundTrips: number;
  totalMs: number;
  /** Share of the handshake's wall time that is the extra PQC bytes. */
  pqcOverheadFrac: number;
  /** Energy for the handshake bytes at the link's energy per bit. */
  joules: number;
};

/**
 * [ASSUMPTION] Optical ISL transceiver energy per bit. Free-space laser terminals
 * are in the low nJ/bit at these rates; used only for an order of magnitude.
 */
export const ISL_JOULES_PER_BIT = 1e-9;

export function linkBudget(
  hs: Handshake,
  o: { distanceKm?: number; rateBps?: number; roundTrips?: number; joulesPerBit?: number } = {},
): LinkBudget {
  const distanceKm = o.distanceKm ?? 5000;
  const rateBps = o.rateBps ?? 1e9;
  const roundTrips = o.roundTrips ?? 2;
  const jPerBit = o.joulesPerBit ?? ISL_JOULES_PER_BIT;
  const propagationMs = ((distanceKm * 1000) / C_VACUUM) * 1000;
  const transmissionMs = ((hs.bytes * 8) / rateBps) * 1000;
  const extraBytes = Math.max(0, hs.bytes - CLASSICAL_HANDSHAKE.bytes);
  const extraMs = ((extraBytes * 8) / rateBps) * 1000;
  const totalMs = roundTrips * 2 * propagationMs + transmissionMs;
  return {
    distanceKm,
    rateBps,
    propagationMs,
    transmissionMs,
    roundTrips,
    totalMs,
    pqcOverheadFrac: totalMs > 0 ? extraMs / totalMs : 0,
    joules: hs.bytes * 8 * jPerBit,
  };
}

/**
 * Link rate at which the extra post-quantum bytes cross a given share of the
 * handshake's wall time. Solving extraMs / totalMs = target for the rate.
 *
 * [RESULT] This is the number that stops the panel from lying by omission. PQC
 * is invisible on a fast link and expensive on a slow one, and small-satellite
 * telemetry is a slow link.
 */
export function rateForOverhead(
  target: number,
  hs: Handshake = PQC_HANDSHAKE,
  o: { distanceKm?: number; roundTrips?: number } = {},
) {
  const distanceKm = o.distanceKm ?? 5000;
  const roundTrips = o.roundTrips ?? 2;
  const propS = (distanceKm * 1000) / C_VACUUM;
  const extraBits = Math.max(0, hs.bytes - CLASSICAL_HANDSHAKE.bytes) * 8;
  const totalBits = hs.bytes * 8;
  // extra/rate = target * (2*rt*prop + total/rate)  =>  rate = (extra - target*total) / (target*2*rt*prop)
  const num = extraBits - target * totalBits;
  const den = target * 2 * roundTrips * propS;
  return num > 0 && den > 0 ? num / den : 0;
}

/**
 * The verdict, kept as data so the page cannot drift off it.
 *
 * [RESULT] On a 5,000 km ISL at 1 Gbps the post-quantum handshake adds 0.15%
 * to the handshake's wall time: the link is latency bound, and geometry beats
 * payload. At 1 Mbps it adds 59%. Quote the crossover, never the verdict.
 */
export const PQC_VERDICT = {
  sizePenaltyX: sizePenalty(),
  /** Above this link rate the extra bytes are under 10% of handshake wall time. */
  freeAboveBps: rateForOverhead(0.1),
  /** Crypto is on the load side of the ledger, like every other computation. */
  affectsNumeratorOfK: false,
  /** The actual reason to migrate. Not performance, not K. */
  reason: "harvest-now-decrypt-later",
  note:
    "Traffic captured today is decrypted when a cryptographically relevant " +
    "quantum computer arrives. Telemetry with a 20-year archive life is the " +
    "wrong thing to be relaxed about.",
  /** [KNOWN_LIMIT] Not a universal claim. See freeAboveBps. */
  caveat:
    "PQC is invisible on an optical ISL and expensive on a slow one: 0.15% of " +
    "handshake wall time at 1 Gbps, 59% at 1 Mbps. Small-satellite telemetry " +
    "is a slow link, and that is where SLH-DSA's 30 kB signatures disqualify " +
    "themselves rather than where they shine.",
  doNotImplementHere: true,
} as const;

/**
 * Sentences the /quantum channel panel is allowed to state. Built from the
 * FIPS catalogue and from the M4a measurement in qsim.ts. No new constants.
 * The page renders these and nothing else, so the copy cannot drift.
 */
export function channelPanel(): { readonly sentences: readonly string[] } {
  const fast = linkBudget(PQC_HANDSHAKE, { distanceKm: 5000, rateBps: 1e9 });
  const slow = linkBudget(PQC_HANDSHAKE, { distanceKm: 5000, rateBps: 1e6 });
  const penalty = sizePenalty();
  const wall = simulationWall();
  const nJ = JOULES_PER_AMPLITUDE_GATE * 1e9;
  const pct = (frac: number) => {
    const p = frac * 100;
    return p >= 10 ? `${Math.round(p)}%` : `${p.toFixed(2)}%`;
  };
  return {
    sentences: [
      "ML-KEM and ML-DSA are the channel for the ISL and for telemetry. They are not a QPU.",
      `A bare ML-KEM-768 + ML-DSA-65 handshake is ${PQC_HANDSHAKE.bytes.toLocaleString("en-US")} B against ${CLASSICAL_HANDSHAKE.bytes} B of X25519 + Ed25519, \u00d7${penalty.toFixed(0)}. Assumption: no certificate chain.`,
      `On a 5,000 km optical ISL at 1 Gbps the extra bytes are ${pct(fast.pqcOverheadFrac)} of handshake wall time. At 1 Mbps they are ${pct(slow.pqcOverheadFrac)}.`,
      `Above ${(PQC_VERDICT.freeAboveBps / 1e6).toFixed(1)} Mbps the extra bytes stay under 10% of the handshake. Below that they dominate, and small-satellite telemetry lives below that.`,
      `The bench is the measurement already in the repo: a ${wall.measuredMaxQubits}-qubit wall on 16 GB, ${nJ.toFixed(2)} nJ per amplitude-update. One gate costs a second of a Type I budget at ${wall.typeIQubits.toFixed(1)} qubits.`,
      "Quantum advantage is an avoided cost. Avoided cost is not generated power, so quantum does not raise K.",
      "The reason to migrate is harvest-now-decrypt-later. Crypto is load, not generation.",
    ],
  };
}
