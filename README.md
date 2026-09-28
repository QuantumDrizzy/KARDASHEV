# KARDASHEV

An instrument that measures civilization in watts.

**K ≈ 0.73** (Sagan 1973, IEA TES 2023 ≈ 620 EJ ≈ 19.6 TW).  
Type I = 10¹⁶ W = 10,000 TW. Gap ×509. A model, not a grid meter.

```
K = (log10(P_watts) − 6) / 10
```

Site: Energy · AI · Biology · Health · Space · Quantum. First-order physics. Labeled assumptions. No partners. No cloud.

Author: [QuantumDrizzy](https://github.com/QuantumDrizzy) · [X](https://x.com/QuantumDrizzy)

---

## Run

```bash
npm install
npm test          # physics locks (kardashev / orbit / research)
npm run dev       # this sandbox: 0.0.0.0:8080 via startup.sh
```

In Grok App Builder the preview is bound to **8080**. Do not change `startup.sh`. Local clone: same `npm run dev` if you keep the Vite plugins; otherwise treat `src/` as the product and ignore `scripts/grok-*.mjs` / `public/__grok`.

## Layout

```
src/lib/          physics + catalogs (source of truth)
src/routes/       pages (TanStack file routes)
src/components/   Stage, benches, charts, HUD
public/media/     local video/poster (no CDN)
docs/             thesis, numbers, next modules — read before editing
CLAUDE.md         instructions for Claude / Grok
```

## Doctrine

- Watts first. Parameters do not raise K.
- AGI trains on Earth. ASI is Type I. Inference may leave the crust.
- Vacuum only radiates. Design the radiator before the FLOP.
- Quantum: PQC and sensing. Not a shortcut to AGI.
- Offline. No auth. No external APIs.

## Tests that matter

`src/lib/kardashev.test.ts` — TES ~20 TW, Sagan rungs, gap ×509, λ=0.62 ~100 yr, AM0, Earth disk, kW/s.

If a number changes, the test must change with a source citation in the comment.
