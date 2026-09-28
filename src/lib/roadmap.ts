export type Status = "flying" | "building" | "filing" | "demo" | "earth" | "blocked";

export type Milestone = {
  id: string;
  when: string;
  year: number;
  title: string;
  org: string;
  status: Status;
  body: string;
  gate: string;
};

export type Track = {
  id: string;
  org: string;
  program: string;
  status: Status;
  now: string;
  next: string;
  bottleneck: string;
};

export const STATUS_LABEL: Record<Status, string> = {
  flying: "flying",
  building: "in factory",
  filing: "filing",
  demo: "demo",
  earth: "earth",
  blocked: "does not fly",
};

export const TRACKS: Track[] = [
  {
    id: "starship",
    org: "SpaceX",
    program: "Starship",
    status: "building",
    now: "Reusable is not industrial cadence yet. It is the bottleneck of the whole scale.",
    next: "Frequent flights + AI1 payload",
    bottleneck: "$/kg and rate",
  },
  {
    id: "starmind",
    org: "SpaceX",
    program: "Starmind / AI1",
    status: "building",
    now: "FCC ~1M sats. AI1: 20 m, 70 m wings, 120 kW avg / 150 kW peak. Gigasat (Bastrop).",
    next: "2 prototypes early 2027 → volume late 2027 (target 1 GW/yr, not 1M sats)",
    bottleneck: "Starship + radiator + chips",
  },
  {
    id: "gigasat",
    org: "SpaceX",
    program: "Gigasat Factory",
    status: "building",
    now: "Plant for thousands of AI sats. Volume claimed late 2027.",
    next: "First articles → rate",
    bottleneck: "Solar / radiator / GPU supply chain",
  },
  {
    id: "xai",
    org: "xAI",
    program: "Colossus / Macrohard",
    status: "earth",
    now: "Inference demand on the ground (GW). Orbit does not train the frontier first.",
    next: "Split: train Earth / serve orbit when ISL holds",
    bottleneck: "Workload topology",
  },
  {
    id: "terafab",
    org: "Terafab",
    program: "Foundry",
    status: "filing",
    now: "Ambition: 1 TW of processors/yr. The bottleneck can move from launch to silicon.",
    next: "Radiation-hard lot vs commodity",
    bottleneck: "Chip supply",
  },
  {
    id: "suncatcher",
    org: "Google + Planet",
    program: "Suncatcher",
    status: "demo",
    now: "Paper + 2 TPU Owl sats, launch early 2027. Dawn-dusk SSO. Clusters of 81 at 1 km.",
    next: "TPU in radiation + optical ISL between the two",
    bottleneck: "Hardware in situ, not the paper",
  },
  {
    id: "starcloud",
    org: "Starcloud",
    program: "Pathfinder",
    status: "flying",
    now: "H100 already flew (2025). Starcloud-2 Blackwell. Starcloud-3 200 kW via Starship PEZ.",
    next: "Cost-competitive claim if launch ~$500/kg",
    bottleneck: "Radiator + lifetime",
  },
  {
    id: "nvidia",
    org: "NVIDIA",
    program: "Space-1 / Rubin",
    status: "building",
    now: "SpaceX exclusive for Starmind AI1. Radiation-lot, not a datacenter GB300.",
    next: "Payload qualification",
    bottleneck: "SEU / 5-year dose",
  },
  {
    id: "tesla",
    org: "Tesla Energy",
    program: "Solar / Megapack",
    status: "earth",
    now: "Watts on the crust. Energy control plane until orbital crosses the grid.",
    next: "Does not replace a radiator in vacuum",
    bottleneck: "Permits and grid, not orbital physics",
  },
  {
    id: "qc",
    org: "Lab (Earth)",
    program: "Superconducting QPU",
    status: "blocked",
    now: "mK + He + muons. Not a LEO payload. Photonics / sensing yes.",
    next: "Stays on the craton / shallow underground",
    bottleneck: "Cryogenics + correlated errors",
  },
];

export const MILESTONES: Milestone[] = [
  {
    id: "m1",
    when: "Nov 2025",
    year: 2025,
    title: "Suncatcher paper + Starcloud-1",
    org: "Google / Starcloud",
    status: "flying",
    body: "Google publishes the SSO + TPU design. Starcloud puts an H100 in orbit. The pathfinder stops being a slide.",
    gate: "Real hardware, not a filing.",
  },
  {
    id: "m2",
    when: "Jan 2026",
    year: 2026,
    title: "FCC Starmind ~1M sats",
    org: "SpaceX",
    status: "filing",
    body: "A compute constellation, not Starlink comms. 1M is a regulatory ceiling, not the 2027 plan.",
    gate: "A license is not a satellite.",
  },
  {
    id: "m3",
    when: "2026",
    year: 2026,
    title: "Gigasat + AI1 design",
    org: "SpaceX",
    status: "building",
    body: "Bastrop factory. AI1 120 kW avg, radiators, laser ISL. Earth stays in GW (Colossus / Neocloud).",
    gate: "Starship actually reusable.",
  },
  {
    id: "m4",
    when: "Early 2027",
    year: 2027,
    title: "AI1 prototypes + Suncatcher 2×TPU",
    org: "SpaceX / Google",
    status: "demo",
    body: "Two AI1 prototypes. Two Planet Owl TPUs. First evidence on heat, radiation, ISL.",
    gate: "Dose and heat, not marketing FLOPS.",
  },
  {
    id: "m5",
    when: "Late 2027",
    year: 2027,
    title: "Volume claimed 1 GW/yr",
    org: "SpaceX",
    status: "building",
    body: "Gigasat cadence target. 1 GW/yr ≠ 1M sats. Without Starship rate it is a slide again.",
    gate: "kg/week to LEO.",
  },
  {
    id: "m6",
    when: "2028",
    year: 2028,
    title: "Initial service",
    org: "SpaceX / pathfinders",
    status: "demo",
    body: "Orbital inference if ISL and lifetime hold. Training all-reduce stays on Earth.",
    gate: "Explicit workload split.",
  },
  {
    id: "m7",
    when: "2030s",
    year: 2032,
    title: "Economic crossover",
    org: "System",
    status: "filing",
    body: "Google: cost comparable to terrestrial kWh if launch ~$200/kg. Musk aims lower. It is a curve, not a yes.",
    gate: "$/kg · radiator kg/W · chip lifetime",
  },
];

export const PHASES = [
  { id: "p0", name: "Earth scales", years: "2025–26", k: "K 0.73", note: "GW on the grid. Pathfinders. Filings." },
  { id: "p1", name: "Demos", years: "2027", k: "evidence", note: "AI1 + TPU + Blackwell. Measure heat and dose." },
  { id: "p2", name: "Service", years: "2028–30", k: "K → 0.85", note: "Inference in orbit. Training on Earth." },
  { id: "p3", name: "Type I wedge", years: "2030s", k: "K → 1", note: "Watts off the crust at scale. Not a Dyson." },
];
