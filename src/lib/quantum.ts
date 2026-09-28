export type Modality = {
  id: string;
  name: string;
  orbit: "no" | "hard" | "maybe" | "yes";
  earth: string;
  why: string;
  bottleneck: string;
};

export const MODALITIES: Modality[] = [
  {
    id: "sc",
    name: "Superconducting transmon",
    orbit: "no",
    earth: "Primary lab",
    why: "10–20 mK, ³He/⁴He dilution, muons → correlated quasiparticles. Massive shielding kills the payload.",
    bottleneck: "Cryogenics + cosmic-ray bursts",
  },
  {
    id: "ion",
    name: "Trapped ions",
    orbit: "hard",
    earth: "Viable",
    why: "Vacuum helps. Vibration, lasers, classical control and optics cooling power do not.",
    bottleneck: "Optics + control + isolation mass",
  },
  {
    id: "ph",
    name: "Photonic / linear optics",
    orbit: "maybe",
    earth: "R&D",
    why: "No mK. Radiation and thermal alignment yes. Natural for ISL and sensing.",
    bottleneck: "Loss, sources, thermal drift",
  },
  {
    id: "nv",
    name: "NV / solid-state sensing",
    orbit: "yes",
    earth: "Lab + field",
    why: "Magnetometry, radiation, timing. Space is the instrument, not the enemy.",
    bottleneck: "SNR + downlink",
  },
  {
    id: "anneal",
    name: "Quantum annealing (flux)",
    orbit: "no",
    earth: "Cryo facility",
    why: "Same cryo family as transmons at a different scale. Not a LEO payload.",
    bottleneck: "mK + classical I/O",
  },
  {
    id: "sim",
    name: "Classical tensor / Cirq sim",
    orbit: "yes",
    earth: "Local HPC (16 GB)",
    why: "Not a QPU. It is the bench: circuits, noise, simulated annealing, hybrid workloads.",
    bottleneck: "VRAM / HBM, not vacuum",
  },
];

export const ARCH = [
  {
    layer: "Orbit",
    role: "Inference + watts",
    owns: "Serving, continuous solar, radiators, ISL",
  },
  {
    layer: "Earth",
    role: "AGI + control",
    owns: "Training, datasets, keys, helium, mK, QEC",
  },
  {
    layer: "Local bench",
    role: "Do not lie to yourself",
    owns: "CUDA / tensors / Cirq / Rust — simulate the radiator, launch, noise. Not the satellite.",
  },
];

export const ORBIT_LABEL: Record<Modality["orbit"], string> = {
  no: "does not fly",
  hard: "hard",
  maybe: "maybe",
  yes: "flies",
};
