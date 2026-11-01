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
      className="relative overflow-hidden rounded-sm"
      style={{ viewTransitionName: photoTransitionName(photo) }}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        priority={index === 0}
        sizes="(min-width: 784px) 736px, calc(100vw - 48px)"
        className="block h-auto w-full"
      />
    </div>
  );
  return (
    <article className="flex flex-col gap-6 sm:gap-8">
      <div className="w-full min-w-0">
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
      <div className="w-full">
        <PaperCard photo={photo} index={index} />
      </div>
    </article>
  );
}
