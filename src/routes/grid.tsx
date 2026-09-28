import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { SiteFooter } from "@/components/site-footer";
import { LayerResearch } from "@/components/layer-research";
import { GridBench } from "@/components/grid-bench";
import { Stage, DataStrip } from "@/components/stage";
import { buildGrid, gridHeadline } from "@/lib/grid";
import {
  MC_TODAY,
  SIZING_CORRECTION,
  singleYearOptimismFactor,
} from "@/lib/grid-reliability";


export const Route = createFileRoute("/grid")({ component: GridPage });

const pct = (x: number, d = 1) => `${(x * 100).toFixed(d)}%`;
// fmt() renders 14,903 as "15 k" and 1,574 as "2 k". For distances and powers
// that loses the number, so these format plainly with separators.
const km = (x: number) => `${Math.round(x).toLocaleString("en-US")} km`;
const gw = (x: number) => `${Math.round(x / 1e9).toLocaleString("en-US")} GW`;
const tw = (x: number) => (x / 1e12).toFixed(2);

function GridPage() {
  // gridHeadline() solves storage by bisection over repeated sims. Once.
  const h = useMemo(() => gridHeadline(), []);
  const grid = useMemo(() => buildGrid(), []);
  const rel = MC_TODAY;
  const correction = SIZING_CORRECTION.find((r) => r.overbuild === 1.15)!;
  const det = correction.deterministicHours;
  const p95 = correction.p95Hours;

  return (
    <Shell bleed>
      <Stage src="/media/earth-night.mp4" poster="/media/earth-night.jpg" veil="night" hint>
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">Grid · bulkheads</p>
        <h1 className="k-line">Latency is physics.</h1>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          Five continental clusters, {grid.links.length} ties, {tw(grid.totalMeanLoadW)} TW of
          electrons. The longest tie is {km(h.longestLinkKm)} — {h.worstLatencyMs.toFixed(0)} ms one
          way, {h.worstRttMs.toFixed(0)} ms round trip. A loop closed over it settles in{" "}
          {h.worstSettleS.toFixed(1)} s. Frequency has to be arrested in {h.arrestWindowS} s. Nobody
          arbitrates a continental contingency from another continent.
        </p>
      </Stage>

      <DataStrip
        items={[
          { k: "Worst link", v: `${h.worstLatencyMs.toFixed(0)} ms` },
          { k: "Settling vs arrest", v: `${h.worstSettleS.toFixed(1)} s / ${h.arrestWindowS} s` },
          { k: "Peak import", v: pct(h.peakImportFrac) },
          {
            k: `Kill ${h.exporterKillRegion}, 4 h fleet`,
            v: `+${h.exporterKillDeltaPp.toFixed(2)} pp`,
          },
        ]}
      />

      <Stage src="/media/tracks.mp4" poster="/media/constellation.jpg">
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">Leg 1 · excluded</p>
        <p className="k-line">No global sync</p>
        <p className="mt-4 font-sans text-5xl text-warn sm:text-7xl">{h.acLimitKm} km</p>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          AC submarine cable dies at about {h.acLimitKm} km on capacitive charging current. The
          shortest tie here is {km(h.shortestLinkKm)}. Every one must be HVDC, and HVDC is
          asynchronous by construction. A single planetary synchronous grid is not a design choice
          anyone gets to make — it is excluded. ERCOT, Hydro-Québec and Japan&apos;s 50/60 Hz split
          are asynchronous ties running today.
        </p>
      </Stage>

      <Stage src="/media/datacenter.mp4" poster="/media/datacenter.jpg">
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">Leg 2 · timescale</p>
        <p className="k-line">Energy, never frequency</p>
        <p className="mt-4 font-sans text-5xl text-warn sm:text-7xl">{h.worstSettleS.toFixed(1)} s</p>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          Delay-limited crossover at ω = 0.6 / RTT, settling at 4τ. Every tie fails the{" "}
          {h.arrestWindowS} s arrest window and passes the 30 s reserve and the 15 min market. So the
          ties carry surplus energy and schedule — never a frequency loop. Worst transport loss is{" "}
          {pct(h.worstLossFrac)} on {h.worstLossLinkId} — at nameplate. Nobody runs a 24,000 km line
          at rating: loss is proportional to the power you push, so its design point is 14% loading
          and an ordinary 10% loss. A long tie is not lossy, it is massively overbuilt.
        </p>
      </Stage>

      <Stage src="/media/earth.jpg" veil="night">
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">Leg 3 · blast radius</p>
        <p className="k-line">One control plane</p>
        <p className="mt-4 font-sans text-5xl text-warn sm:text-7xl">
          {pct(h.blastRadiusFederated, 0)} vs {pct(h.blastRadiusPooled, 0)}
        </p>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          A common-mode fault — firmware, grid-code, a compromised operator — is architecture-neutral
          in the frequency domain. Where architecture decides is reach: one control plane covers the
          whole pool, or one bulkhead. Same kernel, different hardware. Offline-stable.
        </p>
      </Stage>

      <DataStrip
        items={[
          { k: "Clusters", v: `${grid.regions.length}` },
          { k: "Ties", v: `${grid.links.length}` },
          { k: "Worst loss", v: `${pct(h.worstLossFrac)} · ${h.worstLossLinkId}` },
          { k: "Sync possible", v: h.synchronousPossible ? "yes" : "no" },
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <section>
          <p className="font-mono text-xs tracking-[0.22em] text-subtle uppercase">Model</p>
          <h2 className="mt-2 font-sans text-4xl">Storage is priced by the mix, not by the size.</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            Hours of mean load each cluster needs to ride its own night with zero import, solved by
            bisection — not chosen. Wind and firm buy you tank; a solar-heavy cluster carries its
            whole night.
          </p>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            <span className="text-warn">These are single-year figures.</span> They compare mixes
            against each other, which is what they are for. They are <em>not</em> a tank you would
            build: unserved energy is convex in the shortfall, so mean-preserving weather noise
            raises it. Across {rel.samples.toLocaleString("en-US")} synthetic years the same 1%
            target needs{" "}
            <span className="text-warn">
              ×{Math.round(singleYearOptimismFactor(1.15) ?? 0)}
            </span>{" "}
            more storage at ×1.15 overbuild — {det} h becomes {p95} h at 95% confidence.
          </p>
          <div className="mt-8 grid gap-px bg-border sm:grid-cols-5">
            {grid.regions.map((r) => (
              <article key={r.id} className="bg-bg p-6">
                <p className="font-mono text-xs text-subtle">{r.id}</p>
                <p className="mt-2 font-sans text-4xl">{h.islandStorageHours[r.id].toFixed(1)} h</p>
                <p className="mt-3 text-sm text-muted">
                  {r.name}. {gw(r.meanLoadW)} mean, {pct(r.solarShare, 0)} solar,{" "}
                  {pct(r.windShare, 0)} wind, {pct(r.firmShare, 0)} firm.
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <p className="font-mono text-xs tracking-[0.22em] text-subtle uppercase">Bench</p>
          <h2 className="mt-2 font-sans text-4xl">Move it until it breaks.</h2>
          <p className="mt-3 max-w-xl text-sm text-muted">
            First-order, not a PDR. Interties are capped at a fraction of the smaller endpoint, so
            import stays garnish — peak {pct(h.peakImportFrac)} across the run.
          </p>
          <p className="mt-3 max-w-xl text-sm text-muted">
            Kill a cluster in a grid sized to island and nothing happens, because nothing depended
            on it: {h.killedRegion} trades {h.killVacuous ? "nothing at all" : "very little"}, so its
            Δ of {h.killDeltaPp.toFixed(2)} pp is a tautology, not a result. The test with something
            to lose runs on today&apos;s 4 h fleet, where the clusters do lean on the cable. There,
            losing the net exporter {h.exporterKillRegion} costs the others{" "}
            <span className="text-warn">+{h.exporterKillDeltaPp.toFixed(2)} pp</span> against a{" "}
            {pct(h.exporterBaselineUnservedFrac)} baseline. Every other cluster: exactly zero.
          </p>
          <div className="mt-8">
            <GridBench />
          </div>
        </section>
      </div>

      <LayerResearch layer="Energy" />
      <SiteFooter />
    </Shell>
  );
}
