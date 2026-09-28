import { useState } from "react";
import { MediaTile } from "@/components/media-tile";
import { Stage, DataStrip } from "@/components/stage";
import {
  FACET_LABEL,
  FACETS,
  LAYER_RECORD,
  itemsFor,
  layerStats,
  type Facet,
  type Layer,
} from "@/lib/research";
import { cn } from "@/lib/utils";

export function LayerResearch({ layer }: { layer: Layer }) {
  const hero = LAYER_RECORD[layer];
  const stats = layerStats(layer);
  const [facet, setFacet] = useState<Facet>("fields");
  const [i, setI] = useState(0);
  const items = itemsFor(layer, facet);
  const selected = items[Math.min(i, Math.max(items.length - 1, 0))];
  const tiles = selected
    ? [selected, ...items.filter((x) => x.key !== selected.key)].slice(0, 3)
    : items.slice(0, 3);

  function show(next: Facet) {
    setFacet(next);
    setI(0);
  }

  function pick(idx: number, scroll = false) {
    setI(idx);
    if (!scroll) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("layer-record")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <>
      <Stage src={hero.src} poster={hero.poster} veil={hero.veil}>
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">{hero.kicker}</p>
        <h2 className="k-line">{hero.line}</h2>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">{hero.copy}</p>
      </Stage>

      <DataStrip
        items={[
          { k: "Fields", v: String(stats.fields) },
          { k: "Centers", v: String(stats.centers) },
          { k: "Works", v: String(stats.works) },
          { k: "Record", v: stats.span },
        ]}
      />

      <div id="layer-record" className="scroll-mt-20">
        <FacetBar facet={facet} stats={stats} onShow={show} />

        {selected ? (
          <Stage
            key={`${facet}-${selected.key}`}
            src={selected.media.src}
            poster={selected.media.poster}
            className="k-swap"
          >
            <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">
              {FACET_LABEL[facet]} · {selected.kicker}
            </p>
            <p className="k-line">{selected.datum}</p>
            <p className="mt-4 max-w-4xl font-sans text-3xl leading-none text-warn sm:text-5xl">{selected.title}</p>
            <p className="mt-6 max-w-xl font-mono text-sm text-muted">{selected.body}</p>
            <p className="mt-3 font-mono text-xs text-subtle">{selected.sub}</p>
          </Stage>
        ) : null}
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-3 md:grid-cols-3">
          {tiles.map((t) => {
            const idx = items.findIndex((x) => x.key === t.key);
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => pick(idx, true)}
                className="text-left transition-transform duration-150 ease-out active:scale-[0.96]"
              >
                <MediaTile
                  className={cn("h-52", idx === i ? "ring-1 ring-fg" : "")}
                  src={t.media.src}
                  poster={t.media.poster}
                  label={`${t.kicker} · ${t.title}`}
                />
              </button>
            );
          })}
        </div>

        <p className="mt-12 font-mono text-xs tracking-[0.22em] text-subtle uppercase">
          {FACET_LABEL[facet]} · tap a line
        </p>
        <ol className="mt-4 divide-y divide-border border-y border-border">
          {items.map((item, idx) => (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => pick(idx, true)}
                className={cn(
                  "grid w-full min-h-11 gap-2 py-5 text-left transition-colors duration-150 sm:grid-cols-[7rem_1fr_10rem]",
                  idx === i ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                <p className="font-mono text-xs uppercase tracking-wide text-subtle">{item.kicker}</p>
                <div>
                  <p className="font-sans text-2xl sm:text-3xl">{item.title}</p>
                  <p className="mt-1 text-sm text-muted">{item.body}</p>
                </div>
                <p className="font-mono text-xs text-warn sm:text-right">{item.datum}</p>
              </button>
            </li>
          ))}
        </ol>
        <p className="mt-8 font-mono text-xs text-subtle">
          Labs and papers. Not partners. Nobody here signed a deal.
        </p>
      </div>
    </>
  );
}

function FacetBar({
  facet,
  stats,
  onShow,
}: {
  facet: Facet;
  stats: { fields: number; discoveries: number; centers: number; works: number };
  onShow: (f: Facet) => void;
}) {
  return (
    <div className="border-b border-border bg-bg">
      <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 py-3 sm:px-6">
        {FACETS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => onShow(f)}
            className={cn(
              "min-h-11 border px-4 py-2 font-mono text-xs uppercase tracking-wide transition-colors duration-150",
              facet === f ? "border-fg bg-fg text-accent-fg" : "border-border text-muted hover:text-fg",
            )}
          >
            {FACET_LABEL[f]} · {stats[f]}
          </button>
        ))}
      </div>
    </div>
  );
}
