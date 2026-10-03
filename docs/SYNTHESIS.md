# What the physics says about Type I

One document, one sitting. `docs/NUMBERS.md` is the catalogue; this is the argument.

Every number below is computed live by `src/lib/findings.ts` and checked against this file
by `synthesis.test.ts`. If the code changes and this document does not, the build fails.
Regenerate the table at the end with `npm run findings`.

**What this is:** first-order physics, one author with AI assistance, every assumption
labelled and every limit stated. Not peer-reviewed. It is built so that disagreeing with it
means disagreeing with a specific number, which is the point.

---

## 1. Where we are

Sagan 1973: `K = (log₁₀ P − 6) / 10`. IEA total energy supply for 2023 is 620 EJ/yr, which
is **19.6 TW**, which is **K ≈ 0.729**.

Type I is 10¹⁶ W. The gap is **×509 in watts** — not "0.27 points of K". That framing is the
single most common error about this scale and it hides nine doublings.

For orientation: Type I is **5.8%** of the sunlight Earth's disk already intercepts. It is
not "capture the star". It is a modest fraction of what already arrives.

At IEA inertia (1.8%/yr) the gap closes in ~350 years. Under compressed doublings with
λ = 0.62 it closes in **~101 years** — but λ is a *hypothesis*, not a measurement, and it
assumes collaboration. Never show that number without the inertial one beside it.

### 1.1 And the first wall is much nearer than Type I

Section 2 establishes a dozen walls. None of them says **which one you hit first**, and this
document reads as if the answer were Type I — ×509, nine doublings, three and a half
centuries. It is not.

| | power | K | vs today | doublings | inertial |
|---|---|---|---|---|---|
| Today | 19.6 TW | 0.729 | ×1 | 0 | — |
| **Waste-heat ceiling, +0.1 K** | **192 TW** | **0.828** | **×9.8** | **3.3** | **~128 yr** |
| Waste-heat ceiling, +0.5 K | 960 TW | 0.898 | ×48.9 | 5.6 | ~218 yr |
| Waste heat = today's greenhouse forcing | 1,530 TW | 0.918 | ×77.9 | 6.3 | ~244 yr |
| Ground solar needs all Earth's land | 5,960 TW | 0.978 | ×303 | 8.2 | ~320 yr |
| Type I | 10,000 TW | 1.000 | ×509 | 9.0 | ~349 yr |

**The first wall is 3.3 doublings away, not nine** — and at inertia it arrives **2.7× sooner**
than Type I. Everything in section 2 about orbit, lunar sourcing, areal density and radiators
is an argument about what happens *after* a constraint that binds below ten times today's
energy supply.

That reframes the thesis without weakening it:

> **"The moment watts leave the crust" is not a Type I event. It is a K ≈ 0.83 event** — and
> the chain in section 2 is what happens past that point.

*(The distinction that keeps this honest: **+0.1 K and +0.5 K are numbers we picked**, which
is why both are listed — the budget is visibly a dial. The greenhouse crossover is a
**comparison**, not a limit; nothing breaks there, it is where waste heat stops being
ignorable against everything else we do. **Only the land wall is physical.** And the year
column assumes 1.8%/yr forever, which nothing supports beyond it being what recent decades
did — read K and the multiple, the years are there only because they are legible.)*

---

## 2. The spine: why Type I cannot be terrestrial

This is the chain the repo exists to establish. Five modules, each one closing a route.

### 2.1 Waste heat closes the thermal route

Every watt that is *new* energy to the atmosphere-surface system ends as heat. Earth sheds
heat by radiating, and `P ∝ T⁴`, so `ΔT/T = ¼·ΔP/P`. The planet sheds 122 PW at an effective
radiating temperature of 255 K, inverted from σT⁴ rather than quoted.

Type I on the crust from a new-heat source: **+5.06 K**, before a single molecule of CO₂.

Today this is genuinely negligible — 19.6 TW is +0.009 K, about 1% of anthropogenic
radiative forcing. It stops being negligible at **~1,530 TW**, where waste heat alone equals
today's greenhouse forcing.

Under a +0.1 K budget the terrestrial ceiling is **192 TW**, so **98.1%** of Type I cannot
be on the crust.

**The correction that matters here:** the first version of this argument said "every watt
becomes heat, regardless of source". That is wrong. Ground solar, wind and hydro *recycle*
insolation already inside the budget and add essentially nothing. Only fossil, fission,
fusion, geothermal — and anything beamed down from orbit — are new heat.

### 2.2 Geometry closes the ground-solar route

So does ground solar escape? No, but for a different reason. At 40 W/m² mean it needs
250 million km² — **×1.68 all the land on Earth**, or about half the entire planet including
oceans. It fails on geometry, not on thermodynamics.

### 2.3 Beaming closes nothing

The obvious move is to generate in orbit and beam down. It does not help, because the
constraint is on **dissipation**, not generation. Beam 1,000 TW down and use it here and the
waste heat is identical to generating it here — plus the beam's own atmospheric and rectenna
losses, which land here too: **1.20 W of Earth heat per useful watt**, against ~0 for ground
solar.

Orbital solar collects photons that would have *missed Earth entirely*. Every watt that
lands is new heat. **Beamed solar is thermally the worst solar there is.**

So space-based solar power and this thesis are **different architectures**. SBSP moves the
generation and leaves the load. Only moving the **load** touches K. What SBSP is actually
good for is land (×3.8 against ground PV) and continuity through night and winter — real
arguments, just not arguments about K.

### 2.4 So the load goes to orbit. What does that cost?

Not energy. A collector repays its entire launch energy in **21 days** at 337 W/m². The
15× inefficiency of chemical rockets — the thing every spaceflight argument is about — does
not bind here.

It costs **logistics**, by five orders of magnitude. Type I needs 29.7 million km² of
collector, the area of Africa, in orbit. Inverting for a century-long build at 100
flights/day gives a required areal density of 12.3 g/m². Against today's ROSA-class wings
that is a gap of **×183**.

> Costed to low orbit. 2.11 moves the destination to GEO and 2.12 recosts it: the same
> cadence delivers 1/2.8 as much there, so the requirement becomes 4.4 g/m² and the gap
> **×505**.

For scale: McDowell counts 258 launches that reached orbit or marginal orbit in 2024, and 263 attempts — 0.71 per day. "100 flights/day" is already ×142 the entire planet, every day, for a century. The requirement does not move.

### 2.5 And it is not a construction project

Nothing in orbit lasts. You add area at rate R and lose it at installed/L, so the largest
array you can ever *sustain* is

    A_max = R · L

a **ceiling, not a schedule**. At 100 flights/day with a 5-year array you asymptote at **5%
of Type I** and stay there for ever; launching for longer does not help.

> The algebra is right and the input was not. That five-year lifetime was a bare default,
> and 2.9 shows the environment supports roughly seventy. Read 2.5 as the shape of the
> constraint; read 2.9 for where the ceiling actually sits. Over a 100-year
build with a 5-year life, year 1's hardware is replaced nineteen times before year 100.

**The convergence condition: the array must outlive its own construction.** Maintaining Type
I at a 5-year life costs **2,000 flights/day, permanently** — twenty times the construction
cadence.

Two independent calculations — construction and maintenance — terminate in the same place:
**material that never came up Earth's gravity well.** Lunar escape is 2.8 MJ/kg against
Earth's 33.8, twelve times less, with no atmosphere. In-situ material is not enthusiasm; it
is what the arithmetic leaves standing.

### 2.6 And half the system was missing

An orbital load must radiate everything it collects. At a 320 K radiator that is 19.8
million km² against 29.7 of collector, at 3.5 kg/m² against 2.24 — **the radiator is heavier
than the collector**. Every flight count above is **×2.04** too low.

σT⁴ invites a heat pump to reject hotter. It buys 6%, because the pump work must also be
rejected. Raising the junction temperature 50 K passively buys **17%, free** — a factor of
**×2.8** better. **The lever is high-temperature electronics, not thermal engineering.**

### 2.7 So the material comes from the Moon. Does that close?

Two independent roads — construction in 2.4 and maintenance in 2.5 — both terminated at
"material that never came up Earth's gravity well". That was an assertion for four modules.
Costing it changes two things.

**M7 understated the lunar advantage by an order of magnitude.** It compared lunar escape
(2.82 MJ/kg) against Earth's orbital *floor* (33.8 MJ/kg) and got ×12. That is floor against
floor, which flatters Earth. Real against real: Earth launch is chemical and runs 15× above
its floor at 500 MJ/kg, a lunar mass driver is electromagnetic and runs near its own —
**×106, not ×12**.

And transport is not the point anyway. At ~100 MJ/kg of embodied processing, getting the
material off the Moon is **4.5%** of what it costs to make it. The gravity well was never the
expensive part of lunar sourcing; not launching at all is.

**The power bill closes comfortably.** Building over a century needs ~3.8 TW of lunar
industry; maintaining at a 5-year life needs ~76 TW. Enormous absolutely — four times
today's world total energy supply, on the Moon — and **under 1% of the Type I it builds**.

Two things do bind, and neither is thermodynamic.

**First, the array must be essentially all lunar.** Regolith supplies silicon, aluminium,
iron, titanium and oxygen. It does *not* supply carbon, hydrogen or nitrogen at scale, so
polymers, volatiles and some dopants would still be launched. At 100 Earth flights/day —
already 142× the entire world's 2024 rate — Earth can supply **0.016%** of the replacement
flow. **The array must be ≥99.98% lunar-sourced by mass.** No polymer substrate, no imported
dopants at scale, no carbon. That is a materials-science constraint and it is harder than
anything in 2.1–2.6.

**Second, the timeline is a doubling count.** A self-replicating base with productivity `p`
and self-allocation `f` grows as `M₀·e^(f·p·t)`. Optimising the allocation gives **f ≈ 0.96**
— put almost everything back into the factory, because the build is essentially the last
doubling — and the answer is flat from 0.9 to 0.999. Every constant washes out:

    **30 doublings from a 100 t seed.**

    doubling every  1 yr →  30 years        every  5 yr → 151 years
    doubling every  2 yr →  60 years        every 10 yr → 301 years

### 2.8 Which makes λ falsifiable

`forecast.ts` carries λ = 0.62 as a labelled hypothesis giving ~101 years. Divide by 30
doublings and **λ = 0.62 is a claim that off-planet industry doubles every 3.4 years.**

That is the most useful result in the chain. λ was a curve fit nobody could argue with. A
3.4-year doubling time for a self-replicating lunar industrial base is an engineering
parameter people can and should argue about — and it is the number to attack if you want to
attack the timeline.

### 2.9 And the most leveraged number in the chain was never calculated

`A_max = R · L` is **linear in L**. The 5% ceiling in 2.5, the 2,000 flights/day in 2.5, the
76 TW of lunar industry in 2.7 — all of them scale with an array lifetime that was a bare
default. Costing it inverts twice.

**The obvious killer is not a killer.** 12.3 g/m² of polyimide is an **8.7 µm film**, and the
intuition is that micrometeoroids shred it. Integrating the Grün (1985) flux says otherwise:
the film takes ~198 perforations per m² per year and loses **0.000049% of its area per year**
— two hundred thousand years to lose a tenth. Sweeping both free parameters across their
full range moves that by 7×, and 7× of negligible is negligible. Trackable debris strikes the
full array **9.4 times a second** and the area arithmetic comes out the same. A film is the
most damage-tolerant structure imaginable, because it has nothing to sever: no pressure to
lose, no spar to cut. A 10 cm fragment makes a 30 cm hole and keeps going.

*(The flux model is validated on the fact it should reproduce: integrated over Earth it puts
the mass-carrying peak at 172 µm against ~200 µm measured. The total influx lands 3.4× under
Love & Brownlee's central value — inside the literature's own 5–300 kt/yr spread, and a
partial validation, which is how it is recorded.)*

Only one mechanism genuinely bites, and a coating pays for it: **you cannot fly bare.**
Atomic oxygen erodes 45 µm/yr at 400 km, so a bare 8.7 µm film lasts **2.3 months**. A 100 nm
silica overcoat removes it for **1.8%** of the mass budget — and regolith is 42% oxygen and
21% silicon, so 2.7's feedstock already contains it. Ripstop at a **1.3 cm** pitch bounds
each tear to one cell for 0.14% more. **Under 2% of the binding constraint buys survival.**

**[CORRECTION to 2.5] So five years was not a physics number, and it was pessimistic.** It is
the design life of a LEO smallsat, limited by drag decay and bus electronics — the wrong
reference class for a coated film in a high orbit, which has neither. Run every modelled
mechanism at once and the binding one is cell radiation damage at ~1%/yr:

| lifetime | sustainable share of Type I |
|---|---|
| 5 yr — 2.5's assumption | 5% |
| 30 yr | 30% |
| **69 yr — what the environment supports** | **69%** |

That does not make Type I terrestrial, does not touch the ≥99.98%-lunar requirement, and
still falls short of a century-long build — so 2.5's convergence condition (`L ≥ T_build`) is
**brought within argument, not satisfied**. But it is the difference between a ceiling of a
twentieth and a ceiling of two thirds, and it turned on a constant nobody had checked.

### 2.10 The question that replaces it

The array does not die from the environment. **The environment dies from the array.**

29.7 million km² is **23% of Earth's own cross-section** — a second Earth-scale target,
permanently in the way. At 2.24 kg/m² it masses 66.6 Gt: **5.1 million times** everything
humanity has launched in seventy years of spaceflight. One part per million of that
fragmenting is five times the entire current debris population.

No cascade is modelled here and none is claimed. The claim is narrower and harder to dodge:
at this scale the debris question stops being about protecting the array and becomes about
what the array does to every other orbit — and **nothing in 2.1–2.9 has anywhere to put that
cost.**

### 2.11 And nobody had picked an orbit

Seven sections have said "in orbit" and none of them chose one. 2.10 made that expensive by
naming what the array is: **23% of Earth's own cross-section**. An object that size does not
merely sit in orbit — some fraction of it is always between the Sun and the Earth.

For an isotropic shell at radius `a`, the share inside the sunward cylinder is `(1 − cos θ)/2`
with `sin θ = R⊕/a`. Multiply by the array area over Earth's disk and you get the sunlight it
removes. At 400 km that is **7.7% of the insolation**, which through the same `ΔT/T = ¼·ΔP/P`
that 2.1 used is **−4.89 K**.

That is the Last Glacial Maximum. **The array is large enough to freeze the planet** — and it
is the exact mirror of 2.1:

| | |
|---|---|
| Type I kept on the crust (2.1) | **+5.06 K** |
| Type I as a shell at 400 km | **−4.89 K** |

Two climate catastrophes of near-identical magnitude and opposite sign, and the only free
variable between them is where the hardware goes.

**[RESULT] The climate constraint derives an orbit by itself.** Solve for the +0.1 K budget
2.1 already committed to and the floor is **38,960 km**. Geostationary radius is 42,164 km.

> The lowest orbit that does not dim Earth past our own budget is **92% of GEO** — an orbit
> chosen by nothing but radiative balance, landing within 8% of the one orbit everyone
> already knows the name of.

| | altitude | blocked | cooling | duty cycle | within budget |
|---|---|---|---|---|---|
| ISS | 408 km | 7.67% | −4.89 K | 0.67 | no |
| dawn-dusk SSO | 800 km | 6.30% | −4.02 K | 0.73 | no |
| MEO | 10,000 km | 0.92% | −0.59 K | 0.96 | no |
| **GEO** | **35,793 km** | **0.13%** | **−0.085 K** | **0.994** | **yes** |
| lunar distance | 384,400 km | 0.002% | −0.001 K | 1.000 | yes |

**The escape, and its price.** Shading needs `a·sin ψ < R⊕`, so anything beyond ~27° of the
Sun–Earth line at 800 km is in full sunlight and shades nothing. That band is 45.9% of a LEO
shell, and Type I fills **10%** of it. So shading never *forces* a high orbit on its own —
it forces a choice: pack a tenth of a LEO band, in the shell 2.9 excluded for atomic oxygen
and struck 9.4 times a second, or go above 38,960 km where the fill is 0.13% and the question
disappears.

**[CORRECTION to `physics.ts`]** `dutyCycle = 0.96` has been used repo-wide with no orbit
attached. Read as geometry it *is* an orbit — 0.9606 is MEO at 10,000 km, which fails the
climate budget by six times. The value is defensible for a dawn-dusk band and has not been
changed; what was missing is that it silently assumed one. The climate argument and the
duty-cycle argument converge on the same geometry from opposite directions.

*(One identity makes the section cheap to check: for a >> R⊕ the shading fraction reduces
exactly to `A/4πa²`, which is also the fraction of sky the array covers from the ground —
54.9 square degrees at GEO. The same number cools Earth by blocking sunlight and warms it by
blocking outgoing infrared, so the two partially cancel by an amount that depends on the
array's own thermal design.)*

### 2.12 Which changes who pays

2.11 moved the destination and nothing in 2.4–2.10 had recosted the delivery. Worse, the
repo had no way to: `lift.ts` reasons entirely in **energy**, and energy is linear in
altitude. Delivery is not.

    orbital energy    GEO / LEO = ×1.71     linear — what the chain was using
    mass ratio        GEO / LEO = ×2.77     exponential — what a vehicle pays

Reasoning about delivery in joules understates it by **62%**.

**[TIGHTENS 2.4] The areal density requirement gets 2.8× harder.** A century at 100
flights/day needs **4.4 g/m²** to GEO — a **3.1 µm** film — and the gap against a real wing
goes from ×183 to **×505**. 2.11's climate constraint made the hardest number in the chain
substantially worse.

**[STRENGTHENS 2.7] And by the same act it moved the destination toward the Moon.** Earth is
at the bottom of the well and pays the full ascent wherever it is going. The Moon arrives
from outside and pays only to *shed* energy, so a higher destination is a **smaller** capture
burn:

| destination | Earth Δv | Moon Δv | advantage of sourcing from the Moon |
|---|---|---|---|
| LEO 550 km | 8,924 m/s | 6,737 m/s | ×1.8 |
| MEO 10,000 km | 11,463 m/s | 5,142 m/s | ×5.5 |
| **GEO** | **12,724 m/s** | **3,982 m/s** | **×10.4** |

The two columns move in opposite directions. That scissors is the finding.

*(The honest counterweight: lunar cargo can aerobrake into LEO and cannot into GEO. Grant the
Moon that and the LEO advantage rises to ×5.5 — GEO still wins by nearly two to one, so the
direction survives the objection that most threatens it. Transfers are Hohmann, and that is
checked rather than assumed: at a radius ratio of 6.09 the bi-elliptic alternative costs
4,368 m/s against 3,800.)*

So the same geometric fact that widened the Earth-launch gap to ×505 widened the Moon's
advantage to ×10.4. **2.11 did not weaken the thesis — it moved the argument onto the leg
that was already load-bearing.** Two independent roads arrive once more where 2.7 already
was: the material cannot come up Earth's gravity well.

### 2.13 And then we weighed the thing the thesis is about

The thesis is one sentence: *the singularity is the moment watts leave the crust*. Nine
sections have costed the power station that makes those watts — area, radiator, lift,
sourcing, environment, placement, transfer. **Not one of them weighed the load.**

Any load dissipating 10¹⁶ W has mass, and its mass is `P / (W/kg)`. At the specific power of
a real datacentre rack — ~100 W/kg with memory, interconnect and power delivery — that is
**10¹⁴ kg**, or **759 centuries** of launch at 100 flights/day delivered to GEO.

*(A correction caught by its own test: the first version of this section said the power
station was "a rounding error against the thing it powers". It is not. Against the collector
built from real hardware the load is **×1.5**, and it adds **74%** to the collector-plus-
radiator system. The ×759 is against the* deliverable *budget, which is the right denominator
for feasibility and the wrong one for comparing two pieces of hardware. What is fair to say
is narrower and still damning: **every mass total in this document was ~40% low.**)*

**[RESULT] And the load's mass is almost entirely an architecture choice.** A radiator at
3.5 kg/m² and 320 K rejects 505 W/m², so it caps the system at **144 W/kg** whatever the chip
does. A thinned die radiating from its own two faces at 400 K and 100 µm reaches
**10,591 W/kg** — **×73 better**, because it is 0.23 kg/m² instead of 3.5 and has two faces.

> At Type I scale you do not bolt chips to radiators. **You make the chip the radiator** —
> and 2.6's radiator mass becomes an artefact of the wrong architecture. The same 10¹⁶ W is a
> factor of a hundred apart in mass depending only on how the heat leaves the silicon.

**What it would take.** Fitting the load inside one century of launch, with nothing left for
the collector, needs **75,900 W/kg**. By self-radiation that is a **14 µm die at 400 K**, or
100 µm at **654 K**. The first is thinner than any die in production; the second is far past
where silicon logic works. The wall is real and it is made of **die thinning and junction
temperature** — the same lever 2.6 found, pushed much harder.

**[CORRECTS 2.11] And the array cannot be geostationary.** 2.11 solved the climate floor from
the collector area alone. 2.6's radiator adds 19.8e12 m² to the same shell and shades the
same sunlight; the floor goes as √A, so 1.67× the area moves it 1.29× — from 38,960 km to
**50,290 km, or 119% of GEO**. Both sections were right in isolation. Nobody had multiplied
them.

*(Not netted: the radiator also emits toward Earth, which from GEO intercepts 0.57% of an
isotropic emission — 5.7e13 W, or **+0.030 K**, running against the extra shading. The split
depends on radiator orientation, which nothing here models.)*

**Where this leaves the chain.** The load has to be built off-planet too, for the same reason
the collector does — a third independent road to 2.7. But that section's ≥99.98%-lunar
requirement was posed for a *solar film*, where regolith supplies silicon, aluminium and
oxygen. Posed for **semiconductors** it is a far harder question, and nothing here answers it.

### 2.14 And the strongest argument against all of it

Fifteen sections have established where 10¹⁶ W must go and what it costs to put it there.
None has connected the watts back to the claim that motivates them: *AGI is a
software-and-GW event on Earth. ASI is an energy event.*

**The substitution law.** For a fixed rate of computation, `P = R × J/op`. Energy and
efficiency are **substitutes** — halve the joules per operation and the same cognition runs on
half the watts. Any claim that a given amount of thinking *requires* a given number of watts
is therefore a claim about efficiency, not about thinking.

**[THE CHALLENGE] The threshold is ×52.**

2.1 puts the terrestrial ceiling at 192 TW under a +0.1 K budget. Type I computation at
today's efficiency is 10¹⁶ W. It has to leave the crust only while `10¹⁶ / f > 1.92e14`:

> **f = 52.1** — against a logic runway of **×1,232** and a data-movement runway of
> **×10⁸**, both of them 2.6's own figures.

A factor of fifty-two in compute efficiency dissolves the entire orbital argument *for
compute*, and fifty-two is not a large number. Spending the logic runway alone puts Type I
computation at **8.1 TW** — under half of today's world total energy supply, and far inside
the terrestrial ceiling. Worse for the thesis: 2.3 established that the binding term today is
data *movement*, and that is the term with six more orders of headroom than logic.

**Why this is a reductio and not a refutation.** Taken literally the movement runway says all
of Type I's computation could run on **101 MW** — one power station, for a civilisation of
thinking machines. That is absurd, and the absurdity is the information: the 100 kT floor is
a **device-physics bound, not a roadmap**. But ×52 sits so far below the bound that ordinary
progress reaches it, which is why this belongs here and not in a footnote.

**[RESOLUTION] What the substitution actually attacks.** Not the orbital chain. 2.1–2.13
concern where 10¹⁶ W of *any kind* must go, and K is total energy supply — industry,
transport, materials and agriculture have no Landauer runway. Those legs stand unchanged.

What it attacks is the link from **ASI to Type I**. Compute is the one load in the whole
economy with orders of thermodynamic headroom, and it is precisely the load the thesis named.
The honest form of the claim is narrower than the slogan:

> **Type I is an energy event. ASI need not be the thing that causes it.**

The only defence that restores the original claim is Jevons — that efficiency gains raise
total consumption rather than lowering it. That is economics, not physics, and this document
does not lean on it.

*(A side result worth having: **biology is not magic**. A 20 W brain at ~10¹⁵ synaptic
operations per second runs 4.84 orders above the practical floor; an H100 runs 6.09 orders
above it. The brain leads by **×17.7**, not by orders — and swept across the published
10¹⁴–10¹⁶ range for synaptic rate it never becomes a qualitatively different machine.
Neither has spent the runway, and whatever closes the gap is available to both.)*

*(What the watts buy, as conversions and nothing more: **1,050 frontier responses per living
human per second**, or **61,000 brain-equivalents each** in power terms. Nothing here models
what the computation is for.)*

### 2.15 The sentence 2.14 asserted, checked

2.14 resolved its own challenge with a claim: *industry, transport, materials and agriculture
have no Landauer runway*. That was an assertion. If it is false the resolution collapses and
the orbital chain loses its answer to the ×52 escape.

It has a very clean number. Every physical process has a thermodynamic minimum — the Gibbs
free energy of the reaction, the mixing entropy of the separation — and industry runs
**close** to those minima:

| process | minimum | actual | runway |
|---|---|---|---|
| Ammonia, Haber-Bosch | 20.9 GJ/t | 36 GJ/t | **×1.72** |
| Cement clinker | 1.8 GJ/t | 3.5 GJ/t | ×1.94 |
| Aluminium, Hall-Héroult | 23 GJ/t | 50 GJ/t | ×2.17 |
| Desalination, seawater RO | 1.06 kWh/m³ | 3.0 kWh/m³ | ×2.83 |
| Steel, ore to liquid | 7.0 GJ/t | 20 GJ/t | ×2.86 |
| | | **mean** | **×2.31** |

Against compute's ×1,232 in logic and ×10⁸ in movement. **Logic has 534 times the headroom
of heavy industry.** Two centuries of thermodynamics has taken industry to within a factor of
two or three of its floor; computation is nowhere near its own. That gap is not a general
property of technology — **it is specific to computation.**

**[THE CONDITION] So 2.14's escape needs a ≥95% compute economy.**

Spend every runway at once and the reduction is the harmonic blend `1/(f/r_c + (1−f)/r_nc)`.
Set that equal to the escape factor and solve for the compute share:

> **f_c ≥ 95.8%**

And the part worth keeping: **the answer barely depends on compute's runway at all.** At
×1,232 it is 95.8%; at ×10⁸ it is 95.6%; at *infinite* compute efficiency it is still
**95.6%**, because the industrial term alone has to fit under the target. Swept across ×2 to
×10 for industry the required share runs 96.2% down to 80.8%. It never becomes small.

Today compute is **0.27%** of total energy supply, and at that mix the whole achievable
reduction is **×2.31** — not ×52.

So 2.14's challenge survives and narrows into something arguable: **the orbital argument
fails only for a civilisation that spends nineteen twentieths of its energy on thinking.**
That is a real claim about what a Type I economy is *for*, and it is now the hinge the whole
document turns on.

*(The soft joint, stated: transport has no thermodynamic minimum for horizontal displacement
at all, so its runway is unbounded in principle; heating is Carnot-bound at ~×15, not
reaction-bound. Both are excluded from the mean rather than folded in. The judgement that a
10¹⁶ W economy is dominated by making things rather than moving or heating them is a
judgement, not a derivation, and it is the place to attack 2.15.)*

### 2.16 And what all of it looks like from outside

Fifteen sections have built a specific physical object: **4.95e13 m² of collector and
radiator, in orbit, rejecting 10¹⁶ W at a few hundred kelvin.** That is not only an
engineering claim — it is an **observational prediction**, and nothing here had ever pointed
a telescope at it.

**[RESULT] Type I is invisible, and it is not close.**

Bolometrically, 10¹⁶ W against the Sun's 3.83e26 W is **26 parts per trillion**. Going to the
mid-infrared helps enormously — a 320 K radiator peaks at 9.06 µm, far down the photosphere's
Rayleigh-Jeans tail — and buys **×943**. It is still hopeless:

> contrast at 9.06 µm: **2.5e-8**, one part in 41 million.

No photometry reaches parts per billion and no coronagraph reaches 10⁻⁸ at these separations.
Even ignoring the star entirely, the array delivers **0.066 µJy at 10 pc** — below
JWST/MIRI-class sensitivity, for a reach of **3.1 pc**. Four stars.

**[THE COROLLARY] The SETI null result says nothing about Type I.**

Dyson's argument, and every infrared-excess survey since, constrains **Type II** —
stellar-scale interception at ~10²⁶ W, where the excess is order unity. Type I is ten orders
below that. **Non-detection of waste heat is evidence about Dyson spheres and no evidence at
all about civilisations at the scale this document models.**

**[RESULT] The one signature that works is occultation.**

The same 4.95e13 m² against the solar disk is **32.6 ppm**, against Earth's own transit depth
of 83.9 — **39% of an Earth transit**, comfortably inside Kepler- and TESS-class photometry
for a bright star. The asymmetry is structural: occultation compares the array's **area** to
the star's disk (3e-5), emission compares its **luminosity** to the star's (3e-11).

> So the observational prediction of this entire chain is narrow and testable: **look for a
> shallow, aperiodic, non-planetary transit — not for an infrared excess.**

*(And a real tension the arithmetic forced. 2.6 and 2.13 both want the silicon hot, for mass.
A hotter radiator is smaller as T⁻⁴ while its peak radiance grows only as T³, so flux goes as
**1/T** and contrast as **~1/T³** — and occultation falls too, because the radiator shrinks.
**Every detection axis gets worse when the engineering optimum is taken.** Nothing here
resolves that; it is stated because the two optima genuinely point apart.)*

### 2.17 And the thing that does the pushing

2.12 established that delivery is exponential in Δv, and every result in it turns on one
line: `Isp = 380 s`, marked assumed and never derived. Fourteen sections have argued about
orbits, radiators and lunar industry without once modelling the engine.

**The decomposition that makes it checkable.** Specific impulse factors into a combustion term
and a nozzle term, and only the first is a property of the propellant:

    Isp · g₀  =  c*  ·  C_f

`c*` is what the chamber can do, independent of the bell bolted to it. Validating it
separately is the whole discipline, because c* has a tight published value per propellant
pair while C_f depends on an area ratio that differs between every engine ever flown.

| pair | c* derived | c* published | error | engine | Isp derived | published |
|---|---|---|---|---|---|---|
| LOX/LH2 | 2,299 m/s | 2,360 | **−2.6%** | RS-25 | 454.6 s | 452.3 |
| LOX/CH4 | 1,829 m/s | 1,830 | **−0.06%** | Raptor Vac | 371.5 s | 380 |
| LOX/RP-1 | 1,798 m/s | 1,820 | **−1.2%** | Merlin 1D Vac | 382.0 s | 348 |

*(IGNIOS core and R1 table since Unibit-Web ADR-0003: the ecosystem has one engine. M20's own
table gave 2,296 / 1,833 / 1,804 m/s. Its prose said Merlin 367 s while its code gave 379.9 s,
drift the ledger now refuses. The +9.8% on Merlin is in C_f (γ), since c* is inside 1.2%.)*

*(The first run of this was out by exactly √1000 — dividing by molar mass in kg/mol against a
gas constant per kmol. Invisible in any self-consistency check, obvious in one line against a
published number.)*

**[RESULT] The lever is molar mass, not chamber temperature.** Since `c* ∝ √(T_c/M)`, and
hydrogen burns **cooler** than kerosene, the reason LOX/LH2 wins is entirely that its exhaust
is light — 13.5 g/mol fuel-rich against 23.3, a **×1.69** advantage in the group that matters.
Chasing chamber temperature is chasing a square root of the wrong variable, and it is why
every serious high-Isp engine runs fuel-rich even though that wastes fuel.

**[RESULT] And chemistry cannot do 2.12's logistics.**

| mass ratio | Isp needed | |
|---|---|---|
| 30.4 | **380 s** | chemical — and exactly what 2.12 assumed |
| 10 | 563 s | already past chemistry |
| **3** — a sane single stage | **1,181 s** | **×2.6 the chemical ceiling** |

> **Single-stage-to-GEO on chemistry is impossible** — the stage cannot lift its own tanks.

*(An earlier draft of this section said "the Earth-launch route is closed by the periodic
table". 2.18 corrects that: staging reaches GEO fine. The claim that survives is the narrow
one above.)*

### 2.18 Except we launch to GEO every month

2.17 ended on a sentence that could not be right. Something had to give, and it is the scope:
**2.17 computed a single-stage mass ratio and drew a conclusion about the route.**

A stage carries structure as well as propellant, so its payload ratio is
`λ = 1 − (1 − 1/R)/(1 − ε)`. At 12,724 m/s, 380 s and a good ε = 0.08 a single stage gives
**λ = −0.05** — negative, it cannot lift its own tanks. That much 2.17 had right. But total
mass ratio is a **product** over stages, and that is exactly how you beat it without beating
chemistry:

| stages | payload fraction to GEO |
|---|---|
| 1 | **impossible** |
| 2 | **1.21%** |
| 3 | 1.78% |
| 4 | 2.00% — diminishing, each stage brings its own structure |

**[VALIDATION] And here the chain finally meets a flown vehicle.**

Falcon 9 Block 5, expendable: **22,800 kg to LEO and 8,300 kg to GTO**, both published. That
ratio is **×2.747**. Section 2.12 derived a GEO payload penalty of **×2.772** from Tsiolkovsky
alone, with an assumed Isp and no vehicle in it anywhere.

> **0.9% agreement against a real rocket**, and nothing upstream was fitted to it.

The payload fraction agrees too: this model gives 1.21% at two stages against Falcon 9's
actual **1.51%** of gross mass to GTO — conservative by a fifth, which is what a first-order
model with an assumed ε should be. A model that came out *above* a flown vehicle would be the
warning sign.

**[RESULT] So the binding number is 2%, not impossibility.**

Chemistry reaches GEO. It reaches it at one to two percent of gross mass, and **that** is what
makes 2.4's areal density requirement ×505:

> You are not fighting the periodic table. You are fighting the fact that
> **98.8% of what you launch is the launcher.**

2.7's conclusion is unchanged. The reason for it is now stated correctly.

### 2.19 And the same property, costed on the other side of the tank wall

2.17's result was that `c* ∝ √(T_c/M)`, so **the lever is molar mass** — and it then named its
own honest gap: no chamber-pressure or feed-system limit, "which is what actually decides
whether an engine is buildable." Closing that gap finds the answer is the *same atomic fact*,
measured from the other direction.

**Hydrogen is light. That is exactly why its exhaust is fast and exactly why its tank is
enormous.**

| pair | ρ_bulk | Isp | ρ·Isp | vs LH2 |
|---|---|---|---|---|
| LOX/LH2 | 362 kg/m³ | 452.3 s | 163,700 | 1.00 |
| LOX/CH4 | 833 | 380 | 316,700 | **×1.93** |
| LOX/RP-1 | 1,017 | 348 | 354,000 | **×2.16** |

LH2 wins specific impulse by ×1.30 and loses bulk density by ×2.81. Per cubic metre of tank,
kerosene is worth **more than twice as much**. And pump power goes as `ṁ·Δp/(ρ·η)`, so moving
a kilogram of hydrogen costs **×11.4** the pump work of a kilogram of kerosene — which is why
an RS-25 needs a 50 MW-class fuel turbopump to feed a 2 MN engine.

*(Validated against two flown engines: 91 MW modelled for RS-25 against ~73 MW published, and
39 MW for Raptor against ~30 MW. Both **high by 25–30%, in the same direction** — the
signature of an assumed efficiency that is too low, not of a broken model. Only ratios are
quoted, and efficiency cancels out of every one.)*

**[RESULT] And then the unexpected part.**

A tank's mass scales with the volume it encloses, so that ×2.81 penalty lands straight on
2.18's structural coefficient — the number 2.18 flagged as assumed and load-bearing. Give each
pair its own ε and run 2.18's two-stage case again:

| pair | Isp | ε | payload fraction to GEO |
|---|---|---|---|
| LOX/LH2 | 452.3 | 0.152 | **1.03%** |
| LOX/CH4 | 380 | 0.089 | **1.03%** |
| LOX/RP-1 | 348 | 0.080 | 0.66% |

> **Methane exactly matches hydrogen.** LH2's entire 19% specific-impulse advantage over CH4
> is cancelled, to two decimal places, by the tanks that advantage costs.

That was not predicted before running it, and it is the cleanest available explanation for why
the industry converged on methane for reusable vehicles: at equal payload you would rather
have the dense propellant, the small tanks and the 16 MW pump than the huge tanks and the
50 MW one. Both still beat kerosene, so Isp has not stopped mattering — the reversal lands
exactly between hydrogen and methane.

### 2.20 What intelligence can and cannot move

Everything above assumes IEA inertia or a labelled λ. Neither is a claim about what happens if
capability grows fast. So: **sort every parameter in this document by whether thinking harder
can move it.**

| | |
|---|---|
| **Inelastic — cognition does not touch these** | σT⁴ and the 192 TW crust ceiling · Earth's land area · the ~450 s chemical Isp ceiling · bulk propellant densities · Δv budgets · the Landauer floor · the speed of light in a control loop |
| **Elastic — design, materials, organisation** | industrial doubling time · areal density · structural coefficient ε · array lifetime · build rate · compute efficiency |

**[RESULT] And even the elastic ones have a thermodynamic floor.** A self-replicating base of
mass `M` at specific power `p` makes `M·p` watts; another `M` kilograms costs `M·e` joules.
The mass cancels:

    t_double = e / p        — independent of scale

With 2.7's 100 MJ/kg and a collector's own 150 W/kg that is **7.7 days**.

| | doubling time | 30 doublings | vs floor |
|---|---|---|---|
| Physical floor, `e/p` | **7.7 days** | 0.64 yr | ×1 |
| 2.7's industrial model | 264 days | 21.7 yr | ×34 |
| What λ = 0.62 implies | 1,226 days | 101 yr | **×159** |

**The entire gap between the forecast and physics is organisational** — logistics, tooling,
transport, allocation. Every one of those is a thing intelligence attacks. *(The 0.64-year
figure is a reductio in exactly the way 2.14's 101 MW is: nothing rebuilds an industrial base
in eight months. What it shows is that **the schedule is not protected by physics.**)*

**[THE ANSWER] Intelligence moves the date, not the wall.**

1.1 put the first wall at K = 0.828 and **3.29 doublings**. That number is identical in every
regime, because σT⁴ does not negotiate. Only the arrival changes:

| regime | years to the first wall |
|---|---|
| IEA inertia, 1.8%/yr | **~128 years** |
| λ = 0.62 | ~11 years |
| 2.7's industrial model | ~2.4 years |
| the physical floor | ~25 days |

> A fast takeoff does not deliver Type I. **It delivers the +0.1 K waste-heat ceiling,
> quickly** — and everything in section 2 about orbit, lunar sourcing and radiators stops
> being a twenty-second-century problem and becomes a this-decade one.
>
> **It does not raise the ceiling. It shortens the runway to it.**

*(What this does not do: model the latency from cognition to design to working hardware, which
is the actual mechanism being asked about. No takeoff dynamics, no date for anything, and no
claim that any of it happens. The module says which parameters could move and how far energy
lets them.)*

### 2.21 And the part of the latency that is physics

2.20 named its own gap: nothing modelled the latency from cognition to design to working
hardware. Take the part of that latency which is **physical rather than organisational** and it
dominates everything else by two orders of magnitude.

**The right frame is Amdahl, and it reduces the question to one number.** With `f` the
cognition-bound share of the schedule, making thinking free caps the speedup at `1/(1−f)`.
2.20 measured the gap between λ and the thermodynamic floor at ×159, so:

> **"AGI closes the organisational gap" ⟺ "99.37% of the schedule is thinking."**

Anyone asserting the first is asserting the second, and the second can be argued with. That
conversion is most of what this section is for.

**[RESULT] And there is a hard floor under `1 − f`: you cannot know a lifetime in less time
than the lifetime.**

2.9 derived a 69-year array life and said plainly that it is an argument from mechanism, not
from flight heritage — nothing that thin has flown for a decade. 2.5's whole ceiling,
`A_max = R·L`, is linear in exactly that number. Put the build next to the verification:

| | |
|---|---|
| Build 30 doublings at the thermodynamic floor | **232 days** |
| Verify a 69-year lifetime | **69 years** |
| **Verification dominates by** | **×109** |

> **The thing takes eight months to build and sixty-nine years to know.**

**What accelerated testing buys.** Single-mechanism acceleration is routine: a decade of proton
fluence in an afternoon, ten thousand thermal cycles in a month. Three things do not
accelerate — **coupled mechanisms at their true relative rates** (documented as non-additive,
so speeding one up changes which dominates), **the acceleration factor itself** (calibrated
against real-time data, so somebody has to have waited), and **a mechanism nobody modelled**
(LDEF flew 5.8 years and returned surprises). You can accelerate a mechanism you understand.
You cannot accelerate finding the one you missed.

**What a plausible cognitive fraction actually buys**, applied to λ:

| f | speedup ceiling | first wall | Type I |
|---|---|---|---|
| 50% | ×2 | **5.5 yr** | 51 yr |
| 80% | ×5 | 2.2 yr | 20 yr |
| 90% | ×10 | 1.1 yr | 10 yr |
| 95% | ×20 | 0.6 yr | 5 yr |

Even the modest case — half the schedule is thinking, and thinking becomes free — brings the
+0.1 K ceiling inside a decade while Type I stays half a century out. **That is 1.1 and 2.20
saying the same thing twice: the wall is what arrives.**

*(The escape, without moralising: all of this is avoidable by flying unqualified hardware and
finding out. Fast actors take that option. It is a **choice about risk, not a physics result**,
and the acceleration is available only to whoever makes it.)*

### 2.22 The gap that closes itself, in the wrong currency

2.21 listed what it did not model and named fleet learning first. It belongs here, because
learning shares an axis with the build in a way nothing else in this document does.

**Wright's law** says a quantity falls by a fixed fraction per doubling of *cumulative
production* — not per year, not per unit of effort. And 2.7 established that Type I is **thirty
industrial doublings**, which are doublings of cumulative production. **So you get thirty
doublings of learning for free, simply by building the thing.**

The arithmetic is tantalising. 2.12's areal density gap — the hardest number in the chain — is
**×505**, and closing it over thirty doublings requires **18.7% per doubling**. Photovoltaics
learn at **20–24%**, one of the best-documented curves in industrial history.

**[THE TRAP] Except those are different quantities, and the chain's is the one that learns
slowest.**

| curve | rate | quantity | 30 doublings buy | closes ×505? |
|---|---|---|---|---|
| Photovoltaic modules | 22% | **$/W** | ×1,770 | yes |
| Lithium-ion cells | 19% | $/kWh | ×568 | yes |
| Wind turbines | 12% | $/kW | ×47 | no |
| **Areal density, illustrative** | **6%** | **kg/m²** | **×6** | **no** |

Photovoltaics got cheap by getting cheap to *make* — thinner, mass-produced, higher yield — not
by getting light. Space array specific power has gone from roughly 30 W/kg to 150 in three
decades: **×5 in total**, against the ×505 needed.

This document already refuses to let dated cost figures into a physics argument. The same rule
applies here and harder: **a cost learning rate may not be used to close a mass gap.** It is
the most tempting available error and it would flatter the thesis by three orders of magnitude.

**[RESULT] So state the requirement, not a prediction.**

> **r ≥ 18.7% per doubling, in areal density, sustained for thirty doublings.**

A falsifiable engineering target in the right units on the right axis. At 10% it takes **59
doublings** — twice what the build supplies — so **the gap closes only if learning outpaces
construction.**

*(And one more time, from a fourth direction: Wright's x-axis is **units built**. Not years
elapsed, not effort applied. A faster mind moves it only by causing more units to exist —
which is what 1.1, 2.20 and 2.21 each concluded by another route. **Building is what binds.**)*

### 2.23 So when does Type I arrive?

Twenty-five sections and the obvious question has never been answered directly. The answer is
that **this document does not know, cannot know, and will not pretend to.** What it has
produced instead is better and more useful than a date.

**[THE GATES] Everything that must be true, with today beside it.**

| gate | today | required | gap | kind |
|---|---|---|---|---|
| Load specific power | ~100 W/kg | 75,900 W/kg | **×759** | design |
| Areal density | 2.24 kg/m² | 4.43 g/m² | **×505** | design |
| Launch cadence | 0.71 flights/day | 100 | ×142 | design |
| Array lifetime | ~5 yr | 69 yr | ×14 | design |
| Lunar mass fraction | 0% | ≥99.98% | **from zero** | materials |
| Thermal ceiling | 19.6 TW | 192 TW | ×9.8 | budget |
| Compute efficiency | ×1 | **must stay under ×52** | — | **inverted** |

That last one is the strange one and it is real: past ×52, Type I computation fits on the
crust and the orbital argument becomes about industry instead. **It is a gate the thesis needs
to stay shut.** And the lunar fraction is flagged rather than given a multiple, because
"×N better" is not the frame when today is zero.

**[THE REFUSAL] Why there is no date in this document.**

A year is a function of four numbers, and of nothing else: the **doubling time** (2.20: floor
7.7 days, λ implies 3.36 years, ×159 apart), the **cognitive fraction** (2.21: Amdahl caps any
speedup at 1/(1−f)), the **learning rate in kg/m²** (2.22: needs 18.7%/doubling), and the
**launch cadence** (2.4). State those four and the year is a division. Quote a year without
them and it is a feeling with a number attached.

So the calculator here takes a **required** scenario argument and has no default. A test
asserts that no exported function can hand back a year nobody chose the inputs for.

**With the assumptions stated, here is what each reference scenario gives:**

| scenario | doubling | Type I | first wall | closes the areal gap? |
|---|---|---|---|---|
| IEA inertia | 38.9 yr | **349 yr → 2375** | 128 yr | no |
| λ hypothesis | 11.2 yr | **101 yr → 2127** | 37 yr | no |
| Self-replicating industry | 1.2 yr | 11 yr → 2037 | 4 yr | yes |
| Thermodynamic floor | 0.01 yr | *bound, not a forecast* | — | yes |

*(A bug the ordering test caught while this was being written: the first version used 2.7's
**30 industrial mass doublings** where it needed the **9.0 power doublings** to Type I. Those
are different quantities — building the factory versus raising the supply — and mixing them
gave IEA inertia 1,169 years against the 349 this document has quoted since section 1.)*

**[FOR A SIMULATOR] The gates are the mechanism.** A player closing gates is doing exactly
what this chain says has to happen, and the date falls out of their choices instead of being
printed on the box. The scenarios above are difficulty settings, and every one is a citation.

### 2.24 The gates are coupled, and the coupling has a growth law

2.23 admitted in its own limits that it treats the gates as independent. They are not: a
lighter array puts more square metres on each flight, which is more cumulative production,
which is more learning, which is a lighter array. **Positive feedback, and the only cycle in
the graph.**

Written down with launch capability `C` held fixed and Wright's law on areal density, it
integrates:

    dA/dt = C/σ(A),  σ(A) = σ₀(A/A₀)^(−b)   ⟹   **A(t) ∝ t^(1/(1−b))**

**Polynomial. Not exponential.** At 2.22's required 18.7% learning, `b = 0.299` and area grows
as **t^1.43** — superlinear, and nothing like a doubling curve.

**[CORRECTS the chain's framing] Learning does not give doublings.** 2.7, 2.20 and 2.23 all
reason in doublings, which is exponential. This shows learning alone cannot produce that with a
fixed launch capability. **Exponential requires self-replication** — the base building more
base, so that `C` itself grows. That is 2.7's mechanism and a different thing entirely; the two
have been used interchangeably and they are not.

**[RESULT] And λ finally has a mechanism instead of being a fit.**

| starting fleet | r = 10% | **r = 18.7%** | r = 22% |
|---|---|---|---|
| 1,000 m² | 1,524 yr | **54 yr** | 14 yr |
| 10,000 m² | 2,162 yr | **107 yr** | 32 yr |
| 100,000 m² | 3,069 yr | **212 yr** | 72 yr |
| 1,000,000 m² | 4,354 yr | **422 yr** | 165 yr |

With no learning at all: **50,490 years**. With it, at the required rate from a 10,000 m²
fleet: **107**, against the fitted 101.

That is emphatically **not a derivation** — the answer moves by ×8 across three decades of
starting area, and λ sits *inside the range* rather than being reproduced by it. But the
forecast's free parameter now has a mechanism to be argued through, which it has never had.
And **learning at the required rate is worth ×470 on the schedule** — the single largest lever
anywhere in this document.

**[THE BOUNDARY] At a 50% learning rate the model destroys itself.** `b = 1` exactly there, and
beyond it `dA/dt ∝ A^b` reaches infinity in *finite time*. That is not a prediction of
unbounded growth — it is the model announcing it is out of domain, the same way 2.14's 101 MW
and 2.20's 25 days announce theirs.

### 2.25 And self-replication is only exponential below a crossover

2.24 established that exponential growth requires self-replication rather than learning. It
then took self-replication for granted, and should not have.

A factory that makes 96% of its own mass still imports the other 4%, and **that import scales
with the factory.** So growth is `dM/dt = min(p·M, I/(1−c))` with `c` the **closure** — the
mass fraction of its own components a base can produce. The two terms cross at

    **M\* = I / (p·(1−c))**

Below `M*` the base outgrows its imports and **compounds**. Above it the imports bind and
growth is a **straight line**.

| closure | imports | M\* | then linear at | total to 115 Gt | still compounding |
|---|---|---|---|---|---|
| 90% | 10% | 13.2 Gg | 1.32e10 kg/yr | **8,744 yr** | 0.011% |
| **96%** | 4% | 32.9 Gg | 3.29e10 kg/yr | **3,505 yr** | **0.029%** |
| 99% | 1% | 132 Gg | 1.32e11 kg/yr | 886 yr | 0.11% |
| 99.9% | 0.1% | 1.32 Tg | 1.32e12 kg/yr | 103 yr | 1.1% |
| **99.984%** | 0.016% | 8.30 Tg | 8.30e12 kg/yr | **31 yr** | 7.2% |

**[THE GAP] NASA proposed 96%. The chain requires 99.984%.**

The 1980 Advanced Automation for Space Missions study — the only serious engineering treatment
of a self-replicating lunar factory — put achievable closure at roughly 90–96%, with
microelectronics and some chemistry imported. Those differ by **×252 in import flow** and
**×113 in schedule**.

> At 96% closure the exponential phase ends at **33 megatonnes** — 0.03% of the system — and
> everything after is a straight line taking millennia. **The self-replication 2.24 said was
> needed for exponential growth only delivers it for the first three ten-thousandths of the
> build.**

And 2.7 reached 99.98% as a **materials** statement about carbon in regolith. This reaches the
same number as the **dynamical** condition for growth to stay exponential long enough to
matter. Two entirely different arguments, one threshold.

*(99.9% closure gives 103 years against λ's 101. Three modules now land near λ from different
directions. That is interesting and it is not evidence.)*

### 2.26 Which few percent, and why it is a map problem

2.25 closed on its own limit: no model of **which** few percent is hard to close. This is that
question, and the answer is not the one the chain has been implying.

**Regolith has everything structural and nothing living.**

| abundant (weight %) | absent (parts per million) |
|---|---|
| O 44% · Si 21% · Al 13% | **C ~100 ppm** |
| Ca 10% · Fe 6% · Mg 5% | **H ~50 ppm** · **N ~80 ppm** |

Collector, radiator, structure and the silicon all come from the left column. Carbon, hydrogen
and nitrogen are only there as solar wind implanted over billions of years — which is 2.7's
carbon problem as a number: **ten thousand kilograms of regolith per kilogram of carbon.**

**[RESULT] Expensive per kilogram, affordable in total.** Bulk-heating regolith to ~700 °C at
70% yield costs **10 GJ per kilogram of carbon** — a hundred times the embodied energy 2.7
assigns the entire system per kilogram. But only 18.4 Mt is needed, so over a 31-year build
that is **188 GW**, about **5% of the lunar industrial power** already budgeted. It closes, and
it closes expensively.

**[THE ALTERNATIVE] Polar ice is ×124 better — and it moves the problem rather than solving it.**

LCROSS measured **~5.6% water by mass** in the Cabeus ejecta, which turns the 5% energy tax
into 0.04%. Except the ice is in **permanent shadow at 40 K**, and the power needs **permanent
sun**:

| | |
|---|---|
| Array area to run 3.8 TW of lunar industry | **16,450 km²** |
| Peaks of near-eternal light | order **1 km²** each, a handful of ridges |
| What those peaks could run | **0.06%** of the industry |

> The two requirements cannot be met in the same place. **The last few percent of closure is
> not a technology gap — it is a transport problem inside the Moon**, between a polar cold trap
> and wherever there is enough sunlit ground to run a terawatt-scale industry.

That is a constraint of exactly the kind 2.11 found for the array's orbit: geometric,
unavoidable, and invisible until two requirements are put on the same map.

### 2.27 Moving a kilogram across the Moon

2.26 ended by admitting that transport inside the Moon is absent from the whole chain, having
just shown the volatiles are at the poles and the power has to be where the Sun is. Closing
that has a pleasing inversion in it.

**[RESULT] Past 1,181 km it is cheaper to leave the Moon than to hop across it.**

With no atmosphere a ballistic hop is drag-free, which sounds ideal. The minimum-energy range
equation is `v²/(gR) = 2sin(Θ/2)/(1+sin(Θ/2))`, and it validates — at Θ → π it returns
exactly orbital velocity, and the model's g and R reproduce **1,680 m/s orbital** and
**2,376 m/s escape** from μ and R rather than from a table.

The catch is that **you arrive at the speed you left**, so a hop costs twice its launch:

| range | Θ | hop | hop + landing | vs escape |
|---|---|---|---|---|
| 100 km | 3.3° | 397 m/s | 795 m/s | ×0.33 |
| 500 km | 16.5° | 841 | 1,683 | ×0.71 |
| **1,181 km** | 38.9° | 1,188 | **2,376** | **×1.00** |
| 2,730 km | 90.0° | 1,529 | 3,059 | ×1.29 |

Pole to equator is 2,729 km, so the whole distance 2.26's conflict opens sits on the wrong
side of that line.

**[RESULT] Which makes rolling the answer, and rolling is nearly free.** At a rolling
resistance of 0.1, `μ·g·d` gives **0.44 MJ/kg** — **×5.3 cheaper than hopping** and **0.44%**
of the 100 MJ/kg 2.7 assigns as embodied energy. Energetically it does not register.

**[THE INVERSION] And the fleet is small for exactly the reason closure is hard.**

Only the volatiles cross. Silicon, aluminium, iron and oxygen are under the factory wherever it
stands — carbon, hydrogen and nitrogen are only at the poles. That is **0.016% of the flow**:

    volatiles only        **22,913 rovers**
    if everything moved   143,000,000 rovers

So the architecture is forced rather than chosen: **bulk industry on sunlit ground where the
rock already is, and a narrow dedicated volatile chain running to the poles.** A logistics
programme, not a physics wall.

> **The same 0.016% that makes 2.25's closure requirement nearly impossible is what makes this
> transport problem nearly free.** One number, two signs.

---

## 3. The other three layers

### Distribution — a global grid is excluded, and it would not help anyway

AC submarine cable dies at ~100 km on capacitive charging current. Every intercontinental
tie is 6,300–14,900 km, so **all of them must be HVDC, which is asynchronous by
construction**. A single planetary synchronous grid is not a design choice anyone gets to
make. ERCOT, Hydro-Québec and Japan's 50/60 Hz split are asynchronous ties running today.

Latency compounds it: a loop closed over the worst tie settles in **1.61 s** against a 0.5 s
arrest window. Ties carry energy and schedule, never frequency.

But the sharper finding is that the cable barely matters. Raising intertie capacity to 100%
of the smaller endpoint and the voltage to ±1100 kV recovers under 1 pp of unserved energy —
and a wire with *infinite capacity and zero loss* recovers only 0.45 pp more. The binding
constraint is not transmission: at the moment a cluster is short, **nobody else has a surplus
to send**. Overbuild beats storage beats transmission, and it is not close.

Two things the simulations overturned that were in the original framing:

- **Pooling genuinely wins on RoCoF.** Shared inertia is physical and instantaneous. What
  federation buys is a contained blast radius, not a better frequency response. The
  "global pool would cascade" story is not true and is not needed — the exclusion argument
  is airtight without it.
- **Never size storage from one weather year.** Unserved energy is convex in the shortfall,
  so mean-preserving noise raises it. Across 4,000 synthetic weather years on the GPU, one
  year understates the tank by **×26**.

### Compute — a token is a bandwidth problem

Autoregressive decode is memory-bandwidth bound, not FLOP bound: to emit one token you
stream every active weight out of HBM. Two consequences dominate everything else. Device
count **cancels** out of the energy per token. And batching beats model size — a local 8B at
batch 1 costs **0.456 Wh** per reply against **0.323 Wh** for a frontier MoE batched, despite
27× fewer active parameters. The lever is busy-vs-idle, not local-vs-cloud.

Validated against two external numbers: the published ~0.3 Wh per query, and Meta's
published 30.84M H100-hours for Llama-3.1-405B, matched to 99%.

### Quantum — it sits on the load side of the ledger

A statevector over n qubits is 2ⁿ complex amplitudes. Measured on an RTX 5060 Ti: the wall
is **29 qubits** in complex128 on 16 GB, at 85% of datasheet bandwidth, 7.26 nJ per
amplitude-update. Extrapolating, one brute-force gate costs a full second of a Type I budget
at **~80 qubits**.

Real quantum hardware does that gate for microwatts. **That is an avoided cost, not a power
source**, and K counts watts generated. Post-quantum crypto is the same story from the other
side: ×50 the handshake bytes, invisible above ~13.5 Mbps and dominant below it, and
microjoules either way. Neither moves K.

### The operator — humans supervise, they do not stabilise

Resolving a frequency to Δf requires observing for 1/Δf. That is a theorem, and it puts a
consumer EEG decision chain at **1,315 ms** — failing the same 0.5 s arrest window a
transcontinental cable fails, by 2.6×. Two unrelated physics, one architectural conclusion:
no node that settles above the arrest window belongs in a frequency-control loop, whether it
is a continent away or a person.

---

## 4. The one thing that qualifies the thesis

`THESIS.md` says ASI is an energy event. That holds **only if efficiency stops improving**.

Landauer is kT·ln2 = 2.87×10⁻²¹ J per irreversible bit operation. Against a practical 100 kT
reliability floor there are **3.1 orders of magnitude** of headroom in logic and **8.0** in
data movement — and data movement is the term that actually binds today.

So three orders of compute growth, about ten doublings, can arrive without a single extra
watt. **The energy event is real and it is deferred.** That is a narrower claim than the
original and a much harder one to argue with.

---

## 5. What we got wrong

Twelve corrections, each marked `[CORRECTED]` in code, test and docs. The ones that changed
a conclusion:

| what was claimed | what was true |
|---|---|
| `facts.ts` converted TWh/yr to watts | It treated Wh as joules. Every electricity figure was **3600× too small**; the site rendered "Electricity 0.0 TW" |
| HVDC loss is a fixed % per 1000 km | Loss fraction is `P·R/V²` — proportional to the power pushed and to 1/V². The ties looked decorative because they were charged rated losses at a fraction of rated flow |
| Survivors move ±0.01 pp when a cluster is killed | An artefact of comparing four clusters against five. Measured like-for-like it is **exactly zero**, and near-vacuous because the killed cluster traded nothing |
| Waste heat is source-independent | Only new heat loads the radiator. Ground solar recycles insolation and adds ~zero — it fails on geometry instead |
| Collectors weigh 1.2 kg/m² | That is a *blanket*. A wing is 2.24 kg/m², and the areal gap is ×183, not ×98 |
| M7/M8 costed the system | They costed the collector. The radiator is heavier: **×2.04** |
| A hotter array is easier to see | Written from a scratch calculation that held the radiator area fixed. It is not: flux goes as **1/T** and contrast as **~1/T³**, so the mass lever makes every detection axis worse |
| Industry has no efficiency runway (asserted in 2.14) | True, and now measured: **×2.31** against compute's ×1,232. But it had to be checked, and it sets the hinge — the escape needs a **≥95% compute economy** |
| ASI is an energy event, full stop | Only while compute efficiency improves by less than **×52**, against runways of ×1,232 and ×10⁸. The surviving claim is narrower: Type I is an energy event, and ASI need not be what causes it |
| The load did not need weighing | The whole thesis is about moving it. At rack specific power it is 10¹⁴ kg — **759 centuries of launch** — and it was in none of the totals |
| The load dwarfs the power station | It does not, and the test said so. ×1.5 the collector, +74% on the system. The ×759 is against the *deliverable* budget, a different question |
| The array can be geostationary | Only counting the collector. Add 2.6's radiator to the same shell and the floor is **119% of GEO** |
| Hopping is the obvious way to cross an airless world | Past **1,181 km** it costs more Δv than escaping the Moon, because you arrive at the speed you left. Pole to equator is more than twice that |
| The regolith problem is chemistry | It is **geography**. Volatiles are in cold traps that exist because they never see the Sun; the power needs 16,450 km² that always does. Peaks of light run **0.06%** of the industry |
| Self-replication means exponential growth | Only below `M* = I/(p(1−c))`. At the best proposed closure the compounding phase ends at **0.03% of the build** and the rest is a straight line |
| Learning gives doublings | With fixed launch capability it gives a **power law**, `A ∝ t^1.43`. Exponential needs self-replication, a different mechanism, and the two had been used interchangeably |
| The chain should predict a date | It cannot, and says so. A year is a function of four stated parameters — the product is **seven falsifiable gates**, not a year |
| The gap will close because things get cheaper | Photovoltaics learn 22% **in $/W**. The gap is **×505 in kg/m²**, and those decouple — modules got cheap by getting cheap to make, not by getting light |
| Acceleration is limited by how fast we think | Amdahl caps it at 1/(1−f). And under `1−f` sits a physical floor: **you cannot know a 69-year lifetime in under 69 years**, which dominates the 232-day build by ×109 |
| A faster takeoff would move the Type I date | It moves the date of the **first wall**, which is 3.29 doublings away and identical in every regime. Intelligence shortens the runway; it does not raise the ceiling |
| Molar mass is simply the lever | It is the same fact twice: light exhaust is fast **and** light propellant needs huge tanks. Give each pair its own ε and **methane matches hydrogen exactly** |
| The Earth-launch route is closed by chemistry | Written from a *single-stage* mass ratio. Staging reaches GEO at 1–2% of gross mass. What survives: single-stage-to-GEO is impossible, and **98.8% of what you launch is the launcher** |
| The engine was a constant | `Isp = 380 s` was assumed and never derived. Deriving it validates c* to under 3% — and shows a sane single stage to GEO needs **×2.6 the chemical ceiling** |
| Type I was the constraint to argue about | It is the *last* wall, not the first. The waste-heat ceiling binds at **K 0.83, ×9.8, 3.3 doublings** — four walls arrive before Type I does |
| Delivery cost scales like orbital energy | Energy is linear in altitude; the rocket equation is exponential. GEO costs **×2.77** in mass, not ×1.71 — reasoning in joules understated it by 62% |
| "In orbit" was a location | It is 23% of Earth's cross-section. An isotropic shell at 400 km cools the planet **4.89 K** — placement is a climate decision, and the budget picks GEO |
| A 5-year array lifetime | A LEO-smallsat default, and the most leveraged number in the chain. The environment supports **~69 years**, which moves the ceiling from 5% of Type I to 69% |
| Micrometeoroids would shred an 8.7 µm film | 200,000 years to lose a tenth of its area. A film has nothing to sever |
| Lunar sourcing is ×12 cheaper | That compares floors. Earth launch is chemical and runs 15× above its own, so real against real it is **×106** |
| The QUBO would beat greedy | Greedy is optimal. The problem is never combinatorial — max 2 active links, 87% of hours zero. The QUBO reproduces greedy at 35× the cost |

The pattern: none of these were found by re-reading code. Each was found by **building
something to measure against** — an exhaustive optimum for the QUBO, a deterministic gate for
the CUDA port, two published figures for the token cost, physics validation before timing for
the simulator, a browser for the rendered page.

---

## 6. What would falsify this

- **Thermal:** a mechanism that rejects planetary heat without raising the radiating
  temperature. None is known; the constraint is Stefan-Boltzmann, not engineering.
- **Lift:** a collector at ~12 g/m² at wing level including radiator, or a non-terrestrial
  material stream. Either one reopens the build.
- **Lifetime:** an orbital array that outlives its own construction. That single number
  moves `A_max = R·L` from a ceiling to a schedule.
- **Compute:** if data movement stops binding — if the memory wall is genuinely broken — the
  8 orders of runway shrink and the energy event arrives sooner, not later.
- **Grid:** correlated multi-continent weather, which the Monte Carlo assumes away on the
  strength of a 600 km correlation length against 6,300 km separations.
- **The whole compute leg, cheaply:** a ×52 improvement in compute efficiency *together with*
  an economy that is ≥95% computation. 2.14 shows the first is well inside the thermodynamic
  runway the repo itself computed; 2.15 shows the second is the real hinge. Argue that a Type
  I civilisation spends nineteen twentieths of its energy thinking and the orbital argument
  for compute goes with it.
- **2.21's cognitive fraction:** show that most of the schedule really is thinking rather than
  waiting, building or qualifying, and the ×159 gap becomes reachable. That single number
  decides how much of 2.20 survives.
- **2.18's Falcon 9 agreement is the one thing here that could be checked and wasn't fitted.**
  If a second flown vehicle's LEO/GTO ratio departs from 2.12's ×2.77 by much, the transfer
  chain has a problem the ×509 gap has been hiding.
- **2.16's prediction, directly:** a shallow, aperiodic, non-planetary transit of ~30 ppm
  around a nearby bright star would be the first positive evidence this document has ever
  offered. Its absence, so far, constrains nothing — the survey depth is not there yet.
- **2.15's load mix:** show that a 10¹⁶ W economy is dominated by transport (no thermodynamic
  minimum at all) rather than by materials, and the ×2.31 industrial floor stops binding.
- **The load:** a demonstrated path to ~10⁵ W/kg — a 14 µm die running at 400 K, or anything
  else that rejects heat that hard. Nothing in this document is further from a working part.
- **Transfer:** an architecture that delivers to GEO without paying the ×2.77 — orbital
  refuelling changes the flight count but not the Δv, so it would have to be low-thrust
  electric, and nothing here models the trip time that costs.
- **Placement:** a real constellation geometry — planes, not a shell — that either keeps the
  shading inside +0.1 K below GEO, or that cannot be packed into the non-shading band at all.
  Either direction falsifies 2.11's ladder.
- **Environment:** a film failure mode we did not model — tear propagation, UV
  embrittlement, charging — that caps the lifetime near five years after all. That single
  number sets the ceiling linearly, so it is the cheapest place to attack the whole thesis.
- **ISRU:** a photovoltaic that cannot be made ≥99.98% from regolith. Show one carbon-bearing
  layer with no lunar substitute and the whole route closes. Or an industrial doubling time
  demonstrably longer than ~10 years, which pushes Type I past three centuries.

---

## 7. What is not modelled

No orbital assembly, no debris flux, no end-of-life disposal, no power-beaming safety or
pointing, no ionospheric heating. No albedo change from covering a planet in panels. No
economics beyond a dated capex sketch. No inter-annual climate drift. Radiator areal density
is a satellite figure; thin-film concepts would shift the balance.

Every one of those makes the numbers **worse**, not better. They are floors.

---

## Numbers in this document

Generated from `src/lib/findings.ts`. `synthesis.test.ts` fails if these drift from the code.

<!-- FINDINGS-TABLE-START -->

| id | value | unit | kind | module |
|---|---|---|---|---|
| `k-now` | 0.729 | K | derived | `kardashev.ts` |
| `gap-type-i` | 509 | × | derived | `kardashev.ts` |
| `type-i-of-disk` | 0.058 | fraction | derived | `facts.ts` |
| `years-accelerating` | 101 | years | assumed | `forecast.ts` |
| `grid-settle-vs-arrest` | 1.610 | s | derived | `grid.ts` |
| `grid-sync-possible` | 0.000 | links | derived | `grid.ts` |
| `grid-single-year-optimism` | 25.974 | × | measured | `grid-reliability.ts` |
| `grid-least-cost-overbuild` | 1.150 | × | assumed | `grid-cost.ts` |
| `grid-max-arcs` | 2.000 | links | derived | `grid-qubo.ts` |
| `wh-per-response-frontier` | 0.323 | Wh | derived | `compute-energy.ts` |
| `wh-per-response-local` | 0.456 | Wh | derived | `compute-energy.ts` |
| `qubit-wall` | 29.000 | qubits | measured | `qsim.ts` |
| `qubits-at-type-i` | 80.189 | qubits | derived | `qsim.ts` |
| `pqc-size-penalty` | 49.977 | × | published | `pqc.ts` |
| `pqc-free-above` | 1.350e+7 | bit/s | derived | `pqc.ts` |
| `operator-latency` | 1315 | ms | derived | `operator.ts` |
| `operator-fails-arrest` | 2.630 | × | derived | `operator.ts` |
| `type-i-crust-delta-t` | 5.057 | K | derived | `thermal.ts` |
| `crust-must-leave` | 0.981 | fraction | derived | `thermal.ts` |
| `ground-solar-land` | 1.678 | × land | derived | `thermal.ts` |
| `beam-does-not-help` | 1.200 | W per useful W | derived | `beam.ts` |
| `lift-payback` | 20.633 | days | derived | `lift.ts` |
| `areal-gap` | 183 | × | derived | `collector.ts` |
| `sustainable-fraction` | 0.050 | fraction | derived | `collector.ts` |
| `replacement-cadence` | 2000 | flights/day | derived | `collector.ts` |
| `radiator-understatement` | 2.039 | × | derived | `reject.ts` |
| `hot-silicon-lever` | 2.829 | × | derived | `reject.ts` |
| `efficiency-runway-logic` | 3.091 | orders | derived | `reject.ts` |
| `efficiency-runway-movement` | 7.994 | orders | measured | `reject.ts` |
| `lunar-advantage` | 106 | × | derived | `isru.ts` |
| `isru-transport-share` | 0.045 | fraction | derived | `isru.ts` |
| `lunar-industry-power` | 7.635e+13 | W | derived | `isru.ts` |
| `max-earth-fraction` | 1.587e-4 | fraction | derived | `isru.ts` |
| `type-i-doublings` | 30.100 | doublings | derived | `isru.ts` |
| `lambda-as-doubling-time` | 3.356 | years | derived | `isru.ts` |
| `dust-peak-diameter` | 1.723e-4 | m | derived | `environment.ts` |
| `film-thickness` | 8.662e-6 | m | derived | `environment.ts` |
| `micrometeoroid-area-loss` | 4.867e-7 | fraction/yr | derived | `environment.ts` |
| `film-perforations` | 198 | /m²/yr | derived | `environment.ts` |
| `ao-bare-film-life` | 0.192 | years | derived | `environment.ts` |
| `debris-impact-rate` | 9.368 | /s | derived | `environment.ts` |
| `array-vs-earth-cross-section` | 0.233 | fraction | derived | `environment.ts` |
| `array-vs-mass-launched` | 5.120e+6 | × | derived | `environment.ts` |
| `environment-lifetime` | 68.959 | years | derived | `environment.ts` |
| `lifetime-leverage` | 0.300 | fraction | derived | `environment.ts` |
| `shading-leo` | 0.077 | fraction | derived | `placement.ts` |
| `shading-cooling-leo` | 4.890 | K | derived | `placement.ts` |
| `climate-floor-radius` | 3.896e+7 | m | derived | `placement.ts` |
| `climate-floor-vs-geo` | 0.924 | fraction | derived | `placement.ts` |
| `duty-cycle-geometric-leo` | 0.671 | fraction | derived | `placement.ts` |
| `band-fill-leo` | 0.100 | fraction | derived | `placement.ts` |
| `sky-coverage-geo` | 54.863 | deg² | derived | `placement.ts` |
| `geo-payload-penalty` | 2.772 | × | derived | `transfer.ts` |
| `energy-understates-delivery` | 0.619 | fraction | derived | `transfer.ts` |
| `areal-density-geo` | 0.004 | kg/m² | derived | `transfer.ts` |
| `areal-gap-geo` | 505 | × | derived | `transfer.ts` |
| `moon-to-geo-dv` | 3982 | m/s | derived | `transfer.ts` |
| `lunar-advantage-geo` | 10.442 | × | derived | `transfer.ts` |
| `earth-to-geo-dv` | 12724 | m/s | derived | `transfer.ts` |
| `load-mass-rack` | 1.000e+14 | kg | derived | `load.ts` |
| `load-centuries-of-launch` | 759 | centuries | derived | `load.ts` |
| `radiator-specific-power` | 144 | W/kg | derived | `load.ts` |
| `self-radiating-specific-power` | 10591 | W/kg | derived | `load.ts` |
| `load-specific-power-required` | 75904 | W/kg | derived | `load.ts` |
| `die-thickness-required` | 1.395e-5 | m | derived | `load.ts` |
| `climate-floor-corrected` | 5.022e+7 | m | derived | `load.ts` |
| `escape-threshold` | 52.090 | × | derived | `substitution.ts` |
| `logic-runway` | 1232 | × | derived | `substitution.ts` |
| `movement-runway` | 9.870e+7 | × | derived | `substitution.ts` |
| `compute-power-at-logic-floor` | 8.117e+12 | W | derived | `substitution.ts` |
| `brain-lead-over-silicon` | 17.686 | × | derived | `substitution.ts` |
| `brain-orders-over-floor` | 4.843 | orders | derived | `substitution.ts` |
| `type-i-responses-per-person` | 1050 | /person/s | derived | `substitution.ts` |
| `type-i-in-brains` | 60976 | brains/person | derived | `substitution.ts` |
| `industry-runway` | 2.306 | × | derived | `industry.ts` |
| `ammonia-runway` | 1.722 | × | published | `industry.ts` |
| `compute-anomaly` | 534 | × | derived | `industry.ts` |
| `required-compute-share` | 0.958 | fraction | derived | `industry.ts` |
| `required-share-best-case` | 0.956 | fraction | derived | `industry.ts` |
| `reduction-at-todays-mix` | 2.312 | × | derived | `industry.ts` |
| `compute-share-today` | 0.003 | fraction | published | `industry.ts` |
| `type-i-ir-contrast` | 2.463e-8 | fraction | derived | `signature.ts` |
| `type-i-bolometric-contrast` | 2.612e-11 | fraction | derived | `signature.ts` |
| `ir-spectral-advantage` | 943 | × | derived | `signature.ts` |
| `type-i-detection-reach` | 3.080 | pc | derived | `signature.ts` |
| `type-i-occultation-ppm` | 32.553 | ppm | derived | `signature.ts` |
| `occultation-vs-earth` | 0.388 | fraction | derived | `signature.ts` |
| `first-wall-k` | 0.828 | K | derived | `sequence.ts` |
| `first-wall-multiple` | 9.771 | × | derived | `sequence.ts` |
| `first-wall-doublings` | 3.289 | doublings | derived | `sequence.ts` |
| `first-wall-sooner` | 2.734 | × | derived | `sequence.ts` |
| `ground-solar-all-land-w` | 5.960e+15 | W | derived | `sequence.ts` |
| `walls-before-type-i` | 4.000 | walls | derived | `sequence.ts` |
| `cstar-lox-lh2` | 2299 | m/s | derived | `engine.ts` |
| `isp-rs25-derived` | 455 | s | derived | `engine.ts` |
| `molar-mass-lever` | 1.687 | × | derived | `engine.ts` |
| `isp-for-sane-stage` | 1181 | s | derived | `engine.ts` |
| `beyond-chemistry` | 2.624 | × | derived | `engine.ts` |
| `falcon9-validation` | 0.009 | fraction | published | `staging.ts` |
| `geo-payload-fraction` | 0.012 | fraction | derived | `staging.ts` |
| `minimum-stages-to-geo` | 2.000 | stages | derived | `staging.ts` |
| `launcher-share-of-mass` | 0.988 | fraction | derived | `staging.ts` |
| `density-impulse-reversal` | 2.163 | × | derived | `density.ts` |
| `hydrogen-pump-penalty` | 11.408 | × | derived | `density.ts` |
| `rs25-pump-power` | 9.131e+7 | W | derived | `density.ts` |
| `methane-matches-hydrogen` | 1.006 | × | derived | `density.ts` |
| `hydrogen-structural-penalty` | 0.152 | fraction | derived | `density.ts` |
| `doubling-floor-days` | 7.693 | days | derived | `acceleration.ts` |
| `organisational-gap` | 159 | × | derived | `acceleration.ts` |
| `wall-arrival-inertial` | 128 | years | derived | `acceleration.ts` |
| `wall-arrival-fastest` | 0.069 | years | derived | `acceleration.ts` |
| `wall-doublings-invariant` | 3.289 | doublings | derived | `acceleration.ts` |
| `inelastic-parameters` | 7.000 | parameters | derived | `acceleration.ts` |
| `verification-dominance` | 109 | × | derived | `qualification.ts` |
| `cognitive-fraction-implied` | 0.994 | fraction | derived | `qualification.ts` |
| `speedup-at-half-cognition` | 2.000 | × | derived | `qualification.ts` |
| `wall-at-half-cognition` | 5.517 | years | derived | `qualification.ts` |
| `unaccelerable-test-modes` | 3.000 | modes | derived | `qualification.ts` |
| `required-learning-rate` | 0.187 | fraction/doubling | derived | `learning.ts` |
| `pv-cost-learning-rate` | 0.220 | fraction/doubling | published | `learning.ts` |
| `learning-temptation` | 1.178 | × | derived | `learning.ts` |
| `gap-at-mass-like-rate` | 6.439 | × | derived | `learning.ts` |
| `doublings-at-ten-percent` | 59.082 | doublings | derived | `learning.ts` |
| `open-gates` | 6.000 | gates | derived | `route.ts` |
| `power-doublings-to-type-i` | 8.992 | doublings | derived | `route.ts` |
| `hardest-gate` | 759 | × | derived | `route.ts` |
| `inertial-years-to-type-i` | 349 | years | derived | `route.ts` |
| `loop-growth-exponent` | 1.425 | exponent | derived | `bootstrap.ts` |
| `no-learning-years` | 50517 | years | derived | `bootstrap.ts` |
| `learning-leverage` | 470 | x | derived | `bootstrap.ts` |
| `lambda-mechanism-years` | 107 | years | derived | `bootstrap.ts` |
| `required-closure` | 1.000 | fraction | derived | `closure.ts` |
| `proposed-closure` | 0.960 | fraction | published | `closure.ts` |
| `closure-import-gap` | 252 | x | derived | `closure.ts` |
| `years-at-proposed-closure` | 3505 | years | derived | `closure.ts` |
| `exponential-share-at-proposed` | 2.863e-4 | fraction | derived | `closure.ts` |
| `regolith-per-kg-carbon` | 14286 | kg/kg | derived | `volatiles.ts` |
| `carbon-extraction-energy` | 9.977e+9 | J/kg | derived | `volatiles.ts` |
| `volatile-power-tax` | 0.049 | fraction | derived | `volatiles.ts` |
| `polar-ice-advantage` | 124 | x | derived | `volatiles.ts` |
| `peak-of-light-share` | 3.044e-4 | fraction | derived | `volatiles.ts` |
| `lunar-array-area` | 1.642e+10 | m2 | derived | `volatiles.ts` |
| `hop-escape-crossover` | 1.181e+6 | m | derived | `surface.ts` |
| `lunar-roll-energy` | 4.435e+5 | J/kg | derived | `surface.ts` |
| `roll-vs-hop` | 5.274 | x | derived | `surface.ts` |
| `volatile-rover-fleet` | 22914 | rovers | derived | `surface.ts` |
| `everything-rover-fleet` | 1.432e+8 | rovers | derived | `surface.ts` |
| `electricity-now` | 3.422e+12 | W | published | `facts.ts` |
| `datacentres-now` | 5.248e+10 | W | published | `facts.ts` |
| `k-of-type-i` | 1.000 | K | derived | `kardashev.ts` |

<!-- FINDINGS-TABLE-END -->
