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
