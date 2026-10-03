import { operatorDiagram } from "@/lib/operator";

/**
 * M5 UI. CSS/SVG only. Numbers come from operatorDiagram(); this file adds no
 * latency of its own. No device, no upload, no raw store.
 */
export function OperatorDiagram() {
  const d = operatorDiagram();
  const boxW = 148;
  const gap = 28;
  const boxH = 86;
  const padX = 4;
  const padY = 8;
  const width = padX * 2 + d.blocks.length * boxW + (d.blocks.length - 1) * gap;
  const height = padY * 2 + boxH;

  return (
    <section className="border border-border p-6" aria-label="Operator chain">
      <p className="font-mono text-xs tracking-[0.22em] text-subtle uppercase">Control node · not connected</p>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-6 w-full font-mono"
        role="img"
        aria-hidden="true"
      >
        {d.blocks.map((block, i) => {
          const x = padX + i * (boxW + gap);
          const y = padY;
          const midY = y + boxH / 2;
          return (
            <g key={block.id}>
              {i > 0 ? (
                <path
                  d={`M ${x - gap + 2} ${midY} H ${x - 2}`}
                  className="stroke-warn"
                  fill="none"
                  strokeWidth="1"
                />
              ) : null}
              <rect
                x={x}
                y={y}
                width={boxW}
                height={boxH}
                fill="none"
                strokeWidth="1"
                className={block.irreducible ? "stroke-warn" : "stroke-border"}
              />
              <text x={x + 10} y={y + 22} className="fill-fg text-[11px]">
                {block.title}
              </text>
              <text x={x + 10} y={y + 42} className="fill-muted text-[10px]">
                {block.detail}
              </text>
              <text
                x={x + 10}
                y={y + 66}
                className={block.irreducible ? "fill-warn text-[11px]" : "fill-muted text-[11px]"}
              >
                {block.msLabel}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-6 max-w-3xl">
        {d.sentences.map((sentence) => (
          <p
            key={sentence}
            className={
              sentence.includes("do not stabilize")
                ? "mt-4 font-mono text-sm text-warn first:mt-0"
                : "mt-4 font-mono text-sm text-muted first:mt-0"
            }
          >
            {sentence}
          </p>
        ))}
      </div>
    </section>
  );
}