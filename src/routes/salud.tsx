import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/shell";
import { SiteFooter } from "@/components/site-footer";
import { LayerResearch } from "@/components/layer-research";
import { MediaTile } from "@/components/media-tile";
import { Stage, DataStrip } from "@/components/stage";
import { SliderField } from "@/components/slider-field";
import {
  BRAIN_WATT,
  CAREER_SV,
  HALE,
  HEALTH,
  HUMAN_WATT,
  ISS_MSV_YR,
  LEO_MSV_DAY,
  LIFE_EXPECTANCY,
  METABOLIC_W,
  POPULATION,
} from "@/lib/life";
import { OperatorDiagram } from "@/components/operator-diagram";
import { fmtTW } from "@/lib/kardashev";

export const Route = createFileRoute("/salud")({ component: SaludPage });

function SaludPage() {
  const [msv, setMsv] = useState(LEO_MSV_DAY);
  const careerDays = (CAREER_SV * 1000) / msv;
  const careerYr = careerDays / 365.25;

  return (
    <Shell bleed>
      <Stage src="/media/salud.mp4" poster="/media/salud-lab.jpg" hint>
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">Health</p>
        <h1 className="k-line">The operator is a watt too.</h1>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          {POPULATION.toExponential(1)} bodies × {HUMAN_WATT} W = {fmtTW(METABOLIC_W)}. All human flesh is under 1 TW. K
          does not rise on more metabolism. It rises on brains that last — and do not fry in LEO.
        </p>
      </Stage>

      <DataStrip
        items={[
          { k: "e0", v: `${LIFE_EXPECTANCY} yr` },
          { k: "HALE", v: `${HALE} yr` },
          { k: "BMR·N", v: fmtTW(METABOLIC_W) },
          { k: "Brain", v: `${BRAIN_WATT} W` },
        ]}
      />

      <Stage src="/media/brain.mp4" poster="/media/brain.jpg" veil="night">
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">The instrument inside</p>
        <p className="k-line">{BRAIN_WATT} W</p>
        <p className="mt-4 font-sans text-5xl text-warn sm:text-7xl">0.16 TW of neurons</p>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          Twenty watts per head. ASI does not fit in cortex. HALE 63.7 vs e0 73.4 — ten sick years. A century to Type I
          fits in a stretched healthy life, or nobody closes λ.
        </p>
      </Stage>

      <Stage src="/media/salud-orbit.jpg">
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">Orbit · dose</p>
        <p className="k-line">{ISS_MSV_YR} mSv/yr</p>
        <p className="mt-4 font-sans text-5xl text-warn sm:text-7xl">career ~1 Sv</p>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          LEO ~0.3–1 mSv/day. No radiation medicine, no human fleet. Teleop instead. The sat is five years. The operator
          is not.
        </p>
      </Stage>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <section className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {HEALTH.map((h) => (
            <article key={h.k} className="bg-bg p-6">
              <p className="font-mono text-xs text-subtle">{h.k}</p>
              <p className="mt-2 font-sans text-4xl">{h.v}</p>
              <p className="mt-3 text-sm text-muted">{h.note}</p>
            </article>
          ))}
        </section>

        <section className="mt-12 border border-border p-6">
          <p className="font-mono text-xs tracking-[0.22em] text-subtle uppercase">Career dose · move it</p>
          <p className="mt-2 font-sans text-4xl">{careerYr.toFixed(1)} years</p>
          <p className="mt-2 font-mono text-sm text-warn">
            {msv.toFixed(2)} mSv/day → 1 Sv career in {Math.round(careerDays)} days
          </p>
          <div className="mt-6 max-w-lg">
            <SliderField
              label="LEO dose"
              value={Number(msv.toFixed(2))}
              min={0.2}
              max={1.5}
              step={0.05}
              unit="mSv/day"
              onChange={setMsv}
            />
          </div>
          <p className="mt-4 max-w-xl text-sm text-muted">
            A five-year sat at 0.5 mSv/day is ~0.9 Sv. The body is already at the career wall. Design the fleet for
            teleop, not for a city in LEO.
          </p>
        </section>

        <div className="mt-16">
          <OperatorDiagram />
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          <MediaTile className="h-56" src="/media/salud-orbit.jpg" label="Orbital medicine" />
          <MediaTile className="h-56" src="/media/salud-lab.jpg" label="Longevity / HALE" />
        </div>

        <section className="mt-16 grid gap-px bg-border sm:grid-cols-3">
          <article className="bg-bg p-6">
            <p className="font-mono text-xs text-subtle">Earth</p>
            <p className="mt-2 font-sans text-3xl">HALE → e0</p>
            <p className="mt-3 text-sm text-muted">
              63.7 vs 73.4. Ten sick years. Raising K with broken operators is theatre. Longevity is uptime.
            </p>
          </article>
          <article className="bg-bg p-6">
            <p className="font-mono text-xs text-subtle">Orbit</p>
            <p className="mt-2 font-sans text-3xl">mSv / day</p>
            <p className="mt-3 text-sm text-muted">
              LEO ~0.3–1 mSv/day. Career ~1 Sv. No radiation medicine, no human fleet. Teleop instead.
            </p>
          </article>
          <article className="bg-bg p-6">
            <p className="font-mono text-xs text-subtle">A century</p>
            <p className="mt-2 font-sans text-3xl">One life</p>
            <p className="mt-3 text-sm text-muted">
              If Type I is a century, it fits in a stretched HALE. The human gap compresses too — or nobody closes λ.
            </p>
          </article>
        </section>
      </div>
      <LayerResearch layer="Health" />
      <SiteFooter />
    </Shell>
  );
}
