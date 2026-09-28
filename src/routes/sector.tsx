import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { SiteFooter } from "@/components/site-footer";
import { Stage, DataStrip } from "@/components/stage";
import { LAYERS, SECTOR } from "@/lib/sector";

export const Route = createFileRoute("/sector")({ component: SectorPage });

function SectorPage() {
  return (
    <Shell bleed>
      <Stage src="/media/tracks.mp4" poster="/media/constellation.jpg" veil="night" hint>
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">Sector</p>
        <h1 className="k-line">Who has to deliver.</h1>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          They are not partners of this site. There is no deal. This is the industrial floor: launch, watts, silicon,
          quantum states. Without them K does not move.
        </p>
      </Stage>

      <DataStrip
        items={[
          { k: "Layers", v: String(LAYERS.length) },
          { k: "Houses", v: String(SECTOR.length) },
          { k: "Partners", v: "0" },
          { k: "Unit", v: "watts" },
        ]}
      />

      <Stage src="/media/launch.mp4" poster="/media/launch.jpg">
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">Launch</p>
        <h2 className="k-line">The kilogram.</h2>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          SpaceX, Rocket Lab, Blue Origin. Cadence is the product. A filing for a million sats with 0 kg/week is a
          slide.
        </p>
      </Stage>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="space-y-12">
          {LAYERS.map((layer) => (
            <section key={layer}>
              <p className="font-mono text-xs tracking-[0.22em] text-subtle uppercase">{layer}</p>
              <ul className="mt-4 divide-y divide-border border-y border-border">
                {SECTOR.filter((h) => h.layer === layer).map((h) => (
                  <li key={h.name} className="grid gap-2 py-5 sm:grid-cols-[12rem_1fr]">
                    <p className="text-fg">{h.name}</p>
                    <p className="text-muted">{h.delivers}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <p className="mt-10 max-w-xl text-sm text-muted">
          The materials lab lives on the Unibit site. This list is who has to deliver watts and kilograms. It is not
          that lab. The vehicle lives on the IGNIOS site.
        </p>
      </div>
      <SiteFooter />
    </Shell>
  );
}
