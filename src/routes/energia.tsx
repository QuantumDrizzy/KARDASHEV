import { Link, createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { SiteFooter } from "@/components/site-footer";
import { LayerResearch } from "@/components/layer-research";
import { EnergyBench } from "@/components/energy-bench";
import { MediaTile } from "@/components/media-tile";
import { Stage, DataStrip } from "@/components/stage";
import { usePower } from "@/components/use-power";
import { GAP_I, P_I, fmtTW } from "@/lib/kardashev";
import { AM0 } from "@/lib/physics";
import { DATACENTER_W, ELECTRICITY_W, NUCLEAR_W, P_INTERCEPT, TYPE_I_OF_DISK, fmtWps } from "@/lib/facts";

export const Route = createFileRoute("/energia")({ component: EnergiaPage });

function EnergiaPage() {
  const { p, wps } = usePower();
  return (
    <Shell bleed>
      <Stage src="/media/sun.mp4" poster="/media/sun.jpg" veil="sun" hint>
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">Energy · AM0</p>
        <h1 className="k-line">The sun is already here.</h1>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          Type I = {fmtTW(P_I, 0)}. Now {fmtTW(p)}. ×{Math.round(GAP_I)}. It does not close in Texas. {AM0} W/m² outside
          the atmosphere. {(TYPE_I_OF_DISK * 100).toFixed(1)}% of the light the planet already blocks.
        </p>
      </Stage>

      <DataStrip
        items={[
          { k: "AM0", v: `${AM0} W/m²` },
          { k: "Type I", v: fmtTW(P_I, 0) },
          { k: "Now", v: fmtTW(p) },
          { k: "Inertia", v: `+${fmtWps(wps)}` },
        ]}
      />

      <Stage src="/media/am0.mp4" poster="/media/am0.jpg">
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">The disk</p>
        <p className="k-line">
          {(P_INTERCEPT / 1e12).toLocaleString("en-US", { maximumFractionDigits: 0 })} TW
        </p>
        <p className="mt-4 font-sans text-5xl text-warn sm:text-7xl">
          {(TYPE_I_OF_DISK * 100).toFixed(1)}%
        </p>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          πR² × AM0. Sunlight Earth already intercepts. Type I is not “all the star”. It is six percent of the disk.
          Dawn-dusk SSO barely sees night. First Kardashev watt. Not the desert.
        </p>
      </Stage>

      <Stage src="/media/radiator.mp4" poster="/media/radiator.jpg">
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">Vacuum · heat</p>
        <p className="k-line">σT⁴</p>
        <p className="mt-4 font-sans text-5xl text-warn sm:text-7xl">kg / W</p>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          Space does not cool. No convection. Only radiation. The radiator outweighs the chip. Design heat before FLOPS.
          ISS practical ~166 W/m². A GPU rack does not fit an ISS panel.
        </p>
      </Stage>

      <Stage src="/media/plasma.mp4" poster="/media/plasma.jpg" veil="sun">
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">The other Type I</p>
        <p className="k-line">Fusion</p>
        <p className="mt-4 font-sans text-5xl text-warn sm:text-7xl">{fmtTW(NUCLEAR_W)} fission</p>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          Fission electricity ~{fmtTW(NUCLEAR_W)}. ITER is not a grid. Fusion on the crust is still Type 0 until the
          watt shows up. AM0 already does. Do not wait for a torus to close ×{Math.round(GAP_I)}.
        </p>
      </Stage>

      <DataStrip
        items={[
          { k: "Electricity", v: fmtTW(ELECTRICITY_W) },
          { k: "Datacenters", v: fmtTW(DATACENTER_W, 2) },
          { k: "Nuclear e⁻", v: fmtTW(NUCLEAR_W) },
          { k: "Gap", v: `×${Math.round(GAP_I)}` },
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-3 md:grid-cols-3">
          <MediaTile className="h-52" src="/media/solar.jpg" label="Crust — Tesla / Type 0" />
          <MediaTile className="h-52" src="/media/orbit-sat.mp4" poster="/media/ai-sat.jpg" label="SSO — continuous AM0" />
          <MediaTile className="h-52" src="/media/earth-night.mp4" poster="/media/earth-night.jpg" label="The grid, at night" />
        </div>

        <section className="mt-14 grid gap-px bg-border sm:grid-cols-3">
          <article className="bg-bg p-6">
            <p className="font-mono text-xs text-subtle">AM0</p>
            <p className="mt-2 font-sans text-4xl">{AM0} W/m²</p>
            <p className="mt-3 text-sm text-muted">
              No atmosphere. Dawn-dusk SSO barely sees night. First Kardashev watt. Not the desert.
            </p>
          </article>
          <article className="bg-bg p-6">
            <p className="font-mono text-xs text-subtle">Crust</p>
            <p className="mt-2 font-sans text-4xl">Grid</p>
            <p className="mt-3 text-sm text-muted">
              Megapack and ground solar: Type 0. They serve AGI. Cooling water is the ceiling. Electricity is only{" "}
              {fmtTW(ELECTRICITY_W)} of {fmtTW(p)} TES.
            </p>
          </article>
          <article className="bg-bg p-6">
            <p className="font-mono text-xs text-subtle">Vacuum</p>
            <p className="mt-2 font-sans text-4xl">σT⁴</p>
            <p className="mt-3 text-sm text-muted">
              Space does not cool. The radiator outweighs the chip. kg/W, not FLOPS.
            </p>
          </article>
        </section>

        <section className="mt-16">
          <p className="font-mono text-xs tracking-[0.22em] text-subtle uppercase">Model</p>
          <h2 className="mt-2 font-sans text-4xl">Sun, heat, kilograms.</h2>
          <p className="mt-3 max-w-xl text-sm text-muted">
            First-order SSO cluster. Move area, temperature, $/kg, panel efficiency. If solar margin drops under 1.1 the
            sat cannot fly the load. 81 sats × 120 kW is a Suncatcher-class sketch, not a flight plan.
          </p>
          <div className="mt-8">
            <EnergyBench />
          </div>
        </section>

        <section className="mt-16 border border-border p-6">
          <p className="font-mono text-xs tracking-[0.22em] text-subtle uppercase">Distribution</p>
          <h2 className="mt-2 font-sans text-4xl">Capture is half of it.</h2>
          <p className="mt-3 max-w-xl text-sm text-muted">
            Gigawatts that cannot move are Type 0. The grid layer — five continental bulkheads,
            latency as a hard floor, ties that carry energy and never frequency.
          </p>
          <Link to="/grid" className="mt-5 inline-block font-mono text-sm text-warn hover:text-fg">
            → /grid
          </Link>
        </section>
      </div>
      <LayerResearch layer="Energy" />
      <SiteFooter />
    </Shell>
  );
}
