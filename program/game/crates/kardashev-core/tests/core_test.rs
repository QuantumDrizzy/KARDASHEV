use kardashev_core::k_level;

#[test]
fn earth_2026_is_k073() {
    // PHASE0 dial 1 [MEASURED]: 592.2 EJ/yr 2024 = 1.877e13 W
    // → (13.273 − 6)/10 = 0.727.
    let k = k_level(1.877e13);
    assert!((k - 0.727).abs() < 0.001, "got {k}");
}

#[test]
fn k1_is_exactly_one() {
    // Canonical: K1 = 1e16 W.
    assert!((k_level(1.0e16) - 1.0).abs() < 1e-12);
}

#[test]
fn k2_is_the_shell() {
    // Full-K2 = 1e26 W (INVICTUS §0).
    assert!((k_level(1.0e26) - 2.0).abs() < 1e-12);
}

#[test]
fn the_sun_crosses_k2() {
    // L_sun = 3.828e26 W → K = 2.058: the star alone is past Type II.
    let k = k_level(3.828e26);
    assert!((k - 2.058).abs() < 0.001, "got {k}");
}

#[test]
fn k3_is_the_galaxy() {
    assert!((k_level(1.0e36) - 3.0).abs() < 1e-12);
}

// ── Ledger integrity (the real-program contract: flows must close) ─────

#[test]
fn era1_element_flows_balance() {
    // AUDIT.md contract: production ≥ consumption across the Era I program
    // set. Convention (data-schema.md): drain positive = consumption,
    // negative = production → the ledger closes when net flow ≤ 0.
    let data = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../data");
    let programs = kardashev_core::Programs::load(&data.join("programs.toml"))
        .expect("programs.toml");
    let mut net: std::collections::BTreeMap<String, f64> = Default::default();
    for p in &programs.program {
        for (el, rate) in &p.elements_drain {
            *net.entry(el.clone()).or_insert(0.0) += rate;
        }
    }
    for (el, flow) in net {
        assert!(
            flow <= 0.0,
            "element '{el}' nets {flow} kg/yr of unmet demand — silent famine"
        );
    }
}

#[test]
fn deuterium_stock_covers_millennium_at_era1_demand() {
    // KRAKEN §3.2: atmospheric CH4 D inventory = 1.2e13 kg. If net demand
    // (consumption − production) is positive, the horizon must exceed 500 yr.
    let data = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../data");
    let programs = kardashev_core::Programs::load(&data.join("programs.toml"))
        .expect("programs.toml");
    let drain: f64 = programs
        .program
        .iter()
        .filter_map(|p| p.elements_drain.get("deuterium"))
        .filter(|r| **r > 0.0)
        .sum();
    let supply: f64 = programs
        .program
        .iter()
        .filter_map(|p| p.elements_drain.get("deuterium"))
        .filter(|r| **r < 0.0)
        .sum::<f64>()
        .abs();
    let net = drain - supply;
    let horizon = if net <= 0.0 {
        f64::INFINITY // production covers demand: stock grows, no horizon
    } else {
        1.2e13 / net
    };
    assert!(
        horizon > 500.0,
        "deuterium horizon {horizon:.0} yr < 500 yr at Era I net demand"
    );
}

#[test]
fn deuterium_stock_matches_derivation() {
    // STANDARD.md worked chain: the stock in elements.toml is not free —
    // it is [DERIVED] from measured ratios. Re-derive and pin (±10 %,
    // the chain's rounding level).
    //  column mass  = P/g           = 1.467e5 / 1.352      = 1.085e5 kg/m²  [Huygens]
    //  area         = 4πR²          = 8.33e13 m²            (R = 2,574.7 km)
    //  atm mass     = 9.04e18 kg
    //  × CH4 frac   ~2 %                                     [Huygens GCMS profile]
    //  → m_CH4      = 1.8e17 kg
    //  × D mass fr  = 4 × 1.35e-4 × 2.014/16.043 = 6.78e-5   [Cassini D/H]
    //  → stock      = 1.22e13 kg
    let derived = 1.8e17 * 6.78e-5;
    let data = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../data");
    let elements = kardashev_core::load_elements(&data.join("elements.toml"))
        .expect("elements.toml");
    let stock = elements["deuterium"].stock_kg;
    let rel = (stock - derived).abs() / derived * 100.0;
    assert!(rel < 10.0, "stock {stock:.3e} deviates {rel:.1} pct from the derived chain {derived:.3e} — change the chain, not just the number");
}
