import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shell } from "@/components/shell";
import { SiteFooter } from "@/components/site-footer";
import { DataStrip, Stage } from "@/components/stage";
import { GapBars, PowerChart, RateTable } from "@/components/power-chart";
import { SliderField } from "@/components/slider-field";
import { SEQUENCE } from "@/lib/plan";
import { GAP_I } from "@/lib/kardashev";
import { LAMBDA, singularityYear, yearsAccelerating, yearsInertial } from "@/lib/forecast";

export const Route = createFileRoute("/plan")({ component: PlanPage });

function PlanPage() {
  const [lambda, setLambda] = useState(LAMBDA);
  const inert = yearsInertial();
  const accel = useMemo(() => yearsAccelerating(undefined, undefined, lambda), [lambda]);
  const etaI = Math.round(2024 + inert);
  const etaA = Math.round(2024 + accel);
  const wall = singularityYear(lambda);

  return (
    <Shell bleed>
      <Stage src="/media/launch.mp4" poster="/media/launch.jpg" veil="night" hint>
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">Plan</p>
        <h1 className="k-line">Close ×{Math.round(GAP_I)}.</h1>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          Inertia = 1.8%/yr forever. Acceleration = each watt-doubling lasts λ times the previous. Energy historically
          sits at λ≈1; compute does not. Move λ. Programs live in{" "}
          <Link to="/roadmap" className="text-fg underline-offset-4 hover:underline">
            Roadmap
          </Link>
          .
        </p>
      </Stage>

      <DataStrip
        items={[
          { k: "Gap", v: `×${Math.round(GAP_I)}` },
          { k: "Inertia", v: `~${etaI}` },
          { k: `λ=${lambda.toFixed(2)}`, v: `~${etaA}` },
          { k: "Wall", v: Number.isFinite(wall) ? `~${Math.round(wall)}` : "—" },
        ]}
      />

      <Stage src="/media/pad.mp4" poster="/media/starship.jpg">
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">The valve</p>
        <h2 className="k-line">Starship</h2>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          Without kg/week to LEO the rest is a deck. Reusable is not industrial cadence yet. The rocket is the
          bottleneck, not the model. The vehicle lives on the IGNIS site. Mass in{" "}
          <Link to="/space" className="text-fg underline-offset-4 hover:underline">
            Space
          </Link>
          .
        </p>
      </Stage>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <section>
          <p className="font-mono text-xs tracking-[0.22em] text-subtle uppercase">Watts · inertia vs λ</p>
          <p className="mt-2 text-sm text-muted">
            Grey: 1.8% forever. Amber: a gap that shrinks. White: Type I. The wall is λ→0 in finite time — broken
            physics, not an appointment.
          </p>
          <div className="mt-6 max-w-lg">
            <SliderField
              label="λ · duration of the next doubling"
              value={Number(lambda.toFixed(2))}
              min={0.5}
              max={1}
              step={0.01}
              onChange={setLambda}
            />
          </div>
          <p className="mt-3 font-mono text-xs text-warn">
            λ={lambda.toFixed(2)} → Type I ~{etaA}
            {Number.isFinite(wall) ? ` · wall ~${Math.round(wall)}` : ""}
          </p>
          <div className="mt-6 border border-border p-4">
            <PowerChart lambda={lambda} />
          </div>
          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            <div>
              <p className="font-mono text-xs tracking-wide text-subtle uppercase">9 doublings · the gap</p>
              <p className="mt-2 mb-4 text-xs text-muted">From ~20 TW to Type I. Each bar is a ×2.</p>
              <GapBars lambda={lambda} />
            </div>
            <RateTable />
          </div>
        </section>

        <section className="mt-16">
          <p className="font-mono text-xs tracking-[0.22em] text-subtle uppercase">Order</p>
          <ol className="mt-6 divide-y divide-border border-y border-border">
            {SEQUENCE.map((s) => (
              <li key={s.n} className="grid gap-2 py-5 sm:grid-cols-[4rem_9rem_1fr] sm:gap-8">
                <p className="font-mono text-xs text-subtle">{s.n}</p>
                <p>{s.title}</p>
                <p className="text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <SiteFooter />
    </Shell>
  );
}
