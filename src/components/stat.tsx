import { cn } from "@/lib/utils";

export function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "ok" | "warn" | "danger";
}) {
  return (
    <div className="border border-border bg-surface p-4">
      <div className="font-mono text-xs tracking-wide text-subtle uppercase">{label}</div>
      <div
        className={cn(
          "mt-2 font-mono text-xl tabular-nums sm:text-2xl",
          tone === "ok" && "text-ok",
          tone === "warn" && "text-warn",
          tone === "danger" && "text-danger",
        )}
      >
        {value}
      </div>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
