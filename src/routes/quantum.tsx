import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/shell";
import { SiteFooter } from "@/components/site-footer";
import { LayerResearch } from "@/components/layer-research";
import { MediaTile } from "@/components/media-tile";
import { Stage, DataStrip } from "@/components/stage";
import { ARCH, MODALITIES, ORBIT_LABEL } from "@/lib/quantum";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/quantum")({ component: QuantumPage });

function QuantumPage() {
  const [id, setId] = useState(MODALITIES[0]!.id);
  const m = MODALITIES.find((x) => x.id === id) ?? MODALITIES[0]!;

  return (
    <Shell bleed>
      <Stage src="/media/quantum.mp4" poster="/media/quantum.jpg" veil="sun" hint>
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">Quantum</p>
        <h1 className="k-line">It does not raise K.</h1>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          A million qubits in LEO do not close ×509. Three jobs. None of them is the cryostat in orbit.
        </p>
      </Stage>

      <DataStrip
        items={[
          { k: "PQC", v: "Now" },
          { k: "Sensing", v: "Orbit" },
          { k: "QPU mK", v: "Does not fly" },
          { k: "K", v: "watts" },
        ]}
      />

      <Stage src="/media/tracks.mp4" poster="/media/constellation.jpg">
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">01 · the channel</p>
        <h2 className="k-line">PQC</h2>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          Keys when AI leaves the crust. ML-KEM, ML-DSA, the laser ISL. Infrastructure, not a poster. This one is due
          now.
        </p>
      </Stage>

      <Stage src="/media/orbit-sat.mp4" poster="/media/ai-sat.jpg">
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">02 · the instrument</p>
        <h2 className="k-line">Sensing</h2>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          NV magnetometry, clocks, radiation. Space is the instrument. This one flies. It still does not move K.
        </p>
      </Stage>

      <Stage src="/media/quantum.mp4" poster="/media/quantum.jpg">
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">03 · the craton</p>
        <h2 className="k-line">QPU · mK</h2>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          10–20 mK, helium, muons. Stays on Earth. Photonics, maybe. Superconducting transmons in LEO are a slide.
        </p>
      </Stage>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="max-w-xl text-sm text-muted">
          This lab lives on the Unibit site. This page only records that it does not raise K.
        </p>
        <section className="mt-10 grid gap-3 md:grid-cols-3">
          {ARCH.map((a) => (
            <article key={a.layer} className="border border-border p-6">
              <p className="font-mono text-xs text-subtle">{a.layer}</p>
              <p className="mt-2 font-sans text-3xl">{a.role}</p>
              <p className="mt-3 text-sm text-muted">{a.owns}</p>
            </article>
          ))}
        </section>

        <section className="mt-16">
          <p className="font-mono text-xs tracking-[0.22em] text-subtle uppercase">Modalities · tap</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {MODALITIES.map((x) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setId(x.id)}
                className={cn(
                  "border px-4 py-3 font-mono text-xs uppercase transition-colors duration-150",
                  x.id === id ? "border-fg bg-fg text-accent-fg" : "border-border text-muted hover:text-fg",
                )}
              >
                {x.name}
              </button>
            ))}
          </div>
          <div className="mt-8 grid gap-8 border border-border p-6 sm:grid-cols-[10rem_1fr]">
            <div>
              <p className="font-mono text-xs text-subtle">Orbit</p>
              <p className="mt-2 font-sans text-3xl text-warn">{ORBIT_LABEL[m.orbit]}</p>
              <p className="mt-4 font-mono text-xs text-subtle">Earth</p>
              <p className="mt-1">{m.earth}</p>
            </div>
            <div>
              <p className="font-sans text-3xl">{m.name}</p>
              <p className="mt-3 text-sm text-muted">{m.why}</p>
              <p className="mt-4 font-mono text-xs text-subtle">Bottleneck · {m.bottleneck}</p>
            </div>
          </div>
        </section>

        <div className="mt-10 grid gap-3 md:grid-cols-3">
          <MediaTile className="h-52" src="/media/constellation.jpg" label="PQC · the channel" />
          <MediaTile className="h-52" src="/media/orbit-sat.mp4" poster="/media/ai-sat.jpg" label="NV / field" />
          <MediaTile className="h-52" src="/media/quantum.jpg" label="Transmon · craton" />
        </div>
      </div>
      <LayerResearch layer="Quantum" />
      <SiteFooter />
    </Shell>
  );
}
