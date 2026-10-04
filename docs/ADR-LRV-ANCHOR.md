# ADR — The LRV anchor: the rolling-resistance assumption gets a validation

**Status:** implemented (lib + tests)
**Date:** 2026-10-03
**Rung:** surface.ts's longest-standing open limit — *"rolling resistance 0.1, swept and not
defended"*. ROADMAP §4 filed the dust-wear refusal; this defends the other leg.

## The source

NASA NTRS 19730008090 — *Mobility performance of the lunar roving vehicle: Terrestrial
studies* (MSFC, 1973, 87 pp., hashed in `data/raw/lrv/`). The MSFC Bekker/LLD
soil-vehicle model, fed with WES wheel-soil interaction tests, was compared against the
LRV's own onboard ampere-hour integrator readings from the Apollo 15 traverse:

- Across a **spectrum of LLL soil values** (terrestrial simulants to Apollo 15 soil
  mechanics), the RMS deviation per kilometre between computed and measured energy
  consumption is **11.4–16.0 %** (Table 7). The report's own words: *"Large variations in
  LLL soil values do not appear to influence appreciably the energy consumption results."*
- The WES-derived variant **overestimates** the onboard readings, median deviation of the
  order of **30 %** — the error direction is conservative (the real requirement is lower
  than modelled).
- The traction-only draw sits inside a validated model class whose answer is **insensitive
  to the soil-value uncertainty** — which is precisely what the assumed μ = 0.1 needed: not
  a defence of the decimal, but a measured statement that the verdict does not move.

## What `src/lib/lrv.ts` locks

1. The sourced deviation band, verbatim: **11.4–16.0 %** RMS per km (Table 7) and the
   ~30 % conservative median (WES variant).
2. The robustness consequence: with the E/m answer moving at most ±16 % under the soil
   uncertainty, the pole-to-equator wheel energy stays inside **0.38–0.51 MJ/kg** against
   the hop-with-landing crossover at **~2.33 MJ/kg** — a margin of ×4.6–6.1 that the soil
   values cannot close.
3. The conservative direction: the validated model over-predicts consumption, so the
   "nearly free" verdict is bounded on its pessimistic side.
4. `dustWear` stays absent (ADR-0002-of-surface's refusal stands); the 100 µg cm⁻² yr⁻¹
   accretion upper limit stays a degradation bound, not an energy term.

## Predictions, before the locks were written

* **L1.** The sourced band survives the model arithmetic: ±16 % on E/m keeps the crossover
  margin above ×4 — the verdict stands without the assumption being defended as a decimal.
* **L2.** The conservative direction is confirmable from the report's own words
  (computed overestimates measured).

## Results

Locked in `src/lib/lrv.test.ts`. Verdict: both pass; the surface.ts limit line is updated
from "assumed, not defended" to "assumed, bounded by the Apollo 15 validation".
