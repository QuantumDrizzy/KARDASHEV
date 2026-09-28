/**
 * Unibit chain head (Unibit-Web ADR-0002): the same line on every current
 * Unibit, KARDASHEV and IGNIOS page. `src/chain/ledger.gen.json` is written by
 * `unibit-chain export`, which refuses to export a chain that does not verify.
 */
import ledger from "@/chain/ledger.gen.json";

type Head = { seq: number; hash: string } | null;

export function ChainHead() {
  const head = (ledger as unknown as { head: Head }).head;
  if (!head) return <span title="The chain has no blocks yet.">chain: empty</span>;
  return (
    <span className="cursor-help" title={`Unibit chain head ${head.hash} (seq ${head.seq})`}>
      chain {head.hash.slice(0, 12)} · #{head.seq}
    </span>
  );
}
