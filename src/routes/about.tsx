import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { SiteFooter } from "@/components/site-footer";
import { Stage, DataStrip } from "@/components/stage";
import { GAP_I, GROWTH, TES_2023_EJ } from "@/lib/kardashev";
import { AM0 } from "@/lib/physics";
import { LAMBDA } from "@/lib/forecast";

export const Route = createFileRoute("/about")({ component: AboutPage });

function AboutPage() {
  return (
    <Shell bleed>
      <Stage src="/media/earth-night.mp4" poster="/media/earth-night.jpg" veil="night">
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">About</p>
        <h1 className="k-line">An instrument, not a company.</h1>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          KARDASHEV measures civilization in watts. Sagan 1973. IEA TES. IAU L☉. AM0 {AM0} W/m². Nobody on the sector
          list signed a deal here. Not SpaceX. Not xAI. Not Google. Not NVIDIA.
        </p>
      </Stage>

      <DataStrip
        items={[
          { k: "Scale", v: "Sagan K" },
          { k: "TES", v: `${TES_2023_EJ} EJ` },
          { k: "Growth", v: `${(GROWTH * 100).toFixed(1)}%` },
          { k: "λ", v: LAMBDA.toFixed(2) },
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <section id="method" className="grid gap-px bg-border sm:grid-cols-3">
          <article className="bg-bg p-6">
            <p className="font-mono text-xs text-subtle">What</p>
            <p className="mt-2 font-sans text-3xl">Watts first</p>
            <p className="mt-3 text-sm text-muted">
              Type I is ×{Math.round(GAP_I)} in power, not twenty-seven “points” of K. AGI is a GW event on Earth. ASI
              is an energy event. Quantum is not the shortcut.
            </p>
          </article>
          <article className="bg-bg p-6">
            <p className="font-mono text-xs text-subtle">Method</p>
            <p className="mt-2 font-sans text-3xl">First-order</p>
            <p className="mt-3 text-sm text-muted">
              Two-body orbits. σT⁴ radiators. IEA 1.8% inertia vs λ-compressed doublings. Assumptions are labeled.
              Models, not meters.
            </p>
          </article>
          <article className="bg-bg p-6">
            <p className="font-mono text-xs text-subtle">Who</p>
            <p className="mt-2 font-sans text-3xl">QuantumDrizzy</p>
            <p className="mt-3 text-sm text-muted">
              Built as a briefing, not a course. Contact is public: X and GitHub under the same handle. No newsletter.
              No round.
            </p>
          </article>
        </section>

        <section id="sources" className="mt-16">
          <p className="font-mono text-xs tracking-[0.22em] text-subtle uppercase">Sources</p>
          <ul className="mt-6 divide-y divide-border border-y border-border text-sm">
            <li className="grid gap-2 py-4 sm:grid-cols-[10rem_1fr]">
              <p className="font-mono text-xs text-subtle">Sagan 1973</p>
              <p className="text-muted">K = (log₁₀ P − 6) / 10. Type I = 10¹⁶ W. Not Kardashev 1964’s 4×10¹² W.</p>
            </li>
            <li className="grid gap-2 py-4 sm:grid-cols-[10rem_1fr]">
              <p className="font-mono text-xs text-subtle">IEA</p>
              <p className="text-muted">TES 2023 ≈ 620 EJ. Electricity ~30,000 TWh. Datacentres ~460 TWh (2024).</p>
            </li>
            <li className="grid gap-2 py-4 sm:grid-cols-[10rem_1fr]">
              <p className="font-mono text-xs text-subtle">IAU / WGS</p>
              <p className="text-muted">L☉ = 3.826×10²⁶ W. AM0 = 1361 W/m². μ⊕ = 3.986004418×10¹⁴ m³/s².</p>
            </li>
            <li className="grid gap-2 py-4 sm:grid-cols-[10rem_1fr]">
              <p className="font-mono text-xs text-subtle">Biosphere</p>
              <p className="text-muted">Field et al. NPP. Rockström boundaries. UN e0 / HALE. Order-of-magnitude.</p>
            </li>
          </ul>
        </section>
      </div>
      <SiteFooter />
    </Shell>
  );
}
