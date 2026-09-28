const VEIL = {
  default: "absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-bg/15",
  sun: "absolute inset-0 bg-gradient-to-t from-bg via-bg/35 to-transparent",
  night: "absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-bg/25",
} as const;

export function Stage({
  src,
  poster,
  children,
  className = "",
  veil = "default",
  hint = false,
}: {
  src: string;
  poster?: string;
  children: React.ReactNode;
  className?: string;
  veil?: keyof typeof VEIL;
  hint?: boolean;
}) {
  const video = src.endsWith(".mp4");
  return (
    <section className={`relative flex min-h-dvh flex-col justify-end overflow-hidden ${className}`}>
      {video ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : (
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div className={VEIL[veil]} />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-20 sm:px-10">{children}</div>
      {hint ? (
        <p className="k-hint pointer-events-none absolute bottom-5 left-1/2 z-10 -translate-x-1/2 font-mono text-[10px] tracking-[0.45em] text-subtle uppercase">
          scroll
        </p>
      ) : null}
    </section>
  );
}

export function DataStrip({
  items,
  className = "",
}: {
  items: { k: string; v: string }[];
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-2 border-y border-border bg-bg sm:grid-cols-4 ${className}`}>
      {items.map((it) => (
        <div key={it.k} className="border-border px-4 py-5 sm:border-r sm:px-6 sm:last:border-r-0">
          <p className="font-mono text-xs tracking-widest text-subtle uppercase">{it.k}</p>
          <p className="mt-1 font-sans text-2xl tabular-nums sm:text-3xl">{it.v}</p>
        </div>
      ))}
    </div>
  );
}
