// Prints every headline number as JSON, computed live from the physics modules.
// Consumers (Cursor, Grok, decks, figures) must read this, never a doc.
//   npm run findings           full JSON
//   npm run findings -- table  human-readable
import { findingsExport } from "../src/lib/findings.ts";

const out = findingsExport();
if (process.argv.includes("table")) {
  console.log(`${out.counts.total} findings: ${out.counts.derived} derived, ${out.counts.measured} measured, ${out.counts.published} published, ${out.counts.assumed} assumed\n`);
  const w = (s, n) => String(s).padEnd(n).slice(0, n);
  for (const f of out.findings) {
    const v = Math.abs(f.value) >= 1e5 || (f.value !== 0 && Math.abs(f.value) < 1e-3)
      ? f.value.toExponential(3) : f.value.toFixed(3);
    console.log(`${w(f.id, 26)} ${w(f.kind, 10)} ${String(v).padStart(11)} ${w(f.unit, 14)} ${f.module}`);
  }
} else {
  console.log(JSON.stringify(out, null, 2));
}
