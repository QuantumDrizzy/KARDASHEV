import { useMemo, useState } from "react";
import { Stat } from "@/components/stat";
import { SliderField } from "@/components/slider-field";
import {
  buildGrid,
  compareArchitectures,
  killContainment,
  REGIONS,
  type RegionId,
} from "@/lib/grid";
import { allocatorComparison } from "@/lib/grid-qubo";
import { fmt } from "@/lib/utils";

const REGION_IDS: readonly RegionId[] = REGIONS.map((r) => r.id);

export function GridBench() {
  // buildGrid() is cheap; sizedGrid() is not, and the kill demo must run on the
  // unsized grid (sized clusters are self-sufficient by construction).
  const grid = useMemo(() => buildGrid(), []);
  const [killRegion, setKillRegion] = useState<RegionId>("EU");
  const [shockFraction, setShockFraction] = useState(0.5);
  const [shockRegion, setShockRegion] = useState<RegionId>("EU");

  // THE ONLY correct way to measure a kill (contract): same window, same survivors,
  // vacuous flagged when the killed cluster had no counterparty.
  const kill = useMemo(
    () => killContainment({ grid, regionId: killRegion, hours: 72 }),
    [grid, killRegion],
  );

  // Both sides of the architecture argument, no cherry-picking. Pooling usually
  // wins the single random contingency; federation wins the correlated one and
  // is the only option that physically exists across an ocean.
  const arch = useMemo(
    () =>
      compareArchitectures({
        kind: "generation",
        regionId: shockRegion,
        fraction: shockFraction,
      }),
    [grid, shockRegion, shockFraction],
  );

  // The ADR-M2 measurement: greedy vs exhaustive vs QUBO on unserved energy.
  // The lib's own verdict: the QUBO does not earn its place on this grid. The
  // bench shows that number instead of hiding it.
  const allocators = useMemo(() => allocatorComparison({ hours: 720 }), []);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat
          label={`Kill ${killRegion} · Δpp unserved`}
          value={`${kill.deltaPp >= 0 ? "+" : ""}${fmt(kill.deltaPp, 2)} pp`}
          tone={kill.deltaPp > 0.05 ? "danger" : "default"}
          hint={`baseline ${fmt(kill.baselineUnservedFrac * 100, 2)}% -> survivor ${fmt(kill.survivorUnservedFrac * 100, 2)}%`}
        />
        <Stat
          label="Killed trade before death"
          value={`${fmt(kill.killedExportJ / 3.6e12, 2)} TWh out`}
          hint={`${fmt(kill.killedImportJ / 3.6e12, 2)} TWh in`}
        />
        <Stat
          label="Containment"
          value={kill.vacuous ? "vacuous" : "measured"}
          tone={kill.vacuous ? "warn" : "ok"}
          hint={kill.vacuous ? "no counterparty: the delta is a tautology" : "same window, same four survivors"}
        />
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="font-mono text-xs tracking-wide text-subtle uppercase">Kill switch</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {REGION_IDS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setKillRegion(r)}
                className={`border px-3 py-1 font-mono text-xs ${
                  killRegion === r ? "border-foreground" : "border-border text-subtle"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <p className="mt-3 max-w-xl text-sm text-muted">
            Measured over the same window against the same four surviving clusters. A
            cluster nobody depended on proves nothing, and the bench says so instead of
            printing a zero.
          </p>
        </div>
        <div>
          <p className="font-mono text-xs tracking-wide text-subtle uppercase">
            Generation shock (federated vs pooled)
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {REGION_IDS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setShockRegion(r)}
                className={`border px-3 py-1 font-mono text-xs ${
                  shockRegion === r ? "border-foreground" : "border-border text-subtle"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <SliderField
              label="Shock fraction"
              value={shockFraction}
              min={0.1}
              max={1.0}
              step={0.05}
              onChange={(v) => setShockFraction(v)}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Single contingency"
          value={arch.poolingWinsOnThisShock ? "pooling wins" : "federation wins"}
          hint={`lost-load ratio ${fmt(arch.lostLoadRatio, 2)}`}
          tone={arch.poolingWinsOnThisShock ? "warn" : "ok"}
        />
        <Stat
          label="Worst latency"
          value={`${fmt(arch.worstLatencyMs, 0)} ms`}
          hint={`${fmt(arch.longestLinkKm, 0)} km great circle`}
        />
        <Stat
          label="Worst settle"
          value={`${fmt(arch.worstSettleS, 2)} s`}
          hint="arrest window 0.5 s — ties carry energy, never frequency"
        />
        <Stat
          label="Synchronous across oceans"
          value={arch.synchronousPossible ? "possible" : "excluded"}
          tone={arch.synchronousPossible ? "ok" : "ok"}
          hint="ocean ties must be HVDC = asynchronous"
        />
      </div>

      <p className="mt-4 max-w-2xl text-sm text-muted">
        Pooling usually wins the single random contingency — shared inertia is real, and
        the bench shows it when it happens. What federation buys is a contained footprint
        and the only architecture that physically exists across an ocean: every ocean tie
        is HVDC, so a global synchronous pool is excluded by physics, not by taste.
      </p>

      <section className="mt-8 border border-border p-5">
        <h2 className="font-mono text-xs tracking-wide text-subtle uppercase">
          Allocator comparison · 720 h, weather on (ADR-M2 §Decision 4)
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {allocators.map((a) => (
            <Stat
              key={a.label}
              label={a.label}
              value={`${fmt(a.unservedFrac * 100, 3)} % unserved`}
              tone={a.gapPp === 0 ? "ok" : "default"}
              hint={`gap ${fmt(a.gapPp, 2)} pp · traded ${fmt(a.tradedJ / 3.6e12, 1)} TWh · ${a.ms} ms`}
            />
          ))}
        </div>
        <p className="mt-4 max-w-2xl text-sm text-muted">
          Measured, not asserted: the QUBO-class allocator earns its place only if it beats
          greedy on unserved energy on this grid. The number above is the verdict; if the
          QUBO ever stops losing, the test in <code>src/lib/grid-qubo.test.ts</code> is the
          place that notices first.
        </p>
      </section>
    </div>
  );
}
