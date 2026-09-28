import { useEffect, useState } from "react";
import { GAP_I, P_I, kOf, powerAt, tw, yearsTo } from "@/lib/kardashev";
import { LAMBDA, yearsAccelerating } from "@/lib/forecast";
import { wattsPerSecond } from "@/lib/facts";

export function usePower() {
  const [p, setP] = useState(() => powerAt());

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const iv = window.setInterval(() => setP(powerAt()), reduce ? 1000 : 250);
    return () => window.clearInterval(iv);
  }, []);

  const short = Math.max(0, P_I - p);
  return {
    p,
    k: kOf(p),
    short,
    twNow: tw(p),
    twShort: tw(short),
    gap: p > 0 ? P_I / p : GAP_I,
    yearsI: yearsTo(P_I, p),
    yearsAccel: yearsAccelerating(p, P_I, LAMBDA),
    lambda: LAMBDA,
    wps: wattsPerSecond(p),
  };
}
