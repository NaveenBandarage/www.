import type { GalleryPhoto } from "../../data/gallery";

interface PaperCardProps {
  photo: GalleryPhoto;
  index: number;
}

export default function PaperCard({ photo, index }: PaperCardProps) {
  return (
    <aside
      className="w-full text-sm text-neutral-800 dark:text-silver"
      aria-label={`Photo details: ${photo.title || photo.alt}`}
    >
      <h2 className="mb-5 text-base [font-variation-settings:'wght'_500] dark:text-white">
        {photo.title || photo.alt}
      </h2>
      <dl className="space-y-3">
        {[
          ["Location", photo.location],
          ["Camera", photo.camera],
          ["Exposure", photo.exposure],
          ["ISO", photo.iso],
          ["Coordinates", photo.coordinates],
        ].map(([label, value]) =>
          value ? (
            <div
              key={label}
              className="grid grid-cols-[6rem_minmax(0,1fr)] gap-3"
            >
              <dt className="text-neutral-500 dark:text-silver-dark">
                {label}
              </dt>
              <dd className="break-words">{value}</dd>
            </div>
          ) : null,
        )}
      </dl>
      {photo.date ? (
        <p className="mt-6 text-neutral-500 dark:text-silver-dark">
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
                className="h-5 w-5 rounded-sm ring-1 ring-inset ring-black/10 dark:ring-white/10"
                style={{ backgroundColor: color }}
              />
            ))}
        </div>
      ) : null}
      <p className="mt-6 border-t border-neutral-500/10 pt-4 text-xs tabular-nums text-neutral-500 dark:border-neutral-900 dark:text-silver-dark">
        Naveen Bandarage · {String(index + 1).padStart(2, "0")}
      </p>
    </aside>
  );
}
