import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { SiteFooter } from "@/components/site-footer";
import { Stage, DataStrip } from "@/components/stage";
import { LogScale } from "@/components/log-scale";
import { usePower } from "@/components/use-power";
import { GAP_II, GROWTH, L_SUN, P_I, fmtTW, kOf, sci } from "@/lib/kardashev";
import { TYPE_I_OF_DISK, fmtWps } from "@/lib/facts";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { k, p, short, gap, yearsI, yearsAccel, lambda, wps } = usePower();
  const etaInert = Math.round(new Date().getFullYear() + yearsI);
  const etaAccel = Math.round(new Date().getFullYear() + yearsAccel);

  return (
    <Shell bleed>
      <div className="h-dvh snap-y snap-mandatory overflow-y-auto">
        <Stage src="/media/earth-night.mp4" poster="/media/earth-night.jpg" veil="night" hint className="snap-start">
          <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">Now · IEA TES</p>
          <p className="k-hero text-warn tabular-nums">{k.toFixed(2)}</p>
          <p className="mt-3 font-mono text-lg tabular-nums sm:text-2xl">{fmtTW(p)}</p>
          <p className="mt-5 font-sans text-4xl leading-none text-warn sm:text-6xl">
            Type I · {fmtTW(P_I, 0)}
          </p>
          <p className="mt-3 font-sans text-3xl text-fg sm:text-5xl">×{Math.round(gap)}</p>
          <p className="mt-4 max-w-md font-mono text-xs text-muted">
            620 EJ (2023) × {(GROWTH * 100).toFixed(1)}%/yr. +{fmtWps(wps)} even at inertia. A model, not a grid meter.
          </p>
        </Stage>

        <DataStrip
          className="snap-start"
          items={[
            { k: "K", v: k.toFixed(4) },
            { k: "Now", v: fmtTW(p) },
            { k: "Type I", v: fmtTW(P_I, 0) },
            { k: "Gap", v: `×${Math.round(gap)}` },
          ]}
        />

        <Stage src="/media/tracks.mp4" poster="/media/constellation.jpg" className="snap-start">
          <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">Type I · Sagan · planet</p>
          <p className="k-line">10,000 TW</p>
          <p className="mt-4 font-sans text-5xl text-warn sm:text-7xl">×{Math.round(gap)}</p>
          <p className="mt-6 max-w-xl font-mono text-sm tabular-nums">
            We hold {fmtTW(p)} of 10,000 TW. Short {fmtTW(short, 0)}. ×{Math.round(gap)}.
          </p>
          <p className="mt-3 max-w-xl font-mono text-xs text-muted">
            Type I is {(TYPE_I_OF_DISK * 100).toFixed(1)}% of the sunlight Earth already intercepts. Inertia 1.8% → ~
            {etaInert}. If we do it right (λ={lambda.toFixed(2)}) → ~{etaAccel}. A century. Not 2030.
          </p>
        </Stage>

        <Stage src="/media/sun.mp4" poster="/media/sun.jpg" veil="sun" hint className="snap-start">
          <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">Type II · the star</p>
          <p className="k-line">
            {sci(L_SUN).mant}×10<sup>26</sup> W
          </p>
          <p className="mt-4 font-sans text-5xl text-warn sm:text-7xl">×{GAP_II.toExponential(1)}</p>
          <p className="mt-6 max-w-lg font-mono text-xs text-muted">
            L☉ IAU. Sagan II is 10²⁶ W; the Sun is K {kOf(L_SUN).toFixed(2)}. Earth is a rounding error.
          </p>
        </Stage>

        <Stage src="/media/galaxy.mp4" poster="/media/galaxy.jpg" className="snap-start">
          <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">Type III · galaxy</p>
          <p className="k-line">10³⁶–10³⁷ W</p>
          <p className="mt-6 max-w-lg font-mono text-xs text-muted">
            Sagan III = 10³⁶ W. Milky Way starlight ~10³⁷ W. This axis cannot hold it.
          </p>
          <div className="mt-12">
            <LogScale />
          </div>
          <nav className="mt-16 flex flex-wrap gap-8 font-sans text-3xl sm:text-5xl">
            <Link to="/energia" className="hover:text-warn">
              Energy
            </Link>
            <Link to="/ia" className="hover:text-warn">
              AI
            </Link>
            <Link to="/biologia" className="hover:text-warn">
              Biology
            </Link>
            <Link to="/salud" className="hover:text-warn">
              Health
            </Link>
            <Link to="/space" className="hover:text-warn">
              Space
            </Link>
            <Link to="/quantum" className="hover:text-warn">
              Quantum
            </Link>
          </nav>
        </Stage>

        <div className="snap-start flex min-h-dvh flex-col justify-end">
          <SiteFooter />
        </div>
      </div>
    </Shell>
  );
}
