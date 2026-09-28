import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  LAMBDA,
  RATES,
  civilizationSeries,
  doublingGaps,
  yearsAccelerating,
  yearsAtRate,
  yearsInertial,
} from "@/lib/forecast";

export function PowerChart({ lambda = LAMBDA }: { lambda?: number }) {
  const series = useMemo(() => civilizationSeries(lambda), [lambda]);
  return (
    <div className="h-80 w-full font-mono text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
          <XAxis dataKey="year" tick={{ fill: "currentColor", fontSize: 11 }} />
          <YAxis
            scale="log"
            domain={[1e13, 2e16]}
            tick={{ fill: "currentColor", fontSize: 11 }}
            tickFormatter={(v: number) => `10${expSup(Math.log10(v))}`}
          />
          <Tooltip
            contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
            formatter={(v, name) => [Number(v).toExponential(2) + " W", String(name)]}
          />
          <Line type="monotone" dataKey="inertia" name="inertia 1.8%" stroke="var(--color-subtle)" dot={false} />
          <Line
            type="monotone"
            dataKey="accel"
            name={`λ=${lambda.toFixed(2)}`}
            stroke="var(--color-warn)"
            dot={false}
            strokeWidth={2}
          />
          <Line type="monotone" dataKey="typeI" name="Type I" stroke="var(--color-fg)" dot={false} strokeDasharray="4 4" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RateTable() {
  const accel = yearsAccelerating();
  const inert = yearsInertial();
  return (
    <table className="w-full text-left text-sm">
      <thead className="font-mono text-xs tracking-wide text-subtle uppercase">
        <tr>
          <th className="py-2 pr-4">Model</th>
          <th className="py-2 pr-4">Years</th>
          <th className="py-2">Type I crossing</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-t border-border">
          <td className="py-3 pr-4">Inertia 1.8% (λ=1)</td>
          <td className="py-3 pr-4 tabular-nums">{inert.toFixed(0)}</td>
          <td className="py-3 tabular-nums">{Math.round(2024 + inert)}</td>
        </tr>
        <tr className="border-t border-border text-warn">
          <td className="py-3 pr-4">Acceleration λ=0.62 · 100 years</td>
          <td className="py-3 pr-4 tabular-nums">{accel.toFixed(0)}</td>
          <td className="py-3 tabular-nums">{Math.round(2024 + accel)}</td>
        </tr>
        {RATES.filter((r) => r.rate !== 0.018).map((r) => {
          const y = yearsAtRate(r.rate);
          return (
            <tr key={r.label} className="border-t border-border">
              <td className="py-3 pr-4">{r.label}</td>
              <td className="py-3 pr-4 tabular-nums">{y.toFixed(0)}</td>
              <td className="py-3 tabular-nums">{Math.round(2024 + y)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function GapBars({ lambda = LAMBDA }: { lambda?: number }) {
  const gaps = doublingGaps(9, lambda);
  const max = gaps[0]?.years ?? 1;
  return (
    <ol className="space-y-2">
      {gaps.map((g) => (
        <li key={g.n} className="grid grid-cols-[4rem_1fr_5rem] items-center gap-3">
          <span className="font-mono text-xs text-subtle">×{2 ** g.n}</span>
          <span className="h-2 bg-border">
            <span
              className="block h-2 bg-warn"
              style={{ width: `${Math.max(4, Number(((g.years / max) * 100).toFixed(1)))}%` }}
            />
          </span>
          <span className="font-mono text-xs tabular-nums">{g.years.toFixed(1)} yr</span>
        </li>
      ))}
    </ol>
  );
}

function expSup(n: number) {
  const map: Record<string, string> = {
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
    "-": "⁻",
  };
  return String(Math.round(n))
    .split("")
    .map((d) => map[d] ?? d)
    .join("");
}
