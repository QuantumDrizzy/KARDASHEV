export type House = {
  layer: "Launch" | "Energy" | "Compute" | "Silicon" | "Quantum" | "Space";
  name: string;
  delivers: string;
};

/** Industrial base. Not sponsors. Not a JV. Who has to deliver watts, kg, silicon, states. */
export const SECTOR: House[] = [
  { layer: "Launch", name: "SpaceX", delivers: "Starship, Starlink ISL, Starmind / AI1. The kilogram." },
  { layer: "Launch", name: "Rocket Lab", delivers: "Electron, Neutron, rideshare. Small cadence." },
  { layer: "Launch", name: "Blue Origin", delivers: "New Glenn. Heavy mass, if it flies at rate." },
  { layer: "Energy", name: "Tesla Energy", delivers: "Solar + Megapack. Type 0. AGI on the crust." },
  { layer: "Energy", name: "Google", delivers: "Suncatcher: TPU + dawn-dusk solar. Paper and pathfinder." },
  { layer: "Compute", name: "NVIDIA", delivers: "GPU. Radiation-lot. Who builds the rack builds the sat." },
  { layer: "Compute", name: "xAI", delivers: "Colossus. Training on Earth. Inference demand." },
  { layer: "Compute", name: "Starcloud", delivers: "Orbital datacenter. Startup, not a 1M filing." },
  { layer: "Silicon", name: "TSMC", delivers: "Leading-edge. No wafer, no K." },
  { layer: "Silicon", name: "GlobalFoundries", delivers: "Radiation-tolerant / analog. The lot that survives LEO." },
  { layer: "Quantum", name: "D-Wave", delivers: "Annealing. Optimization, not the cryostat in orbit." },
  { layer: "Quantum", name: "Google Quantum AI", delivers: "Superconducting. Earth. Suncatcher is classical." },
  { layer: "Quantum", name: "IBM Quantum", delivers: "Utility-scale superconducting. Craton, not LEO." },
  { layer: "Quantum", name: "PsiQuantum", delivers: "Photonics. The modality that might fly, if it flies." },
  { layer: "Quantum", name: "IonQ", delivers: "Trapped ion. Lab. Does not raise K." },
  { layer: "Space", name: "Lockheed Martin", delivers: "Buses, defense, GNSS. Already putting iron in orbit." },
  { layer: "Space", name: "Northrop Grumman", delivers: "Cygnus, missile warning, large sats." },
  { layer: "Space", name: "Maxar", delivers: "Observation, buses. The eye, not the FLOP." },
  { layer: "Space", name: "Thales Alenia Space", delivers: "Telecom, modules. Europe in the stack." },
  { layer: "Space", name: "Axiom Space", delivers: "Commercial station. Platform, not constellation." },
  { layer: "Space", name: "Meta Materials", delivers: "Optics / metamaterials. Radiator, panel, thermal stealth." },
];

export const LAYERS = ["Launch", "Energy", "Compute", "Silicon", "Quantum", "Space"] as const;
