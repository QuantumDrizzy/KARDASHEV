//! KARDASHEV core — the series' arithmetic as a game engine.
//!
//! Data lives in `data/*.toml` (see ../data-schema.md); every number there
//! carries its whitepaper cross-reference. The sim core never depends on a
//! renderer (Bevy attaches later as a front-end crate, per era1-mechanics §7).

use serde::Deserialize;
use std::collections::BTreeMap;

// ───────────────────────────── Ladder ─────────────────────────────

#[derive(Debug, Deserialize, Clone)]
pub struct Rung {
    pub id: String,
    pub power_watts: f64,
    pub name: String,
    pub gate: String,
}

#[derive(Debug, Deserialize, Default)]
pub struct Ladder {
    #[serde(default)]
    pub rung: Vec<Rung>,
}

/// Sagan-decade scale, pinned to the series' anchors:
/// K = (log10 P − 6)/10 → humanity 2026 (2e13 W) = K0.73,
/// K1 = 1e16 W, K2 = 1e26 W (the Sun crosses it: 3.828e26 → K2.06), K3 = 1e36 W.
pub fn k_level(power_watts: f64) -> f64 {
    (power_watts.max(1.0).log10() - 6.0) / 10.0
}

impl Ladder {
    pub fn load(path: &std::path::Path) -> Result<Self, Box<dyn std::error::Error>> {
        Ok(toml::from_str(&std::fs::read_to_string(path)?)?)
    }
    pub fn current(&self, power_watts: f64) -> Option<&Rung> {
        self.rung.iter().rev().find(|r| power_watts >= r.power_watts)
    }
    pub fn next(&self, power_watts: f64) -> Option<&Rung> {
        self.rung.iter().find(|r| power_watts < r.power_watts)
    }
}

// ───────────────────────────── Programs ───────────────────────────

#[derive(Debug, Deserialize, Clone)]
pub struct Program {
    pub id: String,
    pub name: String,
    pub era: u32,
    pub class: String,
    pub power_watts: f64,
    pub build_years: f64,
    #[serde(default)]
    pub available_from_year: Option<f64>,
    #[serde(default)]
    pub requires: Vec<String>,
    /// kg/yr; positive = consumption, negative = production.
    #[serde(default)]
    pub elements_drain: BTreeMap<String, f64>,
    pub source: String,
}

#[derive(Debug, Deserialize, Default)]
pub struct Programs {
    #[serde(default)]
    pub program: Vec<Program>,
}

impl Programs {
    pub fn load(path: &std::path::Path) -> Result<Self, Box<dyn std::error::Error>> {
        Ok(toml::from_str(&std::fs::read_to_string(path)?)?)
    }
    pub fn get(&self, id: &str) -> Option<&Program> {
        self.program.iter().find(|p| p.id == id)
    }
}

// ───────────────────────────── Events ─────────────────────────────

#[derive(Debug, Deserialize, Clone)]
pub struct Event {
    pub id: String,
    pub era: u32,
    pub name: String,
    pub severity: String,
    pub physics: String,
    pub mitigation: String,
}

#[derive(Debug, Deserialize, Default)]
pub struct Deck {
    #[serde(default)]
    pub event: Vec<Event>,
}

impl Deck {
    pub fn load(path: &std::path::Path) -> Result<Self, Box<dyn std::error::Error>> {
        Ok(toml::from_str(&std::fs::read_to_string(path)?)?)
    }
    pub fn for_era(&self, era: u32) -> Vec<&Event> {
        self.event.iter().filter(|e| e.era == era).collect()
    }
}

// ───────────────────────────── Elements ───────────────────────────

#[derive(Debug, Clone)]
pub struct ElementStock {
    pub stock_kg: f64,
    pub annual_drain_kg: f64,
}

impl ElementStock {
    pub fn cover_years(&self) -> f64 {
        if self.annual_drain_kg <= 0.0 {
            f64::INFINITY
        } else {
            self.stock_kg / self.annual_drain_kg
        }
    }
}

pub fn load_elements(
    path: &std::path::Path,
) -> Result<BTreeMap<String, ElementStock>, Box<dyn std::error::Error>> {
    #[derive(Deserialize)]
    struct Raw {
        #[serde(default)]
        element: Vec<ElementRaw>,
    }
    #[derive(Deserialize)]
    struct ElementRaw {
        id: String,
        stock_kg: f64,
    }
    let raw: Raw = toml::from_str(&std::fs::read_to_string(path)?)?;
    Ok(raw
        .element
        .into_iter()
        .map(|e| {
            (
                e.id,
                ElementStock {
                    stock_kg: e.stock_kg,
                    annual_drain_kg: 0.0,
                },
            )
        })
        .collect())
}

// ───────────────────────────── KPI / Scoreboard ──────────────────────
/// The program's first instrument, in code: `data/kpi.csv` parsed, the
/// scoreboard status derived, and the K1 ETA re-published from data.

/// Minimal RFC4180-subset CSV field split (quotes, doubled quotes; no
/// embedded newlines — kpi.csv doesn't use them).
pub fn parse_csv_line(line: &str) -> Vec<String> {
    let mut out = Vec::new();
    let mut cur = String::new();
    let mut in_q = false;
    let mut chars = line.chars().peekable();
    while let Some(c) = chars.next() {
        if in_q {
            if c == '"' {
                if chars.peek() == Some(&'"') {
                    cur.push('"');
                    chars.next();
                } else {
                    in_q = false;
                }
            } else {
                cur.push(c);
            }
        } else {
            match c {
                '"' => in_q = true,
                ',' => {
                    out.push(std::mem::take(&mut cur));
                }
                _ => cur.push(c),
            }
        }
    }
    out.push(cur);
    out
}

#[derive(Debug, Clone)]
pub struct KpiEntry {
    pub dial: String,
    pub year: String,
    pub value: f64,
    pub unit: String,
    pub class: String,
    pub source: String,
}

#[derive(Debug, Default)]
pub struct Kpi {
    pub entries: Vec<KpiEntry>,
}

impl Kpi {
    pub fn load(path: &std::path::Path) -> Result<Self, Box<dyn std::error::Error>> {
        let raw = std::fs::read_to_string(path)?;
        let mut entries = Vec::new();
        for (i, line) in raw.lines().enumerate() {
            if i == 0 || line.trim().is_empty() {
                continue;
            }
            let f = parse_csv_line(line);
            if f.len() < 5 {
                continue;
            }
            entries.push(KpiEntry {
                dial: f[0].trim().to_string(),
                year: f[1].trim().to_string(),
                value: f[2].trim().parse().unwrap_or(f64::NAN),
                unit: f[3].trim().to_string(),
                class: f[4].trim().to_string(),
                source: f.get(5).cloned().unwrap_or_default(),
            });
        }
        Ok(Self { entries })
    }

    /// Latest measured (non-target) entry for a dial.
    pub fn latest(&self, dial: &str) -> Option<&KpiEntry> {
        self.entries
            .iter()
            .filter(|e| e.dial == dial && e.year != "-")
            .max_by(|a, b| {
                let ya: f64 = a.year.parse().unwrap_or(0.0);
                let yb: f64 = b.year.parse().unwrap_or(0.0);
                ya.partial_cmp(&yb).unwrap_or(std::cmp::Ordering::Equal)
            })
    }

    /// Scoreboard rows (scoreboard_S*): (name, achieved, source note).
    /// Thresholds per ACCELERATION.md: S1 opens at sustained > 2.5 %/yr
    /// growth; S2–S4 are boolean milestones.
    pub fn scoreboard(&self) -> Vec<(String, bool, String)> {
        let mut rows: Vec<(String, bool, String)> = Vec::new();
        for e in &self.entries {
            if let Some(name) = e.dial.strip_prefix("scoreboard_") {
                let achieved = if name == "S1" { e.value >= 2.5 } else { e.value > 0.0 };
                rows.push((name.to_string(), achieved, e.source.clone()));
            }
        }
        rows.sort();
        rows
    }

    /// Max brittleness registered (the index of the worst single point).
    pub fn brittleness_max(&self) -> Option<(&String, f64)> {
        self.entries
            .iter()
            .filter(|e| e.dial.starts_with("brittleness_"))
            .max_by(|a, b| a.value.partial_cmp(&b.value).unwrap())
            .map(|e| (&e.dial, e.value))
    }

    /// Years from current primary power to K1 at sustained growth rate r
    /// (r as a fraction: 0.018 = 1.8 %/yr → t = ln(K1/P)/ln(1+r)).
    pub fn eta_k1_years(&self, r: f64) -> f64 {
        let p = self.latest("primary_power").map(|e| e.value).unwrap_or(2.0e13);
        (1.0e16 / p).ln() / (1.0 + r).ln()
    }

    /// Primary power in watts (latest measured).
    pub fn primary_power(&self) -> f64 {
        self.latest("primary_power").map(|e| e.value).unwrap_or(2.0e13)
    }
}

// ───────────────────────────── State ──────────────────────────────

pub struct GameState {
    pub year: f64,
    pub base_power_watts: f64,
    pub tau_years: f64,
    pub industry_kg: f64,
    pub built: BTreeMap<String, bool>,
    pub queue: Vec<(String, f64)>,
    pub elements: BTreeMap<String, ElementStock>,
    pub ladder: Ladder,
    pub programs: Programs,
    pub deck: Deck,
    pub rng: u64,
    pub log: Vec<String>,
    pub famine_active: bool,
}

impl GameState {
    pub fn new(
        ladder: Ladder,
        programs: Programs,
        deck: Deck,
        elements: BTreeMap<String, ElementStock>,
    ) -> Self {
        Self {
            year: 2026.0,
            // [MEASURED]: 592.2 EJ/yr primary energy 2024, +1.8% (Energy
            // Institute Statistical Review 2025) = 1.877e13 W → K = 0.727.
            // See docs/PHASE0.md dial 1 and data/kpi.csv.
            base_power_watts: 1.877e13,
            tau_years: 4.0,
            industry_kg: 1.0e10,
            built: BTreeMap::new(),
            queue: Vec::new(),
            elements,
            ladder,
            programs,
            deck,
            rng: 0x9E37_79B9_7F4A_7C15,
            log: Vec::new(),
            famine_active: false,
        }
    }

    pub fn k(&self) -> f64 {
        k_level(self.power_watts())
    }

    pub fn power_watts(&self) -> f64 {
        let mut p = self.base_power_watts;
        for id in self.built.keys() {
            if let Some(prog) = self.programs.get(id) {
                p += prog.power_watts;
            }
        }
        if self.famine_active {
            p *= 0.5;
        }
        p
    }

    pub fn can_build(&self, id: &str) -> Result<(), String> {
        let prog = self
            .programs
            .get(id)
            .ok_or_else(|| format!("unknown program '{id}'"))?;
        if self.built.get(id).copied().unwrap_or(false) {
            return Err("already built".into());
        }
        if self.queue.iter().any(|(q, _)| q == id) {
            return Err("already queued".into());
        }
        for r in &prog.requires {
            if !self.built.get(r).copied().unwrap_or(false) {
                return Err(format!("requires '{r}'"));
            }
        }
        if let Some(y) = prog.available_from_year {
            if self.year < y {
                return Err(format!("not before year {y:.0}"));
            }
        }
        Ok(())
    }

    pub fn build(&mut self, id: &str) -> Result<(), String> {
        self.can_build(id)?;
        let years = self.programs.get(id).map(|p| p.build_years).unwrap_or(1.0);
        self.queue.push((id.to_string(), self.year + years));
        Ok(())
    }

    pub fn tick(&mut self, dt_years: f64) {
        self.year += dt_years;

        // Complete builds.
        let mut done = Vec::new();
        self.queue.retain(|(id, t)| {
            if self.year >= *t {
                done.push(id.clone());
                false
            } else {
                true
            }
        });
        for id in done {
            self.built.insert(id.clone(), true);
            self.log
                .push(format!("[{:.0}] COMPLETED: {id}", self.year));
            if let Some(p) = self.programs.get(&id) {
                for (el, rate) in &p.elements_drain {
                    let e = self.elements.entry(el.clone()).or_insert(ElementStock {
                        stock_kg: 0.0,
                        annual_drain_kg: 0.0,
                    });
                    e.annual_drain_kg += rate;
                }
            }
        }

        // Industrial growth (the doubling law).
        self.industry_kg *= 2.0f64.powf(dt_years / self.tau_years);

        // Element ledger: drain/supply, famine on exhaustion.
        self.famine_active = false;
        for (name, e) in self.elements.iter_mut() {
            if e.annual_drain_kg > 0.0 {
                e.stock_kg -= e.annual_drain_kg * dt_years;
                if e.stock_kg < 0.0 {
                    e.stock_kg = 0.0;
                    self.famine_active = true;
                    self.log.push(format!(
                        "[{:.0}] FAMINE: {name} exhausted — fleet at half power",
                        self.year
                    ));
                }
            }
        }

        self.roll_event();
    }

    fn roll_event(&mut self) {
        self.rng ^= self.rng << 13;
        self.rng ^= self.rng >> 7;
        self.rng ^= self.rng << 17;
        let roll = (self.rng % 1000) as f64 / 1000.0;
        if roll < 0.15 {
            let pool: Vec<Event> = self.deck.for_era(1).into_iter().cloned().collect();
            if !pool.is_empty() {
                let ev = pool[(self.rng as usize) % pool.len()].clone();
                self.log.push(format!(
                    "[{:.0}] EVENT [{}]: {} — {}. Mitigation: {}",
                    self.year, ev.severity, ev.name, ev.physics, ev.mitigation
                ));
            }
        }
    }
}
