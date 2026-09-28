import assert from "node:assert/strict";
import test from "node:test";
import {
  COST_2025,
  isoReliabilityFrontier,
  leastCost,
  physicalFrontier,
  priceFrontier,
  priceGrid,
  storageCrossoverUsdPerKwh,
} from "./grid-cost.ts";
import { overbuiltGrid } from "./grid.ts";

/** Reduced settings: the full frontier is ~6.5 s and this suite must stay fast. */
const FAST = { overbuilds: [1.0, 1.5], bisectSteps: 8 } as const;

test("the frontier is a cliff, not a curve", () => {
  // [RESULT] The single most decision-relevant number in the module. Below a
  // threshold of overbuild you must carry the SEASON; above it, only the night.
  const f = physicalFrontier(FAST);
  const thin = f.find((p) => p.overbuild === 1)!;
  const fat = f.find((p) => p.overbuild === 1.5)!;
  assert.ok(thin.storageHours > 300, `x1.0 needs ${thin.storageHours} h`);
  assert.ok(fat.storageHours < 10, `x1.5 needs ${fat.storageHours} h`);
  assert.ok(thin.storageHours / fat.storageHours > 50, "the cliff is gone — recheck");
  // Half again as much generation costs 43% of the energy in curtailment.
  assert.ok(fat.curtailedFrac > 0.35 && fat.curtailedFrac < 0.55);
  assert.ok(thin.curtailedFrac < 0.1);
});

test("electrifying heat moves the cliff, it does not remove it", () => {
  const now = physicalFrontier({ ...FAST, heatElectrification: 0 });
  const later = physicalFrontier({ ...FAST, heatElectrification: 1 });
  const at = (f: typeof now, k: number) => f.find((p) => p.overbuild === k)!.storageHours;
  // ×1.0 gets worse, ×1.5 stays cheap: the cliff edge slides right.
  assert.ok(at(later, 1) > at(now, 1) * 1.5);
  assert.ok(at(later, 1.5) < 12, `x1.5 electrified needs ${at(later, 1.5)} h`);
});

test("economics confirms the physical ranking instead of inverting it", () => {
  // The attack on M2d/M2e/M2f was: overbuild is physically trivial and might be
  // economically insane. It is not. You would need a battery ~100x cheaper.
  const phys = physicalFrontier(FAST);
  const x = storageCrossoverUsdPerKwh({ ...FAST, physical: phys });
  assert.ok(x.baseOverbuild >= 1.5, `optimum sits at x${x.baseOverbuild}`);
  assert.ok(
    x.crossoverUsdPerKwh === null || x.crossoverUsdPerKwh < 10,
    `optimum flips at $${x.crossoverUsdPerKwh}/kWh, which is not absurd enough to ignore`,
  );
  // For scale: the crossover is far under today's energy-block price.
  assert.ok(COST_2025.storageEnergyUsdPerKwh > 100);
});

test("transmission is the worst buy in the model, by a wide margin", () => {
  // A planetary ring at capShare 1.0 costs more than the entire rest of the
  // system, to recover ~1 pp of unserved energy.
  const ring = priceGrid(overbuiltGrid(1.5, { storageHours: 5.8, capShare: 1, voltageKv: 1100 }));
  // capShare 0 means no ties at all. `overbuiltGrid` defaults to 0.08 when the
  // field is omitted, so it has to be passed explicitly.
  const noRing = priceGrid(overbuiltGrid(1.5, { storageHours: 5.8, capShare: 0 }));
  assert.ok(ring.transmissionUsd > noRing.totalUsd, "the ring got cheap — recheck the cost basis");
  assert.equal(noRing.transmissionUsd, 0);
  // And a thin ring is still trillions.
  const thin = priceGrid(overbuiltGrid(1.5, { storageHours: 5.8, capShare: 0.08, voltageKv: 1100 }));
  assert.ok(thin.transmissionUsd > 1e12);
});

test("above the cliff the cost surface is nearly flat — so sit well above it", () => {
  // The actionable finding: overbuilding past the optimum is cheap insurance.
  const f = isoReliabilityFrontier({ overbuilds: [1.15, 1.3, 1.5], bisectSteps: 8 });
  const best = leastCost(f);
  const at15 = f.find((p) => p.overbuild === 1.5)!;
  const premium = at15.cost.totalUsd / best.cost.totalUsd - 1;
  assert.ok(premium < 0.15, `x1.5 costs +${premium * 100}% over the optimum`);
  // ...and x1.5 is what a heat-electrified world needs, so that premium is the
  // price of not falling off the cliff when heating moves onto the grid.
  const later = physicalFrontier({ overbuilds: [1.15, 1.5], bisectSteps: 8, heatElectrification: 1 });
  assert.ok(later.find((p) => p.overbuild === 1.15)!.storageHours > 100);
  assert.ok(later.find((p) => p.overbuild === 1.5)!.storageHours < 12);
});

test("prices are a separate, dated layer that never touches the physics", () => {
  const phys = physicalFrontier(FAST);
  const cheap = priceFrontier(phys, { ...COST_2025, storageEnergyUsdPerKwh: 10 });
  const dear = priceFrontier(phys, { ...COST_2025, storageEnergyUsdPerKwh: 300 });
  // Same physical points, different totals. Re-pricing must not re-simulate.
  for (let i = 0; i < phys.length; i++) {
    assert.equal(cheap[i].storageHours, dear[i].storageHours);
    assert.equal(cheap[i].unservedFrac, dear[i].unservedFrac);
    assert.ok(cheap[i].cost.totalUsd < dear[i].cost.totalUsd);
  }
  assert.ok(COST_2025.asOf.startsWith("2025"), "the cost basis must carry a date");
});
