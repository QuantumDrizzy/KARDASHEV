// Regenerates the numbers table in docs/SYNTHESIS.md from findings().
//
// The document quotes numbers in prose, which drifts. This table is the
// machine-checkable contract between the prose and the code, and
// synthesis.test.ts fails the build if it goes stale.
//
//   npm run synthesis           write the table
//   npm run synthesis -- check  exit 1 if it is stale
//
// Deliberately no regex: the marker strings contain characters that need
// escaping in a RegExp, and an escaped-backslash bug in an earlier version made
// this silently match nothing. indexOf has nothing to escape.
import { readFileSync, writeFileSync } from "node:fs";
import { findings } from "../src/lib/findings.ts";

export const DOC = "docs/SYNTHESIS.md";
export const START = "<!-- FINDINGS-TABLE-START -->";
export const END = "<!-- FINDINGS-TABLE-END -->";

/**
 * @param {number} v
 * @returns {string}
 */
export function formatValue(v) {
  if (Math.abs(v) >= 1e5 || (v !== 0 && Math.abs(v) < 1e-3)) return v.toExponential(3);
  return Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(3);
}

export function buildTable() {
  const rows = findings()
    .map((f) => `| \`${f.id}\` | ${formatValue(f.value)} | ${f.unit} | ${f.kind} | \`${f.module}\` |`)
    .join("\n");
  return `${START}\n\n| id | value | unit | kind | module |\n|---|---|---|---|---|\n${rows}\n\n${END}`;
}

/**
 * Returns the document with a freshly generated table spliced in.
 * @param {string} doc
 * @returns {string}
 */
export function renderDoc(doc) {
  const a = doc.indexOf(START);
  const b = doc.indexOf(END);
  if (a < 0 || b < 0 || b < a) throw new Error(`${DOC} is missing the table markers`);
  return doc.slice(0, a) + buildTable() + doc.slice(b + END.length);
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  const doc = readFileSync(DOC, "utf8");
  const next = renderDoc(doc);
  if (process.argv.includes("check")) {
    if (next !== doc) {
      console.error("docs/SYNTHESIS.md is stale. Run: npm run synthesis");
      process.exit(1);
    }
    console.log("docs/SYNTHESIS.md is in sync with findings()");
  } else {
    writeFileSync(DOC, next);
    console.log(`wrote ${findings().length} rows into ${DOC}`);
  }
}
