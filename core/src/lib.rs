//! kardashev-core — KARDASHEV's M1, the K scale, as one core (Unibit-Web ADR-0003).
//!
//! Sagan 1973: `K = (log10 P − 6) / 10`, P in watts. Type I = 10¹⁶ W, Type II =
//! 10²⁶ W (the Sun, 3.826e26 W, is used as the practical rung), Type III = 10³⁶ W.
//! Civilisation power: IEA 2023 total energy supply, 620 EJ/yr; growth 1.8 %/yr
//! (TES 2013–2023). A model, not a grid meter; the growth is not a forecast.
//!
//! The same code runs natively (the ledger, the tests), in wasm32 (the site) and
//! behind a C ABI (the Unreal plugin). `libm` is used unconditionally so all three
//! agree bit for bit; `tests/golden.rs` holds the port to the TypeScript it
//! replaces within a stated ULP budget.

#![cfg_attr(target_arch = "wasm32", no_std)]

/// Julian year, s.
pub const SECONDS_PER_YEAR: f64 = 365.25 * 86_400.0;
/// IEA 2023 total energy supply, EJ/yr.
pub const TES_2023_EJ: f64 = 620.0;
/// Civilisation power in 2023, W.
pub const P_2023: f64 = (TES_2023_EJ * 1e18) / SECONDS_PER_YEAR;
/// Growth of TES 2013–2023, per year. Not a forecast.
pub const GROWTH: f64 = 0.018;
/// Sagan rungs, W.
pub const P_I: f64 = 1e16;
pub const P_II_SAGAN: f64 = 1e26;
pub const P_III: f64 = 1e36;
/// Solar luminosity, W (the practical Type II rung).
pub const L_SUN: f64 = 3.826e26;
/// Milky Way luminosity, W (order of magnitude).
pub const L_MW: f64 = 1e37;

/// Sagan's K for a power in watts.
#[must_use]
pub fn k_of(p_w: f64) -> f64 {
    (libm::log10(p_w) - 6.0) / 10.0
}

/// Civilisation power `years` after 2024-01-01 at the declared growth, W.
#[must_use]
pub fn power_after_years(years: f64) -> f64 {
    P_2023 * libm::pow(1.0 + GROWTH, years)
}

/// Years for power `p_w` to reach `target_w` at the declared growth.
#[must_use]
pub fn years_to(target_w: f64, p_w: f64) -> f64 {
    libm::log(target_w / p_w) / libm::log(1.0 + GROWTH)
}

/// K now (2023 power).
#[must_use]
pub fn k_now() -> f64 {
    k_of(P_2023)
}

/// How many times today's power Type I is.
#[must_use]
pub fn gap_i() -> f64 {
    P_I / P_2023
}

/// How many times Type I the Sun is.
#[must_use]
pub fn gap_ii() -> f64 {
    L_SUN / P_I
}

// ---------------------------------------------------------------------------
// C ABI: the site (wasm32) and the game (Unreal plugin) call these.
// ---------------------------------------------------------------------------

#[no_mangle]
pub extern "C" fn kardashev_k_of(p_w: f64) -> f64 {
    k_of(p_w)
}

#[no_mangle]
pub extern "C" fn kardashev_power_after_years(years: f64) -> f64 {
    power_after_years(years)
}

#[no_mangle]
pub extern "C" fn kardashev_years_to(target_w: f64, p_w: f64) -> f64 {
    years_to(target_w, p_w)
}

/// 0 P_2023, 1 GROWTH, 2 P_I, 3 L_SUN, 4 P_III, 5 SECONDS_PER_YEAR, 6 TES_2023_EJ,
/// 7 P_II_SAGAN, 8 L_MW. NaN for an unknown index.
#[no_mangle]
pub extern "C" fn kardashev_constant(i: u32) -> f64 {
    match i {
        0 => P_2023,
        1 => GROWTH,
        2 => P_I,
        3 => L_SUN,
        4 => P_III,
        5 => SECONDS_PER_YEAR,
        6 => TES_2023_EJ,
        7 => P_II_SAGAN,
        8 => L_MW,
        _ => f64::NAN,
    }
}

#[cfg(target_arch = "wasm32")]
#[panic_handler]
fn panic(_: &core::panic::PanicInfo) -> ! {
    core::arch::wasm32::unreachable()
}

#[cfg(test)]
mod tests {
    use super::*;

    /// The locks of kardashev.test.ts, restated: TES ~20 TW, K ≈ 0.73, gap ×509.
    #[test]
    fn the_scale_matches_its_sources() {
        assert!((P_2023 / 1e12 - 19.65).abs() < 0.01, "620 EJ/yr is 19.65 TW");
        assert!((k_now() - 0.729).abs() < 0.001);
        assert!((gap_i() - 509.0).abs() < 0.5);
        assert!((k_of(P_I) - 1.0).abs() < 1e-15);
        assert!((k_of(P_III) - 3.0).abs() < 1e-15);
    }

    #[test]
    fn growth_and_years_are_inverse() {
        for y in [1.0, 10.0, 100.0, 350.0] {
            let p = power_after_years(y);
            assert!((years_to(p, P_2023) - y).abs() < 1e-9 * y.max(1.0));
        }
    }
}
