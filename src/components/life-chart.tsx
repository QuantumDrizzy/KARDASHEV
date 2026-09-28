import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { HANPP_W, METABOLIC_W, NPP_W } from "@/lib/life";
import { P_2023, P_I } from "@/lib/kardashev";

const data = [
  { name: "Human flesh", w: METABOLIC_W },
  { name: "HANPP", w: HANPP_W },
  { name: "NPP", w: NPP_W },
  { name: "TES 2023", w: P_2023 },
  { name: "Type I", w: P_I },
];

export function LifeChart() {
  return (
    <div className="h-64 w-full font-mono text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
          <XAxis type="number" scale="log" domain={[1e11, 2e16]} hide />
          <YAxis type="category" dataKey="name" tick={{ fill: "currentColor", fontSize: 11 }} width={88} />
          <Tooltip
            contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
            formatter={(v) => [(Number(v) / 1e12).toFixed(1) + " TW", ""]}
          />
          <Bar dataKey="w" fill="var(--color-warn)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
