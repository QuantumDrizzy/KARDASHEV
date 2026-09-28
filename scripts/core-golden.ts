// Golden outputs of the TypeScript M1 (src/lib/kardashev.ts) for kardashev-core's gate
// (Unibit-Web ADR-0003). Values are written as exact bit patterns, not decimals.
import { writeFileSync } from "node:fs";
import { GAP_I, GAP_II, K_NOW, L_SUN, P_2023, P_I, P_III, kOf, yearsTo, GROWTH, SECONDS_PER_YEAR } from "../src/lib/kardashev.ts";

const bits = (x: number) => {
  const b = new DataView(new ArrayBuffer(8));
  b.setFloat64(0, x);
  return b.getBigUint64(0).toString(16).padStart(16, "0");
};
const cases: { name: string; value: string }[] = [];
const add = (name: string, v: number) => cases.push({ name, value: bits(v) });
add("SECONDS_PER_YEAR", SECONDS_PER_YEAR);
add("P_2023", P_2023);
add("K_NOW", K_NOW);
add("GAP_I", GAP_I);
add("GAP_II", GAP_II);
add("GROWTH", GROWTH);
for (const p of [1, 1e6, 4e12, P_2023, 1e13, 1e16, L_SUN, 1e26, P_III, 1e37, 123456789.5]) add(`kOf(${p})`, kOf(p));
for (const t of [P_I, L_SUN, P_III]) add(`yearsTo(${t},P_2023)`, yearsTo(t, P_2023));
writeFileSync(new URL("../core/tests/golden_ts.json", import.meta.url), JSON.stringify(cases, null, 1));
console.log(`golden: ${cases.length} values from kardashev.ts`);
