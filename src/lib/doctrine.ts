export type DoctrineItem = {
  id: string;
  title: string;
  body: string;
  kind: "do" | "dont" | "risk" | "extract";
};

export const EXTRACT: DoctrineItem[] = [
  {
    id: "e1",
    kind: "extract",
    title: "Watts off the grid",
    body: "In dawn-dusk SSO the panel runs almost continuously, with no atmosphere. The extractable product is firm power outside the terrestrial grid and outside cooling water.",
  },
  {
    id: "e2",
    kind: "extract",
    title: "Inference at volume",
    body: "Laser ISL holds inference and serving batches. Training all-reduce does not, until the mesh is dense. Extract latency-acceptable work, not frontier pretraining.",
  },
  {
    id: "e3",
    kind: "extract",
    title: "Mass as currency",
    body: "The bottleneck is kg to LEO. Each watt of compute drags kg of panel + radiator + spare. Architecture = minimise kg/W, not FLOPS/chip.",
  },
  {
    id: "e4",
    kind: "extract",
    title: "Earth as control plane",
    body: "Heavy training, helium, mK, instrumentation, keys, datasets. Orbit does not replace the lab. Extract scale; keep control.",
  },
  {
    id: "e5",
    kind: "extract",
    title: "Kardashev I under construction",
    body: "Taking compute off the crust raises the fraction of sun we use. It is not Type II. It is the floor of ASI.",
  },
];
