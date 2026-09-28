/**
 * GRID BENCH — M2b. Owner/Grok fills the interior. Claude owns `src/lib/grid.ts`.
 *
 * RULE: every number comes from `@/lib/grid`. No literals in this file except
 * labels and units. If a number you want does not exist in the lib, it is a lib
 * change plus a test in `src/lib/grid.test.ts` — not an expression in JSX.
 *
 * ── Contract (docs/ADR-M2-GRID.md) ───────────────────────────────────────────
 *
 *   buildGrid()          5 regions, 6 links. Per link: km, latencyMs, loss,
 *                        capacityW, mustBeHvdc, breakerS, control{ rttMs,
 *                        settleS, rocofArrest, frequencyContainment,
 *                        economicDispatch }. Per region: meanLoadW, solarPeakW,
 *                        windW, windNameplateW, firmW, storageJ, storagePowerW.
 *                        Cheap — safe to call per render.
 *
 *   sizedGrid(0.01)      Same, with storage solved so each cluster islands.
 *                        EXPENSIVE (~50 ms, runs bisected sims). useMemo it.
 *
 *   simulate({ grid, hours, kill: { regionId, atHour }, allocator })
 *                        -> steps[]        per hour, per region: loadW, solarW,
 *                                          windW, firmW, storageW, socFrac,
 *                                          importW, exportW, unservedW,
 *                                          curtailedW; plus flows[]
 *                        -> perRegion      unservedFrac, peakImportFrac, energies
 *                        -> survivorUnservedFrac   <- the containment metric
 *
 *   compareArchitectures(shock, { hourUtc, grid, inertiaS })
 *                        shock: { kind: "generation", regionId, fraction }
 *                             | { kind: "region", regionId }
 *                             | { kind: "link", linkId }
 *                             | { kind: "commonMode", fraction }
 *                        -> federated / pooled: minHz, worstRocofHzS,
 *                           lostLoadFrac, collapsed[], islands[]
 *                        -> blastRadiusFederated / blastRadiusPooled
 *
 *   gridHeadline()       The four DataStrip numbers, precomputed. Already used
 *                        by the route — do not recompute them here.
 *
 *   killContainment({ grid, regionId, hours, warmupHours, atHour })
 *                        THE ONLY correct way to measure a kill. Returns
 *                        deltaPp measured over the same window and the same
 *                        four survivors, plus `vacuous` — true when the killed
 *                        cluster had no counterparty, which makes its delta a
 *                        tautology. If vacuous, show that, not the zero.
 *
 * NEVER compute `kill.survivorUnservedFrac - base.unservedFrac`. That is four
 * clusters measured against five. It fabricates +-0.1-0.3 pp with a sign that
 * tracks nothing physical. Locked as known-wrong in grid.test.ts.
 *
 * Run the kill demo on buildGrid() (4 h storage), not sizedGrid(): sized
 * clusters are self-sufficient by construction, so killing one proves nothing.
 *
 * Sliders that actually change the answer: storageHours (per region, via
 * buildGrid overrides), capShare, inertiaS 2-6, shock fraction, hourUtc.
 * Plus a kill switch per node.
 *
 * ── Copy guardrails (CLAUDE.md invariant 7) ──────────────────────────────────
 * Three legs only:
 *   1. Ocean ties must be HVDC = asynchronous. A global synchronous pool is
 *      physically excluded, not rejected by taste.
 *   2. Loop settling over these links is 0.7-1.6 s, above the 0.5 s arrest
 *      window. Ties carry energy and schedule, never frequency.
 *   3. One control plane reaches 100% of world load pooled vs 46% federated.
 *
 * NEVER write "the global pool would have cascaded". Pooling genuinely wins on
 * RoCoF (-0.67 vs -1.25 Hz/s). What federation buys is a contained footprint.
 * If the bench shows pooling winning something, show it. That is the point.
 */

export function GridBench() {
  return (
    <div className="border border-border p-6">
      <p className="font-mono text-xs tracking-wide text-subtle uppercase">Bench</p>
      <p className="mt-3 font-sans text-3xl">Not wired yet.</p>
      <p className="mt-3 max-w-xl text-sm text-muted">
        Model, tests and locks live in <code>src/lib/grid.ts</code>. The interactive bench —
        sliders, kill switch, federated vs pooled contingency — is M2b. Contract at the top
        of this file and in <code>docs/ADR-M2-GRID.md</code>.
      </p>
    </div>
  );
}
