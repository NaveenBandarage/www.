import Image from "next/image";
import type { GalleryPhoto } from "../../data/gallery";
import { photoGroups, photoTransitionName } from "../../lib/photos";
import PhotoLink from "../PhotoLink";

interface PhotoCollectionProps {
  photos: GalleryPhoto[];
}

export default function PhotoCollection({ photos }: PhotoCollectionProps) {
  const groups = photoGroups(photos);

  if (!groups.length) {
    return (
      <div className="py-12 text-sm text-neutral-500 dark:text-silver-dark">
        A collection of photographs is on its way.
      </div>
    );
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-16">
        {groups.map((group, index) => {
          const photo = group.photos[0];
          const isStack = group.photos.length > 1;
          return (
            <li key={group.key} className="min-w-0">
              <PhotoLink
                href={group.href}
                className="group flex flex-col items-center rounded-sm text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-500 dark:focus-visible:outline-silver-dark"
                aria-label={`View ${group.title}${isStack ? `, ${group.photos.length} photos` : ""}`}
              >
                <span className="relative flex h-40 w-full items-center justify-center sm:h-48">
                  <span className="relative inline-flex max-h-full max-w-full">
                    {isStack && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 rotate-6 rounded-[2px] bg-white shadow-md dark:bg-neutral-300"
                      />
                    )}
                    {isStack && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 -rotate-3 rounded-[2px] bg-white shadow-md dark:bg-neutral-200"
                      />
                    )}
                    <span
                      className="photo-thumbnail relative inline-flex max-h-40 max-w-full rotate-[-1deg] rounded-[2px] bg-white p-1 shadow-[0_2px_8px_rgba(0,0,0,0.18)] transition-transform duration-200 group-hover:rotate-0 group-hover:-translate-y-1 motion-reduce:transition-none sm:max-h-48"
                      style={{ viewTransitionName: photoTransitionName(photo) }}
                    >
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        width={photo.width}
                        height={photo.height}
                        priority={index < 3}
                        sizes="(min-width: 640px) 160px, 120px"
                        className="block h-auto max-h-[152px] w-auto max-w-[120px] object-contain sm:max-h-[184px] sm:max-w-[160px]"
                      />
                    </span>
                  </span>
                </span>
                <span className="mt-4 block break-words text-sm text-neutral-800 decoration-neutral-300 underline-offset-2 group-hover:underline group-focus-visible:underline dark:text-silver dark:decoration-neutral-700">
                  {group.title}
                </span>
                {isStack && (
                  <span className="mt-1 block text-xs text-neutral-500 dark:text-silver-dark">
                    {group.photos.length} photos
                  </span>
                )}
              </PhotoLink>
            </li>
          );
        })}
      </ul>
    </>
  );
}
