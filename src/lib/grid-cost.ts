/**
 * GRID COST — the economic layer over `grid.ts`. M2g.
 *
 * Deliberately a separate module. `grid.ts` is physics and its numbers are good
 * until the laws change. Everything here has a **shelf life measured in months**
 * and must never be imported into a physics test.
 *
 * The module answers one question the physics could not: M2d/M2e/M2f ranked the
 * levers by effectiveness (overbuild ≫ storage ≫ transmission) but effectiveness
 * is not cost. Overbuilding to ×2 throws away 80% of the energy generated. That
 * is physically trivial and might be economically insane.
 *
 * Method, and the reason to trust the shape rather than the level:
 *   - the physical quantities come from the simulator and are exact;
 *   - the prices are dated point estimates with real spread, so a single
 *     "cheapest option" number would be false precision;
 *   - therefore the output is a **frontier and a crossover**, not an answer.
 *     `storageCrossoverUsdPerKwh()` says what a battery would have to cost for
 *     the optimum to move. That statement survives price drift; a dollar total
 *     does not.
 *
 * [KNOWN_LIMIT] No land, no grid reinforcement inside a cluster, no O&M, no
 * financing, no lifetime or replacement cycles, no learning curve, no carbon
 * price, no transmission inside a region. This is a capex sketch for ranking
 * three levers against each other, not an LCOE.
 */

import {
  REGIONS,
  type GridModel,
  buildGrid,
  noTradeAllocator,
  overbuiltGrid,
  simulate,
} from "./grid.ts";

/**
 * Installed capex, 2025 point estimates. Sources are public utility-scale
 * figures; the spread is real and is why this module reports crossovers.
 *
 * Storage is split into a power block and an energy block on purpose. Quoting
 * "$/kWh" for a 400-hour system using a 4-hour system's price is the standard
 * way to get long-duration storage wrong by an order of magnitude: the power
 * electronics do not scale with duration, the tank does.
 */
export type CostBasis = {
  asOf: string;
  solarUsdPerW: number;
  windUsdPerW: number;
  firmUsdPerW: number;
  storagePowerUsdPerKw: number;
  storageEnergyUsdPerKwh: number;
  hvdcConverterUsdPerKw: number;
  hvdcLineUsdPerKwKm: number;
};

export const COST_2025: CostBasis = {
  asOf: "2025-Q1",
  /** Utility-scale PV, installed DC. Range seen: 0.5 (CN/IN) to 1.2 (US). */
  solarUsdPerW: 0.8,
  /** Onshore wind installed. Offshore is 2-3x this. */
  windUsdPerW: 1.5,
  /** Dispatchable blend — hydro/nuclear/gas. The weakest number here by far. */
  firmUsdPerW: 2.5,
  /** Li-ion power block: inverters, PCS, interconnection. Duration-independent. */
  storagePowerUsdPerKw: 400,
  /** Li-ion energy block: cells, racks, container. This is what scales with hours. */
  storageEnergyUsdPerKwh: 150,
  /** HVDC converter stations, per kW of link rating, both ends. */
  hvdcConverterUsdPerKw: 200,
  /** Submarine-weighted line cost. Overhead is roughly half this. */
  hvdcLineUsdPerKwKm: 1.0,
};

export type CostBreakdown = {
  solarUsd: number;
  windUsd: number;
  firmUsd: number;
  storageUsd: number;
  transmissionUsd: number;
  totalUsd: number;
  /** Nameplate actually bought, for sanity-checking against the real world. */
  solarW: number;
  windW: number;
  firmW: number;
  storageWh: number;
  storagePowerW: number;
  transmissionW: number;
};

/**
 * Price a configuration. Storage power is sized on the peak discharge the
 * simulation actually uses, not on grid.ts's fixed C-rate — a 400-hour tank
 * does not need 100x the inverters, it needs a bigger tank.
 */
export function priceGrid(
  grid: GridModel,
  o: { peakDischargeW?: Record<string, number>; costs?: CostBasis } = {},
): CostBreakdown {
  const c = o.costs ?? COST_2025;
  let solarW = 0;
  let windW = 0;
  let firmW = 0;
  let storageWh = 0;
  let storagePowerW = 0;

  for (const r of grid.regions) {
    solarW += r.solarPeakW;
    windW += r.windNameplateW;
    firmW += r.firmW;
    storageWh += r.storageJ / 3600;
    // Peak discharge from the sim if given; otherwise the model's own C-rate.
    storagePowerW += o.peakDischargeW?.[r.id] ?? r.storagePowerW;
  }

  let transmissionW = 0;
  let transmissionUsd = 0;
  for (const l of grid.links) {
    transmissionW += l.capacityW;
    const kw = l.capacityW / 1000;
    transmissionUsd += kw * (c.hvdcConverterUsdPerKw + c.hvdcLineUsdPerKwKm * l.routedKm);
  }

  const solarUsd = solarW * c.solarUsdPerW;
  const windUsd = windW * c.windUsdPerW;
  const firmUsd = firmW * c.firmUsdPerW;
  const storageUsd =
    (storagePowerW / 1000) * c.storagePowerUsdPerKw + (storageWh / 1000) * c.storageEnergyUsdPerKwh;

  return {
    solarUsd,
    windUsd,
    firmUsd,
    storageUsd,
    transmissionUsd,
    totalUsd: solarUsd + windUsd + firmUsd + storageUsd + transmissionUsd,
    solarW,
    windW,
    firmW,
    storageWh,
    storagePowerW,
    transmissionW,
  };
}

/**
 * The price-free half of the frontier. Expensive (a bisection of full-year sims
 * per overbuild level) and completely independent of what anything costs, so it
 * is computed once and re-priced as often as you like. Keeping this split is
 * what makes a crossover search cheap instead of quadratic.
 */
export type PhysicalPoint = {
  overbuild: number;
  storageHours: number;
  curtailedFrac: number;
  unservedFrac: number;
  storageWh: number;
  storagePowerW: number;
  solarW: number;
  windW: number;
  firmW: number;
  transmissionUsdInputs: { capacityW: number; routedKm: number }[];
};

export type FrontierPoint = PhysicalPoint & { cost: CostBreakdown };

export type FrontierOptions = {
  /** readonly so callers can pass an `as const` tuple. */
  overbuilds?: readonly number[];
  target?: number;
  hours?: number;
  heatElectrification?: number;
  capShare?: number;
  maxStorageHours?: number;
  bisectSteps?: number;
  costs?: CostBasis;
};

/** Peak discharge per region over a run, W. Sizes the storage power block. */
function peakDischarge(sim: ReturnType<typeof simulate>) {
  const out: Record<string, number> = {};
  for (const st of sim.steps) {
    for (const id of Object.keys(st.regions)) {
      const w = st.regions[id as keyof typeof st.regions].storageW;
      if (w > 0) out[id] = Math.max(out[id] ?? 0, w);
    }
  }
  return out;
}

/**
 * Iso-reliability frontier: for each overbuild level, the least storage that
 * meets the reliability target, priced.
 *
 * [RESULT] It is a cliff, not a curve. Below a threshold you must carry the
 * *season* (hundreds of hours); above it you only carry the *night* (single
 * digits). At today's demand shape the cliff sits between ×1.00 and ×1.15;
 * with heat fully electrified it moves to between ×1.30 and ×1.50. Landing
 * just under it costs 50-100x in storage.
 */
export function physicalFrontier(o: FrontierOptions = {}): PhysicalPoint[] {
  const overbuilds = o.overbuilds ?? [1.0, 1.15, 1.3, 1.5, 1.75, 2.0, 2.5, 3.0];
  const target = o.target ?? 0.01;
  const hours = o.hours ?? 8760;
  const heatElectrification = o.heatElectrification ?? 0;
  const capShare = o.capShare ?? 0;
  const maxStorageHours = o.maxStorageHours ?? 1200;
  const steps = o.bisectSteps ?? 14;

  // `capShare || undefined` would turn an intended 0 into the 0.08 default and
  // charge the islanded frontier for a ring it never uses. Pass it straight.
  const mk = (k: number, storageHours: number) =>
    overbuiltGrid(k, { storageHours, capShare });
  const run = (k: number, storageHours: number) =>
    simulate({
      grid: mk(k, storageHours),
      hours,
      weather: true,
      heatElectrification,
      allocator: capShare > 0 ? undefined : noTradeAllocator,
    });

  const points: PhysicalPoint[] = [];
  for (const overbuild of overbuilds) {
    if (run(overbuild, maxStorageHours).unservedFrac > target) continue; // unreachable
    let lo = 0;
    let hi = maxStorageHours;
    for (let i = 0; i < steps; i++) {
      const mid = (lo + hi) / 2;
      if (run(overbuild, mid).unservedFrac > target) lo = mid;
      else hi = mid;
    }
    const sim = run(overbuild, hi);
    const grid = mk(overbuild, hi);
    const peak = peakDischarge(sim);
    let curtailed = 0;
    let load = 0;
    for (const st of sim.steps) {
      for (const r of REGIONS) {
        curtailed += st.regions[r.id].curtailedW;
        load += st.regions[r.id].loadW;
      }
    }
    points.push({
      overbuild,
      storageHours: hi,
      curtailedFrac: load > 0 ? curtailed / load : 0,
      unservedFrac: sim.unservedFrac,
      storageWh: grid.regions.reduce((a, r) => a + r.storageJ / 3600, 0),
      storagePowerW: grid.regions.reduce((a, r) => a + (peak[r.id] ?? r.storagePowerW), 0),
      solarW: grid.regions.reduce((a, r) => a + r.solarPeakW, 0),
      windW: grid.regions.reduce((a, r) => a + r.windNameplateW, 0),
      firmW: grid.regions.reduce((a, r) => a + r.firmW, 0),
      transmissionUsdInputs: grid.links.map((l) => ({ capacityW: l.capacityW, routedKm: l.routedKm })),
    });
  }
  return points;
}

/** Cheap. Re-prices a physical frontier without touching the simulator. */
export function priceFrontier(points: PhysicalPoint[], costs: CostBasis = COST_2025): FrontierPoint[] {
  return points.map((p) => {
    const solarUsd = p.solarW * costs.solarUsdPerW;
    const windUsd = p.windW * costs.windUsdPerW;
    const firmUsd = p.firmW * costs.firmUsdPerW;
    const storageUsd =
      (p.storagePowerW / 1000) * costs.storagePowerUsdPerKw +
      (p.storageWh / 1000) * costs.storageEnergyUsdPerKwh;
    let transmissionUsd = 0;
    let transmissionW = 0;
    for (const l of p.transmissionUsdInputs) {
      transmissionW += l.capacityW;
      transmissionUsd +=
        (l.capacityW / 1000) * (costs.hvdcConverterUsdPerKw + costs.hvdcLineUsdPerKwKm * l.routedKm);
    }
    return {
      ...p,
      cost: {
        solarUsd,
        windUsd,
        firmUsd,
        storageUsd,
        transmissionUsd,
        totalUsd: solarUsd + windUsd + firmUsd + storageUsd + transmissionUsd,
        solarW: p.solarW,
        windW: p.windW,
        firmW: p.firmW,
        storageWh: p.storageWh,
        storagePowerW: p.storagePowerW,
        transmissionW,
      },
    };
  });
}

export function isoReliabilityFrontier(o: FrontierOptions = {}): FrontierPoint[] {
  return priceFrontier(physicalFrontier(o), o.costs ?? COST_2025);
}

export function leastCost(points: FrontierPoint[]) {
  return points.reduce((a, b) => (b.cost.totalUsd < a.cost.totalUsd ? b : a));
}

/**
 * What would a battery have to cost for the least-cost point to move to a
 * storage-heavier configuration? Returns the energy-block price in $/kWh at
 * which the optimum shifts, or null if it never does within the search.
 *
 * This is the number that survives price drift. A dollar total does not.
 */
export function storageCrossoverUsdPerKwh(
  o: FrontierOptions & { search?: readonly number[]; physical?: PhysicalPoint[] } = {},
): { crossoverUsdPerKwh: number | null; baseOverbuild: number; shiftedOverbuild: number | null } {
  const search = o.search ?? [150, 100, 60, 40, 25, 15, 10, 5, 2, 1, 0.5, 0.1];
  // The physics is priced-agnostic: solve it once, then re-price. Doing this
  // inside the loop made the search quadratic and it timed out.
  const physical = o.physical ?? physicalFrontier(o);
  const base = leastCost(priceFrontier(physical, o.costs ?? COST_2025));
  for (const price of search) {
    const costs: CostBasis = { ...(o.costs ?? COST_2025), storageEnergyUsdPerKwh: price };
    const pt = leastCost(priceFrontier(physical, costs));
    if (pt.overbuild < base.overbuild) {
      return { crossoverUsdPerKwh: price, baseOverbuild: base.overbuild, shiftedOverbuild: pt.overbuild };
    }
  }
  return { crossoverUsdPerKwh: null, baseOverbuild: base.overbuild, shiftedOverbuild: null };
}

/** Today's fleet, priced, as a reality check on the totals above. */
export function referenceGridCost(costs?: CostBasis) {
  const grid = buildGrid();
  return priceGrid(grid, { costs });
}
