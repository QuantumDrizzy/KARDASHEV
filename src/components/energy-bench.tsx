import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SliderField } from "@/components/slider-field";
import { Stat } from "@/components/stat";
import { DEFAULT_BENCH, evaluate, launchSweep, radiatorSweep, type BenchInputs } from "@/lib/physics";
import { fmtPowerKw, fmtUsd, fmt } from "@/lib/utils";

export function EnergyBench() {
  const [i, setI] = useState<BenchInputs>(DEFAULT_BENCH);
  const r = useMemo(() => evaluate(i), [i]);
  const sweep = useMemo(() => launchSweep(i), [i]);
  const rad = useMemo(() => radiatorSweep(i), [i]);
  const set = <K extends keyof BenchInputs>(k: K, v: BenchInputs[K]) =>
    setI((s) => ({ ...s, [k]: v }));

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Constellation"
          value={fmtPowerKw(r.constellationKw)}
          hint={`${i.nSats} sats · ${i.computeKw} kW`}
        />
        <Stat label="Radiator / sat" value={`${fmt(r.radiatorM2, 1)} m²`} hint={`${fmt(r.radiatorWm2, 0)} W/m²`} />
        <Stat
          label="$/kWh orbital"
          value={fmtUsd(r.orbitalUsdKwh)}
          tone={r.crossover ? "ok" : "warn"}
          hint={`Earth ${fmtUsd(r.terrestrialUsdKwh)}`}
        />
        <Stat
          label="Bottleneck"
          value={r.bottleneck}
          tone={r.bottleneck === "solar" ? "danger" : r.bottleneck === "launch" ? "warn" : "default"}
        />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Solar / sat"
          value={`${fmt(r.solarW / 1000, 1)} kW`}
          hint={`margin ×${fmt(r.solarMargin, 2)}`}
          tone={r.solarMargin < 1.1 ? "danger" : "ok"}
        />
        <Stat label="Heat" value={`${fmt(r.heatW / 1000, 1)} kW`} hint="×1.05 compute" />
        <Stat label="Dry mass / sat" value={`${fmt(r.dryKg, 0)} kg`} />
        <Stat label="Launch cluster" value={fmtUsd(r.launchUsd)} hint={`$${i.launchUsdKg}/kg`} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="border border-border p-5">
          <h2 className="font-mono text-xs tracking-wide text-subtle uppercase">Solar and heat</h2>
          <div className="mt-5 grid gap-5">
            <SliderField label="Sats" value={i.nSats} min={1} max={400} step={1} onChange={(v) => set("nSats", v)} />
            <SliderField
              label="Compute / sat"
              value={i.computeKw}
              min={10}
              max={400}
              step={5}
              unit="kW"
              onChange={(v) => set("computeKw", v)}
            />
            <SliderField
              label="Solar area"
              value={i.solarM2}
              min={20}
              max={800}
              step={5}
              unit="m²"
              onChange={(v) => set("solarM2", v)}
            />
            <SliderField
              label="Panel efficiency"
              value={Number((i.panelEff * 100).toFixed(0))}
              min={15}
              max={40}
              step={1}
              unit="%"
              onChange={(v) => set("panelEff", v / 100)}
            />
            <SliderField
              label="Radiator T"
              value={i.radiatorT}
              min={260}
              max={420}
              step={5}
              unit="K"
              onChange={(v) => set("radiatorT", v)}
            />
            <SliderField
              label="Launch"
              value={i.launchUsdKg}
              min={10}
              max={2000}
              step={10}
              unit="$/kg"
              onChange={(v) => set("launchUsdKg", v)}
            />
          </div>
        </section>
        <div className="grid gap-6">
          <section className="border border-border p-5">
            <h2 className="font-mono text-xs tracking-wide text-subtle uppercase">Orbital vs grid</h2>
            <div className="mt-4 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sweep}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                  <XAxis dataKey="launchUsdKg" tick={{ fill: "currentColor", fontSize: 11 }} />
                  <YAxis tick={{ fill: "currentColor", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                  />
                  <Line type="monotone" dataKey="orbitalUsdKwh" name="orbital" stroke="var(--color-fg)" dot={false} />
                  <Line type="monotone" dataKey="terrestrialUsdKwh" name="earth" stroke="var(--color-ok)" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className="border border-border p-5">
            <h2 className="font-mono text-xs tracking-wide text-subtle uppercase">Radiator vs T</h2>
            <div className="mt-4 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rad}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                  <XAxis dataKey="radiatorT" tick={{ fill: "currentColor", fontSize: 11 }} />
                  <YAxis tick={{ fill: "currentColor", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                  />
                  <Line type="monotone" dataKey="m2" name="m²" stroke="var(--color-warn)" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
