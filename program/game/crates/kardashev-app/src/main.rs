//! KARDASHEV — terminal prototype for Era I.
//! Enter = +1 year · `list` = programs · `build <id>` = queue · `q` = quit

use kardashev_core::{Deck, GameState, Ladder, Programs, load_elements};
use std::io::{BufRead, Write};
use std::path::PathBuf;

fn main() {
    let data = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../../data")
        .canonicalize()
        .expect("data dir");

    let ladder = Ladder::load(&data.join("ladder.toml")).expect("ladder.toml");
    let programs = Programs::load(&data.join("programs.toml")).expect("programs.toml");
    let deck = Deck::load(&data.join("events.toml")).expect("events.toml");
    let elements = load_elements(&data.join("elements.toml")).expect("elements.toml");
    let mut s = GameState::new(ladder, programs, deck, elements);

    println!("KARDASHEV :: Era I — Earth, 2026. 'q' quit · Enter +1 yr · 'list' · 'build <id>'");

    let stdin = std::io::stdin();
    loop {
        let p = s.power_watts();
        let era = s
            .ladder
            .current(p)
            .map(|r| r.name.as_str())
            .unwrap_or("—");
        let next = s
            .ladder
            .next(p)
            .map(|r| format!("{} ({:.1e} W) — gate: {}", r.name, r.power_watts, r.gate))
            .unwrap_or_else(|| "MAX".into());

        println!("─────────────────────────────────────────────────────────────");
        println!(
            "Year {:.0} | K = {:.3} | P = {:.2e} W | Era: {}",
            s.year,
            s.k(),
            p,
            era
        );
        println!("Next: {next}");
        println!(
            "Built: {:?}",
            s.built.keys().cloned().collect::<Vec<_>>()
        );
        println!(
            "Queue: {:?}",
            s.queue
                .iter()
                .map(|(id, t)| format!("{id}@{:.0}", t))
                .collect::<Vec<_>>()
        );
        print!("Ledger: ");
        for (n, e) in &s.elements {
            if e.annual_drain_kg != 0.0 {
                print!(
                    "{n} {:.1e} kg (cover {:.0} yr)  ",
                    e.stock_kg,
                    e.cover_years()
                );
            }
        }
        println!();
        if s.famine_active {
            println!("!! FAMINE ACTIVE — fleet at half power");
        }
        for l in s.log.drain(..) {
            println!("  {l}");
        }

        print!("\n> ");
        std::io::stdout().flush().unwrap();
        let mut line = String::new();
        if stdin.lock().read_line(&mut line).unwrap_or(0) == 0 {
            break;
        }
        let cmd = line.trim();
        if cmd == "q" || cmd == "quit" {
            break;
        }
        if cmd == "list" {
            for prog in &s.programs.program {
                let mark = if s.built.get(&prog.id).copied().unwrap_or(false) {
                    "[x]"
                } else {
                    "[ ]"
                };
                println!(
                    "{mark} {:24} {:.1e} W  req {:?}  ({})",
                    prog.id, prog.power_watts, prog.requires, prog.source
                );
            }
            continue;
        }
        if let Some(id) = cmd.strip_prefix("build ") {
            match s.build(id.trim()) {
                Ok(()) => println!("queued: {}", id.trim()),
                Err(e) => println!("cannot build: {e}"),
            }
            continue;
        }

        s.tick(1.0);
        if s.k() >= 1.0 {
            println!("\n*** K1 REACHED — THE PLANETARY ERA. Type I: achieved. ***");
        }
    }
}
