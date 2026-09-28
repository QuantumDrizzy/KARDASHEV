/**
 * CONSTANTS — the physical constants, defined once.
 *
 * An audit of the fifteen physics modules found seven constants defined in two
 * places each, including **four separate declarations of the speed of light**
 * under two different names. Every copy happened to agree, which is luck rather
 * than construction: nothing stopped one from being edited alone.
 *
 * This module owns them. The modules that used to declare their own now
 * re-export from here, so no public API changed and no import broke —
 * `orbit.ts` still exports `R_EARTH_M`, it just no longer *defines* it.
 *
 * `consistency.test.ts` walks the modules and fails if any two copies of the
 * same quantity ever disagree, so this cannot quietly come back.
 *
 * Rules for adding anything here:
 *   - SI base units, no prefixes, no per-module conveniences.
 *   - Defined values (c, σ) exactly; measured values (μ⊕) with their source.
 *   - Nothing derived. A derived quantity belongs where its physics lives.
 */

/** Speed of light in vacuum. SI definition, exact. */
export const C = 299_792_458;

/** Stefan-Boltzmann. Exact under SI 2019, from k, h, c. */
export const SIGMA = 5.670374419e-8;

/** Boltzmann. SI 2019 definition, exact. */
export const BOLTZMANN = 1.380649e-23;

/** Standard gravity. Defined, not measured. */
export const G0 = 9.80665;

/** Earth mean radius, m. IUGG. */
export const R_EARTH_M = 6.371e6;

/** Earth gravitational parameter, m³/s². EGM2008 / IAU. */
export const MU_EARTH = 3.986004418e14;

/** Moon gravitational parameter and mean radius. */
export const MU_MOON = 4.9048695e12;
export const R_MOON_M = 1.7374e6;

/** Solar irradiance at 1 AU, W/m². IAU 2015 nominal. */
export const AM0 = 1361;

/** World population. Not physics, but shared and worth pinning. */
export const POPULATION = 8.2e9;

/** Seconds in a Julian year. */
export const SECONDS_PER_YEAR = 365.25 * 86_400;

/** Joules per watt-hour. The factor whose absence was a real bug in facts.ts. */
export const J_PER_WH = 3600;
