/**
 * GRID — federated bulkheads. M2 of docs/NEXT-MODULES.md.
 *
 * Thesis (docs/THESIS.md §2): Type I needs a federated, predictive, self-healing
 * grid — not one global synchronous mesh. This module is the bench that checks
 * whether that claim survives first-order numbers.
 *
 * Three separate physics, kept separate on purpose:
 *
 *   1. GEOGRAPHY / LATENCY — great circle, fiber group velocity, route factor.
 *      Latency is a hard floor: c/n, nothing beats it.
 *   2. ENERGY (hours) — hourly dispatch across 5 continental bulkheads.
 *      Latency is irrelevant here: 100 ms against a 3600 s step is 3e-5.
 *      What matters is capacity, storage, loss and the size of the intertie.
 *   3. CONTROL (seconds) — swing equation, UFLS, generator under-frequency trip.
 *      This is where architecture decides whether a shock is contained.
 *
 * [HONEST] A larger synchronous pool is *more* robust to a single contingency
 * (shared inertia lowers RoCoF). That is why interconnection exists. The case
 * for bulkheads is not "pooling is weak", it is:
 *   (a) an ocean-crossing tie must be HVDC — AC submarine cable dies at ~100 km
 *       on capacitive charging current — and HVDC is asynchronous by
 *       construction, so a global synchronous pool is physically excluded,
 *       not chosen;
 *   (b) a shared control plane shares common-mode faults at its own speed;
 *   (c) settling time of a loop closed over 80-160 ms is ~1-2 s, above the
 *       RoCoF arrest window. You cannot arbitrate a continental contingency
 *       from another continent.
 * compareArchitectures() reports both sides. Do not cherry-pick it.
 *
 * Existing bulkheads, for the record: ERCOT, Hydro-Quebec, and the Japanese
 * 50/60 Hz split are asynchronous ties in production today.
 *
 * Units: SI internally (W, J, m, s). Convert at the UI edge.
 */

import { ELECTRICITY_W } from "./facts.ts";
import { C } from "./constants.ts";

// ─────────────────────────────────────────────────────────── constants (real)

/** Vacuum light speed, SI definition. */
export const C_VACUUM = C;
/** SMF-28 group index at 1550 nm. v = c/n ≈ 2.042e8 m/s. */
export const FIBER_GROUP_INDEX = 1.4682;
export const V_FIBER = C_VACUUM / FIBER_GROUP_INDEX;
/**
 * Cable routes are not great circles (landings, trenches, Suez, backhaul).
 * Frankfurt-Singapore: 9.4e3 km great circle => 92 ms round trip in fiber,
 * measured RTT is ~150-160 ms. Ratio ~1.6. [ASSUMPTION] uniform.
 */
export const ROUTE_FACTOR = 1.6;
/** Aggregate regen/router/switch overhead, one direction. [ASSUMPTION] */
export const SWITCH_MS = 4;

/** AC submarine ceiling: capacitive charging current. Beyond this, HVDC. */
export const AC_SUBMARINE_LIMIT_KM = 100;
/** ±800 kV HVDC line loss, per 1000 km. */
export const HVDC_LOSS_PER_1000KM = 0.03;
/** Two converter stations, ~0.7% each. */
export const HVDC_CONVERTER_LOSS = 0.014;

/** Li-ion round trip. Split symmetrically into charge/discharge legs. */
export const STORAGE_ROUND_TRIP = 0.9;
export const STORAGE_ETA_LEG = Math.sqrt(STORAGE_ROUND_TRIP);
/** Energy/power ratio of the storage fleet, hours. C-rate 0.25. */
export const STORAGE_C_RATE_H = 4;

/**
 * Delay-limited loop crossover. A pure delay T costs phase ωT at frequency ω;
 * spending ~0.6 rad (34°) of a 45° margin on transport gives ω_c = 0.6/RTT.
 * Response time taken as 4τ (settling).
 */
export const PHASE_BUDGET_RAD = 0.6;
export const SETTLE_TAUS = 4;

/** Arrest window for RoCoF in a low-inertia system. */
export const ROCOF_ARREST_S = 0.5;
/** ENTSO-E FCR full activation. */
export const FCR_FULL_S = 30;
/** Economic dispatch / market clearing granularity. */
export const DISPATCH_S = 900;

/** Nominal frequency used as the reference system. NA runs 60 Hz. */
export const F_NOMINAL = 50;
/** ENTSO-E: generators stay connected down to 47.5 Hz. Below that they trip. */
export const F_GEN_TRIP = 47.5;
/** Typical continental UFLS ladder: ~5% of load per stage. */
export const UFLS_LADDER = [
  { hz: 49.0, shed: 0.05 },
  { hz: 48.7, shed: 0.05 },
  { hz: 48.4, shed: 0.05 },
  { hz: 48.1, shed: 0.05 },
  { hz: 47.8, shed: 0.05 },
] as const;
/** ENTSO-E CE reference incident: 3 GW on a ~400 GW system. */
export const FCR_FRACTION = 0.0075;
/** Inertia constant of the online synchronous fleet, seconds. 2-6 s is real. */
export const INERTIA_S = 4;

/** Mean of the clamped-sine day: (1/24)·∫₆¹⁸ sin(π(t−6)/12) dt = 1/π. */
export const SOLAR_CF = 1 / Math.PI;
/** Onshore/offshore blend. [KNOWN_LIMIT] constant — no wind lulls modeled. */
export const WIND_CF = 0.35;
/** Daily demand swing, ±22% about the mean. */
export const LOAD_SWING = 0.22;
/** Local hour of peak demand. */
export const LOAD_PEAK_HOUR = 19;

/** Breaker relay + protection decision time, on top of link latency. */
export const BREAKER_RELAY_S = 0.1;

// ─────────────────────────────────────────────────────────────── specification

export type RegionId = "NA" | "SA" | "EU" | "AF" | "AP";

export type RegionSpec = {
  id: RegionId;
  name: string;
  hub: string;
  lat: number;
  lon: number;
  /** Share of world electricity (facts.ts ELECTRICITY_W). Sums to 1. */
  loadShare: number;
  /** Energy shares of the region's own mean load. Sum > 1 = overbuild. */
  solarShare: number;
  windShare: number;
  firmShare: number;
  storageHours: number;
};

/**
 * Five continental bulkheads. Hubs are real cable landing / interconnect points.
 * loadShare is an order-of-magnitude world electricity split, normalized to 1.
 * Mixes are [ASSUMPTION], each anchored on one physical reason:
 * AF insolation, EU North Sea wind + latitude, SA hydro-dominated firm.
 */
export const REGIONS: readonly RegionSpec[] = [
  {
    id: "NA", name: "North America", hub: "Kansas", lat: 39.8, lon: -98.6,
    loadShare: 0.19, solarShare: 0.45, windShare: 0.35, firmShare: 0.35, storageHours: 4,
  },
  {
    id: "SA", name: "South America", hub: "Brasilia", lat: -15.8, lon: -47.9,
    loadShare: 0.08, solarShare: 0.35, windShare: 0.2, firmShare: 0.6, storageHours: 4,
  },
  {
    id: "EU", name: "Europe", hub: "Frankfurt", lat: 50.1, lon: 8.7,
    loadShare: 0.16, solarShare: 0.35, windShare: 0.45, firmShare: 0.35, storageHours: 4,
  },
  {
    id: "AF", name: "Africa + Middle East", hub: "Nairobi", lat: -1.3, lon: 36.8,
    loadShare: 0.11, solarShare: 0.75, windShare: 0.15, firmShare: 0.25, storageHours: 4,
  },
  {
    id: "AP", name: "Asia-Pacific", hub: "Singapore", lat: 1.35, lon: 103.8,
    loadShare: 0.46, solarShare: 0.55, windShare: 0.2, firmShare: 0.4, storageHours: 4,
  },
] as const;

export type LinkSpec = {
  id: string;
  a: RegionId;
  b: RegionId;
  /** Capacity as a fraction of the smaller endpoint's mean load. */
  capShare: number;
  /** Pole voltage. Loss fraction scales as 1/V². */
  voltageKv?: number;
};

/**
 * Sparse ring + one spur. Not a mesh: a mesh is what this module argues against.
 * [HYPOTHESIS] none of these ties exist. The longest HVDC link built or
 * contracted today is ~4,000 km (Australia-Asia PowerLink class).
 */
export const LINKS: readonly LinkSpec[] = [
  { id: "NA-EU", a: "NA", b: "EU", capShare: 0.08 },
  { id: "EU-AF", a: "EU", b: "AF", capShare: 0.08 },
  { id: "AF-AP", a: "AF", b: "AP", capShare: 0.08 },
  { id: "AP-NA", a: "AP", b: "NA", capShare: 0.08 },
  { id: "NA-SA", a: "NA", b: "SA", capShare: 0.08 },
  { id: "EU-SA", a: "EU", b: "SA", capShare: 0.08 },
] as const;

// ───────────────────────────────────────────────────────── geography / latency

export function greatCircleKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
) {
  const R = 6371;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** One-way, ms. Route factor + fiber group velocity + switching. */
export function linkLatencyMs(greatCircleKm_: number) {
  return ((greatCircleKm_ * ROUTE_FACTOR * 1000) / V_FIBER) * 1000 + SWITCH_MS;
}

/**
 * Fractional power loss, end to end.
 *
 * [CORRECTION] Earlier revisions treated this as a fixed percentage per 1000 km.
 * That is wrong. On a DC line at constant voltage the current is the same all
 * along the conductor, so
 *
 *     P_loss = I²R,  P = V·I   =>   loss fraction = I·R/V = P·R/V²
 *
 * The loss FRACTION is proportional to the power you push and to 1/V². A line
 * running at 15% of its rating loses 15% of its rated loss fraction. This is
 * why the ties looked decorative before: they were being charged rated losses
 * at a fraction of rated flow.
 *
 * Two consequences the model now gets right:
 *   - Overbuilding a cable makes it *more* efficient at a given flow.
 *   - Every line has a maximum deliverable power at 50% efficiency
 *     (classic maximum power transfer). Past it, extra current is pure heat.
 */
export const HVDC_REF_KV = 800;
/** ±1100 kV is built and running (Changji-Guquan, 3,300 km). */
export const HVDC_VOLTAGE_KV = 800;
/** Loading a long line is designed around, not a physical limit. */
export const HVDC_TARGET_LOSS = 0.1;

/** Loss fraction at a given loading (0-1) and pole voltage. */
export function hvdcLossAt(
  greatCircleKm_: number,
  loadingFrac: number,
  voltageKv = HVDC_VOLTAGE_KV,
) {
  const routed = greatCircleKm_ * ROUTE_FACTOR;
  const vScale = (HVDC_REF_KV / voltageKv) ** 2;
  const rated = (routed / 1000) * HVDC_LOSS_PER_1000KM * vScale + HVDC_CONVERTER_LOSS;
  return Math.min(0.99, Math.max(0, rated * Math.min(1, Math.max(0, loadingFrac))));
}

/** Loss if you ran the thing at its nameplate. Often absurd — that is the point. */
export function hvdcLoss(greatCircleKm_: number, voltageKv = HVDC_VOLTAGE_KV) {
  return hvdcLossAt(greatCircleKm_, 1, voltageKv);
}

/** Highest loading that still keeps the loss under `maxLoss`. */
export function maxLoadingForLoss(
  greatCircleKm_: number,
  maxLoss = HVDC_TARGET_LOSS,
  voltageKv = HVDC_VOLTAGE_KV,
) {
  const rated = hvdcLossAt(greatCircleKm_, 1, voltageKv);
  return rated <= 0 ? 1 : Math.min(1, maxLoss / rated);
}

export type ControlBudget = {
  latencyMs: number;
  rttMs: number;
  crossoverHz: number;
  tauS: number;
  settleS: number;
  rocofArrest: boolean;
  frequencyContainment: boolean;
  economicDispatch: boolean;
};

/** What a control loop closed over this link can and cannot do. */
export function controlBudget(latencyMs: number): ControlBudget {
  const rttS = (2 * latencyMs) / 1000;
  const crossoverRad = PHASE_BUDGET_RAD / rttS;
  const tauS = 1 / crossoverRad;
  const settleS = SETTLE_TAUS * tauS;
  return {
    latencyMs,
    rttMs: 2 * latencyMs,
    crossoverHz: crossoverRad / (2 * Math.PI),
    tauS,
    settleS,
    rocofArrest: settleS <= ROCOF_ARREST_S,
    frequencyContainment: settleS <= FCR_FULL_S,
    economicDispatch: settleS <= DISPATCH_S,
  };
}

// ────────────────────────────────────────────────────────────────── the model

export type Region = RegionSpec & {
  meanLoadW: number;
  solarPeakW: number;
  /** Delivered flat. Its energy share is windShare by construction. */
  windW: number;
  /** Nameplate behind that flat delivery, at WIND_CF. Reporting only. */
  windNameplateW: number;
  firmW: number;
  storageJ: number;
  storagePowerW: number;
};

export type Link = LinkSpec & {
  km: number;
  routedKm: number;
  latencyMs: number;
  voltageKv: number;
  /** Loss if run at nameplate. For a long line this is absurd, and that is data. */
  loss: number;
  /** delivered = sent·(1 − lossSlopePerW·sent). Everything below follows from it. */
  lossSlopePerW: number;
  /** Maximum power this line can ever deliver, at 50% efficiency. */
  maxDeliverableW: number;
  /** Loading, and delivered power, at HVDC_TARGET_LOSS. The design point. */
  economicLoadingFrac: number;
  economicDeliveredW: number;
  capacityW: number;
  mustBeHvdc: boolean;
  breakerS: number;
  control: ControlBudget;
};

export type GridModel = {
  regions: Region[];
  links: Link[];
  byId: Record<RegionId, Region>;
  totalMeanLoadW: number;
  /** False when any tie exceeds the AC submarine limit. It always is. */
  synchronousPossible: boolean;
};

export type GridOverrides = {
  regions?: Partial<Record<RegionId, Partial<RegionSpec>>>;
  links?: Record<string, Partial<LinkSpec>>;
  electricityW?: number;
};

export function buildGrid(o: GridOverrides = {}): GridModel {
  const totalW = o.electricityW ?? ELECTRICITY_W;
  const regions: Region[] = REGIONS.map((base) => {
    const s = { ...base, ...(o.regions?.[base.id] ?? {}) };
    const meanLoadW = totalW * s.loadShare;
    return {
      ...s,
      meanLoadW,
      solarPeakW: (meanLoadW * s.solarShare) / SOLAR_CF,
      windW: meanLoadW * s.windShare,
      windNameplateW: (meanLoadW * s.windShare) / WIND_CF,
      firmW: meanLoadW * s.firmShare,
      storageJ: meanLoadW * s.storageHours * 3600,
      storagePowerW: (meanLoadW * s.storageHours) / STORAGE_C_RATE_H,
    };
  });
  const byId = Object.fromEntries(regions.map((r) => [r.id, r])) as Record<RegionId, Region>;
  const links: Link[] = LINKS.map((base) => {
    const s = { ...base, ...(o.links?.[base.id] ?? {}) };
    const km = greatCircleKm(byId[s.a], byId[s.b]);
    const latencyMs = linkLatencyMs(km);
    const voltageKv = s.voltageKv ?? HVDC_VOLTAGE_KV;
    const capacityW = Math.min(byId[s.a].meanLoadW, byId[s.b].meanLoadW) * s.capShare;
    const ratedLoss = hvdcLossAt(km, 1, voltageKv);
    const lossSlopePerW = capacityW > 0 ? ratedLoss / capacityW : 0;
    const economicLoadingFrac = maxLoadingForLoss(km, HVDC_TARGET_LOSS, voltageKv);
    const economicSentW = capacityW * economicLoadingFrac;
    return {
      ...s,
      km,
      routedKm: km * ROUTE_FACTOR,
      latencyMs,
      voltageKv,
      loss: ratedLoss,
      lossSlopePerW,
      maxDeliverableW: lossSlopePerW > 0 ? 1 / (4 * lossSlopePerW) : capacityW,
      economicLoadingFrac,
      economicDeliveredW: economicSentW * (1 - hvdcLossAt(km, economicLoadingFrac, voltageKv)),
      capacityW,
      mustBeHvdc: km * ROUTE_FACTOR > AC_SUBMARINE_LIMIT_KM,
      breakerS: latencyMs / 1000 + BREAKER_RELAY_S,
      control: controlBudget(latencyMs),
    };
  });
  return {
    regions,
    links,
    byId,
    totalMeanLoadW: regions.reduce((s, r) => s + r.meanLoadW, 0),
    synchronousPossible: links.every((l) => !l.mustBeHvdc),
  };
}

// ──────────────────────────────────────────────────────────────────── diurnal

export function localHour(hourUtc: number, lon: number) {
  return (((hourUtc + lon / 15) % 24) + 24) % 24;
}

/** Clamped sine day, 06:00-18:00 local. [ASSUMPTION] equinox, no clouds. */
export function solarFactor(hourUtc: number, lon: number) {
  const h = localHour(hourUtc, lon);
  if (h <= 6 || h >= 18) return 0;
  return Math.sin((Math.PI * (h - 6)) / 12);
}

/** Mean exactly 1 over 24 h. Peak at LOAD_PEAK_HOUR local. */
export function loadFactor(hourUtc: number, lon: number) {
  const h = localHour(hourUtc, lon);
  return 1 + LOAD_SWING * Math.cos((2 * Math.PI * (h - LOAD_PEAK_HOUR)) / 24);
}

// ─────────────────────────────────────────────────────────── hourly dispatch

export type RegionStep = {
  id: RegionId;
  alive: boolean;
  loadW: number;
  solarW: number;
  windW: number;
  firmW: number;
  /** > 0 discharging to the bus, < 0 charging from the bus. */
  storageW: number;
  socFrac: number;
  importW: number;
  exportW: number;
  unservedW: number;
  curtailedW: number;
};

export type Flow = {
  linkId: string;
  from: RegionId;
  to: RegionId;
  sentW: number;
  deliveredW: number;
  /** Actual loss at this flow, not the nameplate figure. */
  lossFrac: number;
  loadingFrac: number;
};

export type StepResult = {
  hourUtc: number;
  regions: Record<RegionId, RegionStep>;
  flows: Flow[];
  loadW: number;
  unservedW: number;
  curtailedW: number;
  tradedW: number;
};

export type TradeContext = {
  grid: GridModel;
  surplus: Record<RegionId, number>;
  deficit: Record<RegionId, number>;
  openLinks: Link[];
};

export type Allocator = (ctx: TradeContext) => Flow[];

/**
 * Greedy: cheapest link first, surplus only, no wheeling through a third
 * region. [KNOWN_LIMIT] no transit routing; a true transportation LP would do
 * marginally better. A QUBO-class block allocator drops in behind this seam.
 */
export const greedyAllocator: Allocator = ({ surplus, deficit, openLinks }) => {
  const flows: Flow[] = [];
  // Rank by the loss a link would incur at its own economic loading, so a long
  // cheap-to-run line is not punished for a nameplate it will never see.
  for (const l of [...openLinks].sort(
    (x, y) => x.lossSlopePerW * x.capacityW - y.lossSlopePerW * y.capacityW,
  )) {
    let from: RegionId;
    let to: RegionId;
    if (surplus[l.a] > 0 && deficit[l.b] > 0) {
      from = l.a;
      to = l.b;
    } else if (surplus[l.b] > 0 && deficit[l.a] > 0) {
      from = l.b;
      to = l.a;
    } else continue;

    const m = l.lossSlopePerW;
    // delivered(sent) = sent·(1 − m·sent). Peaks at sent = 1/(2m).
    const peakSentW = m > 0 ? 1 / (2 * m) : Infinity;
    const want = deficit[to];
    // Invert the parabola: m·sent² − sent + want = 0.
    const disc = m > 0 ? 1 - 4 * m * want : 1;
    const sentForWant = m > 0 ? (disc > 0 ? (1 - Math.sqrt(disc)) / (2 * m) : peakSentW) : want;
    const sentW = Math.min(surplus[from], l.capacityW, peakSentW, sentForWant);
    if (sentW <= 0) continue;

    const loadingFrac = l.capacityW > 0 ? sentW / l.capacityW : 0;
    const lossFrac = m * sentW;
    const deliveredW = sentW * (1 - lossFrac);
    surplus[from] -= sentW;
    deficit[to] = Math.max(0, deficit[to] - deliveredW);
    flows.push({ linkId: l.id, from, to, sentW, deliveredW, lossFrac, loadingFrac });
  }
  return flows;
};

export type StepOptions = {
  soc: Record<RegionId, number>;
  dead?: Set<RegionId>;
  allocator?: Allocator;
  dtS?: number;
  /** Season + weather. Omit for the permanent-equinox, clear-sky baseline. */
  env?: Env | null;
};

/**
 * One hour. Local-first ladder: own generation, own storage, then imported
 * surplus, then shed. Import is never dispatched before local storage — that is
 * the bulkhead rule, and it is why importW stays small.
 */
export function step(grid: GridModel, hourUtc: number, opt: StepOptions): StepResult {
  const dtS = opt.dtS ?? 3600;
  const dead = opt.dead ?? new Set<RegionId>();
  const allocate = opt.allocator ?? greedyAllocator;

  const rs = {} as Record<RegionId, RegionStep>;
  const surplus = {} as Record<RegionId, number>;
  const deficit = {} as Record<RegionId, number>;

  for (const r of grid.regions) {
    const alive = !dead.has(r.id);
    const env = opt.env;
    const season = env ? loadSeasonFactor(r.lat, env.dayOfYear, env.heatElectrification ?? 0) : 1;
    const demandW = r.meanLoadW * loadFactor(hourUtc, r.lon) * season;
    const loadW = alive ? demandW : 0;
      const wx = env?.weather?.[r.id];
    const solarShape = env
      ? solarFactorGeo(hourUtc, r.lat, r.lon, env.dayOfYear)
      : solarFactor(hourUtc, r.lon);
    const windSeason = env ? windSeasonFactor(r.lat, env.dayOfYear) : 1;
    const solarW = alive ? r.solarPeakW * solarShape * (wx?.solar ?? 1) : 0;
    const windW = alive ? r.windW * windSeason * (wx?.wind ?? 1) : 0;
    const variable = solarW + windW;
    const firmW = alive ? Math.min(r.firmW, Math.max(0, loadW - variable)) : 0;
    let net = variable + firmW - loadW;

    let storageW = 0;
    if (alive && net > 0) {
      const headroomW = (r.storageJ - opt.soc[r.id]) / dtS / STORAGE_ETA_LEG;
      const chargeW = Math.max(0, Math.min(net, r.storagePowerW, headroomW));
      // Clamp: the tank is a physical bound, not a float accumulator.
      opt.soc[r.id] = Math.min(r.storageJ, opt.soc[r.id] + chargeW * STORAGE_ETA_LEG * dtS);
      storageW = -chargeW;
      net -= chargeW;
    } else if (alive && net < 0) {
      const availW = (opt.soc[r.id] / dtS) * STORAGE_ETA_LEG;
      const dischargeW = Math.max(0, Math.min(-net, r.storagePowerW, availW));
      opt.soc[r.id] = Math.max(0, opt.soc[r.id] - (dischargeW / STORAGE_ETA_LEG) * dtS);
      storageW = dischargeW;
      net += dischargeW;
    }

    surplus[r.id] = alive ? Math.max(0, net) : 0;
    deficit[r.id] = alive ? Math.max(0, -net) : 0;

    rs[r.id] = {
      id: r.id,
      alive,
      // A dead cluster is dark: demand still exists, none of it is served.
      loadW: demandW,
      solarW,
      windW,
      firmW,
      storageW,
      socFrac: opt.soc[r.id] / r.storageJ,
      importW: 0,
      exportW: 0,
      unservedW: alive ? 0 : demandW,
      curtailedW: 0,
    };
  }

  const openLinks = grid.links.filter((l) => !dead.has(l.a) && !dead.has(l.b));
  const flows = allocate({ grid, surplus, deficit, openLinks });
  for (const f of flows) {
    rs[f.from].exportW += f.sentW;
    rs[f.to].importW += f.deliveredW;
  }

  let loadW = 0;
  let unservedW = 0;
  let curtailedW = 0;
  let tradedW = 0;
  for (const r of grid.regions) {
    const s = rs[r.id];
    if (s.alive) {
      s.unservedW = deficit[r.id];
      s.curtailedW = surplus[r.id];
    }
    loadW += s.loadW;
    unservedW += s.unservedW;
    curtailedW += s.curtailedW;
  }
  for (const f of flows) tradedW += f.deliveredW;

  return { hourUtc, regions: rs, flows, loadW, unservedW, curtailedW, tradedW };
}

// ────────────────────────────────────────────────────────────────── simulate

export type Kill = { regionId: RegionId; atHour: number };

export type RegionTotals = {
  id: RegionId;
  loadJ: number;
  unservedJ: number;
  curtailedJ: number;
  importJ: number;
  exportJ: number;
  unservedFrac: number;
  /** Worst instantaneous import / load. The bulkhead invariant lives here. */
  peakImportFrac: number;
};

export type SimResult = {
  grid: GridModel;
  steps: StepResult[];
  perRegion: Record<RegionId, RegionTotals>;
  loadJ: number;
  unservedJ: number;
  curtailedJ: number;
  unservedFrac: number;
  /** Unserved excluding the killed cluster. This is the containment metric. */
  survivorUnservedFrac: number;
};

export type SimOptions = {
  grid?: GridModel;
  hours?: number;
  startHourUtc?: number;
  socStart?: number;
  kill?: Kill | null;
  allocator?: Allocator;
  /** Turn on real solar geometry and seasonal wind. Default off = M2d baseline. */
  weather?: boolean;
  /** Day of year at hour 0. Only meaningful with weather on. */
  startDay?: number;
  dunkelflaute?: Dunkelflaute | null;
  /** 0 = today's demand shape, 1 = heat fully electrified. Needs weather on. */
  heatElectrification?: number;
};

export function simulate(o: SimOptions = {}): SimResult {
  const grid = o.grid ?? buildGrid();
  const hours = o.hours ?? 48;
  const start = o.startHourUtc ?? 0;
  const socStart = o.socStart ?? 0.5;

  const soc = Object.fromEntries(
    grid.regions.map((r) => [r.id, r.storageJ * socStart]),
  ) as Record<RegionId, number>;
  const dead = new Set<RegionId>();

  const steps: StepResult[] = [];
  const per = Object.fromEntries(
    grid.regions.map((r) => [
      r.id,
      {
        id: r.id,
        loadJ: 0,
        unservedJ: 0,
        curtailedJ: 0,
        importJ: 0,
        exportJ: 0,
        unservedFrac: 0,
        peakImportFrac: 0,
      },
    ]),
  ) as Record<RegionId, RegionTotals>;

  for (let h = 0; h < hours; h++) {
    if (o.kill && h === o.kill.atHour) dead.add(o.kill.regionId);
    const env = o.weather || o.dunkelflaute
      ? envAt(h, {
          startDay: o.startDay,
          dunkelflaute: o.dunkelflaute,
          heatElectrification: o.heatElectrification,
        })
      : null;
    const s = step(grid, start + h, { soc, dead, allocator: o.allocator, env });
    steps.push(s);
    for (const r of grid.regions) {
      const rr = s.regions[r.id];
      const t = per[r.id];
      t.loadJ += rr.loadW * 3600;
      t.unservedJ += rr.unservedW * 3600;
      t.curtailedJ += rr.curtailedW * 3600;
      t.importJ += rr.importW * 3600;
      t.exportJ += rr.exportW * 3600;
      if (rr.loadW > 0) t.peakImportFrac = Math.max(t.peakImportFrac, rr.importW / rr.loadW);
    }
  }
  for (const t of Object.values(per)) t.unservedFrac = t.loadJ > 0 ? t.unservedJ / t.loadJ : 0;

  const totals = Object.values(per);
  const loadJ = totals.reduce((s, t) => s + t.loadJ, 0);
  const unservedJ = totals.reduce((s, t) => s + t.unservedJ, 0);
  const curtailedJ = totals.reduce((s, t) => s + t.curtailedJ, 0);
  const killed = o.kill?.regionId;
  const survivors = totals.filter((t) => t.id !== killed);
  const survLoadJ = survivors.reduce((s, t) => s + t.loadJ, 0);
  const survUnsJ = survivors.reduce((s, t) => s + t.unservedJ, 0);

  return {
    grid,
    steps,
    perRegion: per,
    loadJ,
    unservedJ,
    curtailedJ,
    unservedFrac: loadJ > 0 ? unservedJ / loadJ : 0,
    survivorUnservedFrac: survLoadJ > 0 ? survUnsJ / survLoadJ : 0,
  };
}

// ──────────────────────────────────────────────── islanding / storage sizing

/** No trade at all. Every bulkhead alone. This is the sizing condition. */
export const noTradeAllocator: Allocator = () => [];

/**
 * A bulkhead is only a bulkhead if it survives islanded. Run the cluster with
 * every tie open and report what fraction of its own demand it fails to serve.
 */
export function islandUnservedFrac(
  regionId: RegionId,
  storageHours: number,
  o: { hours?: number; socStart?: number } = {},
) {
  const grid = buildGrid({ regions: { [regionId]: { storageHours } } });
  const s = simulate({
    grid,
    hours: o.hours ?? 72,
    socStart: o.socStart ?? 0.5,
    allocator: noTradeAllocator,
  });
  return s.perRegion[regionId].unservedFrac;
}

/**
 * Minimum storage, in hours of mean load, for a cluster to ride its own night
 * with zero import. Bisection — the sim is monotone in storage. Returns
 * Infinity when the energy budget itself is short (not a storage problem).
 */
export function sizeIslandStorageHours(
  regionId: RegionId,
  target = 0.01,
  maxHours = 48,
) {
  if (islandUnservedFrac(regionId, maxHours) > target) return Infinity;
  let lo = 0;
  let hi = maxHours;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (islandUnservedFrac(regionId, mid) > target) lo = mid;
    else hi = mid;
  }
  return hi;
}

/** Grid whose storage is sized so every bulkhead is islanding-capable. */
export function sizedGrid(target = 0.01): GridModel {
  const regions = Object.fromEntries(
    REGIONS.map((r) => [r.id, { storageHours: sizeIslandStorageHours(r.id, target) }]),
  ) as Partial<Record<RegionId, Partial<RegionSpec>>>;
  return buildGrid({ regions });
}

// ───────────────────────────────────────────────────── contingency (seconds)

/**
 * Swing equation on the aggregated online fleet:
 *   df/dt = f0 · (P_gen − P_load) / (2 · H · S_online)
 * plus a linear FCR ramp to full in FCR_FULL_S, a UFLS ladder, and generator
 * under-frequency trip at F_GEN_TRIP.
 *
 * [KNOWN_LIMIT] single-machine equivalent. No inter-area modes, no voltage,
 * no governor droop dynamics, no protection coordination. It answers one
 * question only: does the imbalance stay inside its own bulkhead.
 */
export type Shock =
  /** A block of one cluster's generation trips. The classic contingency. */
  | { kind: "generation"; regionId: RegionId; fraction: number }
  /** The whole cluster goes dark — its load AND its generation leave. */
  | { kind: "region"; regionId: RegionId }
  /** Cable cut. Both ends feel the flow that was on it, opposite signs. */
  | { kind: "link"; linkId: string }
  /**
   * Same fraction of generation trips everywhere at once: a firmware fault, a
   * shared inverter grid-code bug, a compromised control plane.
   * [RESULT] In the frequency domain this is architecture-neutral — a
   * proportional loss gives the same RoCoF whatever the pool size. The
   * federation argument here is blast radius of the control plane, not
   * inertia. See controlPlaneBlastRadius().
   */
  | { kind: "commonMode"; fraction: number };

export type IslandResult = {
  id: RegionId;
  /** Imbalance at t=0, W. Negative = deficit. */
  imbalanceW: number;
  onlineW: number;
  rocofHzS: number;
  minHz: number;
  shedFrac: number;
  collapsed: boolean;
};

export type ContingencyOptions = {
  grid?: GridModel;
  hourUtc?: number;
  inertiaS?: number;
  dtS?: number;
  horizonS?: number;
  /** Pre-shock hourly state, so flows are the ones actually on the links. */
  soc?: Record<RegionId, number>;
};

export type ContingencyResult = {
  mode: "federated" | "pooled";
  islands: IslandResult[];
  collapsed: RegionId[];
  /** Load lost to shedding + collapse, as a fraction of total demand. */
  lostLoadFrac: number;
  worstRocofHzS: number;
  minHz: number;
};

function swing(
  loadW: number,
  onlineW: number,
  imbalanceW: number,
  inertiaS: number,
  dtS: number,
  horizonS: number,
) {
  const fcrW = loadW * FCR_FRACTION;
  let f = F_NOMINAL;
  let shedFrac = 0;
  let stage = 0;
  let collapsed = false;
  let minHz = F_NOMINAL;
  let rocof0 = 0;
  const inertiaJ = 2 * inertiaS * onlineW; // 2·H·S, joules per Hz/Hz
  for (let t = 0; t < horizonS; t += dtS) {
    const reserveW = Math.min(fcrW, (fcrW * t) / FCR_FULL_S);
    const shedW = loadW * shedFrac;
    const net = imbalanceW + reserveW + shedW;
    const df = inertiaJ > 0 ? (F_NOMINAL * net) / inertiaJ : 0;
    if (t === 0) rocof0 = df;
    f += df * dtS;
    minHz = Math.min(minHz, f);
    while (stage < UFLS_LADDER.length && f <= UFLS_LADDER[stage].hz) {
      shedFrac += UFLS_LADDER[stage].shed;
      stage++;
    }
    if (f <= F_GEN_TRIP) {
      collapsed = true;
      break;
    }
    if (f >= F_NOMINAL) break;
  }
  return { rocofHzS: rocof0, minHz, shedFrac, collapsed };
}

/** Pre-shock hourly snapshot, used to know what was flowing on each link. */
function snapshot(grid: GridModel, hourUtc: number, soc?: Record<RegionId, number>) {
  const s0 =
    soc ??
    (Object.fromEntries(grid.regions.map((r) => [r.id, r.storageJ * 0.5])) as Record<RegionId, number>);
  return step(grid, hourUtc, { soc: { ...s0 } });
}

/**
 * Power actually injected to serve native load. NOT solar+wind+firm: a cluster
 * in the middle of its solar day is curtailing, and tripping generation that
 * was already turned down costs the frequency nothing. It is also the
 * single-machine proxy for online rated capacity, so H·S uses the same number.
 */
const servingOf = (s: RegionStep) => Math.max(0, s.loadW - s.unservedW);

/**
 * Imbalance felt by each surviving cluster at t=0, in W. Negative = deficit.
 * A cluster that goes dark takes its own load with it, so the rest only feel
 * the flow they lost — which is capped by capShare. That cap is the bulkhead.
 */
function imbalanceOf(grid: GridModel, snap: StepResult, shock: Shock) {
  const out = Object.fromEntries(grid.regions.map((r) => [r.id, 0])) as Record<RegionId, number>;
  if (shock.kind === "generation") {
    out[shock.regionId] = -servingOf(snap.regions[shock.regionId]) * shock.fraction;
  } else if (shock.kind === "commonMode") {
    for (const r of grid.regions) out[r.id] = -servingOf(snap.regions[r.id]) * shock.fraction;
  } else if (shock.kind === "region") {
    for (const f of snap.flows) {
      if (f.from === shock.regionId) out[f.to] -= f.deliveredW;
      if (f.to === shock.regionId) out[f.from] += f.sentW;
    }
  } else {
    const f = snap.flows.find((x) => x.linkId === shock.linkId);
    if (f) {
      out[f.to] -= f.deliveredW;
      out[f.from] += f.sentW;
    }
  }
  return out;
}

const darkRegion = (shock: Shock) => (shock.kind === "region" ? shock.regionId : null);

/**
 * FEDERATED: each bulkhead rides its own inertia. HVDC ties carry power, not
 * frequency, so a neighbour only feels the flow it lost — capped by capShare.
 */
export function contingencyFederated(shock: Shock, o: ContingencyOptions = {}): ContingencyResult {
  const grid = o.grid ?? buildGrid();
  const hourUtc = o.hourUtc ?? 12;
  const inertiaS = o.inertiaS ?? INERTIA_S;
  const dtS = o.dtS ?? 0.02;
  const horizonS = o.horizonS ?? 60;
  const snap = snapshot(grid, hourUtc, o.soc);
  const imb = imbalanceOf(grid, snap, shock);
  const dark = darkRegion(shock);

  const islands: IslandResult[] = grid.regions.map((r) => {
    const s = snap.regions[r.id];
    const onlineW = servingOf(s);
    if (r.id === dark) {
      return {
        id: r.id, imbalanceW: -s.loadW, onlineW,
        rocofHzS: 0, minHz: 0, shedFrac: 1, collapsed: true,
      };
    }
    if (Math.abs(imb[r.id]) < 1 || onlineW <= 0) {
      return {
        id: r.id, imbalanceW: imb[r.id], onlineW,
        rocofHzS: 0, minHz: F_NOMINAL, shedFrac: 0, collapsed: false,
      };
    }
    return { id: r.id, imbalanceW: imb[r.id], onlineW, ...swing(s.loadW, onlineW, imb[r.id], inertiaS, dtS, horizonS) };
  });

  return summarize("federated", grid, snap, islands);
}

/**
 * POOLED: the counterfactual. One synchronous machine, shared inertia, shared
 * fault. [PHYSICALLY EXCLUDED at this scale — see mustBeHvdc — kept as the
 * control case, because it is what "one global grid" would mean.]
 */
export function contingencyPooled(shock: Shock, o: ContingencyOptions = {}): ContingencyResult {
  const grid = o.grid ?? buildGrid();
  const hourUtc = o.hourUtc ?? 12;
  const inertiaS = o.inertiaS ?? INERTIA_S;
  const dtS = o.dtS ?? 0.02;
  const horizonS = o.horizonS ?? 60;
  const snap = snapshot(grid, hourUtc, o.soc);
  const imb = imbalanceOf(grid, snap, shock);
  const dark = darkRegion(shock);
  const inPool = grid.regions.filter((r) => r.id !== dark);

  // A dark cluster leaves the pool with its load and its generation together,
  // so the pool only carries what that cluster was exporting.
  const poolImbalanceW = inPool.reduce((s, r) => s + imb[r.id], 0);
  const poolLoadW = inPool.reduce((s, r) => s + snap.regions[r.id].loadW, 0);
  const poolOnlineW = inPool.reduce((s, r) => s + servingOf(snap.regions[r.id]), 0);
  const w = swing(poolLoadW, poolOnlineW, poolImbalanceW, inertiaS, dtS, horizonS);

  const islands: IslandResult[] = grid.regions.map((r) => {
    const x = snap.regions[r.id];
    if (r.id === dark) {
      return {
        id: r.id, imbalanceW: -x.loadW, onlineW: servingOf(x),
        rocofHzS: 0, minHz: 0, shedFrac: 1, collapsed: true,
      };
    }
    return { id: r.id, imbalanceW: imb[r.id], onlineW: servingOf(x), ...w };
  });
  return summarize("pooled", grid, snap, islands);
}

function summarize(
  mode: "federated" | "pooled",
  grid: GridModel,
  snap: StepResult,
  islands: IslandResult[],
): ContingencyResult {
  const totalLoadW = grid.regions.reduce((s, r) => s + snap.regions[r.id].loadW, 0);
  const lostW = islands.reduce(
    (s, i) => s + snap.regions[i.id].loadW * (i.collapsed ? 1 : i.shedFrac),
    0,
  );
  const live = islands.filter((i) => !i.collapsed || i.rocofHzS !== 0);
  return {
    mode,
    islands,
    collapsed: islands.filter((i) => i.collapsed).map((i) => i.id),
    lostLoadFrac: totalLoadW > 0 ? lostW / totalLoadW : 0,
    worstRocofHzS: live.length ? Math.min(...live.map((i) => i.rocofHzS)) : 0,
    minHz: Math.min(...islands.filter((i) => i.minHz > 0).map((i) => i.minHz), F_NOMINAL),
  };
}

/**
 * Fraction of world load reachable from ONE compromised control plane.
 * Pooled: everything. Federated: the largest single bulkhead. This is the
 * whole security argument, and it needs no swing equation.
 */
export function controlPlaneBlastRadius(mode: "federated" | "pooled", grid = buildGrid()) {
  if (mode === "pooled") return 1;
  return Math.max(...grid.regions.map((r) => r.meanLoadW)) / grid.totalMeanLoadW;
}

export type ArchitectureComparison = {
  federated: ContingencyResult;
  pooled: ContingencyResult;
  /** True when the pool would have contained the shock better. It often does. */
  poolingWinsOnThisShock: boolean;
  /** Ratio of load lost. > 1 means federation lost more on this single event. */
  lostLoadRatio: number;
  /** The link-level fact that decides the architecture regardless of the above. */
  synchronousPossible: boolean;
  longestLinkKm: number;
  worstLatencyMs: number;
  worstSettleS: number;
  blastRadiusFederated: number;
  blastRadiusPooled: number;
};

/**
 * Both sides, no cherry-picking. Read it as: pooling usually wins the single
 * random contingency (shared inertia), federation wins the correlated one and
 * is the only option that physically exists across an ocean.
 */
export function compareArchitectures(shock: Shock, o: ContingencyOptions = {}): ArchitectureComparison {
  const grid = o.grid ?? buildGrid();
  const federated = contingencyFederated(shock, { ...o, grid });
  const pooled = contingencyPooled(shock, { ...o, grid });
  const worst = grid.links.reduce((a, b) => (a.latencyMs > b.latencyMs ? a : b));
  return {
    federated,
    pooled,
    poolingWinsOnThisShock: pooled.lostLoadFrac < federated.lostLoadFrac,
    lostLoadRatio: pooled.lostLoadFrac > 0 ? federated.lostLoadFrac / pooled.lostLoadFrac : Infinity,
    synchronousPossible: grid.synchronousPossible,
    longestLinkKm: worst.km,
    worstLatencyMs: worst.latencyMs,
    worstSettleS: worst.control.settleS,
    blastRadiusFederated: controlPlaneBlastRadius("federated", grid),
    blastRadiusPooled: controlPlaneBlastRadius("pooled", grid),
  };
}

// ────────────────────────────────────────────────────────── headline for the UI

/**
 * The four numbers the route puts in its DataStrip, plus the context each one
 * needs to be read honestly. Lives here so no component ever computes physics.
 * One call, one sizedGrid, two sims — memoize it, do not call it per render.
 */
export type GridHeadline = {
  /** Worst one-way link, and what a loop closed over it can actually do. */
  worstLatencyMs: number;
  worstRttMs: number;
  worstSettleS: number;
  arrestWindowS: number;
  arrestPossible: boolean;
  /** Worst instantaneous import, any cluster, over the whole window. */
  peakImportFrac: number;
  /**
   * Kill containment, measured like for like by killContainment(). Both
   * fractions are over the SAME four surviving clusters — never subtract
   * SimResult.unservedFrac from SimResult.survivorUnservedFrac to get this.
   */
  baselineUnservedFrac: number;
  survivorUnservedFrac: number;
  killDeltaPp: number;
  /** True when the killed cluster had no counterparty: the delta proves nothing. */
  killVacuous: boolean;
  killedRegion: RegionId;
  killedUnservedFrac: number;
  /**
   * The non-tautological version: kill the net exporter on the undersized
   * (4 h) grid, where clusters actually lean on the ties.
   */
  exporterKillRegion: RegionId;
  exporterKillDeltaPp: number;
  exporterBaselineUnservedFrac: number;
  /** Why a global synchronous pool is not on the menu. */
  synchronousPossible: boolean;
  acLimitKm: number;
  shortestLinkKm: number;
  longestLinkKm: number;
  worstLossFrac: number;
  worstLossLinkId: string;
  /** One compromised control plane, two architectures. */
  blastRadiusFederated: number;
  blastRadiusPooled: number;
  /** Storage each cluster needs to ride its own night with zero import. */
  islandStorageHours: Record<RegionId, number>;
};

export function gridHeadline(
  o: { killRegionId?: RegionId; hours?: number; target?: number } = {},
): GridHeadline {
  const target = o.target ?? 0.01;
  const hours = o.hours ?? 72;
  const killRegionId = o.killRegionId ?? "AP";
  const grid = sizedGrid(target);

  const base = simulate({ grid, hours });
  const killed = simulate({ grid, hours, kill: { regionId: killRegionId, atHour: Math.floor(hours / 3) } });

  const slowest = grid.links.reduce((a, b) => (a.latencyMs > b.latencyMs ? a : b));
  const lossiest = grid.links.reduce((a, b) => (a.loss > b.loss ? a : b));
  const shortest = grid.links.reduce((a, b) => (a.km < b.km ? a : b));

  // Like for like. The naive subtraction is locked as known-wrong in the tests.
  const contained = killContainment({ grid, regionId: killRegionId, hours, atHour: Math.floor(hours / 3) });
  // And the version that is not a tautology, on today's 4 h fleet.
  const thin = buildGrid();
  const exporter = REGIONS.map((r) =>
    killContainment({ grid: thin, regionId: r.id, hours, atHour: Math.floor(hours / 3) }),
  ).reduce((a, b) => (b.deltaPp > a.deltaPp ? b : a));

  return {
    worstLatencyMs: slowest.latencyMs,
    worstRttMs: slowest.control.rttMs,
    worstSettleS: slowest.control.settleS,
    arrestWindowS: ROCOF_ARREST_S,
    arrestPossible: grid.links.some((l) => l.control.rocofArrest),
    peakImportFrac: Math.max(...Object.values(base.perRegion).map((t) => t.peakImportFrac)),
    baselineUnservedFrac: contained.baselineUnservedFrac,
    survivorUnservedFrac: contained.survivorUnservedFrac,
    killDeltaPp: contained.deltaPp,
    killVacuous: contained.vacuous,
    exporterKillRegion: exporter.regionId,
    exporterKillDeltaPp: exporter.deltaPp,
    exporterBaselineUnservedFrac: exporter.baselineUnservedFrac,
    killedRegion: killRegionId,
    killedUnservedFrac: killed.perRegion[killRegionId].unservedFrac,
    synchronousPossible: grid.synchronousPossible,
    acLimitKm: AC_SUBMARINE_LIMIT_KM,
    shortestLinkKm: shortest.km,
    longestLinkKm: slowest.km,
    worstLossFrac: lossiest.loss,
    worstLossLinkId: lossiest.id,
    blastRadiusFederated: controlPlaneBlastRadius("federated", grid),
    blastRadiusPooled: controlPlaneBlastRadius("pooled", grid),
    islandStorageHours: Object.fromEntries(
      grid.regions.map((r) => [r.id, r.storageHours]),
    ) as Record<RegionId, number>,
  };
}

// ──────────────────────────────────────────────────────── kill containment

/**
 * Like-for-like containment measurement.
 *
 * [FOOTGUN] `SimResult` exposes `unservedFrac` (all five clusters) next to
 * `survivorUnservedFrac` (four clusters). Subtracting one from the other is the
 * obvious move and it is wrong: different region sets, different denominators.
 * It manufactures a delta of ±0.1-0.3 pp out of nothing, with a sign that
 * depends on whether the killed cluster was above or below the mean. Both a
 * human and a model made exactly that mistake on this module. Use this instead.
 *
 * Also reports whether the killed cluster had any counterparty at all. If it
 * traded nothing, its delta is structurally zero and proves nothing — say so
 * rather than quoting the zero.
 */
export type KillContainment = {
  regionId: RegionId;
  hours: number;
  warmupHours: number;
  atHour: number;
  /** Both over the same window AND the same four surviving clusters. */
  baselineUnservedFrac: number;
  survivorUnservedFrac: number;
  deltaPp: number;
  /** What the killed cluster was moving over the ties before it died. */
  killedExportJ: number;
  killedImportJ: number;
  /** No counterparty => the delta is a tautology, not a result. */
  vacuous: boolean;
};

export function killContainment(
  o: {
    grid?: GridModel;
    regionId: RegionId;
    hours?: number;
    warmupHours?: number;
    atHour?: number;
    allocator?: Allocator;
  },
): KillContainment {
  const grid = o.grid ?? buildGrid();
  const hours = o.hours ?? 72;
  const warmupHours = o.warmupHours ?? 0;
  const atHour = o.atHour ?? Math.floor(hours / 3);
  const { regionId, allocator } = o;

  const base = simulate({ grid, hours, allocator });
  const kill = simulate({ grid, hours, allocator, kill: { regionId, atHour } });

  const survivors = (sim: SimResult) => {
    let loadJ = 0;
    let unservedJ = 0;
    for (let i = warmupHours; i < sim.steps.length; i++) {
      for (const r of grid.regions) {
        if (r.id === regionId) continue;
        const x = sim.steps[i].regions[r.id];
        loadJ += x.loadW * 3600;
        unservedJ += x.unservedW * 3600;
      }
    }
    return loadJ > 0 ? unservedJ / loadJ : 0;
  };

  // What the cluster was actually trading, up to the moment it died.
  let killedExportJ = 0;
  let killedImportJ = 0;
  for (let i = warmupHours; i < atHour; i++) {
    for (const f of base.steps[i].flows) {
      if (f.from === regionId) killedExportJ += f.sentW * 3600;
      if (f.to === regionId) killedImportJ += f.deliveredW * 3600;
    }
  }

  const baselineUnservedFrac = survivors(base);
  const survivorUnservedFrac = survivors(kill);
  return {
    regionId,
    hours,
    warmupHours,
    atHour,
    baselineUnservedFrac,
    survivorUnservedFrac,
    deltaPp: (survivorUnservedFrac - baselineUnservedFrac) * 100,
    killedExportJ,
    killedImportJ,
    vacuous: killedExportJ + killedImportJ <= 0,
  };
}

// ───────────────────────────────────────────────── does the cable matter?

/**
 * Parametric study: raise intertie capacity and pole voltage until the ties
 * stop being decorative, and measure what that actually buys.
 *
 * [RESULT] It buys almost nothing. Going from capShare 0.08 to 1.00 and from
 * ±800 kV to ±1100 kV takes peak import from 2.8% to 38% of load — the cable
 * becomes structural by any reasonable definition — and still only recovers
 * ~0.8 pp of unserved energy against a ~6.7% baseline. Measured as storage:
 * a planetary ring rated at 100% of the smaller endpoint, at ±1100 kV, saves
 * **0.06 hours of battery**. Four minutes.
 *
 * The reason is structural. The diurnal deficit is a bulk-energy problem
 * (hours × GW) and a cable is a power-rated asset. Covering AP's night needs
 * ~11,000 GWh; the surplus clusters simply do not have that to give at the
 * same instant, and what they do have arrives across a line whose loss rises
 * with every watt you push through it.
 *
 * This does not make federation *safer*. It makes it the default: at planetary
 * scale there is very little to federate. The energy case for a single world
 * grid is weak on its own terms, before any argument about control or security.
 *
 * [KNOWN_LIMIT — read this before quoting the result] The model has NO weather.
 * `windW` is delivered flat and the sky is always clear. The real economic case
 * for interconnection is smoothing *correlated weather* — a five-day European
 * Dunkelflaute is exactly when you want to import — not smoothing the day/night
 * cycle. This study therefore understates the value of a tie, and says nothing
 * about the case that matters most. Adding correlated weather is the next
 * module, and it is where this conclusion should be attacked.
 */
export type TiePoint = {
  capShare: number;
  voltageKv: number;
  /** Unserved energy the ties recover, in percentage points of world load. */
  tradeValuePp: number;
  /** Worst instantaneous import as a share of a cluster's load. */
  peakImportFrac: number;
  /** Worst like-for-like cost of killing any one cluster. */
  worstKillPp: number;
  worstKillRegion: RegionId | null;
  /** Storage hours needed for <1% unserved WITH these ties. */
  storageHours: number;
};

export type TieStudy = {
  points: TiePoint[];
  /** Storage hours needed with no ties at all. The number to beat. */
  storageHoursIslanded: number;
  /** Best storage saving any configuration achieved, in hours. */
  bestStorageSavingH: number;
  bestPoint: TiePoint;
};

function uniformGrid(capShare: number, voltageKv: number, storageHours?: number) {
  return buildGrid({
    regions: storageHours === undefined
      ? undefined
      : (Object.fromEntries(REGIONS.map((r) => [r.id, { storageHours }])) as GridOverrides["regions"]),
    links: Object.fromEntries(LINKS.map((l) => [l.id, { capShare, voltageKv }])),
  });
}

/** Bisect uniform storage hours for a target unserved fraction. */
export function solveUniformStorageHours(
  o: { capShare?: number; voltageKv?: number; target?: number; hours?: number; allocator?: Allocator } = {},
) {
  const target = o.target ?? 0.01;
  const hours = o.hours ?? 72;
  let lo = 0;
  let hi = 24;
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    const grid = uniformGrid(o.capShare ?? 0.08, o.voltageKv ?? HVDC_VOLTAGE_KV, mid);
    if (simulate({ grid, hours, allocator: o.allocator }).unservedFrac > target) lo = mid;
    else hi = mid;
  }
  return hi;
}

export function tieStudy(
  o: { capShares?: readonly number[]; voltagesKv?: readonly number[]; hours?: number } = {},
): TieStudy {
  const capShares = o.capShares ?? [0.08, 0.16, 0.32, 0.64, 1.0];
  const voltagesKv = o.voltagesKv ?? [HVDC_VOLTAGE_KV, 1100];
  const hours = o.hours ?? 72;

  const storageHoursIslanded = solveUniformStorageHours({ target: 0.01, hours, allocator: noTradeAllocator });

  const points: TiePoint[] = [];
  for (const voltageKv of voltagesKv) {
    for (const capShare of capShares) {
      const grid = uniformGrid(capShare, voltageKv);
      const withTie = simulate({ grid, hours });
      const without = simulate({ grid, hours, allocator: noTradeAllocator });
      let worstKillPp = 0;
      let worstKillRegion: RegionId | null = null;
      for (const r of REGIONS) {
        const c = killContainment({ grid, regionId: r.id, hours, atHour: Math.floor(hours / 3) });
        if (c.deltaPp > worstKillPp) {
          worstKillPp = c.deltaPp;
          worstKillRegion = r.id;
        }
      }
      points.push({
        capShare,
        voltageKv,
        tradeValuePp: (without.unservedFrac - withTie.unservedFrac) * 100,
        peakImportFrac: Math.max(...Object.values(withTie.perRegion).map((t) => t.peakImportFrac)),
        worstKillPp,
        worstKillRegion,
        storageHours: solveUniformStorageHours({ capShare, voltageKv, target: 0.01, hours }),
      });
    }
  }

  const bestPoint = points.reduce((a, b) => (b.storageHours < a.storageHours ? b : a));
  return {
    points,
    storageHoursIslanded,
    bestStorageSavingH: storageHoursIslanded - bestPoint.storageHours,
    bestPoint,
  };
}

// ────────────────────────────────────────────────── weather and seasons (M2e)

/**
 * The attack on M2d. That study had no weather: flat wind, clear sky, permanent
 * equinox. It concluded the cable was worth three minutes of battery. Weather is
 * where that conclusion should break, for two separate reasons:
 *
 *   SYNOPTIC (days) — Dunkelflaute. Low wind AND low sun over a whole synoptic
 *   system for 3-7 days. Wind power correlation decays over ~600 km, so a
 *   continent is one weather system and two continents are not. At the 6,300 to
 *   14,900 km separations here the clusters are effectively independent, which
 *   is exactly the condition under which a tie pays.
 *
 *   SEASONAL (months) — obliquity. EU at 50.1°N gets 6× less daily insolation at
 *   the December solstice than at June. No battery covers a season. But the
 *   southern hemisphere is in summer, and the tropics never left it.
 *
 * Both are opt-in: `simulate({ weather: true })`. With weather off the model is
 * bit-identical to the M2d baseline, so the earlier results stay reproducible.
 */

/** Earth's axial tilt. */
export const OBLIQUITY_DEG = 23.44;
/** e-folding length of wind-power spatial correlation. ~0.1 by 1,500 km. */
export const WEATHER_CORRELATION_KM = 600;
/** Mid-latitude winter wind uplift, scaled by sin(lat). EU is ±23%, tropics flat. */
export const WIND_WINTER_BOOST = 0.3;
/** Day of year of the December solstice. */
export const WINTER_SOLSTICE_DAY = 355;

export function solarDeclinationDeg(dayOfYear: number) {
  return OBLIQUITY_DEG * Math.sin((2 * Math.PI * (dayOfYear - 81)) / 365.25);
}

/** Half the day length, in degrees of hour angle. ω_s = acos(−tanφ·tanδ). */
export function sunriseHourAngleDeg(latDeg: number, declDeg: number) {
  const rad = Math.PI / 180;
  const c = -Math.tan(latDeg * rad) * Math.tan(declDeg * rad);
  return Math.acos(Math.max(-1, Math.min(1, c))) / rad;
}

export function daylightHours(latDeg: number, dayOfYear: number) {
  return (2 * sunriseHourAngleDeg(latDeg, solarDeclinationDeg(dayOfYear))) / 15;
}

/**
 * Daily insolation on a horizontal surface, relative to the equinox at the same
 * latitude. H₀ ∝ ω_s·sinφ·sinδ + cosφ·cosδ·sin ω_s; at equinox that is cosφ.
 * EU 50.1°N: 1.79 in June, 0.30 in December — a factor of 6.
 */
export function dailyInsolationFactor(latDeg: number, dayOfYear: number) {
  const rad = Math.PI / 180;
  const la = latDeg * rad;
  const dd = solarDeclinationDeg(dayOfYear) * rad;
  const ws = sunriseHourAngleDeg(latDeg, solarDeclinationDeg(dayOfYear)) * rad;
  const h = ws * Math.sin(la) * Math.sin(dd) + Math.cos(la) * Math.cos(dd) * Math.sin(ws);
  const eq = Math.cos(la);
  return eq > 1e-9 ? Math.max(0, h / eq) : 0;
}

/**
 * Annual mean of dailyInsolationFactor at a latitude.
 *
 * [FINDING] It is not 1. Sizing solar on the equinox day misestimates annual
 * yield by −4.1% at the equator to +2.1% at 50°N — the equinox is not the
 * average day. With only 15% overbuild that is a quarter of the margin, so it
 * has to be handled explicitly rather than absorbed silently.
 */
const annualMeanCache = new Map<number, number>();
export function annualMeanInsolationFactor(latDeg: number) {
  const key = Math.round(latDeg * 1e6);
  const hit = annualMeanCache.get(key);
  if (hit !== undefined) return hit;
  let sum = 0;
  for (let d = 1; d <= 365; d++) sum += dailyInsolationFactor(latDeg, d);
  const mean = sum / 365;
  annualMeanCache.set(key, mean);
  return mean;
}

/**
 * Diurnal shape with the real day length and the real seasonal amplitude.
 * Reduces exactly to solarFactor() at the equinox: daylight 12 h, factor 1.
 *
 * `normalized` divides by the annual mean so the year carries exactly the same
 * solar energy as the aseasonal model. That is what isolates the variable under
 * test — the *distribution* of energy across the year — from an accidental
 * change in how much energy there is. Default on.
 */
export function solarFactorGeo(
  hourUtc: number,
  latDeg: number,
  lon: number,
  dayOfYear: number,
  normalized = true,
) {
  const ws = sunriseHourAngleDeg(latDeg, solarDeclinationDeg(dayOfYear));
  const daylight = (2 * ws) / 15;
  if (daylight <= 0) return 0; // polar night
  const sunrise = 12 - ws / 15;
  const h = localHour(hourUtc, lon);
  if (h <= sunrise || h >= sunrise + daylight) return 0;
  const season =
    dailyInsolationFactor(latDeg, dayOfYear) /
    (normalized ? annualMeanInsolationFactor(latDeg) : 1);
  const amplitude = (12 * season) / daylight;
  return amplitude * Math.sin((Math.PI * (h - sunrise)) / daylight);
}

/** Storm-track seasonality. Mean 1 over the year, so annual energy is preserved. */
export function windSeasonFactor(latDeg: number, dayOfYear: number) {
  const rad = Math.PI / 180;
  return (
    1 +
    WIND_WINTER_BOOST *
      Math.sin(latDeg * rad) *
      Math.cos((2 * Math.PI * (dayOfYear - WINTER_SOLSTICE_DAY)) / 365.25)
  );
}

/** Spatial correlation of a weather event between two points. */
export function weatherCorrelation(km: number) {
  return Math.exp(-km / WEATHER_CORRELATION_KM);
}

/**
 * A scripted Dunkelflaute. Deterministic on purpose: a seeded stochastic model
 * makes the locks brittle and hides the mechanism. One region at a time is
 * physically justified — see weatherCorrelation() at these separations.
 */
export type Dunkelflaute = {
  regionId: RegionId;
  startHour: number;
  hours: number;
  /** Output multipliers during the event. Northern winter overcast + calm. */
  windFactor: number;
  solarFactor: number;
};

export const DEFAULT_DUNKELFLAUTE: Omit<Dunkelflaute, "regionId" | "startHour"> = {
  hours: 5 * 24,
  windFactor: 0.1,
  solarFactor: 0.3,
};

export type Env = {
  dayOfYear: number;
  /** Multipliers applied on top of geometry, per region. */
  weather?: Partial<Record<RegionId, { wind?: number; solar?: number }>>;
  /** 0 = today's demand shape, 1 = heat fully on the grid. */
  heatElectrification?: number;
};

export function envAt(
  hourIndex: number,
  o: { startDay?: number; dunkelflaute?: Dunkelflaute | null; heatElectrification?: number } = {},
): Env {
  const dayOfYear = ((((o.startDay ?? 1) + Math.floor(hourIndex / 24)) % 365) + 365) % 365 || 365;
  const heatElectrification = o.heatElectrification;
  const d = o.dunkelflaute;
  if (!d || hourIndex < d.startHour || hourIndex >= d.startHour + d.hours)
    return { dayOfYear, heatElectrification };
  return {
    dayOfYear,
    heatElectrification,
    weather: { [d.regionId]: { wind: d.windFactor, solar: d.solarFactor } },
  };
}

// ─────────────────────────────────── M2e: what weather does to the M2d result

/**
 * Seasonal storage requirement: the worst cumulative energy deficit a cluster
 * runs up over a year, islanded, expressed in hours of its own mean load.
 * This is the storage duration curve's low point — the tank you would need to
 * carry the season, as opposed to the night.
 */
export function seasonalStorageHours(
  regionId: RegionId,
  o: { grid?: GridModel; hours?: number; startDay?: number } = {},
) {
  const grid = o.grid ?? buildGrid();
  const region = grid.byId[regionId];
  const sim = simulate({
    grid,
    hours: o.hours ?? 8760,
    startDay: o.startDay,
    weather: true,
    allocator: noTradeAllocator,
  });
  let cum = 0;
  let worst = 0;
  for (const st of sim.steps) {
    const x = st.regions[regionId];
    const available = x.solarW + x.windW + x.firmW;
    cum = Math.min(0, cum + (available - x.loadW) * 3600);
    worst = Math.min(worst, cum);
  }
  return -worst / (region.meanLoadW * 3600);
}

/**
 * The M2e verdict. Weather was supposed to break the M2d conclusion that the
 * cable is worth minutes of battery. It does not. It makes it worse.
 *
 * What weather changes:
 *   - Seasonality is a mid-latitude tax. EU (50.1°N) goes from 0.14% unserved
 *     to 3.3%; NA (39.8°N) from 0.66% to 4.1%. The tropics do not move at all.
 *     The signature tracks |latitude| exactly, which is what obliquity predicts.
 *   - The storage bill explodes: 7.4 h of mean load becomes ~358 h. Fifteen
 *     days. That is seasonal storage, and no battery chemistry does it.
 *
 * What weather does NOT change:
 *   - The cable still saves nothing. Not at capShare 1.0, not at ±1100 kV, and
 *     — the decisive test — **not with a physically impossible wire** of
 *     infinite capacity and zero loss, which recovers 0.44 pp where the real
 *     ring recovers 0.39 pp. The real ring already captures ~90% of what a
 *     magic wire could do.
 *
 * That is the whole finding: transmission is not the binding constraint. Not
 * because the cable is too thin or too lossy, but because at the moment a
 * cluster is short, **nobody else has a surplus to send**. During a five-day
 * European Dunkelflaute the flow limiter is "no surplus", not capacity and not
 * maximum power transfer — raising capShare from 1.0 to 4.0 moves imports by 3%.
 *
 * The lever that does work is overbuild. Multiplying every generation share by
 * 1.5 takes the annual storage requirement from ~358 h to ~3.4 h and unserved
 * energy to zero, at the price of ~42% curtailment. The whole planetary ring,
 * at any capacity and any voltage, saves at most ~0.7 h of that.
 *
 * [KNOWN_LIMIT] This is a physical model, not an economic one. It ranks levers
 * by effectiveness, not by cost. Whether 42% curtailment is cheaper than 11.6
 * TWh of battery or a 30,000 km ring is a $/W-vs-$/kWh-vs-$/kW-km question this
 * module does not answer, and the answer moves every year.
 * [KNOWN_LIMIT] One scripted Dunkelflaute at a time, no stochastic weather, no
 * seasonal load (winter heating is not modeled, which flatters winter).
 */
export type WeatherStudy = {
  aseasonalUnservedFrac: number;
  seasonalUnservedFrac: number;
  perRegion: Record<
    RegionId,
    { latDeg: number; aseasonal: number; seasonal: number; penaltyPp: number }
  >;
  /** Unserved with the real ring, and with a wire that cannot exist. */
  ringUnservedFrac: number;
  magicWireUnservedFrac: number;
  ringSavedPp: number;
  magicSavedPp: number;
  /** How much of the impossible wire's value the real ring already captures. */
  ringCapturesOfMagic: number;
};

export function weatherStudy(
  o: { hours?: number; storageHours?: number; startDay?: number; heatElectrification?: number } = {},
): WeatherStudy {
  const hours = o.hours ?? 8760;
  const storageHours = o.storageHours ?? 7.43;
  const startDay = o.startDay;
  const heatElectrification = o.heatElectrification;
  const mk = (capShare: number, voltageKv: number) =>
    buildGrid({
      regions: Object.fromEntries(
        REGIONS.map((r) => [r.id, { storageHours }]),
      ) as GridOverrides["regions"],
      links: Object.fromEntries(LINKS.map((l) => [l.id, { capShare, voltageKv }])),
    });

  const islanded = mk(0.08, HVDC_VOLTAGE_KV);
  const aseasonal = simulate({ grid: islanded, hours, allocator: noTradeAllocator });
  const seasonal = simulate({ grid: islanded, hours, weather: true, startDay, heatElectrification, allocator: noTradeAllocator });
  const ring = simulate({ grid: mk(1, 1100), hours, weather: true, startDay, heatElectrification });
  // Infinite capacity, effectively zero loss. Not buildable. That is the point.
  const magic = simulate({ grid: mk(1000, 1e6), hours, weather: true, startDay, heatElectrification });

  const ringSavedPp = (seasonal.unservedFrac - ring.unservedFrac) * 100;
  const magicSavedPp = (seasonal.unservedFrac - magic.unservedFrac) * 100;

  return {
    aseasonalUnservedFrac: aseasonal.unservedFrac,
    seasonalUnservedFrac: seasonal.unservedFrac,
    perRegion: Object.fromEntries(
      REGIONS.map((r) => [
        r.id,
        {
          latDeg: r.lat,
          aseasonal: aseasonal.perRegion[r.id].unservedFrac,
          seasonal: seasonal.perRegion[r.id].unservedFrac,
          penaltyPp:
            (seasonal.perRegion[r.id].unservedFrac - aseasonal.perRegion[r.id].unservedFrac) * 100,
        },
      ]),
    ) as WeatherStudy["perRegion"],
    ringUnservedFrac: ring.unservedFrac,
    magicWireUnservedFrac: magic.unservedFrac,
    ringSavedPp,
    magicSavedPp,
    ringCapturesOfMagic: magicSavedPp > 0 ? ringSavedPp / magicSavedPp : 1,
  };
}

/** Multiply every generation share by k. The lever that actually moves. */
export function overbuiltGrid(k: number, o: { storageHours?: number; capShare?: number; voltageKv?: number } = {}) {
  return buildGrid({
    regions: Object.fromEntries(
      REGIONS.map((r) => [
        r.id,
        {
          storageHours: o.storageHours ?? r.storageHours,
          solarShare: r.solarShare * k,
          windShare: r.windShare * k,
          firmShare: r.firmShare * k,
        },
      ]),
    ) as GridOverrides["regions"],
    links: Object.fromEntries(
      LINKS.map((l) => [l.id, { capShare: o.capShare ?? l.capShare, voltageKv: o.voltageKv ?? HVDC_VOLTAGE_KV }]),
    ),
  });
}

// ──────────────────────────── M2f: seasonal load, and electrified heat

/**
 * Seasonal demand. Two terms with opposite latitude scalings, because they are
 * different physics:
 *
 *   HEATING — degree-days. Scales with |sin φ|: nothing at the equator, hard at
 *   50°N. Peaks in the LOCAL winter, which is when insolation is at its lowest.
 *   Less sun and more load at the same instant: the two terms compound.
 *
 *   COOLING — scales with cos φ: a tropical and subtropical summer load. Peaks
 *   in the LOCAL summer, which is when insolation is at its highest. These two
 *   cancel, which is why an equatorial cluster is an easy grid.
 *
 * A single sinusoid would have got Brazil backwards — southern-hemisphere
 * demand peaks in the southern *summer* (cooling), not the southern winter.
 *
 * Anchored on two observables, not on taste:
 *   - EU today: winter/summer electricity demand ≈ 1.20
 *   - Subtropical cooling-dominated: summer/winter ≈ 1.15
 *
 * `heatElectrification` ∈ [0,1] moves the first anchor from today's 1.20 to
 * 2.00, the shape of a continent that has moved its heat onto the grid. That is
 * not a detail on the way to Type I — it is most of the new load.
 *
 * Annual mean is normalized to exactly 1, so this moves demand around the year
 * without changing how much there is. Same discipline as the solar term.
 */
export const WINTER_DEMAND_RATIO_50N = 1.2;
export const WINTER_DEMAND_RATIO_50N_ELECTRIFIED = 2.0;
export const SUMMER_COOLING_RATIO = 1.15;

const seasonMeanCache = new Map<string, number>();

function rawLoadSeason(latDeg: number, dayOfYear: number, heatElectrification: number) {
  const rad = Math.PI / 180;
  // +1 in the local winter, −1 in the local summer.
  const w =
    Math.cos((2 * Math.PI * (dayOfYear - WINTER_SOLSTICE_DAY)) / 365.25) *
    (latDeg < 0 ? -1 : 1);
  const heatRatio =
    WINTER_DEMAND_RATIO_50N +
    heatElectrification * (WINTER_DEMAND_RATIO_50N_ELECTRIFIED - WINTER_DEMAND_RATIO_50N);

  // Both terms are additive and non-negative, so the summer trough is NOT
  // (1 − a): it already carries the cooling term. Solve the anchors properly.
  // Cooling is pinned at the equator, where the heating term is exactly zero,
  // so the two amplitudes decouple and electrifying heat cannot inflate cooling.
  const C_EQ = Math.cos(0) / Math.cos(15 * rad);
  const aCool = (SUMMER_COOLING_RATIO - 1) / C_EQ;
  // Then heating is pinned at 50°, where the heat scale is 1 by definition:
  //   (1 + aHeat) / (1 + aCool·C50) = heatRatio
  const C50 = Math.cos(50 * rad) / Math.cos(15 * rad);
  const aHeat = heatRatio - 1 + heatRatio * C50 * aCool;

  const heat = Math.max(0, w) * (Math.abs(Math.sin(latDeg * rad)) / Math.sin(50 * rad));
  const cool = Math.max(0, -w) * (Math.cos(latDeg * rad) / Math.cos(15 * rad));
  return 1 + aHeat * heat + aCool * cool;
}

/** Mean 1 over the year, by construction. */
export function loadSeasonFactor(latDeg: number, dayOfYear: number, heatElectrification = 0) {
  const key = `${Math.round(latDeg * 1e4)}:${Math.round(heatElectrification * 1e4)}`;
  let mean = seasonMeanCache.get(key);
  if (mean === undefined) {
    let sum = 0;
    for (let d = 1; d <= 365; d++) sum += rawLoadSeason(latDeg, d, heatElectrification);
    mean = sum / 365;
    seasonMeanCache.set(key, mean);
  }
  return rawLoadSeason(latDeg, dayOfYear, heatElectrification) / mean;
}
