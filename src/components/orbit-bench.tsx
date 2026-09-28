import { useMemo, useState } from "react";
import { SliderField } from "@/components/slider-field";
import { Stat } from "@/components/stat";
import { ORBITS, circular, typeISwarm } from "@/lib/orbit";
import { fmt } from "@/lib/utils";

export function OrbitBench() {
  const [hKm, setHKm] = useState(550);
  const [kgM2, setKgM2] = useState(1.2);
  const [payloadT, setPayloadT] = useState(100);
  const [perDay, setPerDay] = useState(3);
  const o = useMemo(() => circular(hKm), [hKm]);
  const swarm = useMemo(
    () => typeISwarm(kgM2, payloadT * 1000, perDay),
    [kgM2, payloadT, perDay],
  );

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Altitude" value={`${hKm} km`} hint="circular, two-body" />
        <Stat label="v" value={`${(o.v / 1000).toFixed(2)} km/s`} hint={`${(o.periodS / 60).toFixed(1)} min`} />
        <Stat label="g" value={`${o.gFrac.toFixed(2)} g`} hint={`${o.g.toFixed(2)} m/s² · free fall`} />
        <Stat
          label="Eclipse (plane)"
          value={`${(o.eclipseFrac * 100).toFixed(0)}%`}
          hint={`${o.eclipseMin.toFixed(0)} min night · SSO ≈ 0`}
          tone={o.eclipseFrac > 0.3 ? "warn" : "ok"}
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="border border-border p-5">
          <h2 className="font-mono text-xs tracking-wide text-subtle uppercase">Circular orbit</h2>
          <div className="mt-5">
            <SliderField label="Altitude" value={hKm} min={200} max={2000} step={10} unit="km" onChange={setHKm} />
          </div>
          <ol className="mt-6 flex flex-wrap gap-2">
            {ORBITS.filter((x) => x.hKm <= 2000).map((x) => (
              <li key={x.id}>
                <button
                  type="button"
                  onClick={() => setHKm(x.hKm)}
                  className="border border-border px-3 py-2 font-mono text-xs uppercase tracking-wide text-muted hover:text-fg"
                >
                  {x.name}
                </button>
              </li>
            ))}
          </ol>
          <p className="mt-4 font-mono text-xs text-muted">
            Weightless ≠ no gravity. At {hKm} km you still weigh {o.gFrac.toFixed(2)} g. You miss the ground.
          </p>
        </section>

        <section className="border border-border p-5">
          <h2 className="font-mono text-xs tracking-wide text-subtle uppercase">Type I as AM0 sheet</h2>
          <div className="mt-5 grid gap-5">
            <SliderField
              label="Areal density"
              value={Number(kgM2.toFixed(2))}
              min={0.01}
              max={2}
              step={0.01}
              unit="kg/m²"
              onChange={setKgM2}
            />
            <SliderField
              label="Payload / launch"
              value={payloadT}
              min={20}
              max={200}
              step={5}
              unit="t"
              onChange={setPayloadT}
            />
            <SliderField
              label="Cadence"
              value={perDay}
              min={0.1}
              max={50}
              step={0.1}
              unit="/day"
              onChange={setPerDay}
            />
          </div>
        </section>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Area" value={`${Math.round(swarm.areaM2 / 1e6).toLocaleString("en-US")} km²`} hint="10,000 TW at AM0 × 28% × SSO" />
        <Stat label="Mass" value={`${(swarm.massKg / 1e12).toFixed(1)} Gt`} hint={`${kgM2} kg/m²`} />
        <Stat
          label="Flights"
          value={fmt(swarm.flights, 0)}
          hint={`${swarm.mwPerLaunch.toFixed(0)} MW / launch`}
          tone="warn"
        />
        <Stat
          label="Years"
          value={Number.isFinite(swarm.years) ? fmt(swarm.years, 0) : "—"}
          hint={`${perDay}/day · ${payloadT} t`}
          tone={swarm.years > 200 ? "danger" : swarm.years > 50 ? "warn" : "ok"}
        />
      </div>
      <p className="mt-4 max-w-3xl font-mono text-xs text-muted">
        1.2 kg/m² and 100 t is today's sheet and a claimed Starship. Type I as photovoltaic swarm does not close on
        that. Either the sheet gets ~10³ lighter, cadence becomes a factory, or Type I is not a PV swarm.
      </p>
    </div>
  );
}
