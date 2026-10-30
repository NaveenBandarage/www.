import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import type { GalleryPhoto } from "../../data/gallery";
import { photoGroups, photoTransitionName } from "../../lib/photos";
import PhotoLink from "../PhotoLink";

interface PhotoCollectionProps {
  photos: GalleryPhoto[];
  initialPage?: number;
}
const angles = [-1.5, 0.7, -0.6, 1.2, -0.9, 0.4];
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
      <div className="py-14">
        <p className="text-sm text-neutral-500 dark:text-silver-dark">
          Photographs coming soon.
        </p>
      </div>
    );
  return (
    <>
      <ul className="grid grid-cols-2 items-center gap-x-8 gap-y-12 py-12 sm:grid-cols-3 sm:gap-y-16 lg:grid-cols-4">
        {visible.map((group, index) => {
          const photo = group.photos[0];
          const isStack = group.photos.length > 1;
          return (
            <li key={group.key} className="text-center">
              <PhotoLink
                href={group.href}
                className="group inline-flex w-full flex-col items-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8"
                aria-label={`View ${group.title}${isStack ? `, ${group.photos.length} photos` : ""}`}
              >
                <span className="relative flex h-44 w-full items-center justify-center sm:h-48">
                  <span
                    className={`photo-thumbnail photo-print relative block w-fit max-w-[160px] p-1.5 ${isStack ? "photo-stack" : ""}`}
                    style={
                      {
                        "--print-angle": `${angles[index % angles.length]}deg`,
                        viewTransitionName: photoTransitionName(photo),
                      } as CSSProperties
                    }
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      width={photo.width}
                      height={photo.height}
                      sizes="160px"
                      className="relative z-10 max-h-40 w-auto max-w-full object-contain sm:max-h-44"
                    />
                  </span>
                </span>
                <span className="mt-4 block text-sm">{group.title}</span>
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
        className="py-8 text-center text-xs text-neutral-500 dark:text-silver-dark"
        aria-live="polite"
      >
        {visible.length} of {groups.length}
      </div>
      {hasMore ? (
        <PhotoLink
          href={`/photos?page=${page + 1}`}
          scroll={false}
          className="link-fade mx-auto block w-fit text-sm"
        >
          More photos
        </PhotoLink>
      ) : null}
    </>
  );
}
