import Image from "next/image";
import type { GalleryPhoto } from "../../data/gallery";
import { photoSlug, photoTransitionName } from "../../lib/photos";
import PaperCard from "../PaperCard";
import PhotoLink from "../PhotoLink";

export default function PhotoDetail({
  photo,
  index,
  linked = false,
}: {
  photo: GalleryPhoto;
  index: number;
  linked?: boolean;
}) {
  const print = (
    <div
      className="photo-print relative p-2 sm:p-3"
      style={{ viewTransitionName: photoTransitionName(photo) }}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        priority={index === 0}
        sizes="(min-width: 1024px) 600px, (min-width: 768px) 60vw, 90vw"
        className="block h-auto w-full"
      />
    </div>
  );
  return (
    <article className="photo-detail flex flex-col items-center gap-7 md:flex-row md:items-start md:gap-0">
      <div className="relative z-10 w-full min-w-0 md:w-[62%]">
        {linked ? (
          <PhotoLink
            href={`/photo/${photoSlug(photo)}`}
            aria-label={`View ${photo.title || photo.alt}`}
            className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {print}
          </PhotoLink>
        ) : (
          print
        )}
      </div>
      <div className="w-full max-w-sm md:mt-10 md:-ml-1 md:w-[38%]">
        <PaperCard photo={photo} index={index} />
      </div>
    </article>
  );
}
