import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { SiteFooter } from "@/components/site-footer";
import { LayerResearch } from "@/components/layer-research";
import { MediaTile } from "@/components/media-tile";
import { Stage, DataStrip } from "@/components/stage";
import { TRACKS, STATUS_LABEL } from "@/lib/roadmap";
import { GAP_I, P_I, fmtTW } from "@/lib/kardashev";
import { DATACENTER_W, ELECTRICITY_W } from "@/lib/facts";

export const Route = createFileRoute("/ia")({ component: IaPage });

const IA_TRACKS = TRACKS.filter((t) =>
  ["starmind", "xai", "suncatcher", "starcloud", "nvidia"].includes(t.id),
);

function IaPage() {
  return (
    <Shell bleed>
      <Stage src="/media/datacenter.mp4" poster="/media/datacenter.jpg" veil="night" hint>
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">AI · AGI · ASI</p>
        <h1 className="k-line">AGI is Earth. ASI is K.</h1>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          More parameters do not raise Kardashev. AGI fits in GW. All datacenters on Earth are {fmtTW(DATACENTER_W, 2)}.
          ASI asks for ×{Math.round(GAP_I)} in watts.
        </p>
      </Stage>

      <DataStrip
        items={[
          { k: "AGI", v: "Earth" },
          { k: "Datacenters", v: fmtTW(DATACENTER_W, 2) },
          { k: "ASI", v: "Type I" },
          { k: "Gap", v: `×${Math.round(GAP_I)}` },
        ]}
      />

      <Stage src="/media/orbit-sat.mp4" poster="/media/ai-sat.jpg">
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">Inference · orbit</p>
        <h2 className="k-line">Serve off the crust.</h2>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          Pretraining, NVLink, water: Earth. Inference, SSO, laser ISL: orbit. Starmind, Suncatcher, Starcloud. Watts
          without a grid. The satellite does not train the frontier first.
        </p>
      </Stage>

      <Stage src="/media/tracks.mp4" poster="/media/constellation.jpg">
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">ASI</p>
        <p className="k-line">{fmtTW(P_I, 0)}</p>
        <p className="mt-4 font-sans text-5xl text-warn sm:text-7xl">not more layers</p>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          World electricity is {fmtTW(ELECTRICITY_W)}. Datacenters {fmtTW(DATACENTER_W, 2)}. Type I is {fmtTW(P_I, 0)}.
          Without ×{Math.round(GAP_I)} it is marketing, not ASI.
        </p>
      </Stage>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="max-w-xl text-sm text-muted">
          The stack’s own tools live on the Unibit site. This page only counts watts against K.
        </p>
        <div className="mt-10 grid gap-3 md:grid-cols-2">
          <MediaTile className="h-64 md:h-80" src="/media/am0.mp4" poster="/media/am0.jpg" label="AM0 — the rack’s real PSU" />
          <MediaTile className="h-64 md:h-80" src="/media/terafab.jpg" label="Silicon · radiation-lot" />
        </div>

        <section className="mt-10 grid gap-px bg-border sm:grid-cols-3">
          <article className="bg-bg p-6">
            <p className="font-mono text-xs text-subtle">AGI</p>
            <p className="mt-2 font-sans text-4xl">Earth</p>
            <p className="mt-3 text-sm text-muted">
              Pretraining, NVLink, water. xAI Colossus. The satellite does not train the frontier.
            </p>
          </article>
          <article className="bg-bg p-6">
            <p className="font-mono text-xs text-subtle">Inference</p>
            <p className="mt-2 font-sans text-4xl">Orbit</p>
            <p className="mt-3 text-sm text-muted">SSO, laser ISL. Starmind, Suncatcher, Starcloud. Watts without a grid.</p>
          </article>
          <article className="bg-bg p-6">
            <p className="font-mono text-xs text-subtle">ASI</p>
            <p className="mt-2 font-sans text-4xl">Type I</p>
            <p className="mt-3 text-sm text-muted">Not more layers. More sun. Without ×509 it is marketing, not ASI.</p>
          </article>
        </section>

        <section className="mt-16">
          <p className="font-mono text-xs tracking-[0.22em] text-subtle uppercase">Flying / in factory</p>
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {IA_TRACKS.map((t) => (
              <li key={t.id} className="grid gap-2 py-5 sm:grid-cols-[8rem_1fr_8rem]">
                <p className="font-mono text-xs uppercase text-subtle">{STATUS_LABEL[t.status]}</p>
                <div>
                  <p>
                    {t.org} · {t.program}
                  </p>
                  <p className="mt-1 text-sm text-muted">{t.now}</p>
                </div>
                <p className="text-sm text-muted">{t.bottleneck}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 font-mono text-xs text-subtle">
            Watts in{" "}
            <Link to="/energia" className="text-fg underline-offset-4 hover:underline">
              Energy
            </Link>
            . Cadence in{" "}
            <Link to="/plan" className="text-fg underline-offset-4 hover:underline">
              Plan
            </Link>
            .
          </p>
        </section>
      </div>
      <LayerResearch layer="AI" />
      <SiteFooter />
    </Shell>
  );
}
