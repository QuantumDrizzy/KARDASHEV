import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { SiteFooter } from "@/components/site-footer";
import { MediaTile } from "@/components/media-tile";
import { Stage, DataStrip } from "@/components/stage";
import { MILESTONES, PHASES, TRACKS, STATUS_LABEL, type Status } from "@/lib/roadmap";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/roadmap")({ component: RoadmapPage });

const TONE: Record<Status, string> = {
  flying: "text-ok",
  building: "text-warn",
  filing: "text-muted",
  demo: "text-fg",
  earth: "text-muted",
  blocked: "text-danger",
};

function RoadmapPage() {
  return (
    <Shell bleed>
      <Stage src="/media/tracks.mp4" poster="/media/constellation.jpg" hint>
        <p className="font-mono text-xs tracking-[0.35em] text-subtle uppercase">Roadmap</p>
        <h1 className="k-line">What is flying.</h1>
        <p className="mt-6 max-w-xl font-mono text-sm text-muted">
          Programs, gates, cadence. Not the λ model — that lives in{" "}
          <Link to="/plan" className="text-fg underline-offset-4 hover:underline">
            Plan
          </Link>
          . A filing is not a satellite. A demo is not a factory.
        </p>
      </Stage>

      <DataStrip
        items={[
          { k: "Now", v: "Pathfinders" },
          { k: "2027", v: "Demos" },
          { k: "2028–30", v: "Serve" },
          { k: "2030s", v: "Wedge" },
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <section>
          <p className="font-mono text-xs tracking-[0.22em] text-subtle uppercase">Phases</p>
          <ol className="mt-6 grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
            {PHASES.map((p) => (
              <li key={p.id} className="bg-bg p-5">
                <p className="font-mono text-xs text-subtle">{p.years}</p>
                <p className="mt-3 font-sans text-2xl">{p.name}</p>
                <p className="mt-2 text-sm text-muted">{p.note}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          <MediaTile className="h-52" src="/media/orbit-sat.mp4" poster="/media/ai-sat.jpg" label="AI1" />
          <MediaTile className="h-52" src="/media/pad.mp4" poster="/media/starship.jpg" label="Starship" />
          <MediaTile className="h-52" src="/media/solar.jpg" label="Tesla Energy" />
          <MediaTile className="h-52" src="/media/datacenter.mp4" poster="/media/datacenter.jpg" label="Colossus" />
        </div>

        <section className="mt-16 overflow-x-auto">
          <p className="font-mono text-xs tracking-[0.22em] text-subtle uppercase">Programs</p>
          <table className="mt-6 w-full min-w-[640px] text-left text-sm">
            <thead className="font-mono text-xs tracking-wide text-subtle uppercase">
              <tr>
                <th className="py-3 pr-4">Program</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Now</th>
                <th className="py-3">Bottleneck</th>
              </tr>
            </thead>
            <tbody>
              {TRACKS.filter((t) => t.id !== "qc").map((t) => (
                <tr key={t.id} className="border-t border-border align-top">
                  <td className="py-4 pr-4">
                    <p className="font-mono text-xs text-subtle">{t.org}</p>
                    <p>{t.program}</p>
                  </td>
                  <td className={cn("py-4 pr-4 font-mono text-xs uppercase", TONE[t.status])}>
                    {STATUS_LABEL[t.status]}
                  </td>
                  <td className="py-4 pr-4 text-muted">{t.now}</td>
                  <td className="py-4">{t.bottleneck}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 font-mono text-xs text-subtle">
            Who has to deliver:{" "}
            <Link to="/sector" className="text-fg underline-offset-4 hover:underline">
              Sector
            </Link>
            . Not partners. Not a deal.
          </p>
        </section>

        <section className="mt-16">
          <p className="font-mono text-xs tracking-[0.22em] text-subtle uppercase">Line</p>
          <ol className="mt-6">
            {MILESTONES.map((m) => (
              <li key={m.id} className="grid grid-cols-[7rem_1fr] gap-4 border-t border-border py-4">
                <p className="font-mono text-xs text-subtle">{m.when}</p>
                <div>
                  <p>{m.title}</p>
                  <p className="mt-1 text-sm text-muted">{m.body}</p>
                  <p className="mt-1 font-mono text-xs text-subtle">Gate · {m.gate}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <SiteFooter />
    </Shell>
  );
}
