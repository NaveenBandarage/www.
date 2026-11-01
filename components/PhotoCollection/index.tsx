import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import type { GalleryPhoto } from "../../data/gallery";
import { photoGroups, photoTransitionName } from "../../lib/photos";
import PhotoLink from "../PhotoLink";

interface PhotoCollectionProps {
  photos: GalleryPhoto[];
  initialPage?: number;
}
const pageSize = 24;

export default function PhotoCollection({
  photos,
  initialPage = 1,
}: PhotoCollectionProps) {
  const groups = photoGroups(photos);
  const router = useRouter();
  const rawPage = Number(router.query.page ?? initialPage);
  const page =
    Number.isInteger(rawPage) && rawPage > 0
      ? Math.min(rawPage, Math.max(1, Math.ceil(groups.length / pageSize)))
      : 1;
  const visible = groups.slice(0, page * pageSize);
  const sentinel = useRef<HTMLDivElement>(null);
  const loading = useRef(false);
  const hasMore = visible.length < groups.length;
  useEffect(() => {
    const element = sentinel.current;
    if (!hasMore || !element || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || loading.current)
          return;
        loading.current = true;
        void router
          .replace(
            { pathname: "/photos", query: { page: page + 1 } },
            undefined,
            { shallow: true, scroll: false },
          )
          .finally(() => {
            loading.current = false;
          });
      },
      { rootMargin: "200px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasMore, page, router]);

  if (!groups.length)
    return (
      <div className="border-t border-neutral-500/10 py-12 dark:border-neutral-900 sm:py-16">
        <h2 className="text-base text-neutral-800 dark:text-white">
          A few moments, soon.
        </h2>
        <p className="mt-2 text-sm text-neutral-500 dark:text-silver-dark">
          A collection of photographs is on its way.
        </p>
      </div>
    );
  return (
    <>
      <ul className="grid grid-cols-2 gap-x-5 gap-y-8 border-t border-neutral-500/10 pt-8 dark:border-neutral-900 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-10">
        {visible.map((group, index) => {
          const photo = group.photos[0];
          const isStack = group.photos.length > 1;
          return (
            <li key={group.key} className="min-w-0">
              <PhotoLink
                href={group.href}
                className="group flex w-full flex-col rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-500 dark:focus-visible:outline-silver-dark"
                aria-label={`View ${group.title}${isStack ? `, ${group.photos.length} photos` : ""}`}
              >
                <span className="relative flex aspect-[4/5] w-full items-center justify-center rounded-sm bg-neutral-100 p-3 dark:bg-neutral-900 sm:p-4">
                  <span
                    className="photo-thumbnail relative flex h-full w-full items-center justify-center"
                    style={{ viewTransitionName: photoTransitionName(photo) }}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      width={photo.width}
                      height={photo.height}
                      priority={index < 2}
                      sizes="(min-width: 784px) 202px, (min-width: 640px) calc((100vw - 176px) / 3), calc((100vw - 116px) / 2)"
                      className="block max-h-full w-auto max-w-full object-contain"
                    />
                  </span>
                </span>
                <span className="mt-3 block break-words text-sm text-neutral-800 decoration-neutral-300 underline-offset-2 group-hover:underline group-focus-visible:underline dark:text-silver dark:decoration-neutral-700">
                  {group.title}
                </span>
                {isStack ? (
                  <span className="mt-1 block text-xs text-neutral-500 dark:text-silver-dark">
                    {group.photos.length} photos
                  </span>
                ) : null}
              </PhotoLink>
            </li>
          );
        })}
      </ul>
      <div
        ref={sentinel}
        className="pt-8 text-sm tabular-nums text-neutral-500 dark:text-silver-dark"
        aria-live="polite"
      >
        {visible.length} of {groups.length}{" "}
        {groups.some((group) => group.photos.length > 1)
          ? "collections"
          : "photos"}
      </div>
      {hasMore ? (
        <PhotoLink
          href={`/photos?page=${page + 1}`}
          scroll={false}
          className="link mt-4 inline-block text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          More photos
        </PhotoLink>
      ) : null}
    </>
  );
}
