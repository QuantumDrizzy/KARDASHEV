import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/shell";
import { SiteFooter } from "@/components/site-footer";
import { LayerResearch } from "@/components/layer-research";
import { MediaTile } from "@/components/media-tile";
import { Stage, DataStrip } from "@/components/stage";
import { LifeChart } from "@/components/life-chart";
import { SliderField } from "@/components/slider-field";
import { BOUNDARIES, HANPP_FRAC, NPP_TW, OCEAN_NPP_FRAC } from "@/lib/life";
import { GAP_I, P_I, fmtTW } from "@/lib/kardashev";

export const Route = createFileRoute("/biologia")({ component: BiologiaPage });

function BiologiaPage() {
  const [pct, setPct] = useState(Math.round(HANPP_FRAC * 100));
  const taken = NPP_TW * (pct / 100);
  const typeIofNpp = P_I / 1e12 / NPP_TW;

  return (
    <Shell bleed>
      <Stage src="/media/biosphere.mp4" poster="/media/biosphere.jpg" hint>
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">Biology · biosphere</p>
        <h1 className="k-line">Type I does not eat the planet.</h1>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          NPP ≈ {NPP_TW} TW. Type I = {fmtTW(P_I, 0)} — ×{Math.round(typeIofNpp)} photosynthesis. If ×{Math.round(GAP_I)}{" "}
          comes from the biosphere, there is no Earth left to classify.
        </p>
      </Stage>

      <DataStrip
        items={[
          { k: "NPP", v: `${NPP_TW} TW` },
          { k: "HANPP", v: `${Math.round(HANPP_FRAC * 100)}%` },
          { k: "Ocean NPP", v: `${Math.round(OCEAN_NPP_FRAC * 100)}%` },
          { k: "Type I / NPP", v: `×${Math.round(typeIofNpp)}` },
        ]}
      />

      <Stage src="/media/ocean.jpg">
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">Ocean · phytoplankton</p>
        <p className="k-line">{Math.round(NPP_TW * OCEAN_NPP_FRAC)} TW</p>
        <p className="mt-4 font-sans text-5xl text-warn sm:text-7xl">half of life</p>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          Ocean NPP ~47% of the living budget. AM0 in orbit does not acidify. Coal does. Type I harvested from
          chlorophyll is extinction with a unit.
        </p>
      </Stage>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="font-mono text-xs tracking-[0.22em] text-subtle uppercase">Log · living watts vs K</p>
        <p className="mt-2 text-sm text-muted">
          Human flesh ~1 TW. HANPP ~32 TW. NPP ~130 TW. Civilization ~20 TW. Type I 10,000 TW. AM0, not chlorophyll.
        </p>
        <div className="mt-6 border border-border p-4">
          <LifeChart />
        </div>

        <section className="mt-12 border border-border p-6">
          <p className="font-mono text-xs tracking-[0.22em] text-subtle uppercase">HANPP · move it</p>
          <p className="mt-2 font-sans text-4xl">{pct}% of NPP</p>
          <p className="mt-2 font-mono text-sm tabular-nums text-warn">{taken.toFixed(0)} TW taken from the living budget</p>
          <div className="mt-6 max-w-lg">
            <SliderField label="Share of net primary production appropriated" value={pct} min={1} max={100} step={1} unit="%" onChange={setPct} />
          </div>
          <p className="mt-4 max-w-xl text-sm text-muted">
            We already take ~25%. Type I is {typeIofNpp.toFixed(0)}× all photosynthesis on Earth. The slider stops at
            100%. Physics does not. Do not close K by eating the Holocene.
          </p>
        </section>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          <MediaTile className="h-56" src="/media/ocean.jpg" label="Ocean · phytoplankton" />
          <MediaTile
            className="h-56"
            src="/media/earth-night.mp4"
            poster="/media/earth-night.jpg"
            label="The grid over the biosphere"
          />
        </div>

        <section className="mt-16">
          <p className="font-mono text-xs tracking-[0.22em] text-subtle uppercase">Boundaries · Rockström</p>
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {BOUNDARIES.map((b) => (
              <li key={b.id} className="grid gap-2 py-5 sm:grid-cols-[10rem_6rem_1fr]">
                <p>{b.name}</p>
                <p className="font-mono text-xs uppercase text-warn">{b.status}</p>
                <p className="text-sm text-muted">{b.note}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <LayerResearch layer="Biology" />
      <SiteFooter />
    </Shell>
  );
}
