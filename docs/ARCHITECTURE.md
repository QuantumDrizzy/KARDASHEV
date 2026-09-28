# Architecture

## Stack (this repo)

- React 19 + TanStack Start/Router (file routes in `src/routes/`)
- Tailwind v4 (`src/styles.css` `@theme`)
- Recharts (`power-chart`, `life-chart`). No 3D: Three.js was removed with `orbit-scene.tsx`.
- Zustand available, unused for core physics
- **Auth off. DB off.** `src/lib/auth/*` and `src/lib/db.ts` are sandbox prewire — do not import them in product routes.
- Media: local files under `public/media/` (mp4 + jpg posters). No YouTube, no CDN.

## Runtime (Grok sandbox)

- Preview: `0.0.0.0:8080`
- `startup.sh` → `npm run dev`
- `src/routes/__root.tsx` must keep `AuthProvider` + `PreviewHostBridge` even with auth off
- Do not strip `grokPwaPlugin` / `public/__grok`

## Data flow

```
kardashev.ts  ──► usePower() ──► Stage hero (K, TW, gap, years)
forecast.ts   ──► power-chart (inertia vs λ)
physics.ts    ──► energy-bench / orbit-bench (sliders → evaluate())
orbit.ts      ──► /space numbers + orbit-scene
grid.ts       ──► (M2) grid bench: 5 bulkheads, latency, kill switch
life.ts       ──► /biologia /salud
research.ts   ──► LayerResearch (per-layer catalog)
roadmap.ts    ──► /roadmap /ia tracks
programs.ts   ──► /sector
plan.ts       ──► /plan
quantum.ts    ──► /quantum modality picker
```

`usePower` ticks every 250 ms (1 s if reduced-motion). It is the only “live” clock. Everything else is closed-form.

## UI grammar

- `Shell bleed` + full-viewport `Stage` (video + veil + copy) + `DataStrip` of four stats
- Display type: `.k-hero` / `.k-line` (Big Shoulders)
- Body: IBM Plex Mono
- Warn gold `#e8a04e` for the number that hurts
- Radius 0. Heavy black. No glassmorphism, no rounded cards, no hero gradients
- Nav: Energy AI Biology Health Space Quantum
- Footer: instrument + layers + sector + about + contact

## Adding a page

1. `src/routes/foo.tsx` — `createFileRoute("/foo")`
2. Reuse `Shell bleed`, `Stage`, `DataStrip`, `LayerResearch` if the layer has catalog entries
3. Numbers from `src/lib`, never literals in JSX except labels
4. `routeTree.gen.ts` is generated — do not hand-edit unless the plugin is down

## Tests

```
npm test
```

Runs node:test on:

- `src/lib/kardashev.test.ts` (physics locks)
- `src/lib/orbit.test.ts`
- `src/lib/grid.test.ts` (federated bulkheads — see `docs/ADR-M2-GRID.md`)
- `src/lib/research.test.ts`
- sandbox auth/app-data tests (ignore unless you touch those files)

## What is NOT in this repo yet

See `docs/NEXT-MODULES.md`. No QUBO solver, no JAX, no Muse 2 pipeline. The federated-grid
sim now exists as `src/lib/grid.ts` (lib + tests); its bench UI does not. The site currently **measures**. The next phase **validates** architecture for 0.73 → 1.0.
