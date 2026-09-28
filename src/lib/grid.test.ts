import assert from "node:assert/strict";
import test from "node:test";
import { ELECTRICITY_TWH_YR, ELECTRICITY_W } from "./facts.ts";
import { P_I } from "./kardashev.ts";
import {
  type RegionId,
  AC_SUBMARINE_LIMIT_KM,
  F_GEN_TRIP,
  HVDC_CONVERTER_LOSS,
  LINKS,
  REGIONS,
  SOLAR_CF,
  V_FIBER,
  buildGrid,
  compareArchitectures,
  contingencyFederated,
  contingencyPooled,
  controlBudget,
  controlPlaneBlastRadius,
  greatCircleKm,
  gridHeadline,
  hvdcLoss,
  hvdcLossAt,
  maxLoadingForLoss,
  islandUnservedFrac,
  killContainment,
  linkLatencyMs,
  loadFactor,
  loadSeasonFactor,
  noTradeAllocator,
  simulate,
  sizeIslandStorageHours,
  sizedGrid,
  solarFactor,
  annualMeanInsolationFactor,
  dailyInsolationFactor,
  daylightHours,
  overbuiltGrid,
  seasonalStorageHours,
  solarFactorGeo,
  step,
  tieStudy,
  weatherStudy,
  WIND_CF,
} from "./grid.ts";

// ────────────────────────────────────────────────────────────────── geography

test("great circle: exact spherical cases and one published distance", () => {
  const quarter = greatCircleKm({ lat: 0, lon: 0 }, { lat: 0, lon: 90 });
  assert.ok(Math.abs(quarter - (Math.PI * 6371) / 2) < 1);
  const anti = greatCircleKm({ lat: 0, lon: 0 }, { lat: 0, lon: 180 });
  assert.ok(Math.abs(anti - Math.PI * 6371) < 1);
  // New York - London, published ~5,570 km.
  const ny = greatCircleKm({ lat: 40.71, lon: -74.01 }, { lat: 51.51, lon: -0.13 });
  assert.ok(ny > 5540 && ny < 5600, `NY-London ${ny}`);
});

test("fiber is c/n, not c", () => {
  assert.ok(V_FIBER > 2.03e8 && V_FIBER < 2.05e8);
  // 1000 km great circle -> 1600 km routed -> 7.8 ms + switching.
  const ms = linkLatencyMs(1000);
  assert.ok(ms > 11 && ms < 13, `${ms} ms`);
});

test("HVDC loss reproduces 3%/1000 km of routed line plus converters", () => {
  // 625 km great circle = 1000 km routed.
  const l = hvdcLoss(625);
  assert.ok(Math.abs(l - 0.0436) < 0.002, `${l}`);
  // Compounding, not linear: it must stay below 1 at any distance.
  assert.ok(hvdcLoss(20_000) < 1);
});

// ──────────────────────────────────────────────────────────── the anchor: TES

test("the five bulkheads are exactly world electricity, no invented total", () => {
  const shares = REGIONS.reduce((s, r) => s + r.loadShare, 0);
  assert.ok(Math.abs(shares - 1) < 1e-12);
  const grid = buildGrid();
  assert.ok(Math.abs(grid.totalMeanLoadW - ELECTRICITY_W) / ELECTRICITY_W < 1e-12);
  // ~3.4 TW of electrons, not the ~20 TW of TES.
  assert.ok(grid.totalMeanLoadW > 3.3e12 && grid.totalMeanLoadW < 3.6e12);
});

// ────────────────────────────────────────────────────── latency and control

test("intercontinental latency is 50-130 ms one way, 100-260 ms round trip", () => {
  const grid = buildGrid();
  const lat = grid.links.map((l) => l.latencyMs);
  assert.ok(Math.min(...lat) > 40, `min ${Math.min(...lat)}`);
  assert.ok(Math.max(...lat) < 200, `max ${Math.max(...lat)}`);
  // The transpacific tie is the worst one and it is above 100 ms.
  const apna = grid.links.find((l) => l.id === "AP-NA");
  assert.ok(apna!.latencyMs > 100);
});

test("no intercontinental link can close a RoCoF arrest loop; all can dispatch", () => {
  const grid = buildGrid();
  for (const l of grid.links) {
    assert.equal(l.control.rocofArrest, false, `${l.id} claims sub-second arrest`);
    assert.equal(l.control.frequencyContainment, true, `${l.id} fails 30 s FCR`);
    assert.equal(l.control.economicDispatch, true, `${l.id} fails 15 min dispatch`);
    // Settling is 1-2 s: above the arrest window, far under the market window.
    assert.ok(l.control.settleS > 0.5 && l.control.settleS < 2.5, `${l.id} ${l.control.settleS}`);
  }
});

test("control budget scales with delay, not with wishes", () => {
  const fast = controlBudget(10);
  const slow = controlBudget(160);
  assert.ok(fast.settleS < slow.settleS);
  assert.ok(Math.abs(slow.settleS / fast.settleS - 16) < 1e-9);
});

test("a global synchronous pool is physically excluded, not rejected by taste", () => {
  const grid = buildGrid();
  assert.equal(grid.synchronousPossible, false);
  for (const l of grid.links) {
    assert.ok(l.routedKm > AC_SUBMARINE_LIMIT_KM);
    assert.equal(l.mustBeHvdc, true);
  }
});

// ─────────────────────────────────────────────────────────────────── diurnal

test("solar capacity factor is derived (1/pi), not asserted", () => {
  const n = 20_000;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += solarFactor((i * 24) / n, 0);
  assert.ok(Math.abs(sum / n - SOLAR_CF) < 1e-4);
  assert.ok(Math.abs(SOLAR_CF - 1 / Math.PI) < 1e-15);
});

test("load shape has mean exactly 1 and peaks in the local evening", () => {
  const n = 20_000;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += loadFactor((i * 24) / n, 0);
  assert.ok(Math.abs(sum / n - 1) < 1e-6);
  assert.ok(loadFactor(19, 0) > loadFactor(7, 0));
  // Longitude only shifts phase, never amplitude.
  assert.ok(Math.abs(loadFactor(19, 0) - loadFactor(19 - 103.8 / 15, 103.8)) < 1e-9);
});

// ─────────────────────────────────────────────────────────── energy accounting

test("every step closes: supply equals sinks, delivered equals sent minus loss", () => {
  const grid = buildGrid();
  const soc = Object.fromEntries(
    grid.regions.map((r) => [r.id, r.storageJ * 0.5]),
  ) as Record<RegionId, number>;
  let worst = 0;
  for (let h = 0; h < 72; h++) {
    const s = step(grid, h, { soc });
    for (const r of grid.regions) {
      const x = s.regions[r.id];
      const supply = x.solarW + x.windW + x.firmW + Math.max(0, x.storageW) + x.importW;
      const sinks = x.loadW - x.unservedW + Math.max(0, -x.storageW) + x.exportW + x.curtailedW;
      worst = Math.max(worst, Math.abs(supply - sinks) / Math.max(1, x.loadW));
    }
    for (const f of s.flows) {
      // Loss is load dependent now: check against the loss actually incurred.
      worst = Math.max(worst, Math.abs(f.deliveredW - f.sentW * (1 - f.lossFrac)) / Math.max(1, f.sentW));
      const l = grid.links.find((z) => z.id === f.linkId)!;
      worst = Math.max(worst, Math.abs(f.lossFrac - l.lossSlopePerW * f.sentW) / Math.max(1e-9, f.lossFrac));
    }
  }
  assert.ok(worst < 1e-9, `worst relative error ${worst}`);
});

test("storage never goes negative and never exceeds its own tank", () => {
  const grid = buildGrid();
  const soc = Object.fromEntries(
    grid.regions.map((r) => [r.id, r.storageJ * 0.5]),
  ) as Record<RegionId, number>;
  for (let h = 0; h < 72; h++) {
    step(grid, h, { soc });
    for (const r of grid.regions) {
      assert.ok(soc[r.id] >= -1e-6, `${r.id} soc ${soc[r.id]}`);
      assert.ok(soc[r.id] <= r.storageJ + 1e-6, `${r.id} overfilled`);
    }
  }
});

// ────────────────────────────────────────────────────── the bulkhead invariant

test("an intertie is garnish: capacity under 10% of the smaller endpoint", () => {
  const grid = buildGrid();
  for (const l of grid.links) {
    const smaller = Math.min(grid.byId[l.a].meanLoadW, grid.byId[l.b].meanLoadW);
    assert.ok(l.capacityW / smaller <= 0.1, `${l.id} intertie is structural`);
  }
  assert.equal(LINKS.length, 6, "sparse ring plus one spur, never a full mesh");
});

test("import never becomes structural: peak import stays under 10% of load", () => {
  for (const grid of [buildGrid(), sizedGrid(0.01)]) {
    const s = simulate({ grid, hours: 72 });
    for (const t of Object.values(s.perRegion)) {
      assert.ok(t.peakImportFrac < 0.1, `${t.id} imports ${t.peakImportFrac} of load`);
    }
  }
});

test("today's 4 h storage does NOT island: the default build has a real gap", () => {
  // [KNOWN_LIMIT] This is the honest baseline, not a failure of the model.
  // A solar-heavy cluster with 4 h of storage cannot ride its own night.
  const s = simulate({ hours: 72 });
  assert.ok(s.unservedFrac > 0.02, `default build looks too good: ${s.unservedFrac}`);
  assert.ok(s.perRegion.AF.unservedFrac > s.perRegion.EU.unservedFrac);
});

test("storage requirement is set by how solar-heavy the mix is", () => {
  const hours = Object.fromEntries(REGIONS.map((r) => [r.id, sizeIslandStorageHours(r.id, 0.01)]));
  for (const r of REGIONS) assert.ok(Number.isFinite(hours[r.id]), `${r.id} cannot island at all`);
  // EU is wind + firm heavy, so it barely needs a tank.
  // AF is 75% solar, so it needs to carry its whole night.
  assert.ok(hours.EU < hours.AF / 2, `EU ${hours.EU} vs AF ${hours.AF}`);
  assert.ok(hours.EU > 2 && hours.EU < 4);
  assert.ok(hours.AF > 6 && hours.AF < 12);
  // And the sizing actually holds when you run it.
  for (const r of REGIONS) assert.ok(islandUnservedFrac(r.id, hours[r.id]) <= 0.0101);
});

// ───────────────────────────────────────────────────────────────── the demo

test("killing a cluster does not touch the others", () => {
  const grid = sizedGrid(0.01);
  const base = simulate({ grid, hours: 72 });
  for (const id of ["AP", "EU", "NA"] as const) {
    const k = simulate({ grid, hours: 72, kill: { regionId: id, atHour: 24 } });
    // The killed cluster loses the rest of the window, as it must.
    assert.ok(k.perRegion[id].unservedFrac > 0.6, `${id} did not actually go dark`);
    // Survivors do not move. That is the whole claim.
    assert.ok(
      Math.abs(k.survivorUnservedFrac - base.unservedFrac) < 0.002,
      `kill ${id}: survivors ${k.survivorUnservedFrac} vs baseline ${base.unservedFrac}`,
    );
  }
});

// ─────────────────────────────────────────────────────── contingency (seconds)

test("pooling really is better on RoCoF — do not pretend otherwise", () => {
  const grid = sizedGrid(0.01);
  const c = compareArchitectures({ kind: "generation", regionId: "AP", fraction: 0.2 }, { hourUtc: 12, grid });
  // Shared inertia. The ratio is serving_total / serving_AP, not a free lunch.
  assert.ok(c.pooled.worstRocofHzS > c.federated.worstRocofHzS);
  assert.ok(Math.abs(c.federated.worstRocofHzS / c.pooled.worstRocofHzS - 1.875) < 0.1);
  // And it is independent of the inertia constant, as the swing equation says.
  for (const inertiaS of [2, 4, 6]) {
    const x = compareArchitectures(
      { kind: "generation", regionId: "AP", fraction: 0.2 },
      { hourUtc: 12, grid, inertiaS },
    );
    assert.ok(Math.abs(x.federated.worstRocofHzS / x.pooled.worstRocofHzS - 1.875) < 0.1);
  }
});

test("pooling socializes the shed: better frequency, wider blackout", () => {
  const grid = sizedGrid(0.01);
  const c = compareArchitectures({ kind: "generation", regionId: "AP", fraction: 0.2 }, { hourUtc: 12, grid });
  // Federation sheds deeply in one cluster; the pool sheds shallowly everywhere.
  assert.ok(c.federated.lostLoadFrac < c.pooled.lostLoadFrac);
  assert.equal(c.federated.collapsed.length, 0);
  assert.equal(c.pooled.collapsed.length, 0);
  // UFLS arrests both above the generator trip floor.
  assert.ok(c.federated.minHz > F_GEN_TRIP);
  assert.ok(c.pooled.minHz > F_GEN_TRIP);
});

test("a common-mode fault is architecture-neutral in the frequency domain", () => {
  // [RESULT] A proportional loss gives the same RoCoF at any pool size.
  // The federation argument for this shock is blast radius, not inertia.
  const grid = sizedGrid(0.01);
  const c = compareArchitectures({ kind: "commonMode", fraction: 0.2 }, { hourUtc: 12, grid });
  assert.ok(Math.abs(c.federated.worstRocofHzS - c.pooled.worstRocofHzS) < 1e-9);
  assert.ok(Math.abs(c.federated.lostLoadFrac - c.pooled.lostLoadFrac) < 1e-9);
});

test("blast radius of one control plane is the argument that survives", () => {
  const grid = buildGrid();
  assert.equal(controlPlaneBlastRadius("pooled", grid), 1);
  const fed = controlPlaneBlastRadius("federated", grid);
  assert.ok(Math.abs(fed - 0.46) < 1e-9, `${fed}`);
  assert.ok(fed < 1);
});

test("a dark cluster takes its own load with it — the pool barely notices", () => {
  const grid = sizedGrid(0.01);
  const f = contingencyFederated({ kind: "region", regionId: "AP" }, { hourUtc: 12, grid });
  const p = contingencyPooled({ kind: "region", regionId: "AP" }, { hourUtc: 12, grid });
  assert.deepEqual(f.collapsed, ["AP"]);
  assert.deepEqual(p.collapsed, ["AP"]);
  // Nobody else trips in either architecture: losing gen AND load together is
  // not a frequency event. The naive "kill a cluster" demo belongs to the
  // energy timescale, not this one.
  assert.ok(f.islands.filter((i) => i.id !== "AP").every((i) => !i.collapsed));
  assert.ok(p.islands.filter((i) => i.id !== "AP").every((i) => !i.collapsed));
});

test("gridHeadline hands the UI numbers the UI must not compute", () => {
  const h = gridHeadline();
  // Latency and what it forbids.
  assert.ok(h.worstLatencyMs > 100 && h.worstLatencyMs < 200);
  assert.ok(Math.abs(h.worstRttMs - 2 * h.worstLatencyMs) < 1e-9);
  assert.ok(h.worstSettleS > h.arrestWindowS, "settling must exceed the arrest window");
  assert.equal(h.arrestPossible, false);
  assert.equal(h.synchronousPossible, false);
  assert.ok(h.shortestLinkKm > h.acLimitKm);
  // The bulkhead invariant, as shown on screen.
  assert.ok(h.peakImportFrac < 0.1);
  assert.ok(Math.abs(h.survivorUnservedFrac - h.baselineUnservedFrac) < 0.002);
  assert.ok(h.killedUnservedFrac > 0.6);
  // Blast radius.
  assert.equal(h.blastRadiusPooled, 1);
  assert.ok(h.blastRadiusFederated < h.blastRadiusPooled);
  // Storage sizing comes through, and EU is still the cheap tank.
  assert.ok(h.islandStorageHours.EU < h.islandStorageHours.AF / 2);
  // Nameplate loss on the transpacific tie. Absurd, and that is the finding:
  // nobody runs a 24,000 km line at rating. See economicLoadingFrac.
  assert.ok(h.worstLossFrac > 0.6 && h.worstLossFrac < 0.9);
  assert.equal(h.worstLossLinkId, "AP-NA");
});

// ─────────────────────────────────────────────────────── kill containment

test("killContainment compares like with like — the footgun is closed", () => {
  const grid = sizedGrid(0.01);
  for (const regionId of ["NA", "SA", "EU", "AF", "AP"] as const) {
    for (const [hours, warmupHours, atHour] of [
      [72, 0, 24],
      [48, 24, 24],
      [48, 0, 24],
    ] as const) {
      const c = killContainment({ grid, regionId, hours, warmupHours, atHour });
      // Same window, same four survivors: the delta is zero, not "small".
      assert.ok(Math.abs(c.deltaPp) < 1e-9, `${regionId} ${hours}/${warmupHours} -> ${c.deltaPp} pp`);
    }
  }
});

test("the naive delta is an artefact: 4 clusters measured against 5", () => {
  // This is the mistake this module invites. Lock it as a known-wrong value so
  // nobody reintroduces it as a headline number.
  const grid = sizedGrid(0.01);
  const base = simulate({ grid, hours: 48 });
  const kill = simulate({ grid, hours: 48, kill: { regionId: "AP", atHour: 24 } });
  const naive = (kill.survivorUnservedFrac - base.unservedFrac) * 100;
  const honest = killContainment({ grid, regionId: "AP", hours: 48, atHour: 24 }).deltaPp;
  assert.ok(Math.abs(naive) > 0.2, `naive delta ${naive} pp`);
  assert.ok(Math.abs(honest) < 1e-9);
  // And its sign flips with the cluster, which is the tell that it is spurious.
  const naiveNA =
    (simulate({ grid, hours: 48, kill: { regionId: "NA", atHour: 24 } }).survivorUnservedFrac -
      base.unservedFrac) * 100;
  assert.ok(naive * naiveNA < 0, `both deltas share a sign: ${naive} vs ${naiveNA}`);
});

test("a sized grid barely trades, so its containment result is near-vacuous", () => {
  // [KNOWN_LIMIT] sizeIslandStorageHours() sizes each cluster with
  // noTradeAllocator. Killing a cluster nobody depended on proves nothing.
  // The kill demo belongs on the undersized grid. Say so in the UI.
  const grid = sizedGrid(0.01);
  const ap = killContainment({ grid, regionId: "AP", hours: 72, atHour: 24 });
  assert.equal(ap.vacuous, true, "AP suddenly has counterparties — recheck the claim");
  const withTrade = simulate({ grid, hours: 72 });
  const without = simulate({ grid, hours: 72, allocator: noTradeAllocator });
  const gain = Math.max(
    ...REGIONS.map((r) => without.perRegion[r.id].unservedFrac - withTrade.perRegion[r.id].unservedFrac),
  );
  assert.ok(gain < 0.001, `trade is worth ${gain * 100} pp — the ties stopped being garnish`);
});

test("on the undersized grid the kill demo has something to lose", () => {
  const grid = buildGrid(); // 4 h storage: clusters do lean on the ties
  const na = killContainment({ grid, regionId: "NA", hours: 72, atHour: 24 });
  assert.equal(na.vacuous, false, "NA must be the exporter for this test to mean anything");
  assert.ok(na.deltaPp > 0, "losing the net exporter must cost the others something");
  // And even then it is a rounding error against a 7% baseline.
  assert.ok(na.deltaPp < 0.4, `${na.deltaPp} pp`);
  assert.ok(na.baselineUnservedFrac > 0.05);
});

test("gridHeadline no longer renders the artefact to screen", () => {
  const h = gridHeadline();
  // baseline and survivor must be the SAME four clusters, so the delta is real.
  assert.ok(Math.abs(h.survivorUnservedFrac - h.baselineUnservedFrac) < 1e-12);
  assert.ok(Math.abs(h.killDeltaPp) < 1e-9);
  assert.equal(h.killVacuous, true);
  // And the UI is handed the non-tautological number as well.
  assert.equal(h.exporterKillRegion, "NA");
  assert.ok(h.exporterKillDeltaPp > 0 && h.exporterKillDeltaPp < 0.4);
  assert.ok(h.exporterBaselineUnservedFrac > 0.05);
});

// ──────────────────────────────────────────── load-dependent transport loss

test("loss fraction is proportional to loading and to 1/V²", () => {
  const km = 5000;
  const full = hvdcLossAt(km, 1);
  assert.ok(Math.abs(hvdcLossAt(km, 0.5) - full / 2) < 1e-12, "not linear in loading");
  assert.equal(hvdcLossAt(km, 0), 0);
  // 1/V² applies to the LINE term only. Converter loss is valve switching and
  // conduction, not I²R in the conductor, so it does not scale with pole voltage.
  const line = (v: number) => hvdcLossAt(km, 1, v) - HVDC_CONVERTER_LOSS;
  assert.ok(Math.abs(line(1600) - line(800) / 4) < 1e-12, `${line(1600)} vs ${line(800) / 4}`);
  // +-1100 kV is built and running (Changji-Guquan): ~53% of the +-800 kV loss.
  assert.ok(Math.abs(line(1100) / line(800) - (800 / 1100) ** 2) < 1e-12);
  assert.ok(full > line(800));
});

test("every line has a maximum deliverable power at 50% efficiency", () => {
  for (const l of buildGrid().links) {
    const peakSent = 1 / (2 * l.lossSlopePerW);
    const delivered = peakSent * (1 - l.lossSlopePerW * peakSent);
    assert.ok(Math.abs(delivered - l.maxDeliverableW) / l.maxDeliverableW < 1e-12);
    // Maximum power transfer always lands at exactly half efficiency.
    assert.ok(Math.abs(delivered / peakSent - 0.5) < 1e-12);
    // Pushing past the peak delivers LESS. That is the physics, not a bug.
    const past = peakSent * 1.2;
    assert.ok(past * (1 - l.lossSlopePerW * past) < delivered);
  }
});

test("maxLoadingForLoss inverts the loss law exactly", () => {
  // The design-point helper: highest loading that still keeps loss under target.
  for (const km of [1000, 6000, 15000]) {
    for (const target of [0.05, 0.1, 0.2]) {
      const frac = maxLoadingForLoss(km, target);
      if (frac >= 1) continue; // short line, target unreachable from above
      assert.ok(Math.abs(hvdcLossAt(km, frac) - target) < 1e-12, `${km}km @${target}`);
    }
  }
  // Doubling the pole voltage roughly doubles the loading you can run at.
  assert.ok(maxLoadingForLoss(15000, 0.1, 1600) > maxLoadingForLoss(15000, 0.1, 800) * 3);
});

test("a long tie must be run at a fraction of its rating to be worth anything", () => {
  const apna = buildGrid().links.find((l) => l.id === "AP-NA")!;
  assert.ok(apna.loss > 0.6, "nameplate loss on 24,000 km should be brutal");
  // ...yet at its design point it is a perfectly ordinary cable.
  assert.ok(apna.economicLoadingFrac < 0.2, `${apna.economicLoadingFrac}`);
  assert.ok(apna.economicDeliveredW > 5e9 && apna.economicDeliveredW < 8e9);
  // Shorter ties can be loaded harder for the same loss.
  const euaf = buildGrid().links.find((l) => l.id === "EU-AF")!;
  assert.ok(euaf.economicLoadingFrac > apna.economicLoadingFrac);
});

test("overbuilding a cable makes it more efficient at a given flow", () => {
  const thin = buildGrid();
  const fat = buildGrid({ links: Object.fromEntries(LINKS.map((l) => [l.id, { capShare: 0.32 }])) });
  const a = thin.links.find((l) => l.id === "NA-EU")!;
  const b = fat.links.find((l) => l.id === "NA-EU")!;
  const flowW = 10e9;
  assert.ok(b.lossSlopePerW * flowW < a.lossSlopePerW * flowW, "fat cable is not cheaper");
  assert.ok(Math.abs((b.lossSlopePerW * flowW) / (a.lossSlopePerW * flowW) - 0.25) < 1e-9);
});

// ──────────────────────────────────────────── does the cable matter? (M2d)

test("raising capacity and voltage does make the tie structural", () => {
  const s = tieStudy({ capShares: [0.08, 1.0], voltagesKv: [800, 1100] });
  const thin = s.points.find((p) => p.capShare === 0.08 && p.voltageKv === 800)!;
  const fat = s.points.find((p) => p.capShare === 1.0 && p.voltageKv === 1100)!;
  // Garnish at 8%, load-bearing at 100%.
  assert.ok(thin.peakImportFrac < 0.05, `${thin.peakImportFrac}`);
  assert.ok(fat.peakImportFrac > 0.3, `${fat.peakImportFrac}`);
  // Monotone: more copper and more volts always move more energy.
  assert.ok(fat.tradeValuePp > thin.tradeValuePp * 5);
  // And killing a cluster starts to cost the others something real.
  assert.ok(fat.worstKillPp > thin.worstKillPp);
  assert.equal(fat.worstKillRegion, "NA");
});

test("...and it still buys almost no storage — the cable is not the answer", () => {
  // [RESULT] The headline of M2d, and it is a negative one.
  const s = tieStudy();
  assert.ok(s.storageHoursIslanded > 7 && s.storageHoursIslanded < 8);
  // A planetary ring at 100% of the smaller endpoint saves minutes, not hours.
  assert.ok(s.bestStorageSavingH < 0.15, `${s.bestStorageSavingH} h saved`);
  assert.ok(s.bestStorageSavingH > 0, "the tie should still be worth something");
  // Even at its best the tie recovers under 1 pp against a multi-pp baseline.
  assert.ok(Math.max(...s.points.map((p) => p.tradeValuePp)) < 1);
  // [KNOWN_LIMIT] No weather in this model. Wind is flat, the sky is clear.
  // The real case for interconnection is correlated weather, not day/night.
  assert.equal(WIND_CF, 0.35, "wind is still modeled as a constant");
});

test("the architecture is scale free — nothing breaks on the way to Type I", () => {
  const now = buildGrid();
  const typeI = buildGrid({ electricityW: P_I });
  const a = simulate({ grid: now, hours: 72 });
  const b = simulate({ grid: typeI, hours: 72 });
  // Every fraction is identical: the model is linear in total load.
  assert.ok(Math.abs(a.unservedFrac - b.unservedFrac) < 1e-12);
  for (const r of REGIONS) {
    assert.ok(Math.abs(a.perRegion[r.id].peakImportFrac - b.perRegion[r.id].peakImportFrac) < 1e-12);
  }
  // What changes is absolute: the tank. ~7.4 h of Type I is tens of PWh.
  const tankJ = P_I * 7.43 * 3600;
  const tankTWh = tankJ / 3.6e9 / 1e6;
  assert.ok(tankTWh > 60_000 && tankTWh < 90_000, `${tankTWh} TWh`);
  // Which is more than twice the world's entire annual electricity output today.
  assert.ok(tankTWh > 2 * ELECTRICITY_TWH_YR);
});

// ────────────────────────────────────── M2e: weather, and the attack on M2d

test("weather is opt-in: with it off the model is the M2d baseline exactly", () => {
  const a = simulate({ hours: 72 });
  const b = simulate({ hours: 72, weather: false });
  assert.equal(a.unservedFrac, b.unservedFrac);
  // And the geometry reduces to the equinox model on the equinox itself.
  for (const h of [0, 5, 9, 12, 15, 20]) {
    assert.ok(Math.abs(solarFactorGeo(h, 0, 0, 81, false) - solarFactor(h, 0)) < 2e-3, `h=${h}`);
  }
});

test("solar geometry matches the real seasonal swing", () => {
  // EU at 50.1°N: ~6× more daily insolation in June than in December.
  const summer = dailyInsolationFactor(50.1, 172);
  const winter = dailyInsolationFactor(50.1, 355);
  assert.ok(summer / winter > 5 && summer / winter < 7, `${summer / winter}`);
  // Day length follows: 16.2 h vs 7.8 h.
  assert.ok(Math.abs(daylightHours(50.1, 172) - 16.2) < 0.2);
  assert.ok(Math.abs(daylightHours(50.1, 355) - 7.8) < 0.2);
  // The tropics barely have a season, and the hemispheres are opposed.
  assert.ok(Math.abs(dailyInsolationFactor(1.35, 172) / dailyInsolationFactor(1.35, 355) - 1) < 0.1);
  assert.ok(dailyInsolationFactor(-15.8, 355) > dailyInsolationFactor(-15.8, 172));
  // Equinox is the reference point, by construction.
  assert.ok(Math.abs(dailyInsolationFactor(50.1, 81) - 1) < 0.02);
});

test("seasonality preserves annual energy — it moves it, it does not delete it", () => {
  // Otherwise the experiment would be measuring an accidental fleet shrink.
  for (const r of REGIONS) {
    let flat = 0;
    let geo = 0;
    for (let h = 0; h < 8760; h++) {
      flat += solarFactor(h, r.lon);
      geo += solarFactorGeo(h, r.lat, r.lon, 1 + Math.floor(h / 24));
    }
    assert.ok(Math.abs(geo / flat - 1) < 0.005, `${r.id} annual energy moved by ${geo / flat}`);
  }
  // The un-normalized truth, kept as a finding: the equinox is not the average
  // day, so equinox sizing misestimates annual yield by −4% to +2%.
  assert.ok(annualMeanInsolationFactor(1.35) < 0.97);
  assert.ok(annualMeanInsolationFactor(50.1) > 1.01);
});

test("the seasonal penalty is a mid-latitude tax, and it tracks |lat|", () => {
  const w = weatherStudy();
  assert.ok(w.seasonalUnservedFrac > w.aseasonalUnservedFrac);
  // Tropics: untouched. Mid-latitudes: hammered.
  assert.ok(Math.abs(w.perRegion.AF.penaltyPp) < 1, `AF ${w.perRegion.AF.penaltyPp}`);
  assert.ok(Math.abs(w.perRegion.AP.penaltyPp) < 1, `AP ${w.perRegion.AP.penaltyPp}`);
  assert.ok(w.perRegion.EU.penaltyPp > 4, `EU ${w.perRegion.EU.penaltyPp}`);
  assert.ok(w.perRegion.NA.penaltyPp > 4, `NA ${w.perRegion.NA.penaltyPp}`);
  // Mid-latitudes carry an order of magnitude more seasonal penalty than tropics.
  assert.ok(w.perRegion.EU.penaltyPp > 5 * Math.abs(w.perRegion.AP.penaltyPp));
  // EU is the highest latitude and takes the biggest hit of the two.
  assert.ok(Math.abs(w.perRegion.EU.latDeg) > Math.abs(w.perRegion.NA.latDeg));
});

test("seasonal storage is a different order of magnitude from diurnal storage", () => {
  const grid = overbuiltGrid(1, { storageHours: 4000 });
  const eu = seasonalStorageHours("EU", { grid });
  const af = seasonalStorageHours("AF", { grid });
  // Days-to-weeks at mid latitude, hours at the equator.
  assert.ok(eu > 100, `EU seasonal store ${eu} h`);
  assert.ok(af < 100, `AF seasonal store ${af} h`);
  assert.ok(eu > af * 3);
});

test("[THE ATTACK] weather does not rescue the cable — a magic wire barely does", () => {
  const w = weatherStudy();
  // A wire with infinite capacity and zero loss. Not buildable. Still marginal.
  assert.ok(w.magicSavedPp < 1, `an impossible wire saved ${w.magicSavedPp} pp`);
  // And the real ±1100 kV ring already captures most of that.
  assert.ok(w.ringCapturesOfMagic > 0.7, `real ring gets ${w.ringCapturesOfMagic} of the impossible`);
  // It recovers a small slice of a much bigger hole.
  assert.ok(w.magicSavedPp / (w.seasonalUnservedFrac * 100) < 0.25);
});

test("overbuild is the lever the cable is not", () => {
  const H = 8760;
  const at = (k: number) =>
    simulate({ grid: overbuiltGrid(k, { storageHours: 7.43 }), hours: H, weather: true, allocator: noTradeAllocator })
      .unservedFrac;
  const base = at(1);
  const more = at(1.5);
  assert.ok(base > 0.03, `${base}`);
  // Half again as much generation, islanded, no cable at all: the problem ends.
  assert.ok(more < 1e-6, `1.5x overbuild still leaves ${more}`);
  // Which is ~100x what the entire planetary ring achieved on the same grid.
  const w = weatherStudy();
  assert.ok(base - more > (w.ringSavedPp / 100) * 5);
});

// ────────────────────────── M2f: seasonal demand and electrified heat

test("seasonal demand moves load around the year without changing the total", () => {
  for (const he of [0, 0.5, 1]) {
    for (const r of REGIONS) {
      let sum = 0;
      for (let d = 1; d <= 365; d++) sum += loadSeasonFactor(r.lat, d, he);
      assert.ok(Math.abs(sum / 365 - 1) < 1e-9, `${r.id} he=${he} mean ${sum / 365}`);
    }
  }
});

test("both demand anchors are hit exactly, and the hemispheres are not swapped", () => {
  // EU 50°N winter/summer = 1.20 today, 2.00 with heat on the grid.
  // Tolerance is 1e-4, not 1e-12: day 172 is not exactly half a tropical year
  // from day 355, so cos() lands at −0.999979 rather than −1.
  assert.ok(Math.abs(loadSeasonFactor(50, 355, 0) / loadSeasonFactor(50, 172, 0) - 1.2) < 1e-4);
  assert.ok(Math.abs(loadSeasonFactor(50, 355, 1) / loadSeasonFactor(50, 172, 1) - 2.0) < 1e-4);
  // Equatorial cooling peak = 1.15, and heat electrification must not touch it.
  assert.ok(Math.abs(loadSeasonFactor(0, 172, 0) / loadSeasonFactor(0, 355, 0) - 1.15) < 1e-4);
  assert.ok(Math.abs(loadSeasonFactor(0, 172, 1) / loadSeasonFactor(0, 355, 1) - 1.15) < 1e-4);
  // Southern hemisphere: heating peaks in JUNE, not December.
  assert.ok(loadSeasonFactor(-40, 172, 1) > loadSeasonFactor(-40, 355, 1));
  assert.ok(loadSeasonFactor(40, 355, 1) > loadSeasonFactor(40, 172, 1));
});

test("[M2f] electrified heat is the first thing that makes transmission matter", () => {
  const today = weatherStudy({ heatElectrification: 0 });
  const electrified = weatherStudy({ heatElectrification: 1 });
  // Less sun and more load on the same December day. The two compound.
  assert.ok(electrified.seasonalUnservedFrac > today.seasonalUnservedFrac * 1.4);
  assert.ok(electrified.perRegion.EU.seasonal > 0.12, `EU ${electrified.perRegion.EU.seasonal}`);
  // The cable's value roughly doubles...
  assert.ok(electrified.ringSavedPp > today.ringSavedPp * 1.5);
  // ...and the gap to an impossible wire WIDENS, which is the tell that
  // transmission has finally started to bind rather than sitting idle.
  const gapToday = today.magicSavedPp - today.ringSavedPp;
  const gapElectrified = electrified.magicSavedPp - electrified.ringSavedPp;
  assert.ok(gapElectrified > gapToday, "a better cable should now be worth building");
  assert.ok(electrified.ringCapturesOfMagic < today.ringCapturesOfMagic);
});

test("[M2f] overbuild still wins, but the bill goes up with electrified heat", () => {
  const clears = (he: number) => {
    for (const k of [1, 1.25, 1.5, 1.75, 2, 2.5, 3]) {
      const u = simulate({
        grid: overbuiltGrid(k, { storageHours: 7.43 }),
        hours: 8760,
        weather: true,
        heatElectrification: he,
        allocator: noTradeAllocator,
      }).unservedFrac;
      if (u < 1e-4) return k;
    }
    return Infinity;
  };
  const now = clears(0);
  const later = clears(1);
  assert.ok(now <= 1.5, `today needs ${now}x`);
  assert.ok(later > now, "electrifying heat must raise the overbuild bill");
  assert.ok(later <= 2, `electrified needs ${later}x`);
  // Still islanded, still no cable at all. That is the comparison that matters.
});
