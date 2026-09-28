import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { SiteFooter } from "@/components/site-footer";
import { OrbitBench } from "@/components/orbit-bench";
import { LayerResearch } from "@/components/layer-research";
import { MediaTile } from "@/components/media-tile";
import { Stage, DataStrip } from "@/components/stage";
import { AM0 } from "@/lib/physics";
import {
  H_GEO_KM,
  HOHMANN_LEO_GEO,
  ISS,
  ORBITS,
  PANEL_W_M2,
  TYPE_I_PV,
  V_ESCAPE,
  circular,
} from "@/lib/orbit";
import { fmt } from "@/lib/utils";

export const Route = createFileRoute("/space")({ component: SpacePage });

function SpacePage() {
  return (
    <Shell bleed>
      <Stage src="/media/orbit-sat.mp4" poster="/media/ai-sat.jpg" hint>
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">Space · LEO</p>
        <h1 className="k-line">{(ISS.v / 1000).toFixed(2)} km/s</h1>
        <p className="mt-4 font-sans text-5xl text-warn sm:text-7xl">{ISS.gFrac.toFixed(2)} g</p>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          ISS 408 km. You are not weightless because gravity died. You are missing the ground. Circular two-body, IAU
          μ. Not a poster.
        </p>
      </Stage>

      <DataStrip
        items={[
          { k: "LEO v", v: `${(ISS.v / 1000).toFixed(2)} km/s` },
          { k: "Period", v: `${(ISS.periodS / 60).toFixed(1)} min` },
          { k: "g", v: `${ISS.gFrac.toFixed(2)} g` },
          { k: "AM0", v: `${AM0} W/m²` },
        ]}
      />

      <Stage src="/media/am0.mp4" poster="/media/am0.jpg">
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">Dawn-dusk SSO</p>
        <h2 className="k-line">The sun does not set.</h2>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          Sun in the orbit plane: {(ISS.eclipseFrac * 100).toFixed(0)}% night at ISS — {ISS.eclipseMin.toFixed(0)} min
          of eclipse. Dawn-dusk SSO parks β near 90°. Night goes toward zero. That is why compute lives there, not in
          GEO.
        </p>
      </Stage>

      <Stage src="/media/launch.mp4" poster="/media/launch.jpg" veil="night">
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">The valve</p>
        <h2 className="k-line">kg / week</h2>
        <p className="mt-4 font-sans text-5xl text-warn sm:text-7xl">
          {(V_ESCAPE / 1000).toFixed(2)} km/s escape
        </p>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          Surface escape {(V_ESCAPE / 1000).toFixed(2)} km/s. LEO costs ~9.4 km/s with gravity and drag. Starship
          claimed 100 t reusable — cadence is not a factory yet. Without kg/week the constellation is a filing. The
          vehicle lives on the IGNIOS site.
        </p>
      </Stage>

      <DataStrip
        items={[
          { k: "Escape", v: `${(V_ESCAPE / 1000).toFixed(2)} km/s` },
          { k: "GEO", v: `${Math.round(H_GEO_KM).toLocaleString("en-US")} km` },
          { k: "LEO→GEO", v: `${(HOHMANN_LEO_GEO.dv / 1000).toFixed(2)} km/s` },
          { k: "Panel", v: `${PANEL_W_M2.toFixed(0)} W/m²` },
        ]}
      />

      <Stage src="/media/tracks.mp4" poster="/media/constellation.jpg">
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">Type I as a sheet</p>
        <p className="k-line">{Math.round(TYPE_I_PV.areaM2 / 1e6).toLocaleString("en-US")} km²</p>
        <p className="mt-4 font-sans text-5xl text-warn sm:text-7xl">{fmt(TYPE_I_PV.flights, 0)} flights</p>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          10,000 TW at {PANEL_W_M2.toFixed(0)} W/m² (AM0 × 28% × SSO duty × bus). 1.2 kg/m² × 100 t / launch. Type I as
          photovoltaic swarm is {fmt(TYPE_I_PV.years, 0)} years at 3/day. The sheet has to get lighter, or this is not
          the architecture.
        </p>
      </Stage>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <section>
          <p className="font-mono text-xs tracking-[0.22em] text-subtle uppercase">Parks</p>
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {ORBITS.map((b) => {
              const o = circular(b.hKm);
              const period = o.periodS >= 3600 ? `${(o.periodS / 3600).toFixed(1)} h` : `${(o.periodS / 60).toFixed(0)} min`;
              return (
                <li key={b.id} className="grid gap-2 py-5 sm:grid-cols-[8rem_7rem_7rem_6rem_1fr] sm:items-baseline">
                  <p>{b.name}</p>
                  <p className="font-mono text-xs tabular-nums text-muted">{b.hKm.toLocaleString("en-US")} km</p>
                  <p className="font-mono text-xs tabular-nums text-muted">{(o.v / 1000).toFixed(2)} km/s</p>
                  <p className="font-mono text-xs tabular-nums text-muted">{period}</p>
                  <p className="text-sm text-muted">{b.note}</p>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-16">
          <p className="font-mono text-xs tracking-[0.22em] text-subtle uppercase">Model</p>
          <h2 className="mt-2 font-sans text-4xl">Altitude, sheet, cadence.</h2>
          <p className="mt-3 max-w-xl text-sm text-muted">
            Move the orbit. Then move how heavy the watt is. If years stay in the thousands, this is not how Type I
            flies.
          </p>
          <div className="mt-8">
            <OrbitBench />
          </div>
        </section>

        <div className="mt-10 grid gap-3 md:grid-cols-3">
          <MediaTile className="h-52" src="/media/pad.mp4" poster="/media/starship.jpg" label="Starship — kg to LEO" />
          <MediaTile className="h-52" src="/media/radiator.mp4" poster="/media/radiator.jpg" label="Heat — σT⁴" />
          <MediaTile className="h-52" src="/media/constellation.jpg" label="Debris — catalog, not Kessler-as-date" />
        </div>

        <section className="mt-16 grid gap-px bg-border sm:grid-cols-3">
          <article className="bg-bg p-6">
            <p className="font-mono text-xs text-subtle">Belts</p>
            <p className="mt-2 font-sans text-3xl">1–12 / 13–60 Mm</p>
            <p className="mt-3 text-sm text-muted">
              Inner protons, outer electrons. SSO 550 km sits under the inner belt. The South Atlantic Anomaly still
              hits. GEO and GPS sit in the weather. Commodity GPU is not a belt payload.
            </p>
          </article>
          <article className="bg-bg p-6">
            <p className="font-mono text-xs text-subtle">Catalog</p>
            <p className="mt-2 font-sans text-3xl">~4×10⁴ tracked</p>
            <p className="mt-3 text-sm text-muted">
              USSPACECOM. Debris larger than 1 cm is ~10⁶. Kessler is a collision rate, not a date. A million-sat filing without
              deorbit is architecture as debris.
            </p>
          </article>
          <article className="bg-bg p-6">
            <p className="font-mono text-xs text-subtle">Starlink ≠ compute</p>
            <p className="mt-2 font-sans text-3xl">Same rocket</p>
            <p className="mt-3 text-sm text-muted">
              Thousands already at ~550 km. Communications, not 120 kW radiators. Starmind is a different payload on
              the same valve. See{" "}
              <Link to="/plan" className="text-fg underline-offset-4 hover:underline">
                Plan
              </Link>
              .
            </p>
          </article>
        </section>
      </div>
      <LayerResearch layer="Space" />
      <SiteFooter />
    </Shell>
  );
}
