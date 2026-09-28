//! KARDASHEV's M1 numbers for the Unibit chain (Unibit-Web ADR-0002/0003).
//!
//!   cargo run --release --bin ledger     -> ../out/ledger/kardashev.json
//!
//! Inputs are CITED (their published source); what the core computes from them
//! is DERIVED, with the test that locks it. A dirty tree is written but marked,
//! and unibit-chain refuses it.

use std::fmt::Write as _;
use std::path::PathBuf;
use std::process::Command;

use kardashev_core::*;

fn git(root: &PathBuf, args: &[&str]) -> Option<String> {
    let out = Command::new("git").args(args).current_dir(root).output().ok()?;
    out.status.success().then(|| String::from_utf8_lossy(&out.stdout).trim().to_string())
}

fn esc(s: &str) -> String {
    s.replace('\\', "\\\\").replace('"', "\\\"")
}

fn main() {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("..");
    let commit = git(&root, &["rev-parse", "--short=12", "HEAD"]).unwrap_or_else(|| "unknown".into());
    let dirty = git(&root, &["status", "--porcelain"]).is_none_or(|s| !s.is_empty());

    let iea = "IEA World Energy Balances 2023: total energy supply 620 EJ/yr";
    let sagan = "Sagan 1973, The Cosmic Connection: K = (log10 P - 6) / 10";
    let lib = "core/src/lib.rs (kardashev-core), locked by tests/golden.rs against src/lib/kardashev.ts";
    // (key, value, unit, class, source)
    let rows: Vec<(&str, f64, &str, &str, &str)> = vec![
        ("inputs/tes_2023_ej", TES_2023_EJ, "EJ/yr", "CITED", iea),
        ("inputs/growth_per_year", GROWTH, "1", "CITED", "IEA TES growth 2013-2023, about 1.8 %/yr; not a forecast"),
        ("inputs/type_i_w", P_I, "W", "CITED", sagan),
        ("inputs/sun_luminosity_w", L_SUN, "W", "CITED", "Solar luminosity 3.826e26 W as used by M1 [TO VERIFY against IAU 2015 nominal 3.828e26 W]"),
        ("inputs/type_iii_w", P_III, "W", "CITED", sagan),
        ("m1/power_2023_w", P_2023, "W", "DERIVED", lib),
        ("m1/k_now", k_now(), "1", "DERIVED", lib),
        ("m1/gap_type_i", gap_i(), "1", "DERIVED", lib),
        ("m1/gap_sun_over_type_i", gap_ii(), "1", "DERIVED", lib),
        ("m1/years_to_type_i", years_to(P_I, P_2023), "yr", "DERIVED", lib),
        ("m1/years_to_sun", years_to(L_SUN, P_2023), "yr", "DERIVED", lib),
        ("m1/years_to_type_iii", years_to(P_III, P_2023), "yr", "DERIVED", lib),
    ];

    let mut entries = String::new();
    for (i, (key, v, unit, class, source)) in rows.iter().enumerate() {
        assert!(v.is_finite(), "{key} is not finite");
        let cites = if *class == "DERIVED" {
            r#","cites":["kardashev/inputs/tes_2023_ej","kardashev/inputs/growth_per_year","kardashev/inputs/type_i_w"]"#
        } else {
            ""
        };
        let _ = write!(
            entries,
            "{}{{\"id\":\"kardashev/{key}\",\"value\":{v:?},\"unit\":\"{unit}\",\"class\":\"{class}\",\"verdict\":\"PASS\",\"source\":\"{}\",\"test\":\"core/tests/golden.rs\",\"inputs\":{{\"growth_per_year\":{GROWTH:?}}}{cites}}}",
            if i == 0 { "" } else { ",\n" },
            esc(source)
        );
    }
    let batch = format!(
        "{{\"repo\":\"kardashev\",\"commit\":\"{commit}\",\"dirty\":{dirty},\"producer\":\"cargo run --bin ledger (kardashev-core)\",\"entries\":[\n{entries}\n]}}\n"
    );
    let out = root.join("out").join("ledger");
    std::fs::create_dir_all(&out).expect("out/ledger");
    std::fs::write(out.join("kardashev.json"), batch).expect("write batch");
    println!(
        "ledger -> {}  ({} entries, commit {commit}{})",
        out.join("kardashev.json").display(),
        rows.len(),
        if dirty { ", DIRTY: the chain will refuse it" } else { "" }
    );
}
