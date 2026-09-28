import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { SiteFooter } from "@/components/site-footer";

const NAV = [
  { to: "/energia", label: "Energy" },
  { to: "/ia", label: "AI" },
  { to: "/biologia", label: "Biology" },
  { to: "/salud", label: "Health" },
  { to: "/space", label: "Space" },
  { to: "/quantum", label: "Quantum" },
] as const;

export function Shell({
  children,
  bleed = false,
}: {
  children: React.ReactNode;
  bleed?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header
        className={cn(
          "z-30",
          bleed
            ? "pointer-events-none fixed inset-x-0 top-0"
            : "sticky top-0 border-b border-border bg-bg/90 backdrop-blur-sm",
        )}
      >
        <div className="pointer-events-auto mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="font-sans text-xl tracking-[0.22em] text-fg sm:text-2xl">
            KARDASHEV
          </Link>
          <nav className="flex min-w-0 flex-1 justify-end overflow-x-auto">
            {NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "shrink-0 px-3 py-2 font-mono text-xs tracking-wide uppercase transition-colors duration-150",
                    active ? "text-fg" : "text-subtle hover:text-fg",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      {bleed ? children : <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">{children}</main>}
      {!bleed ? <SiteFooter /> : null}
    </div>
  );
}
