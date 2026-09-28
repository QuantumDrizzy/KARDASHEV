import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const INSTRUMENT = [
  { to: "/", label: "Scale" },
  { to: "/roadmap", label: "Roadmap" },
  { to: "/plan", label: "Plan" },
] as const;

const LAYERS = [
  { to: "/energia", label: "Energy" },
  { to: "/ia", label: "AI" },
  { to: "/biologia", label: "Biology" },
  { to: "/salud", label: "Health" },
  { to: "/space", label: "Space" },
  { to: "/quantum", label: "Quantum" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <Link to="/" className="font-sans text-xl tracking-[0.22em] text-fg sm:text-2xl">
          KARDASHEV
        </Link>
        <p className="mt-3 max-w-lg text-sm text-muted">
          An instrument that measures civilization in watts. Not a startup. Not a course. Models, not meters.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          <FooterCol title="Instrument">
            {INSTRUMENT.map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-warn">
                {l.label}
              </Link>
            ))}
          </FooterCol>
          <FooterCol title="Layers">
            {LAYERS.map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-warn">
                {l.label}
              </Link>
            ))}
          </FooterCol>
          <FooterCol title="Industry">
            <Link to="/sector" className="hover:text-warn">
              Sector
            </Link>
            <span className="text-subtle">No partners. No deal.</span>
          </FooterCol>
          <FooterCol title="About">
            <Link to="/about" className="hover:text-warn">
              About us
            </Link>
            <a href="/about#method" className="hover:text-warn">
              Method
            </a>
            <a href="/about#sources" className="hover:text-warn">
              Sources
            </a>
          </FooterCol>
          <FooterCol title="Contact">
            <a href="https://x.com/QuantumDrizzy" className="hover:text-warn">
              X · QuantumDrizzy
            </a>
            <a href="https://github.com/QuantumDrizzy" className="hover:text-warn">
              GitHub
            </a>
          </FooterCol>
        </div>
        <p className="mt-10 font-mono text-[11px] tracking-wide text-subtle">local — Unibit / KARDASHEV / IGNIS</p>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 font-mono text-[11px] tracking-wide text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>Not affiliated with SpaceX, xAI, Tesla, Google, NVIDIA.</p>
          <p>© 2026 KARDASHEV</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.22em] text-subtle uppercase">{title}</p>
      <div className="mt-3 flex flex-col gap-1.5 text-sm">{children}</div>
    </div>
  );
}
