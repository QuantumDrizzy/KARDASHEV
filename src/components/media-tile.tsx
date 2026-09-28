export function MediaTile({
  src,
  poster,
  label,
  className = "",
}: {
  src: string;
  poster?: string;
  label: string;
  className?: string;
}) {
  const isVideo = src.endsWith(".mp4");
  return (
    <figure className={`relative overflow-hidden bg-surface ${className}`}>
      {isVideo ? (
        <video
          className="h-full w-full object-cover"
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : (
        <img src={src} alt={label} className="h-full w-full object-cover" />
      )}
      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg to-transparent px-4 py-4 font-mono text-xs tracking-wide text-fg">
        {label}
      </figcaption>
    </figure>
  );
}
