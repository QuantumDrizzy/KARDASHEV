/** Who measures. Not partners. Not this site. Lives inside each layer. */

export const LAYERS = ["Energy", "AI", "Biology", "Health", "Space", "Quantum"] as const;
export type Layer = (typeof LAYERS)[number];

export const FACETS = ["fields", "discoveries", "centers", "works"] as const;
export type Facet = (typeof FACETS)[number];

export const FACET_LABEL: Record<Facet, string> = {
  fields: "Fields",
  discoveries: "Discoveries",
  centers: "Centers",
  works: "Works",
};

export type Media = { src: string; poster?: string };

export type Field = {
  id: string;
  name: string;
  layer: Layer;
  body: string;
  datum: string;
  media: Media;
};

export type Discovery = {
  year: string;
  title: string;
  org: string;
  layer: Layer;
  body: string;
  datum: string;
  media: Media;
};

export type Center = {
  name: string;
  where: string;
  layer: Layer;
  delivers: string;
  datum: string;
  media: Media;
};

export type Work = {
  year: string;
  title: string;
  venue: string;
  org: string;
  layer: Layer;
  measures: string;
  datum: string;
  media: Media;
};

export type RecordItem = {
  key: string;
  kicker: string;
  title: string;
  body: string;
  datum: string;
  media: Media;
  sub: string;
};

const M = {
  sun: { src: "/media/sun.mp4", poster: "/media/sun.jpg" },
  am0: { src: "/media/am0.mp4", poster: "/media/am0.jpg" },
  plasma: { src: "/media/plasma.mp4", poster: "/media/plasma.jpg" },
  radiator: { src: "/media/radiator.mp4", poster: "/media/radiator.jpg" },
  solar: { src: "/media/solar.jpg" },
  dc: { src: "/media/datacenter.mp4", poster: "/media/datacenter.jpg" },
  sat: { src: "/media/orbit-sat.mp4", poster: "/media/ai-sat.jpg" },
  tracks: { src: "/media/tracks.mp4", poster: "/media/constellation.jpg" },
  terafab: { src: "/media/terafab.jpg" },
  bio: { src: "/media/biosphere.mp4", poster: "/media/biosphere.jpg" },
  ocean: { src: "/media/ocean.jpg" },
  night: { src: "/media/earth-night.mp4", poster: "/media/earth-night.jpg" },
  earth: { src: "/media/earth.jpg" },
  salud: { src: "/media/salud.mp4", poster: "/media/salud-lab.jpg" },
  brain: { src: "/media/brain.mp4", poster: "/media/brain.jpg" },
  orbitmed: { src: "/media/salud-orbit.jpg" },
  launch: { src: "/media/launch.mp4", poster: "/media/launch.jpg" },
  pad: { src: "/media/pad.mp4", poster: "/media/starship.jpg" },
  q: { src: "/media/quantum.mp4", poster: "/media/quantum.jpg" },
  galaxy: { src: "/media/galaxy.mp4", poster: "/media/galaxy.jpg" },
} as const satisfies Record<string, Media>;

export const LAYER_RECORD: Record<
  Layer,
  { src: string; poster: string; veil: "default" | "sun" | "night"; kicker: string; line: string; copy: string }
> = {
  Energy: {
    src: "/media/plasma.mp4",
    poster: "/media/plasma.jpg",
    veil: "sun",
    kicker: "Record · Energy",
    line: "Who measures the watt.",
    copy: "IEA TES. IAU TSI. NIF ignition. ITER is not a grid. The numbers on this page come from labs. Not from this site.",
  },
  AI: {
    src: "/media/datacenter.mp4",
    poster: "/media/datacenter.jpg",
    veil: "night",
    kicker: "Record · AI",
    line: "Who measures the rack.",
    copy: "IEA datacentres. Kaplan scaling. Suncatcher. Starcloud already flew an H100. Parameters do not raise K. Watts do.",
  },
  Biology: {
    src: "/media/biosphere.mp4",
    poster: "/media/biosphere.jpg",
    veil: "default",
    kicker: "Record · Biology",
    line: "Who measures the living watt.",
    copy: "Field NPP. Rockström boundaries. Haberl HANPP. Type I is not a harvest of chlorophyll.",
  },
  Health: {
    src: "/media/brain.mp4",
    poster: "/media/brain.jpg",
    veil: "night",
    kicker: "Record · Health",
    line: "Who measures the operator.",
    copy: "UN e0. WHO HALE. NASA dose. Career ~1 Sv. No radiation medicine, no human fleet.",
  },
  Space: {
    src: "/media/launch.mp4",
    poster: "/media/launch.jpg",
    veil: "night",
    kicker: "Record · Space",
    line: "Who measures the kilogram.",
    copy: "Van Allen. Kessler. Two-body μ. Dawn-dusk SSO. kg/W is the civilizational metric, not the FLOP.",
  },
  Quantum: {
    src: "/media/quantum.mp4",
    poster: "/media/quantum.jpg",
    veil: "sun",
    kicker: "Record · Quantum",
    line: "Who measures the state.",
    copy: "NIST PQC. LIGO. Clocks. NV sensing. A million qubits in LEO still do not close ×509.",
  },
};

export const FIELDS: Field[] = [
  {
    id: "am0",
    name: "AM0 / TSI",
    layer: "Energy",
    datum: "1361 W/m²",
    body: "Total solar irradiance at 1 AU. IAU 2015. The first Kardashev watt is this number, not a desert.",
    media: M.am0,
  },
  {
    id: "fusion",
    name: "Magnetic fusion",
    layer: "Energy",
    datum: "Q > 1 ≠ grid",
    body: "Tokamak and stellarator. NIF ignition is a pulse, not TES. ITER is not Type I. Crust watts until the watt shows up.",
    media: M.plasma,
  },
  {
    id: "radcool",
    name: "Radiative cooling",
    layer: "Energy",
    datum: "σT⁴",
    body: "Vacuum has no convection. ISS practical ~166 W/m². The radiator is the civilizational metric.",
    media: M.radiator,
  },
  {
    id: "tes",
    name: "TES metrology",
    layer: "Energy",
    datum: "620 EJ",
    body: "IEA total energy supply. 2023 → ~20 TW. The live K on the home is this series, not a grid meter.",
    media: M.night,
  },
  {
    id: "crustpv",
    name: "Crust PV / Type 0",
    layer: "Energy",
    datum: "Type 0",
    body: "Megapack and ground solar serve AGI. They do not close ×486. Cooling water is the ceiling.",
    media: M.solar,
  },
  {
    id: "scaling",
    name: "Scaling laws",
    layer: "AI",
    datum: "N ≠ K",
    body: "Kaplan 2020. Loss vs N, D, C. More parameters do not raise Kardashev. AGI is a GW event on Earth.",
    media: M.dc,
  },
  {
    id: "dcwatts",
    name: "Datacenter watts",
    layer: "AI",
    datum: "460 TWh",
    body: "IEA 2024. ~50 GW. All racks on Earth are a rounding error of Type I. ASI asks for the sun.",
    media: M.dc,
  },
  {
    id: "radlot",
    name: "Radiation-lot silicon",
    layer: "AI",
    datum: "SEU / TID",
    body: "A GB300 from a datacenter is not a 5-year SSO payload. The lot is the product. Inference can fly. Training cannot, first.",
    media: M.terafab,
  },
  {
    id: "isl",
    name: "Laser ISL",
    layer: "AI",
    datum: "no fiber",
    body: "The rack in orbit has no WAN. Optical crosslinks are the backplane. Starmind, Suncatcher, Starlink heritage.",
    media: M.tracks,
  },
  {
    id: "serve",
    name: "Train Earth / serve orbit",
    layer: "AI",
    datum: "AGI · ASI",
    body: "Pretraining, NVLink, water: crust. Inference, SSO, AM0: orbit. The satellite does not train the frontier first.",
    media: M.sat,
  },
  {
    id: "npp",
    name: "NPP / HANPP",
    layer: "Biology",
    datum: "130 TW",
    body: "Field et al. ~105 Pg C/yr → ~130 TW. Type I is ×77 that photosynthesis. The biosphere is not a 10,000 TW stock.",
    media: M.bio,
  },
  {
    id: "boundaries",
    name: "Planetary boundaries",
    layer: "Biology",
    datum: "overshoot",
    body: "Rockström / SRC. Climate, N, land, integrity already crossed. Type I on the crust cooks the Holocene.",
    media: M.earth,
  },
  {
    id: "ocean",
    name: "Ocean NPP",
    layer: "Biology",
    datum: "47%",
    body: "Phytoplankton ~half the living budget. AM0 in orbit does not acidify. Coal does.",
    media: M.ocean,
  },
  {
    id: "forcing",
    name: "Radiative forcing",
    layer: "Biology",
    datum: "~2.7 W/m²",
    body: "IPCC AR6. A few watts per square meter already moves the Holocene. Thermal Type I on the crust is not a climate plan.",
    media: M.night,
  },
  {
    id: "hale",
    name: "HALE / e0",
    layer: "Health",
    datum: "63.7 / 73.4",
    body: "WHO / UN. Ten sick years. Raising K with broken operators is theatre. Longevity is uptime.",
    media: M.salud,
  },
  {
    id: "dose",
    name: "LEO dose",
    layer: "Health",
    datum: "0.3–1 mSv/d",
    body: "ISS ~180 mSv/yr. Career ~1 Sv. A body is not a five-year sat. Teleop instead.",
    media: M.orbitmed,
  },
  {
    id: "bmr",
    name: "Metabolic watt",
    layer: "Health",
    datum: "< 1 TW",
    body: "8.2×10⁹ × 120 W. All human flesh is under a terawatt. K does not rise on more metabolism.",
    media: M.brain,
  },
  {
    id: "radmed",
    name: "Space radiation medicine",
    layer: "Health",
    datum: "career 1 Sv",
    body: "Cucinotta / NASA HRP. GCR, SPE, SAA. No pharmacy for this yet. No radiation medicine, no human fleet.",
    media: M.orbitmed,
  },
  {
    id: "sso",
    name: "Dawn-dusk SSO",
    layer: "Space",
    datum: "β ≈ 90°",
    body: "Night → 0. Why Suncatcher and Starmind park there, not GEO. Two-body + β, not a mood.",
    media: M.am0,
  },
  {
    id: "radhard",
    name: "Radiation-hard silicon",
    layer: "Space",
    datum: "SAA",
    body: "SEU, TID, inner belt. SSO 550 km sits under Van Allen. Commodity GPU is not a belt payload.",
    media: M.sat,
  },
  {
    id: "debris",
    name: "Debris / conjunction",
    layer: "Space",
    datum: "~4×10⁴",
    body: "USSPACECOM tracked. >1 cm ~10⁶. Kessler is a rate. A million-sat filing without deorbit is debris architecture.",
    media: M.tracks,
  },
  {
    id: "kgw",
    name: "kg / W",
    layer: "Space",
    datum: "kg / W",
    body: "Launch mass per watt of orbital compute. Panel + radiator + spare. The FLOP is downstream of the kilogram.",
    media: M.pad,
  },
  {
    id: "twobody",
    name: "Two-body parks",
    layer: "Space",
    datum: "μ⊕",
    body: "IAU μ = 3.986004418×10¹⁴. ISS 7.67 km/s, 92.5 min, 0.88 g. You are missing the ground. Gravity did not die.",
    media: M.sat,
  },
  {
    id: "pqc",
    name: "PQC",
    layer: "Quantum",
    datum: "ML-KEM",
    body: "Keys when inference leaves the crust. NIST FIPS 203/204/205. Infrastructure now. Not a qubit poster.",
    media: M.tracks,
  },
  {
    id: "sensing",
    name: "Quantum sensing",
    layer: "Quantum",
    datum: "NV / clocks",
    body: "Magnetometry, radiation, timing. Space is the instrument. This one flies. The transmon does not.",
    media: M.sat,
  },
  {
    id: "qpu",
    name: "mK QPU",
    layer: "Quantum",
    datum: "10–20 mK",
    body: "Helium, muons, dilution. Stays on the craton. A million qubits in LEO do not close Type I.",
    media: M.q,
  },
  {
    id: "interferometry",
    name: "Interferometry",
    layer: "Quantum",
    datum: "GW150914",
    body: "Spacetime as instrument. Does not raise K. Shows the lab still lives on a craton.",
    media: M.galaxy,
  },
];

export const DISCOVERIES: Discovery[] = [
  {
    year: "1957",
    title: "Sputnik 1",
    org: "OKB-1",
    layer: "Space",
    datum: "83 kg",
    body: "The kilogram left. Everything after is cadence. Type I as a sheet is still millions of flights.",
    media: M.launch,
  },
  {
    year: "1958",
    title: "Van Allen belts",
    org: "Explorer 1 / Iowa",
    layer: "Space",
    datum: "1–12 Mm",
    body: "Inner protons, outer electrons. SSO 550 km sits under the inner belt. SAA still hits.",
    media: M.sat,
  },
  {
    year: "1964",
    title: "Kardashev types",
    org: "Kardashev",
    layer: "Energy",
    datum: "4×10¹² W",
    body: "Original Type I was already exceeded. We do not use it. Sagan 1973 is this instrument.",
    media: M.galaxy,
  },
  {
    year: "1973",
    title: "Sagan K",
    org: "Sagan",
    layer: "Energy",
    datum: "10¹⁶ W",
    body: "K = (log₁₀ P − 6) / 10. Type I = 10,000 TW. The live number on the home.",
    media: M.sun,
  },
  {
    year: "1978",
    title: "Kessler syndrome",
    org: "Kessler / Cour-Palais",
    layer: "Space",
    datum: "a rate",
    body: "Collision frequency of artificial satellites. Not a date. A million-sat filing without deorbit is the experiment.",
    media: M.tracks,
  },
  {
    year: "2019",
    title: "Starlink v1",
    org: "SpaceX",
    layer: "Space",
    datum: "same rocket",
    body: "Thousands at ~550 km. Communications, not 120 kW radiators. The valve for Starmind. Not the payload.",
    media: M.pad,
  },
  {
    year: "1981",
    title: "ASTM AM0",
    org: "ASTM / NASA",
    layer: "Energy",
    datum: "E490",
    body: "Spectrum and constant outside the atmosphere. The panel’s first number.",
    media: M.am0,
  },
  {
    year: "1994",
    title: "Shor’s algorithm",
    org: "Shor / AT&T",
    layer: "Quantum",
    datum: "factor",
    body: "Why PQC is due now. Does not raise K. The channel has to survive inference leaving the crust.",
    media: M.q,
  },
  {
    year: "1998",
    title: "NPP map",
    org: "Field et al.",
    layer: "Biology",
    datum: "105 Pg C/yr",
    body: "Ocean ~half. Type I is not a harvest of this. ~130 TW of living budget.",
    media: M.bio,
  },
  {
    year: "2000",
    title: "NCRP Report 132",
    org: "NCRP",
    layer: "Health",
    datum: "1 Sv",
    body: "Career limit. A five-year sat at 0.5 mSv/day is already ~0.9 Sv. The body hits the wall first.",
    media: M.orbitmed,
  },
  {
    year: "2006",
    title: "Space radiation cancer risk",
    org: "Cucinotta / Durante",
    layer: "Health",
    datum: "GCR",
    body: "Lancet Oncol. The operator is not a five-year sat. Career sieverts, not a poster of a gym in LEO.",
    media: M.orbitmed,
  },
  {
    year: "2019",
    title: "Twins Study",
    org: "NASA / Science",
    layer: "Health",
    datum: "340 d",
    body: "One twin in ISS, one on Earth. Telomeres, fluids, genome. A year in LEO is already a clinical event.",
    media: M.brain,
  },
  {
    year: "2009",
    title: "Planetary boundaries",
    org: "Rockström / SRC",
    layer: "Biology",
    datum: "safe space",
    body: "Several already crossed. Watts off the crust, or no K to measure.",
    media: M.earth,
  },
  {
    year: "2015",
    title: "IAU L☉ + TSI",
    org: "IAU",
    layer: "Energy",
    datum: "1361 W/m²",
    body: "L☉ = 3.826×10²⁶ W. Sun is Sagan K ≈ 2.06, not 2.58.",
    media: M.sun,
  },
  {
    year: "2015",
    title: "Boundaries update",
    org: "Steffen et al.",
    layer: "Biology",
    datum: "Science",
    body: "Guiding human development on a changing planet. Climate, integrity, N still overshoot.",
    media: M.bio,
  },
  {
    year: "2016",
    title: "GW150914",
    org: "LIGO",
    layer: "Quantum",
    datum: "1.3×10⁹ ly",
    body: "Spacetime as instrument. Does not raise K. The isolation is terrestrial.",
    media: M.galaxy,
  },
  {
    year: "2020",
    title: "Scaling laws",
    org: "Kaplan et al.",
    layer: "AI",
    datum: "L(N,D,C)",
    body: "Loss is a power law in parameters, data, compute. Still a GW event. Still Earth.",
    media: M.dc,
  },
  {
    year: "2022",
    title: "NIF ignition",
    org: "LLNL",
    layer: "Energy",
    datum: "gain > 1",
    body: "Target gain on a pulse. Not a grid. Fusion on the crust is still Type 0 until it ships watts.",
    media: M.plasma,
  },
  {
    year: "2023",
    title: "IEA TES 620 EJ",
    org: "IEA",
    layer: "Energy",
    datum: "~20 TW",
    body: "1.8%/yr. The live K on the home is this series, not a grid meter.",
    media: M.night,
  },
  {
    year: "2024",
    title: "Datacentre 460 TWh",
    org: "IEA",
    layer: "AI",
    datum: "~50 GW",
    body: "Electricity 2024. All the racks. ASI is still ×486 away. Not more layers.",
    media: M.dc,
  },
  {
    year: "2024",
    title: "NIST PQC FIPS",
    org: "NIST",
    layer: "Quantum",
    datum: "203/204/205",
    body: "ML-KEM, ML-DSA, SLH-DSA. The channel, not the cryostat. Due now.",
    media: M.q,
  },
  {
    year: "2025",
    title: "H100 in orbit",
    org: "Starcloud",
    layer: "AI",
    datum: "pathfinder",
    body: "Hardware, not a slide. Lifetime and radiator still the gate.",
    media: M.sat,
  },
  {
    year: "2025",
    title: "Suncatcher",
    org: "Google / Planet",
    layer: "AI",
    datum: "TPU · SSO",
    body: "Dawn-dusk TPU paper + 2027 demo. Classical. Quantum AI stayed on Earth.",
    media: M.tracks,
  },
];

export const CENTERS: Center[] = [
  {
    name: "ITER",
    where: "Cadarache",
    layer: "Energy",
    datum: "tokamak",
    delivers: "Not a grid. The other Type I if it ever ships a watt.",
    media: M.plasma,
  },
  {
    name: "NIF / LLNL",
    where: "Livermore",
    layer: "Energy",
    datum: "ignition 2022",
    delivers: "Inertial fusion. Pulse, not TES.",
    media: M.plasma,
  },
  {
    name: "PPPL",
    where: "Princeton",
    layer: "Energy",
    datum: "NSTX-U",
    delivers: "Magnetic confinement on a craton. Theory + machine.",
    media: M.plasma,
  },
  {
    name: "IPP Garching",
    where: "Max Planck",
    layer: "Energy",
    datum: "W7-X",
    delivers: "ASDEX Upgrade, Wendelstein 7-X. Stellarator is not a sat.",
    media: M.plasma,
  },
  {
    name: "UKAEA Culham",
    where: "Oxfordshire",
    layer: "Energy",
    datum: "STEP",
    delivers: "JET heritage. Watts still on the island.",
    media: M.plasma,
  },
  {
    name: "NREL",
    where: "Golden, CO",
    layer: "Energy",
    datum: "PV",
    delivers: "Grid, AM0-adjacent metrology. Type 0 done well.",
    media: M.solar,
  },
  {
    name: "IEA",
    where: "Paris",
    layer: "Energy",
    datum: "620 EJ",
    delivers: "TES. The series this site runs. A model of the world, not a plant.",
    media: M.night,
  },
  {
    name: "IAU",
    where: "Paris",
    layer: "Energy",
    datum: "L☉",
    delivers: "TSI, the astronomical unit. The star’s watt is a committee number.",
    media: M.sun,
  },
  {
    name: "NASA GSFC / LASP",
    where: "Greenbelt / Boulder",
    layer: "Energy",
    datum: "TSIS",
    delivers: "SORCE, TSIS-1. Who actually watches AM0.",
    media: M.am0,
  },
  {
    name: "Epoch AI",
    where: "research org",
    layer: "AI",
    datum: "FLOP/s",
    delivers: "Compute trends. Who plots the rack against history. Not a partner.",
    media: M.dc,
  },
  {
    name: "IEA (electricity)",
    where: "Paris",
    layer: "AI",
    datum: "460 TWh",
    delivers: "Datacentre series. The honest GW number under every demo.",
    media: M.dc,
  },
  {
    name: "NVIDIA",
    where: "Santa Clara",
    layer: "AI",
    datum: "rad-lot",
    delivers: "The wafer before the sat. Space-1 / Rubin. Not a deal here.",
    media: M.terafab,
  },
  {
    name: "Google Research",
    where: "Mountain View",
    layer: "AI",
    datum: "Suncatcher",
    delivers: "TPU in dawn-dusk SSO. Paper + 2027 pathfinder. Classical.",
    media: M.tracks,
  },
  {
    name: "Starcloud",
    where: "Redmond",
    layer: "AI",
    datum: "H100 flew",
    delivers: "Pathfinder in orbit. Hardware, not a 1M filing.",
    media: M.sat,
  },
  {
    name: "IMEC",
    where: "Leuven",
    layer: "AI",
    datum: "process",
    delivers: "Leading-edge. The wafer before anyone’s sat.",
    media: M.terafab,
  },
  {
    name: "Stockholm Resilience",
    where: "Stockholm",
    layer: "Biology",
    datum: "boundaries",
    delivers: "The reason Type I cannot eat NPP.",
    media: M.earth,
  },
  {
    name: "PIK",
    where: "Potsdam",
    layer: "Biology",
    datum: "2.7 W/m²",
    delivers: "Climate, Earth system. Forcing is not a vibe.",
    media: M.night,
  },
  {
    name: "IIASA",
    where: "Laxenburg",
    layer: "Biology",
    datum: "HANPP",
    delivers: "Energy scenarios, HANPP, the long series.",
    media: M.bio,
  },
  {
    name: "NASA Ocean Color",
    where: "GSFC",
    layer: "Biology",
    datum: "MODIS / PACE",
    delivers: "Who actually maps phytoplankton. Ocean ~half of NPP.",
    media: M.ocean,
  },
  {
    name: "IPCC WG1",
    where: "Geneva",
    layer: "Biology",
    datum: "AR6",
    delivers: "The physical basis. Not a forecast of Type I.",
    media: M.earth,
  },
  {
    name: "WHO / UN PD",
    where: "Geneva / NY",
    layer: "Health",
    datum: "e0 / HALE",
    delivers: "The operator of K. Population, lifespan, healthy years.",
    media: M.salud,
  },
  {
    name: "NASA HRP",
    where: "JSC",
    layer: "Health",
    datum: "mSv / day",
    delivers: "Human Research Program. Dose, bone, fluid, isolation.",
    media: M.orbitmed,
  },
  {
    name: "NCRP",
    where: "Bethesda",
    layer: "Health",
    datum: "1 Sv",
    delivers: "Career limits. The number the fleet hits before the sat dies.",
    media: M.orbitmed,
  },
  {
    name: "ESA Space Medicine",
    where: "Cologne / ESTEC",
    layer: "Health",
    datum: "LEO",
    delivers: "European crew medical. Same sieverts, different flag.",
    media: M.salud,
  },
  {
    name: "NIRS / QST",
    where: "Chiba",
    layer: "Health",
    datum: "GCR analog",
    delivers: "Heavy-ion medicine. The beam that stands in for the belt.",
    media: M.brain,
  },
  {
    name: "JPL",
    where: "Pasadena",
    layer: "Space",
    datum: "thermal",
    delivers: "Deep space, rad-hard, buses that already leave.",
    media: M.sat,
  },
  {
    name: "ESA ESTEC",
    where: "Noordwijk",
    layer: "Space",
    datum: "TVAC",
    delivers: "Qualification, thermal vacuum, European payload.",
    media: M.radiator,
  },
  {
    name: "JAXA ISAS",
    where: "Sagamihara",
    layer: "Space",
    datum: "kg",
    delivers: "Science spacecraft. Hayabusa lineage. kg to somewhere.",
    media: M.launch,
  },
  {
    name: "USSPACECOM",
    where: "Colorado Springs",
    layer: "Space",
    datum: "~4×10⁴",
    delivers: "The catalog. Conjunction is a rate, not a press release.",
    media: M.tracks,
  },
  {
    name: "NASA Goddard",
    where: "Greenbelt",
    layer: "Space",
    datum: "SSO",
    delivers: "Science orbits, AM0 instruments, buses under the belt.",
    media: M.am0,
  },
  {
    name: "NIST",
    where: "Gaithersburg / Boulder",
    layer: "Quantum",
    datum: "SI / clocks",
    delivers: "Time, PQC, sensing that can fly.",
    media: M.q,
  },
  {
    name: "LIGO",
    where: "Hanford / Livingston",
    layer: "Quantum",
    datum: "strain",
    delivers: "Interferometry at terrestrial isolation. Not LEO.",
    media: M.galaxy,
  },
  {
    name: "QuTech",
    where: "Delft",
    layer: "Quantum",
    datum: "spin / transmon",
    delivers: "Network + experiment. Craton. Not a payload.",
    media: M.q,
  },
  {
    name: "IQC Waterloo",
    where: "Waterloo",
    layer: "Quantum",
    datum: "IQC",
    delivers: "Theory + experiment. PQC adjacent.",
    media: M.q,
  },
  {
    name: "CERN",
    where: "Geneva",
    layer: "Quantum",
    datum: "GW",
    delivers: "The grid already noticed. Big science is still Type 0 on Earth.",
    media: M.q,
  },
];

export const WORKS: Work[] = [
  {
    year: "1973",
    title: "The Cosmic Connection — Sagan K",
    venue: "book / Icarus lineage",
    org: "Sagan",
    layer: "Energy",
    datum: "10¹⁶ W",
    measures: "K = (log₁₀ P − 6) / 10. Type I = 10¹⁶ W. This instrument.",
    media: M.galaxy,
  },
  {
    year: "2011",
    title: "A new, lower value of total solar irradiance",
    venue: "Geophys. Res. Lett.",
    org: "Kopp & Lean",
    layer: "Energy",
    datum: "~1361",
    measures: "TSI reconstruction that the IAU 2015 number sits on.",
    media: M.am0,
  },
  {
    year: "2016",
    title: "Nominal values for selected solar and planetary quantities",
    venue: "AJ 152:41 / IAU 2015",
    org: "Prša et al.",
    layer: "Energy",
    datum: "L☉",
    measures: "L☉ = 3.826×10²⁶ W. TSI 1361 W/m². Sun is K ≈ 2.06.",
    media: M.sun,
  },
  {
    year: "2022",
    title: "Lawson criterion for ignition exceeded at NIF",
    venue: "Phys. Rev. Lett.",
    org: "Abu-Shawareb et al. / LLNL",
    layer: "Energy",
    datum: "gain > 1",
    measures: "A pulse. Not TES. Fusion still Type 0 until it ships a watt.",
    media: M.plasma,
  },
  {
    year: "2024",
    title: "World Energy Outlook / TES",
    venue: "IEA",
    org: "IEA",
    layer: "Energy",
    datum: "620 EJ",
    measures: "The 2023 TES this site runs. ~20 TW. 1.8%/yr inertia.",
    media: M.night,
  },
  {
    year: "2020",
    title: "Scaling Laws for Neural Language Models",
    venue: "arXiv:2001.08361",
    org: "Kaplan et al.",
    layer: "AI",
    datum: "L ∝ N^α",
    measures: "Parameters, data, compute. Still GW. Still Earth. Not K.",
    media: M.dc,
  },
  {
    year: "2021",
    title: "Carbon Emissions and Large Neural Network Training",
    venue: "arXiv:2104.10350",
    org: "Patterson et al.",
    layer: "AI",
    datum: "MWh",
    measures: "Training energy as a first-class number. The crust already feels the rack.",
    media: M.dc,
  },
  {
    year: "2024",
    title: "Electricity 2024 — datacentres",
    venue: "IEA",
    org: "IEA",
    layer: "AI",
    datum: "460 TWh",
    measures: "~50 GW of racks. Type I is 10,000 TW. Do the division.",
    media: M.dc,
  },
  {
    year: "2025",
    title: "Suncatcher — TPU satellites in dawn-dusk SSO",
    venue: "Google Research",
    org: "Google / Planet",
    layer: "AI",
    datum: "~81 sats",
    measures: "Classical compute. Optical ISL. Cost crossover if launch ~$200/kg. Quantum stayed home.",
    media: M.tracks,
  },
  {
    year: "1998",
    title: "Primary Production of the Biosphere",
    venue: "Science 281",
    org: "Field, Behrenfeld, Randerson, Falkowski",
    layer: "Biology",
    datum: "105 Pg C/yr",
    measures: "Ocean ~half. ~130 TW. Type I is ×77 this number.",
    media: M.bio,
  },
  {
    year: "2007",
    title: "Quantifying and mapping HANPP",
    venue: "PNAS",
    org: "Haberl et al.",
    layer: "Biology",
    datum: "~25%",
    measures: "We already take a quarter of NPP. The slider on this page is that paper.",
    media: M.earth,
  },
  {
    year: "2009",
    title: "A safe operating space for humanity",
    venue: "Nature 461",
    org: "Rockström et al.",
    layer: "Biology",
    datum: "boundaries",
    measures: "Why Type I cannot be a harvest of the Holocene.",
    media: M.earth,
  },
  {
    year: "2015",
    title: "Planetary boundaries: Guiding human development",
    venue: "Science 347",
    org: "Steffen et al.",
    layer: "Biology",
    datum: "update",
    measures: "Climate, integrity, N still overshoot. Same reason AM0 lives in orbit.",
    media: M.bio,
  },
  {
    year: "2021",
    title: "AR6 Climate Change — The Physical Science Basis",
    venue: "IPCC WG1",
    org: "IPCC",
    layer: "Biology",
    datum: "~2.7 W/m²",
    measures: "Forcing. A few W/m² already moves the Holocene.",
    media: M.night,
  },
  {
    year: "2006",
    title: "Cancer risk from exposure to galactic cosmic rays",
    venue: "Lancet Oncol.",
    org: "Cucinotta & Durante",
    layer: "Health",
    datum: "GCR",
    measures: "The body is the payload that dies first. Career sieverts.",
    media: M.orbitmed,
  },
  {
    year: "2011",
    title: "Physical basis of radiation protection in space travel",
    venue: "Rev. Mod. Phys. 83",
    org: "Durante & Cucinotta",
    layer: "Health",
    datum: "SPE / GCR",
    measures: "Why teleop, not a city in LEO. The sat lasts five years. The operator does not.",
    media: M.orbitmed,
  },
  {
    year: "2024",
    title: "World Population Prospects",
    venue: "UN DESA",
    org: "UN PD",
    layer: "Health",
    datum: "8.2×10⁹",
    measures: "The operator count. ×120 W < 1 TW of flesh.",
    media: M.salud,
  },
  {
    year: "2025",
    title: "World Health Statistics — e0 / HALE",
    venue: "WHO",
    org: "WHO",
    layer: "Health",
    datum: "73.4 / 63.7",
    measures: "Ten sick years. A century to Type I has to fit in a stretched HALE.",
    media: M.brain,
  },
  {
    year: "1978",
    title: "Collision frequency of artificial satellites",
    venue: "J. Geophys. Res.",
    org: "Kessler & Cour-Palais",
    layer: "Space",
    datum: "cascade",
    measures: "Kessler is a rate. Catalog ~4×10⁴ tracked. >1 cm ~10⁶.",
    media: M.tracks,
  },
  {
    year: "1958",
    title: "Radiation around the Earth by Explorer 1",
    venue: "Iowa / JGR lineage",
    org: "Van Allen",
    layer: "Space",
    datum: "belts",
    measures: "Inner protons, outer electrons. SSO sits under. SAA still hits.",
    media: M.sat,
  },
  {
    year: "2011",
    title: "IADC Space Debris Mitigation Guidelines",
    venue: "IADC",
    org: "IADC",
    layer: "Space",
    datum: "25 yr",
    measures: "Deorbit is architecture. A million-sat filing without it is debris.",
    media: M.tracks,
  },
  {
    year: "2013",
    title: "Astrodynamics — two-body, SSO, eclipse",
    venue: "Vallado / IAU μ",
    org: "Vallado / IAU",
    layer: "Space",
    datum: "μ⊕",
    measures: "The parks on this page. ISS 7.67 km/s. Dawn-dusk β.",
    media: M.am0,
  },
  {
    year: "1994",
    title: "Algorithms for quantum computation: discrete logarithms and factoring",
    venue: "FOCS",
    org: "Shor",
    layer: "Quantum",
    datum: "poly(log N)",
    measures: "Why the channel has to move before the cryostat does.",
    media: M.q,
  },
  {
    year: "2015",
    title: "Optical atomic clocks",
    venue: "Rev. Mod. Phys. 87",
    org: "Ludlow, Boyd, Ye, Peik, Schmidt",
    layer: "Quantum",
    datum: "10⁻¹⁸",
    measures: "Sensing that can fly. Time is the instrument.",
    media: M.q,
  },
  {
    year: "2016",
    title: "Observation of gravitational waves from a binary black hole merger",
    venue: "Phys. Rev. Lett. 116",
    org: "Abbott et al. / LIGO",
    layer: "Quantum",
    datum: "GW150914",
    measures: "Does not raise K. Proves the lab is still a craton.",
    media: M.galaxy,
  },
  {
    year: "2017",
    title: "Quantum sensing",
    venue: "Rev. Mod. Phys. 89",
    org: "Degen, Reinhard, Cappellaro",
    layer: "Quantum",
    datum: "NV",
    measures: "Magnetometry, radiation, timing. The modality that leaves Earth.",
    media: M.sat,
  },
  {
    year: "2024",
    title: "FIPS 203 ML-KEM / 204 ML-DSA / 205 SLH-DSA",
    venue: "NIST",
    org: "NIST",
    layer: "Quantum",
    datum: "now",
    measures: "PQC as infrastructure. Keys when inference leaves the crust.",
    media: M.tracks,
  },
];

export function fieldsFor(layer: Layer) {
  return FIELDS.filter((f) => f.layer === layer);
}
export function discoveriesFor(layer: Layer) {
  return DISCOVERIES.filter((d) => d.layer === layer);
}
export function centersFor(layer: Layer) {
  return CENTERS.filter((c) => c.layer === layer);
}
export function worksFor(layer: Layer) {
  return WORKS.filter((w) => w.layer === layer);
}

export function itemsFor(layer: Layer, facet: Facet): RecordItem[] {
  if (facet === "fields") {
    return fieldsFor(layer).map((f, n) => ({
      key: f.id,
      kicker: String(n + 1).padStart(2, "0"),
      title: f.name,
      body: f.body,
      datum: f.datum,
      media: f.media,
      sub: layer,
    }));
  }
  if (facet === "discoveries") {
    return discoveriesFor(layer).map((d) => ({
      key: `${d.year}-${d.title}`,
      kicker: d.year,
      title: d.title,
      body: d.body,
      datum: d.datum,
      media: d.media,
      sub: d.org,
    }));
  }
  if (facet === "centers") {
    return centersFor(layer).map((c) => ({
      key: c.name,
      kicker: c.where,
      title: c.name,
      body: c.delivers,
      datum: c.datum,
      media: c.media,
      sub: layer,
    }));
  }
  return worksFor(layer).map((w) => ({
    key: `${w.year}-${w.title}`,
    kicker: w.year,
    title: w.title,
    body: w.measures,
    datum: w.datum,
    media: w.media,
    sub: `${w.org} · ${w.venue}`,
  }));
}

export function layerStats(layer: Layer) {
  const fields = fieldsFor(layer);
  const discoveries = discoveriesFor(layer);
  const centers = centersFor(layer);
  const works = worksFor(layer);
  const years = [...discoveries, ...works].map((x) => Number(x.year)).filter((n) => Number.isFinite(n));
  const lo = years.length ? Math.min(...years) : 0;
  const hi = years.length ? Math.max(...years) : 0;
  return {
    fields: fields.length,
    discoveries: discoveries.length,
    centers: centers.length,
    works: works.length,
    span: years.length ? `${lo}–${hi}` : "—",
  };
}
