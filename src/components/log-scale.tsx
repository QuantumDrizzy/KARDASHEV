import { GAP_I, MARKS, P_III } from "@/lib/kardashev";

const LOG_MIN = 12;
const LOG_MAX = 27;

function xOf(p: number) {
  const t = (Math.log10(p) - LOG_MIN) / (LOG_MAX - LOG_MIN);
  return Math.min(100, Math.max(0, t * 100));
}

export function LogScale() {
  const ticks = [12, 13, 14, 15, 16, 18, 20, 22, 24, 26];

  return (
    <div className="w-full overflow-x-auto">
      <div className="relative h-36 min-w-[36rem]">
        {ticks.map((exp) => (
          <span
            key={exp}
            className="absolute top-0 font-mono text-xs text-subtle"
            style={{ left: `${((exp - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 100}%` }}
          >
            10{expToSup(exp)}
          </span>
        ))}

        <div className="absolute top-8 right-0 left-0 h-px bg-border" />

        {MARKS.map((m) => {
          const left = xOf(m.p);
          const alignEnd = left > 70;
          return (
            <div
              key={m.k}
              className="absolute top-6"
              style={{
                left: `${left}%`,
                transform: alignEnd ? "translateX(-100%)" : undefined,
              }}
            >
              <span className={`block h-4 w-px ${m.k === 0.73 ? "ml-auto bg-warn" : "bg-fg"}`} />
              <p className={`mt-2 font-mono text-xs whitespace-nowrap ${m.k === 0.73 ? "text-warn" : "text-fg"}`}>
                {m.label}
              </p>
              <p className="font-mono text-xs text-subtle">K {m.k}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-6 font-mono text-xs text-subtle">
        Type III ~10{expToSup(Math.log10(P_III))} W — this axis cannot hold it. K is log₁₀(W). Type I is not missing
        “points”. It is missing ×{Math.round(GAP_I)}.
      </p>
    </div>
  );
}

function expToSup(n: number) {
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
  };
  return String(Math.round(n))
    .split("")
    .map((d) => map[d] ?? d)
    .join("");
}
