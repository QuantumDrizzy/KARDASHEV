# Routes

| Path | File | What it does |
|---|---|---|
| `/` | `index.tsx` | Live K, Type I gap, Type II sun, Type III, log scale, layer nav |
| `/energia` | `energia.tsx` | AM0, disk %, σT⁴, energy bench, research catalog |
| `/ia` | `ia.tsx` | AGI=Earth / ASI=K, orbital inference, industry tracks |
| `/biologia` | `biologia.tsx` | NPP vs Type I, HANPP, boundaries |
| `/salud` | `salud.tsx` | Operator uptime, HALE, dose, brain watts |
| `/space` | `space.tsx` | Two-body ISS, SSO, orbit bench. No 3D scene |
| `/quantum` | `quantum.tsx` | Does not raise K. Modalities. PQC / sensing / mK |
| `/grid` | `grid.tsx` | M2 federated bulkheads: latency, HVDC exclusion, blast radius, storage sizing. Bench stub pending (M2b) |
| `/roadmap` | `roadmap.tsx` | Industry tracks + milestones |
| `/plan` | `plan.tsx` | 8-step sequence + stack table |
| `/sector` | `sector.tsx` | Programs list (observation). Reads `sector.ts`, **not** `programs.ts` |
| `/about` | `about.tsx` | Method + sources |
| `/ahora` | → `/plan` | alias |
| `/bench` `/flota` `/doctrine` `/research` `/stack` | thin/redirect | keep unless you rehome links |

Components: `stage.tsx` (full-bleed video), `shell.tsx` (nav), `energy-bench.tsx`,
`grid-bench.tsx` (stub), `orbit-bench.tsx`, `power-chart.tsx`, `log-scale.tsx`,
`layer-research.tsx`, `use-power.ts`.

**Removed 2026-08-25**, after a browser sweep of all 18 routes found nothing imported them:
`orbit-scene.tsx`, `k-hud.tsx`, `src/lib/programs.ts`. `three` and `@types/three` went with
them — they existed only for the orbit scene, were already tree-shaken out of the build, and
cost 28 MB in `node_modules` for zero runtime bytes. Backups sit outside the repo.
