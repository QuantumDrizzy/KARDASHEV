// Embed the IGNIOS core (the ecosystem's one engine) into KARDASHEV (Unibit-Web ADR-0003 step 4b).
// Source of truth: IGNIOS's own generated module (cargo xtask site), copied as-is, so KARDASHEV runs
// the same bytes the IGNIOS site runs and the chain's ledger was checked against.
//   node --experimental-strip-types scripts/embed-ignis.ts [path-to-NXS]
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ignios = process.argv[2] ?? join(import.meta.dirname, "..", "..", "..", "PR0JECTS", "RESEARCH", "NXS");
const src = readFileSync(join(ignios, "site", "src", "ignis", "core", "wasm.gen.ts"), "utf8");
if (!src.includes("IGNIS_CORE_WASM_BASE64")) throw new Error("not an IGNIOS core module: " + ignios);
writeFileSync(
  new URL("../src/lib/ignis-core.gen.ts", import.meta.url),
  "// COPIED by scripts/embed-ignis.ts from IGNIOS site/src/ignis/core/wasm.gen.ts. Do not edit.\n" + src,
);
console.log("embedded the IGNIOS core:", src.match(/IGNIS_CORE_COMMIT = "([^"]+)"/)?.[1]);
