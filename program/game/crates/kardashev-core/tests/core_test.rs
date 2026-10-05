use kardashev_core::k_level;

#[test]
fn earth_2026_is_k073() {
    // OIKOUMENE §2: humanity ~2e13 W → (13.301 − 6)/10 = 0.730.
    let k = k_level(2.0e13);
    assert!((k - 0.730).abs() < 0.001, "got {k}");
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
