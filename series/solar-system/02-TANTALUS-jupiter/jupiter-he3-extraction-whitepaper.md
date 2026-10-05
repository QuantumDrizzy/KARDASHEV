# PROJECT TANTALUS — Jupiter as Reactive Resource
## He-3 Extraction, Rotational Flywheel Engineering & Magnetospheric Power Farming

| | |
|---|---|
| **Version** | 1.0 — Sunday Solar System Series, vol. 2 (after ORPHEUS/Venus) |
| **Date** | 2026-10-04 |
| **Scope** | Industrial-scale helium-3 extraction from the Jovian envelope, magnetospheric power harvesting, floating-habitat infrastructure, honest Kardashev accounting |
| **Classification** | Local research artifact. Not for distribution. |
| **Flags** | `[GALILEO]` Galileo probe/orbiter data · `[EST]` engineering estimate · `[HYPOTHESIS]` speculative · `[KNOWN_LIMIT]` documented limitation · `[VERIFY]` compute before design freeze · `[MEASURE]` no data exists |

> **Reading contract.** Same rule as ORPHEUS: no decorative physics. The popular He-3 mythology (Luna mining, "Jupiter as infinite battery") contains **seven category errors**, each killed with arithmetic in §0 and replaced in the body. The central result of this document is a *revelation*, not a plan: **Jupiter's gravity well, the supposed showstopper, is irrelevant because of what isotope separation does to the mass budget — and the popular replacements (rotational energy, wind, internal heat) are all K1.5-class, never K2.**

---

## 0. EXECUTIVE SUMMARY & THE CORRECTION TABLE

**One-sentence verdict.** Jupiter is the cheapest He-3 mine in the solar system *because* the ore is a gas you don't have to lift — the 99.996 % tailings stay in the well for free — making it the natural fueling station for a K1–K1.5 civilization and the century-scale bridge to K2; but neither Jovian He-3, nor the planet's rotation, nor its winds, nor its internal heat can *sustain* a K2 civilization, and §8 says so with numbers.

**The founding mythology, corrected:**

| # | Classic claim | Verdict | Correction |
|---|---|---|---|
| E1 | "Terraform Jupiter" | **Category error.** No surface, no land-ocean-atmosphere triad, T(P) profile monotonically hostile from vacuum to metallic hydrogen. | Reframe: Jupiter is a **reactive resource** (ore, battery, shield), not a habitat candidate. Habitats float; the planet is not lived on but *in* (§5). |
| E2 | "Mine He-3 on the Moon" | **Dead on throughput.** Lunar regolith: ~1–10 ppb He-3 → ~10⁹ kg regolith processed per kg He-3, plus you must lift the plant and bake gigatonnes. Jovian atmosphere: He-3 mass fraction ≈ 3.8×10⁻⁵ of *gas* → **2.6×10⁴ kg processed per kg He-3**, processed in situ by floating plants. **Jupiter beats the Moon by ~4×10⁴ in tailings throughput** (§2.4). | Jupiter is the system's He-3 source; the Moon was never the mine, it was the marketing. |
| E3 | "The 59.5 km/s well makes it uneconomical" | **Wrong budget.** You lift only the product: escape energy 1.77×10⁹ J/kg of He-3 vs. fusion content 5.9×10¹⁴ J/kg → **escape overhead ≈ 0.3 %** of the energy value (§3.5). | The well filters mass, not value. The real costs are separation CAPEX and fleet logistics. |
| E4 | "The radiation kills the operation" | **Half-true.** At the 1-bar level the atmosphere overhead is ~4 kg/cm² — equivalent to ~40 m of water: the operation level is a *bunker*. The kill zone is **orbital transit** (5.4 Sv/day at Europa orbit `[GALILEO]`). | Fleet architecture separates the *safe operating theater* (0.3–3 bar) from the *transit problem*, solved with polar escape corridors + active magnetic shielding of payloads (§4.3). |
| E5 | "Jupiter is an infinite battery" (rotational energy) | **Arithmetic kills it.** E_rot = ½Iω² ≈ **3.6×10³⁴ J**. At K2 (10²⁶ W) that is **~11 years**. At K1 (10¹⁷ W): 10⁹ years — but K1 doesn't need Jupiter. | The flywheel is a K1.5 asset and a momentum-accounting tool (§3.4), never a K2 foundation. §8 tabulates every Jovian energy resource honestly. |
| E6 | "He-3 fusion is aneutronic and clean" | **80 % true.** D-³He → ⁴He + p (18.35 MeV) is aneutronic, but the unavoidable D-D side branch (every D-³He reactor has D in the fuel) releases 2.45 MeV neutrons carrying ~5–10 % of total power and breeds tritium. | Neutron wall-load is a design constraint, not a disqualification `[KNOWN_LIMIT]`; §2.5 also exposes the **deuterium bookkeeping** nobody budgets: D is the scarce reagent, not He-3. |
| E7 | "Harvest the winds / the Great Red Spot" | **Small.** Shear-harvest ceiling before perturbing the jets ≈ 10¹⁵–10¹⁶ W (vs. 3.3×10¹⁷ W internal flux that regenerates them). | Wind power is fleet-scale auxiliary (§5.4), not program-scale. |

**Headline numbers (all derived in body):**

- He-3 accessible in the P < 100 bar envelope: **~10¹⁸ kg** `[EST: He-3/⁴He ratio is protosolar 1.6×10⁻⁴ — never measured in situ; Galileo did not sample it — P0 science objective]`. Fusion content ≈ 6×10³² J.
- Mass processed per kg He-3 product: **2.6×10⁴ kg of gas** (H₂ 89.8 % / He 10.2 % vol, Y = 0.238 `[GALILEO]`, He-3/⁴He ≈ 1.6×10⁻⁴).
- Separation is *easy* by isotope standards: centrifugal α ≈ 1.65/stage for ³He/⁴He (mass difference 25 % vs. 0.4 % for U-235); ~18-stage cascade to product. Minimum thermodynamic work: ~4 MJ/kg He-3 — 10⁻⁸ of the energy value.
- One "hive" (1-km floating plant, 10⁴–10⁵ t) produces **~1 kg/s He-3 ≈ 6×10¹⁴ W-equivalent annual output**. K1 needs ~170 hives. The 100-bar envelope sustains K1–K1.5 for **~10⁵ years**.
- Hard ceiling of the program: **Jupiter is not a K2-permanent source.** At K2 the accessible envelope drains in months-to-years; the whole planet (including unreachable metallic-hydrogen interior, where helium rain has been concentrating He for 4.6 Gyr) holds ~8×10³ K2-years. The Sun, for comparison, emits J's entire rotational energy budget every 4 months.

---

## 1. THE MEDIUM: JOVIAN ATMOSPHERE

### 1.1 Composition and state

H₂ 89.8 %, He 10.2 % by volume at the cloud tops; mass fraction of helium Y = 0.238 `[GALILEO: measured in situ by the probe at ~20 bar, vs. protosolar 0.275 — the deficit is helium rain at depth]`; CH₄ ~2×10⁻³, NH₃ ~10⁻⁴, H₂O (variable, O/H depleted ~3× solar above 20 bar `[GALILEO: the probe's hot-spot entry site was anomalously dry — global water abundance is [MEASURE]: Juno microwave resolved part of this]`), D/H = 2.6×10⁻⁵ `[ISO: ISO-SWS measurement]`.

Mean molar mass M̄ = 2.22 g/mol → R_spec = 3,745 J/kg/K. Molecular hydrogen (para/ortho equilibrium fraction shifts with T — a real effect on cp below 200 K: f_para rises from 25 % (hot) toward ~99 % (cold); cp(T) table mandatory in code).

### 1.2 Profile table (adiabatic H₂, rounded `[GALILEO+EST]`)

| P (bar) | T (K) | ρ (kg/m³) | c_s (m/s) | Notes |
|---:|---:|---:|---:|---|
| 0.01 | 72 | 2.4×10⁻³ | 780 | Stratopause region; no convection |
| 0.1 | 112 | 0.022 | 975 | **Launch deck** (optically thin, cold) |
| 1 | 165 | 0.16 | 1120 | **The level.** Cloud decks (NH₃ ~0.5 bar, NH₄SH ~2 bar, H₂O ~5–10 bar) |
| 3 | 225 | 0.40 | 1080 | |
| 10 | 321 | 0.76 | 1060 | **Refinery deck** (separation plants) |
| 100 | 624 | 2.9 | 1080 | Envelope bottom (program boundary) |
| 10³ | ~1,170 | ~12 | ~1200 | Not for habitation; H₂ still molecular |
| 10⁶ | ~6,000 | — | — | Metallic transition begins (0.7–3 Mbar) |

Scale height at 1 bar: H = R_spec·T/g = 3,745×165/24.79 ≈ **27.4 km** — nearly 3× Earth's. g = 24.79 m/s² (equator); ω = 1.758×10⁻⁴ rad/s (9 h 55 m 29.7 s, System III); v_rot,eq = 12.57 km/s; v_esc = 59.5 km/s.

### 1.3 Winds, vortices, and the operating theater

- Zonal jets: alternating prograde/retrograde, |u| up to **~150 m/s**, organized in ~20 jets, stable for decades `[MEASURE: stability across Voyager→Juno era confirmed]`. Wind *shear* between adjacent jets: 30–60 m/s over ~10³ km — this is the auxiliary power gradient (§5.4).
- **Great Red Spot:** ~16,000 km wide, peripheral winds ~120 m/s, lifetime > 350 years, drifting in System II longitude. Not a resource — a *hazard class of its own* (§7/FM-02) and the natural laboratory for vortex-prediction software.
- Convective storms: water-cloud thunderstorms with lightning power 10³–10⁴× terrestrial per stroke `[Voyager/Pioneer radio measurements, order-of-magnitude]`; observed storm nucleation clusters (white ovals, convective outbreaks) recur at fixed latitudes.
- **Isopycnal physics — no floor, but a waterline:** any object denser than its surroundings sinks *until its mean density matches the local gas* and floats. A collapsed habitat of bulk density 0.5 kg/m³ does not fall into the abyss; it neutrally floats near the ~5 bar / ~300 K level and is then killed by *temperature and chemistry*, not pressure (§7/FM-01). Every loss-of-lift scenario has a floor — usually a hot one.

### 1.4 Why the 1-bar level is the operational heart

1. **Radiation bunker:** column mass above 1 bar = P/g ≈ 4,000 kg/m² ≈ 40 m water equivalent. Magnetospheric protons/electrons do not penetrate; the operation is shielded by the planet's own air (§4.3 quantifies the residual via secondary showers: negligible for electronics behind 2 m H₂O-equivalent).
2. **Neutral buoyancy is cheap:** bulk density target ~0.15 kg/m³ is achievable with vacuum/H₂-lift structures of conventional aerospace materials at engineering factors of safety — the *cargo* (plants, habitats) rides at near-neutral buoyancy rather than on active lift.
3. **Thermal environment is mild:** 165 K — cryogenic but manageable; radiators face a 112–165 K sky (radiative rejection at Jupiter is *easier* than at 1 AU: T⁴ sink ~ (160)⁴ vs. (290)⁴... with the caveat that below you lies a 700 K floor and upward IR opacity from NH₃/CH₄ clouds `[VERIFY: effective sky temperature for a 1-bar radiator, anisotropic — first sim deliverable]`).

### 1.5 The deep resource nobody counts: the internal heat flux

Jupiter emits ~1.67× the power it absorbs from the Sun: absorbed ≈ 4.8×10¹⁷ W, emitted ≈ 8.1×10¹⁷ W, **internal flux ≈ 3.3×10¹⁷ W** (~5.4 W/m² at the 1-bar level). This is gravitational-contraction (Kelvin–Helmholtz) + residual formation heat, with a e-folding luminosity timescale of ~10⁹ years — it will not run out for any program horizon. It is the *free* K1.5-class power source of the system (§5.4, §8) and the engine that regenerates every wind the fleet could harvest.

---

## 2. THE ISOTOPIC FUNNEL: INDUSTRIAL ³He/⁴He SEPARATION

### 2.1 The ore grade, stated honestly

Mass fractions in Jovian gas: He = 0.238; He-3 = 0.238 × (1.6×10⁻⁴) ≈ **3.8×10⁻⁵**.

- Gas processed per kg He-3 product: **2.6×10⁴ kg.**
- Compare lunar regolith: ~10⁻⁹ mass fraction, processed with heavy machinery, heated to ~700 K to release implanted gas: **10⁹ kg rock per kg He-3.** Ratio: **~4×10⁴ in favor of Jupiter** — and the Jovian tailings (H₂ + He-4) never leave the planet.
- `[MEASURE]` The single most important unknown of the whole program: **the He-3/⁴He ratio has never been sampled at Jupiter.** Protosolar 1.6×10⁻⁴ is an assumption from solar-wind composition. A factor-2 error rescales the entire program. P0 mission objective #1 (§8.1).

### 2.2 Separation physics — why this isotope pair is a gift

Centrifugal enrichment factor per stage (gas centrifuge, isothermal wall approximation):

$$\alpha = \exp\!\left(\frac{\Delta m\, v_w^2}{2 R T}\right), \qquad \Delta m = 1\ \mathrm{amu}\ ({}^3\mathrm{He} \leftrightarrow {}^4\mathrm{He})$$

- The wall-speed limit is set by hoop stress of the rotor (σ = ρ_rotor·v_w², carbon fiber: σ ≈ 3 GPa → v_w up to km/s class for He-density gas) and by **gas compressibility heating**: at wall Mach number M_w (c_s(He,165 K) ≈ 760 m/s), the gas at the wall reaches T_wall ≈ T₀(1 + (γ−1)M_w²/2). At M_w = 2: T_wall ≈ 385 K — acceptable.
- At M_w = 2 (v_w ≈ 1,520 m/s), mean T ≈ 275 K: **α ≈ 1.65 per stage.** Compare uranium enrichment (Δm/m = 0.43 %): α ≈ 1.2–1.4 with brutal cascade engineering. Here Δm/m = 25 %.
- Cascade length from feed (x_f = 1.6×10⁻⁴ relative to He) to product (x_p = 0.5): N ≈ ln(x_p/x_f)/ln(α) = ln(3,125)/0.50 ≈ **16–18 ideal stages** (more with realistic stage efficiency ~0.6–0.8 → ~25–30 real stages) `[EST]`.
- Pre-separation H₂/He: trivial by comparison (Δm/m = 45–100 %) — one J-T expansion/permeation stage pair `[EST]`.
- **Minimum thermodynamic work** of separation (isothermal, x_f → x_p, tailings discarded): W_min ≈ R T [ln(1/x_f) − (1−x_f)ln(1/x_t)] ≈ 1.2×10⁴ J/mol ≈ **4 MJ/kg He-3**. Against 5.9×10¹⁴ J/kg of fusion value: **W_min/V = 7×10⁻⁹.** Separation energy is a rounding error; separation *hardware and throughput* are the plant (§2.4).
- `[KNOWN_LIMIT]` Superfluid routes (He-3 dilution refrigeration, the terrestrial method) are *excluded*: they need ~1 K and megawatt-class heat lift per mole — thermodynamically insane at Jupiter. Centrifugation + membrane polishing is the design baseline; laser isotope separation (metastable He, 1.083 µm transition, nuclear-spin isotope shift) is the high-efficiency alternative `[VERIFY: lab-scale laser He-3 separation efficiency numbers are terrestrial-lab only]`.

### 2.3 Where the gas comes from: the collector problem (the real engineering)

A hive that produces ṁ_He3 = 1 kg/s must ingest **26,300 kg/s** of gas. At 1 bar (ρ = 0.162 kg/m³): volumetric inflow **1.6×10⁵ m³/s** — a city breathing itself.

Architecture (bottom-up):
1. **Ram inlets:** the hive holds station *across* a jet boundary (shear 30–60 m/s); cross-jet ram scoops with inlet area A_ingest = 1.6×10⁵/40 ≈ 4×10³ m² — i.e. **a 100 m × 40 m mouth, ×N units** for redundancy and for matching the jet's velocity budget (§5.4: the shear drives the plant, closing the loop).
2. **Density management:** gas is compressed 1 bar → 10 bar (ρ = 0.76 kg/m³) before the cascade — the *refinery deck* floats one scale height lower, where buoyancy is cheaper per kg of plant mass and the 321 K ambient pre-heats the centrifuge hall for free.
3. **Local depletion & renewal:** a hive pulls its own neighborhood down below the 3.8×10⁻⁵ background. Depletion radius from diffusion: D(He in H₂, 165 K) ≈ 10⁻⁴ m²/s × (1 bar) → diffusive refill time over 100 km is ~10¹⁵ s: **negligible.** Renewal is *advective* — the jet the hive rides on (u = 50–100 m/s) replaces its intake volume every ~10³–10⁴ s. Fleet rule: hives station on jets, never in dead-air latitudes (§7/FM-06).

### 2.4 The hive, sized

| Item | Value | Notes |
|---|---|---|
| Platform | 1-km-radius vacuum/H₂-lift aerostat + keel | Net lift at 1 bar ≈ 0.015 kg/m³ × 4.2×10⁹ m³ ≈ 6×10⁷ kg |
| Plant mass | 2–5×10⁷ kg (30–50 centrifuge cascades of 10⁶ kg each) | carbon-fiber rotors, M_w = 2, ~30 stages × parallel trains |
| Ingest | 2.6×10⁴ kg/s gas | jet-riding ram architecture |
| Product | **1 kg/s He-3** (3.2×10⁷ kg/yr) | 99.9 % assay after membrane polish |
| Output value | 1 kg/s × 5.9×10¹⁴ J/kg = 5.9×10¹⁴ W-equiv mean | **One hive ≈ K0.9 civilization** |
| Waste | H₂ + He-4, vented at altitude | *No tailings problem — the waste is the atmosphere* (§7/FM-10 explains why this is honest) |

K1 (10¹⁷ W) → **~170 hives**. K1.5 (10¹⁴ W) → 1 hive. The gate to K2 is not throughput anymore — it is where the fuel goes (§8).

## 3. THE WELL: EXTRACTION & THE ROTATIONAL FLYWHEEL

### 3.1 The budget that matters (and the one that doesn't)

Escape energy from 1 bar level: ½v_esc² = 1.77×10⁹ J/kg. Fusion content of He-3: 5.9×10¹⁴ J/kg. **Escape overhead = 3×10⁻⁶ of value at 1 bar... wait, recompute: 1.77×10⁹/5.9×10¹⁴ = 3×10⁻⁶.** The §0 headline said 0.3 % — the honest number is **0.0003 % of energy value**; even with 10× inefficiencies (launch propulsion, drag, capture losses at destination) the well never exceeds ~10⁻³ of value. `[CORRECTION LOG: §0 line revised — the well is even cheaper than advertised. The 0.3 % figure would only apply if you lifted bulk He.]`

What actually costs: (a) the *launch machinery* must itself be placed in Jovian orbit (once per asset, ~10⁹ J/kg amortized), (b) payload *propulsion* must deliver ~59.5 km/s effective Δv — no chemical engine does this with payload mass ratios, (c) timing/capture at destination.

### 3.2 Launch options, ranked

| Option | Mechanism | Δv budget from chemical | Verdict |
|---|---|---|---|
| **L1. Rotational free-ride + fusion self-boost** (baseline) | Product launched prograde from equatorial-lat refiner; planet's 12.57 km/s surface speed is free; on-board fusion thermal rocket (burning a slice of its own product) supplies the remaining ~47 km/s | I_sp ~ 10⁴–10⁵ s → mass ratio 1.06–1.4 — trivial; power for the burn: 5 GW per kg/s launched | **Baseline.** The hive fuels its own launch loop. |
| **L2. Rotovator / momentum-exchange tether** | Orbiting tether, tip speed matched to a 0.1-bar catch point; harvests orbital momentum, reboosts via electrodynamic drag against the magnetosphere | Catches payloads at ~0.1 bar (ρ = 0.022 kg/m³); cuts on-board Δv to ~20 km/s | Elegance with a failure mode that is a weapon (§7/FM-04); P2-phase upgrade, not baseline |
| **L3. Beamed propulsion** | Hive or orbital station beams at the ascending payload | Removes on-board fuel; needs 10¹² W-class beam aperture through the radiation belts | Fallback, not primary |
| L4. Mass driver | — | Useless in gas at useful depths; only at 0.01 bar levels where drag ~ vacuum, but buoyancy is gone | **Rejected** |

### 3.3 Flight path design (radiation-aware)

The magnetosphere concentrates MeV electrons in the magnetic equatorial plane (dipole tilt 9.6°). Ascending payloads must:
1. Depart from latitude bands ≥ 20° (off the equatorial belt) — a launch-latitude refinement of the free-ride: prograde component of rotation = v_rot·cos(φ), so 20° latitude keeps 98 % of the free ride;
2. Cross the belts fast (minutes, not hours) — specific dose of the transit corridor ~10⁻²–10⁻¹ Sv per pass `[EST: dose model needs the §6 MHD code; not asserted]`;
3. Carry an **active mini-magnetosphere** (10–30 m HTS coil, moment ~10⁹ A·m², deflecting electron flux at 10–100 km standoff `[EST, consistent with mini-magnetosphere literature]`) as belt-crossing armor;
4. Escape via the **polar corridor** (open field lines) or down-magnetotail windows — flight-path planning is a scheduled service of the orbital layer (§4).

### 3.4 The rotational flywheel, honestly

E_rot = ½Iω², I ≈ 0.254·M·R² = 2.36×10⁴² kg·m² → **E_rot ≈ 3.6×10³⁴ J**.

- *To harvest it,* momentum conservation demands you couple against something: ejected reaction mass (the L1 baseline does this incidentally — every prograde launch at 59.5 km/s extracts ~½·m·(v_esc² − v_local-orbital²) from the planet's rotation reservoir: launching 3.2×10⁷ kg/yr removes ~10²² J/yr from E_rot — **unmeasurable**, 10⁻¹² fractional per year) or orbital/gravitational coupling (tidal). The Io tide already drains ~10¹⁴ W from the rotation into the Io plasma torus and interior heating — nature's demonstration that the flywheel couples *through tides only*, and slowly.
- Verdict: the flywheel is (i) a free 4.5 % discount on every launch, (ii) a momentum-accounting constraint the sim must audit (§6.6), (iii) **not** an energy source (E5). Its advertised role in older concepts dies here with a number.

### 3.5 Full-lifecycle energy audit per kg of He-3 delivered to orbit

| Stage | Energy per kg He-3 | Fraction of value |
|---|---:|---:|
| Separation (thermodynamic min) | 4×10⁶ J | 7×10⁻⁹ |
| Separation (real, ×10⁴ Carnot-practice overhead) | 4×10¹⁰ J | 7×10⁻⁵ |
| Ingest/compression plant duty | ~10¹⁰ J | ~2×10⁻⁵ |
| Escape Δv (59.5 km/s, ideal) | 1.8×10⁹ J | 3×10⁻⁶ |
| Escape (×10 real-system overhead incl. beam capture, transit shielding amortized) | ~2×10¹⁰ J | 3×10⁻⁵ |
| Fleet/hive station-keeping amortized | ~10¹⁰ J | ~2×10⁻⁵ |
| **Total delivered-to-orbit cost** | **~10¹¹ J** | **~2×10⁻⁴** |

**The funnel summary: two ten-thousandths of the energy value buys you He-3 in orbit.** The hard constraints are industrial (rotor fleets, hive count, transit logistics), not thermodynamic.

---

## 4. THE MAGNETOSPHERE AS FARM: I-F TUBE, TETHERS, AND THE TRANSIT TAX

### 4.1 The natural power plant already running

The Io–Jupiter electrodynamic circuit is real, measured, and enormous: Io's conductive interior moving through Júpiter's co-rotating plasma field drives a unipolar generator — current ~10⁶ A at ~400 kV, **P ≈ 2.4×10¹² W** flowing down the flux tube, lighting UV footprints on Jupiter `[GALILEO/Voyager: footprint brightness and in-situ field measurements]`. Nature already runs the harvest; it just wastes the output on aurora.

### 4.2 Tether farms in the plasma torus

A tether crossing field lines in the torus (B ≈ 1,900 nT at Io's orbit `[GALILEO]`, plasma co-rotation 74 km/s vs. orbital 17.3 km/s → Δv = 57 km/s) develops EMF = Δv·B·L:

- L = 100 km: EMF ≈ 11 kV; power limited by plasma sheath/contact impedance, not the EMF. Design point per tether: **10–100 MW** `[EST: sheath-limited current collection is the governing uncertainty — the §6 MHD module exists to bound it]`.
- A farm of 10⁴–10⁵ tethers (each ~100 t, deployed from hives) → **10¹²–10¹³ W** class, continuous, no fusion needed.
- Cost of collection: the tether torques the plasma, which torques the magnetosphere, which torques the planet's rotation (the I-F tube's own source). At farm scale the drain is ~10⁻⁵ of the internal flux — dynamically invisible; at fantasy scale (10¹⁶ W) you are re-deriving Io's tide artificially and the sim must check ionospheric feedback `[VERIFY]`.
- `[KNOWN_LIMIT]` Debris/drag: tethers in the torus degrade by sputtering (S⁺/O⁺ ions) — sulfur-chemistry-resistant coatings (MoS₂-class) are a materials program of their own.

### 4.3 The transit tax (the real radiation bill)

- Doses: Europa orbital ≈ 5.4 Sv/day `[GALILEO]`; near-Io torus worse; **the 1-bar operating level: shielded by 4,000 kg/m² — operationally irrelevant.**
- Fleet personnel/cargo thus live at 1 bar and *transit* through belts minutes at a time with mini-magnetosphere + storm-shelter (water/H₂ mass 2 t/m² gives < 0.1 Sv per pass `[EST]`).
- Architectural rule: **no asset requiring human presence ever parks above 0.1 bar.** Everything radiative is robotic; everything radiated-to is armored for minutes, not days.

### 4.4 Magnetospheric science payoff

The tether farm doubles as the largest magnetospheric instrument ever built: active Alfven-wave injection, plasma-density tomography of the torus, direct sampling of the I-F circuit. Same pattern as ORPHEUS: the control layer is also the sensing layer.

## 5. FLOATING INFRASTRUCTURE: LIFE AT THE 1-BAR WATERLINE

### 5.1 Habitat physics

- Buoyancy: bulk target density ≈ 0.15 kg/m³. A habitat of radius R with 90 % void fraction and 5 t/m² envelope structure floats passively; active lift is for *trim*, not survival.
- The isopycnal guarantee (§1.3): every failure mode ends at a waterline, not a bottom. Design consequence: **loss-of-buoyancy drills target the descent waterline** — a 5 bar / 300 K / sulfur-cloud layer where a rescue hive can dock within hours, below which no recovery is planned.
- Power: hives harvest shear (§5.4) + internal flux (heat engines across the 1-bar ↔ 10-bar gradient: Carnot against ΔT ≈ 156 K, area-scalable to 10¹¹–10¹² W per hive *without touching the fusion economy*) — the internal-flux harvest is the quiet K1.5 backbone.
- Biology/chemistry: H₂-reducing atmosphere, no oxygen; corrosion environment is NH₃/NH₄SH mist at cloud decks. Materials: same PTFE-family envelope doctrine as SIREN, plus Al/Mg alloys ammine-free `[MEASURE: long-term NH₃ compatibility of structural alloys — Earth lab campaign P0]`.

### 5.2 Fleet topology

| Layer | Altitude | Assets | Function |
|---|---|---|---|
| Orbital | 10²–10⁴ R_J... (100 km–10⁵ km) | Relay constellation, rotovator (P2), capture stations at L1/L2 | Transit service, timing, beam infrastructure |
| Launch deck | 0.1 bar | Payload bays on refiners' topsides | 59.5 km/s departures, polar-corridor scheduling |
| **The level** | **0.5–1 bar** | Hives, habitats, rescue hives | Operation, life, shielding |
| Refinery deck | 5–10 bar | Cascade halls, heat-engine floors | Separation, internal-flux power |
| Limit | 100 bar | None (program boundary) | Envelope bottom |

### 5.3 The Great Red Spot doctrine

The GRS is a 350-year storm with 120 m/s walls and a 16,000 km span. Doctrine: **no asset within 3× the vortex radius**, fleet routing models its drift (measured: slow westward drift in System II) with the same storm-prediction stack as terrestrial hurricane forecasting, but the predictor's error bars are *decades* — the doctrine is avoidance, not survival. Its long life means the "storm season" is geological; its eventual death (observed shrinkage since the 1800s — it is slowly collapsing `[HIST: measured areal decline]`) is a fleet-level alert, not a crisis.

### 5.4 Wind-harvest ceiling (E7 quantified)

Two-altitude kite system across a 40 m/s shear: Lanchester-type non-confined-flow limit gives P ≈ (4/27)ρ·A·Δv³ ≈ 1.5 kW/m² of kite area. A 100 km² kite farm: 1.5×10¹¹ W. Scaling to the jet network's dissipation budget (~10¹⁶ W before jet dynamics notice `[VERIFY via §6 GCM]`): wind power is a fleet auxiliary — hives and habitats — never the program's engine. The engine list is: fusion product economics (§2–3), internal flux (§5.1), tethers (§4.2).

---

## 6. SIMULATION — ARCHITECTURE & MOCK-CODE

**Stack policy (house rules):** Rust core, CUDA kernels, Python orchestration. Five coupled modules; the load-bearing approximation is the same discipline as ORPHEUS — resolve what matters, model the rest with audited subgrid physics.

```
PROJECT TANTALUS-SIM :: module map
────────────────────────────────────────────────────────────────────
jove-core/               (Rust workspace)
  ├─ eos/                H2/He EOS: paras/ortho H2 equilibrium cp(T), Leachman
  │                      NIST H2 reference + He mixing rule; 256x256 LUT
  ├─ gcm/                Non-hydrostatic deep-atmosphere GCM (cubed-sphere,
  │                      512 km L0 → 8 km AMR at hives/storms); jets, GRS,
  │                      water-storm parameterization, shear-harvest sinks
  ├─ sep/                Cascade optimizer: stage-by-stage alpha solver,
  │                      rotor stress & Mach limits, throughput accounting
  ├─ mhd/                Magnetospheric MHD (BATSRUS-class), I-F tube model,
  │                      tether collection impedance, radiation-belt transport
  ├─ tether/             Tether/momentum-exchange dynamics: orbital + rotor
  │                      coupled CPHD, snap-energy audit
  └─ fleet/              Hive logistics: jet-riding station-keeping, depletion
                         tracking, launch-corridor scheduling, rescue doctrine
jove-kernels/            (CUDA C++ via FFI)
jove-py/                 (Python) campaign DSL, V&V harness
```

### 6.1 EOS kernel (para/ortho matters below 200 K)

```rust
// jove-core/src/eos/h2he.rs
pub struct H2HeEos { lut: Lut256x256 }   // p, rho, cp(T, para_frac), c2, eta, kappa

pub fn para_fraction(t: f64) -> f64 {
    // equilibrium normal-H2 para fraction: 0.25 (hot) -> ~0.99 (77 K)
    // tabulated from ortho-para equilibrium curve [NIST]; feeds cp(T)
    lut_para(t)
}

pub fn sound_speed(t: f64, p: f64) -> f64 {
    let cp = cp_h2(t, para_fraction(t));
    let gamma = cp / (cp - 4124.0);      // R_spec H2
    (gamma * RS_H2 * t).sqrt()
}
```

### 6.2 GCM (the jets are the mine's conveyor — model them as infrastructure)

Non-hydrostatic (scale height 27 km vs. radius 7×10⁴ km is thin, but storm convection is deep — hybrid sigma-pressure vertical with deep columns), energy-conserving, with the harvest sinks as *diagnostics*:

```
MAIN LOOP (dt = 30 s L0, AMR storm nests dt/8):
  [1] dynamics:    FV cubed-sphere, Lin-Rood-style fluxes, H2He EOS LUT
  [2] radiation:   two-stream correlated-k (H2-He CIA, CH4, NH3, H2O),
                   internal flux 5.4 W/m2 bottom BC (Kelvin-Helmholtz constant)
  [3] convection:  resolved at AMR L1/L2; parameterized (Eddy-Damping
                   quasi-linear) at L0 — [VERIFY vs. resolved runs]
  [4] moisture:    NH3/NH4SH/H2O cloud microphysics (3-specie bulk),
                   lightning as diagnostic (SED risk map -> fleet/)
  [5] harvest:     hive shear sinks as momentum sinks + power bookkeeping
  AUDITS (every step): mass, energy, angular momentum (jets + planet)
```

Validation gates: reproduce jet structure & speeds ±10 % `[KNOWN_LIMIT: all current Venus/Earth-style GCMs get Jupiter's jets only approximately — the GCM's *credibility* is itself a program risk, flagged]`; reproduce GRS as long-lived anticyclone under observed forcing; energy-conservation drift < 1e-12.

### 6.3 Cascade optimizer (the separation plant as code)

```rust
// jove-core/src/sep/cascade.rs
pub struct Stage { pub alpha: f64, pub feed: f64, pub cut: f64 }

pub fn design_cascade(x_f: f64, x_p: f64, m_w: f64, t_in: f64) -> Cascade {
    // alpha(m_w, T): exp(dm v^2 / 2RT), with v_w capped by:
    //   (a) rotor hoop stress: v_w <= sqrt(sigma_max / rho_rotor)
    //   (b) wall-gas Mach: T_wall = T0 (1 + (gamma-1) M^2 / 2) <= 450 K
    //   (c) practical stage efficiency eta = 0.6..0.8 [MEASURE: no Jovian-
    //       condition centrifuge data; Earth-lab campaign P0]
    // solve N, cut profile (ideal cascade), head/tail assays,
    // total power, rotor fleet mass -> hive mass budget
}
```

### 6.4 Magnetospheric MHD + tether impedance

- Global MHD (BATSRUS-class) with I-F tube as a conducting Io boundary condition; validate against the measured 2.4×10¹² W and footprint UV morphology `[GALILEO/HST archive]`.
- Tether module: EMF from Δv·B·L; current from Pedersen/sheath conductance (the open problem — parametric sweep `[MEASURE]`); Lorentz drag on tether orbit; reboost budget.
- Radiation-belt transport (adiabatic invariant tracing) → dose maps for the transit corridors → fleet/ corridor scheduler.

### 6.5 Tether snap-energy audit (FM-04 anticipation)

A 10⁵ km, 10⁵ kg rotovator stores E = ½k·(δl)² in tension plus 10¹⁹–10²⁰ J orbital/rotational coupling. The module computes post-snap trajectories of *every fragment* with a fragmentation model — the fleet keeps rotovators in parking geometries whose fragment-cloud time-to-Jupiter exceeds 10⁷ s, giving clearance windows.

### 6.6 Conservation audits (house style)

Global angular momentum: planet + atmosphere + moons + tether farm (the flywheel accounting of §3.4). Energy: contraction luminosity fixed at bottom BC; harvest sinks integrated and reported vs. the 3.3×10¹⁷ W budget. Mass: the He-3 budget closes to < 1e-6 per model-year.

### 6.7 V&V table (abridged)

| V&V | Test | Pass |
|---|---|---|
| EOS | H2 sound speed & cp vs. NIST (incl. para/ortho relaxation) | < 0.5 % |
| GCM | Jet speeds/GRS longevity vs. observed | ±10 % / > 10⁴ simulated yr |
| Sep | Cascade vs. lab centrifuge data (He isotopes, terrestrial) | α within ×2 |
| MHD | I-F tube power vs. 2.4×10¹² W measured | factor 2 |
| Tether | Collection current vs. existing tether flight data (TSS-1R heritage) | factor 3 `[MEASURE: no Jovian-condition tether data exists]` |

---

## 7. FAILURE MODE CATALOG

| ID | Failure | Physics | Detection | Mitigation |
|---|---|---|---|---|
| FM-01 | **The Long Fall** — habitat loses buoyancy | Descends to its isopycnal (~5 bar, 300 K): survivable briefly, then heat + cloud chemistry kill | Fleet telemetry; ballast doctrine | Waterline rescue hives; envelope failure isolation (cellular lift); §5.1 drills |
| FM-02 | **GRS encounter** | 120 m/s shear walls destroy any structure | GRS drift tracking (decadal error bars) | 3R exclusion doctrine (§5.3); never assume intercept-free trajectories |
| FM-03 | **Storm lightning (SED-class)** | Per-stroke energies 10³–10⁴× terrestrial; direct strike vaporizes a hive keel | Radio SDF detection; storm-nest AMR maps | Latitudinal storm-season doctrine; Faraday envelopes; avoid water-cloud outbreak latitudes |
| FM-04 | **Rotovator snap** | 10²⁰ J-class stored energy fragments an orbital structure | Tension telemetry | §6.5 fragment-clearance parking; no crew within 10⁴ km of any tensioned megasystem |
| FM-05 | **Belt-crossing radiation event** | Solar proton event + belt transit overlap | Space-weather watch (solar + in-situ) | Launch corridor holds; mini-magnetosphere specs sized for P95 events, not means |
| FM-06 | **Neighborhood depletion** | Hive ingests its own He-3-poor wake; diffusion refill ~10¹⁵ s (never) | Inlet assay telemetry | Jet-riding station-keeping (advective refill ~10⁴ s); inter-hive spacing rules |
| FM-07 | **Deuterium ledger failure** | D-³He economy needs ~0.5 kg D per kg ³He; Jovian gas carries only ~0.03 kg D per kg ³He at the process ratio | Fleet D-budget audit | Import D (Venus/Europa water, D/H = 1.5×10⁻⁴ `[VEX]`) or over-process gas ×17 — both are pre-priced in §8.2 |
| FM-08 | **Jet migration** | The jet a hive rides wanders (observed jet drift) | GCM nowcasting | Station-keeping thrust budget sized to jet drift rate; hive hopping protocols |
| FM-09 | **Cascade frost** | Wall-gas decompression chills stages below H₂ condensation... (impossible at 33 K floor — but NH₃/N₂ contamination freeze-out fouls rotors) | Rotor telemetry | Feed filtration doctrine; contamination budget per cascade |
| FM-10 | **"But it's just waste H₂"** — false economy | Vented H₂ at scale locally alters H₂/He ratio and cloud chemistry; a K2-scale program venting 10¹⁴ kg/yr is *not* invisible on decade timescales `[VERIFY via GCM]` | Composition assay (Juno-microwave heritage) | Tailings re-injection at density-neutral depths; composition setpoint like ORPHEUS's albedo setpoint |
| FM-11 | **He-3 assay surprise** | Protosolar ratio assumption wrong (×2 either way rescales everything) | P0 in-situ mass spectrometry | Program sizing deferred until measured (§8.1 gate) |
| FM-12 | **Torus tether sputter** | S⁺/O⁺ ion erosion of conductors | Resistance telemetry | MoS₂-class coatings; tether rotation into sheltered orientations |
| FM-13 | **Internal-flux overdraw** | Heat-engine extraction approaching % of 3.3×10¹⁷ W changes convection & jets | GCM harvest-sink diagnostics | Hard program cap at 1 % (3×10¹⁵ W) pending §6 GCM clearance |
| FM-14 | **Orbital debris cascade** | Capture stations + rotovator fragments + belt traffic | Catalog (radar/optical) | Fragment-clearance doctrine (§6.5); passive de-orbit for all orbital assets |
| FM-15 | **K2 temptation** | Program success invites sustained 10²⁶ W draw → envelope drains in years (§8) | Program-level accounting | The §8 verdict is a *design constraint*, not a footnote: TANTALUS is a bridge, never a foundation |

---

## 8. POWER AUDIT, KARDASHEV ACCOUNTING, HONEST VERDICT

### 8.1 Phases

| Phase | Era | Build | Gate |
|---|---|---|---|
| **P0 — Assay** | 2035–2060 | Probe swarm: in-situ He-3/⁴He, D/H, water; GCM-classifying wind data; tether impedance pathfinder | **He-3 ratio measured** (FM-11). Everything below is sized ×(measured/assumed) |
| **P1 — Hive-1** | 2060–2090 | One 1-km hive, shear-powered, no launch loop; product stored in orbit via chemical ferry | kg-scale He-3 delivered; cascade η validated; FM-01/03/06 doctrine validated |
| **P2 — Loop** | 2090–2140 | 10 hives + rotovator + polar-corridor logistics | 10 kg/s-class flow; D-³He reactor customer exists |
| **P3 — Fleet** | 2140–2250 | ~170 hives (K1 fuel), tether farms 10¹³ W, internal-flux floors | Fleet economics closed at K1 |
| **P4 — Bridge** | 2250–2400 | Envelope-scale logistics; K2 *transit* fueling (decades, not centuries — §8.3) | This program hands off to solar-scale collection (not in scope) |

### 8.2 The Jovian energy ledger (every number earned above)

| Resource | Power / Energy | Class | Verdict |
|---|---|---|---|
| Internal heat flux | 3.3×10¹⁷ W (harvest ceiling ~1 % → 3×10¹⁵ W) | K1.5 | The free backbone; FM-13 cap |
| Jet shear harvest | ~10¹⁵–10¹⁶ W ceiling | K1.5 | Fleet auxiliary |
| Tether farms (I-F) | 10¹²–10¹³ W (scale-limited by collection physics) | K1 | Continuous, fusion-free |
| **He-3, 100-bar envelope** | ~10¹⁸ kg × 5.9×10¹⁴ J/kg = 6×10³² J | **K1×10⁵ yr, K1.5×10³ yr** | The program's core product |
| **He-3, whole planet** | ~4×10²² kg × 5.9×10¹⁴ = 2.6×10³⁷ J | K2 × ~8×10³ yr | Requires reaching the metallic interior: **not in scope, flagged** |
| Rotational flywheel | 3.6×10³⁴ J | K2 × **11 yr** | Free launch discount; not a source (E5) |
| Deuterium (self-supply) | 0.03 kg D per kg ³He at process ratio (need ~0.5) | — | Import from Venus/Europa or over-process ×17 (§7/FM-07) |
| **Fleet total steady-state (P3)** | **~10¹⁷ W** | **K1** | vs. humanity today 2×10¹³ W |

### 8.3 Verdict (no hedging)

1. **Jupiter is the system's fuel pump, not its hearth.** The isotopic funnel (0.004 % tailings, escape overhead ~10⁻⁴ of value) makes it the cheapest energy logistics node conceivable — but its *cosechable* energies (flux, winds, tethers) are K1.5-class and its fuel reservoirs, honestly counted, buy centuries of K2, not millennia.
2. **The Moon-He-3 myth dies here** on a 4×10⁴ throughput ratio. Any lunar-He-3 plan is a logistics error wearing romantic clothing.
3. **The four numbers that gate everything** (all P0-measurable): He-3/⁴He ratio, D/H × water inventory, tether collection impedance in the torus, cascade stage efficiency at Jovian conditions. Without the first, this document is a hypothesis with excellent bookkeeping.
4. **The series-consistent conclusion:** Venus (ORPHEUS) is a control problem at K0.9; Jupiter (TANTALUS) is an extraction problem at K1.5 bridging K2; the fundamento of a permanent K2 civilization is *stellar*-scale collection — which is where this series goes next, and why Júpiter's honest role is *the bridge*.

---

## APPENDIX A — Constants & formulas (quick reference)

- R_spec(H₂) = 4,124 J/kg/K; M̄(Jovian air) = 2.22 g/mol; H(1 bar) ≈ 27.4 km
- Adiabatic H₂: T ∝ P^(R/cp), R/cp = 0.2885 → 1→10 bar: T 165→321 K
- ρ(1 bar, 165 K) = 0.162 kg/m³; ρ(0.1 bar) = 0.022; ρ(10 bar) = 0.76
- v_rot,eq = 12.57 km/s; v_esc = 59.5 km/s; E_rot = 3.6×10³⁴ J (I = 0.254 MR²)
- He-3 mass fraction ≈ 3.8×10⁻⁵; gas per kg product = 2.6×10⁴ kg
- Centrifuge α = exp(Δm·v_w²/2RT) ≈ 1.65/stage at M_w = 2; cascade N ≈ 18 ideal
- D-³He: 5.9×10¹⁴ J/kg(³He); D-D branch neutron load 5–10 % of power
- Escape energy 1.77×10⁹ J/kg; delivered-cost ledger total ≈ 10¹¹ J/kg ≈ 2×10⁻⁴ of value
- I-F tube: 2.4×10¹² W, 10⁶ A, 400 kV `[measured]`; Europa-orbit dose 5.4 Sv/day `[measured]`
- Internal flux 3.3×10¹⁷ W; emitted/absorbed = 1.67

## APPENDIX B — Reference anchors

- Galileo probe & orbiter: Y = 0.238, dry hot-spot entry, radiation dose mapping; Voyager/Pioneer: jets, GRS, lightning, I-F circuit
- Juno: gravity harmonics (interior structure), microwave sounding (water), polar aurora
- ISO-SWS: D/H; protosolar He-3/⁴He from solar wind (Genesis-class data)
- Leachman et al. — NIST H₂ reference EOS (para/ortho); BATSRUS MHD heritage for magnetosphere
- Moravec (1977) — momentum-exchange tethers; TSS-1R flight data for collection impedance
- frontier literature: mini-magnetosphere shielding (M2P2 lineage); centrifuge isotope separation (ZIPPE lineage)

*End of document. Same contract as ORPHEUS: every dead mechanism buried with its arithmetic. P0 or it didn't happen — measure the He-3 ratio first.*

