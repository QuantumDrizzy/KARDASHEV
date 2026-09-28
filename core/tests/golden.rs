//! The gate (Unibit-Web ADR-0003): the Rust port against the TypeScript M1 it
//! replaces. `golden_ts.json` is written by `scripts/core-golden.ts` from
//! src/lib/kardashev.ts as exact bit patterns. The budget is stated here and
//! every difference is printed, not hidden.

use kardashev_core::*;

/// Allowed distance in units in the last place. JS Math.log10/log and Rust's
/// libm are both fdlibm descendants, but not guaranteed identical.
const ULP_BUDGET: u64 = 2;

fn ulps(a: f64, b: f64) -> u64 {
    if a == b {
        return 0;
    }
    let (x, y) = (a.to_bits() as i64, b.to_bits() as i64);
    x.abs_diff(y)
}

fn arg(name: &str) -> f64 {
    let inside = &name[name.find('(').unwrap() + 1..name.find(')').unwrap()];
    inside.split(',').next().unwrap().parse().unwrap()
}

#[test]
fn the_port_matches_the_typescript() {
    let text = std::fs::read_to_string(concat!(env!("CARGO_MANIFEST_DIR"), "/tests/golden_ts.json")).unwrap();
    let cases: Vec<serde_json::Value> = serde_json::from_str(&text).unwrap();
    let mut worst = 0u64;
    let mut exact = 0usize;
    for c in &cases {
        let name = c["name"].as_str().unwrap();
        let ts = f64::from_bits(u64::from_str_radix(c["value"].as_str().unwrap(), 16).unwrap());
        let rs = match name {
            "SECONDS_PER_YEAR" => SECONDS_PER_YEAR,
            "P_2023" => P_2023,
            "K_NOW" => k_now(),
            "GAP_I" => gap_i(),
            "GAP_II" => gap_ii(),
            "GROWTH" => GROWTH,
            n if n.starts_with("kOf(") => k_of(arg(n)),
            n if n.starts_with("yearsTo(") => years_to(arg(n), P_2023),
            n => panic!("golden case `{n}` has no Rust counterpart"),
        };
        let d = ulps(rs, ts);
        println!("{name:32} ts {ts:<24e} rs {rs:<24e} ulp {d}");
        worst = worst.max(d);
        exact += usize::from(d == 0);
        assert!(d <= ULP_BUDGET, "{name}: {d} ulp apart (budget {ULP_BUDGET})");
    }
    println!("{exact}/{} bit-identical, worst {worst} ulp (budget {ULP_BUDGET})", cases.len());
}
