import type { CSSProperties } from "react";
import type { GalleryPhoto } from "../../data/gallery";

interface PaperCardProps {
  photo: GalleryPhoto;
  index: number;
}

export default function PaperCard({ photo, index }: PaperCardProps) {
  const paperSeed = Array.from(photo.slug || photo.src).reduce(
    (seed, char) => seed + char.charCodeAt(0),
    index,
  );
  return (
    <aside
      className="photo-paper relative w-full px-7 py-8 font-mono text-sm text-neutral-700"
      style={
        {
          "--paper-angle": `${[-1.2, 0.7, -0.4, 1.1][paperSeed % 4]}deg`,
        } as CSSProperties
      }
      aria-label={`Photo details: ${photo.title || photo.alt}`}
    >
      <h2 className="mb-6 border-b border-dashed border-neutral-400 pb-3">
        {photo.title || photo.alt}
      </h2>
      <dl className="space-y-1">
        {[
          ["Location", photo.location],
          ["Camera", photo.camera],
          ["Exposure", photo.exposure],
          ["ISO", photo.iso],
          ["Coordinates", photo.coordinates],
        ].map(([label, value]) =>
          value ? (
            <div key={label}>
              <dt className="sr-only">{label}</dt>
              <dd>{value}</dd>
            </div>
          ) : null,
        )}
      </dl>
      {photo.date ? (
        <p className="mt-6">
          <time dateTime={photo.date}>
            {/^\d{4}-\d{2}-\d{2}$/.test(photo.date) &&
            !Number.isNaN(Date.parse(photo.date))
              ? new Intl.DateTimeFormat("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  timeZone: "UTC",
                }).format(new Date(`${photo.date}T12:00:00Z`))
              : photo.date}
          </time>
        </p>
      ) : null}
      {photo.palette?.length ? (
        <div className="mt-6 flex gap-1.5" aria-label="Photo color palette">
          {photo.palette
            .filter((color) => /^#[\da-f]{6}$/i.test(color))
            .map((color, i) => (
              <span
                key={`${color}-${i}`}
                role="img"
                aria-label={color}
                className="paper-swatch h-6 w-6"
                style={{ backgroundColor: color }}
              />
            ))}
        </div>
      ) : null}
      <p className="mt-8 text-[10px] uppercase tracking-widest text-neutral-500">
        Naveen Bandarage · {String(index + 1).padStart(2, "0")}
      </p>
    </aside>
  );
}
