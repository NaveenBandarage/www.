import { AnimatePresence, m } from "framer-motion";
import useReducedMotion from "../../lib/useReducedMotion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryPhoto } from "../../data/gallery";

interface GalleryProps {
  photos: GalleryPhoto[];
}

const placeholderRatios = [
  [4, 5],
  [1, 1],
  [3, 2],
  [2, 3],
  [5, 4],
  [4, 3],
] as const;

const placeholderTones = [
  "bg-neutral-200 dark:bg-neutral-900",
  "bg-stone-300 dark:bg-stone-800",
  "bg-zinc-200 dark:bg-zinc-900",
  "bg-neutral-300 dark:bg-neutral-800",
  "bg-stone-200 dark:bg-stone-900",
  "bg-zinc-300 dark:bg-zinc-800",
] as const;

const placeholderPhotos: GalleryPhoto[] = Array.from(
  { length: 24 },
  (_, index) => {
    const [width, height] = placeholderRatios[index % placeholderRatios.length];

    return {
      src: "",
      alt: `Empty gallery slot ${index + 1}`,
      width,
      height,
    };
  },
);

function EmptyPhoto({ photo, index }: { photo: GalleryPhoto; index: number }) {
  const labelSize = Math.max(0.16 * Math.min(photo.width, photo.height), 0.24);

  return (
    <svg
      aria-hidden="true"
      className="h-full w-full text-neutral-200 dark:text-neutral-900"
      preserveAspectRatio="xMidYMid meet"
      viewBox={`0 0 ${photo.width} ${photo.height}`}
    >
      <rect width={photo.width} height={photo.height} fill="currentColor" />
      <g className="text-neutral-400 dark:text-neutral-700">
        <text
          x={photo.width / 2}
          y={photo.height / 2}
          dominantBaseline="middle"
          fill="currentColor"
          fontFamily="var(--sans-font)"
          fontSize={labelSize}
          textAnchor="middle"
        >
          {String(index + 1).padStart(2, "0")}
        </text>
      </g>
    </svg>
  );
}

function GallerySwitcher() {
  return (
    <details className="group absolute top-4 right-4 z-30">
      <summary className="flex size-6 cursor-pointer list-none items-center justify-center rounded-md outline-none transition-colors hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-neutral-400 dark:hover:bg-neutral-900 [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className="size-2.5 rounded-[2px] bg-amber-300 shadow-[0_0_0_1px_rgba(0,0,0,0.03)]"
        />
        <span className="sr-only">Open site navigation</span>
      </summary>

      <nav
        aria-label="Gallery navigation"
        className="absolute top-7 right-0 w-32 rounded-lg border border-neutral-200 bg-white p-1 shadow-fancy dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-dark"
      >
        <Link
          href="/"
          className="flex items-center justify-between rounded-md px-2 py-1 text-sm hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:hover:bg-neutral-900"
        >
          Home
          <span
            aria-hidden="true"
            className="size-2.5 rounded-[2px] bg-indigo-500"
          />
        </Link>
        <Link
          href="/blog"
          className="flex items-center justify-between rounded-md px-2 py-1 text-sm hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:hover:bg-neutral-900"
        >
          Blog
          <span
            aria-hidden="true"
            className="size-2.5 rounded-[2px] bg-rose-500"
          />
        </Link>
        <span
          aria-current="page"
          className="flex items-center justify-between rounded-md bg-neutral-100 px-2 py-1 text-sm dark:bg-neutral-900"
        >
          Gallery
          <span
            aria-hidden="true"
            className="size-2.5 rounded-[2px] bg-amber-300"
          />
        </span>
      </nav>
    </details>
  );
}

export default function Gallery({ photos }: GalleryProps) {
  const entries = photos.length > 0 ? photos : placeholderPhotos;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const ignoreClickRef = useRef(false);
  const pointerStartRef = useRef<number | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const total = entries.length;
  const activePhoto = entries[activeIndex];
  const isEmpty = photos.length === 0;

  const showNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % total);
  }, [total]);

  const showPrevious = useCallback(() => {
    setActiveIndex((current) => (current - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (isPaused || shouldReduceMotion || total < 2) return;

    const timeout = window.setTimeout(showNext, 2800);
    return () => window.clearTimeout(timeout);
  }, [activeIndex, isPaused, shouldReduceMotion, showNext, total]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showNext, showPrevious]);

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerStartRef.current = event.clientX;
    ignoreClickRef.current = false;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (pointerStartRef.current === null) return;

    const distance = event.clientX - pointerStartRef.current;
    pointerStartRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (Math.abs(distance) < 48) return;

    ignoreClickRef.current = true;
    if (distance > 0) showPrevious();
    else showNext();
  };

  return (
    <section className="relative flex h-dvh min-h-[360px] flex-col overflow-hidden bg-gray-50 text-neutral-800 dark:bg-black dark:text-silver">
      <Link
        href="/"
        className="absolute top-4 left-4 z-30 text-sm text-neutral-500 transition-colors hover:text-neutral-800 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:text-silver-dark dark:hover:text-white"
      >
        Back
      </Link>
      <GallerySwitcher />

      <button
        type="button"
        aria-describedby={isEmpty ? "gallery-empty-instructions" : undefined}
        aria-label={
          isEmpty
            ? `Empty gallery slot ${activeIndex + 1} of ${total}. Show next slot.`
            : `Photo ${activeIndex + 1} of ${total}. Show next photo.`
        }
        className="relative grid min-h-0 flex-1 cursor-pointer touch-pan-y place-items-center border-0 bg-transparent p-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-400 sm:p-8"
        onBlur={() => setIsPaused(false)}
        onClick={() => {
          if (ignoreClickRef.current) {
            ignoreClickRef.current = false;
            return;
          }
          showNext();
        }}
        onFocus={() => setIsPaused(true)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onPointerDown={handlePointerDown}
        onPointerCancel={() => {
          pointerStartRef.current = null;
        }}
        onPointerUp={handlePointerUp}
      >
        <span className="sr-only" aria-live="polite">
          {isEmpty ? "Empty gallery slot" : "Photo"} {activeIndex + 1} of{" "}
          {total}
        </span>

        {isEmpty ? (
          <p id="gallery-empty-instructions" className="sr-only">
            Add image files to public/gallery, then list them in
            data/gallery.ts.
          </p>
        ) : null}

        <AnimatePresence initial={false}>
          <m.div
            key={activeIndex}
            className="absolute inset-4 sm:inset-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.45 }}
          >
            {activePhoto.src ? (
              <Image
                priority
                fill
                src={activePhoto.src}
                alt={activePhoto.alt}
                className="object-contain"
                sizes="(min-width: 640px) calc(100vw - 64px), calc(100vw - 32px)"
              />
            ) : (
              <EmptyPhoto photo={activePhoto} index={activeIndex} />
            )}
          </m.div>
        </AnimatePresence>
      </button>

      <div
        role="group"
        aria-label={isEmpty ? "Empty gallery slots" : "All photos"}
        className="flex h-10 shrink-0"
      >
        {entries.map((photo, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={`${photo.src || "empty"}-${index}`}
              type="button"
              aria-label={
                isEmpty
                  ? `Show empty gallery slot ${index + 1} of ${total}`
                  : `Show photo ${index + 1} of ${total}: ${photo.alt}`
              }
              aria-pressed={isActive}
              className={`relative min-w-0 flex-1 cursor-pointer overflow-hidden border-0 p-0 outline-none transition-opacity focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white ${
                isActive ? "opacity-100" : "opacity-55 hover:opacity-80"
              }`}
              onClick={() => setActiveIndex(index)}
            >
              {photo.src ? (
                <Image
                  fill
                  src={photo.src}
                  alt=""
                  className="object-cover"
                  sizes="10vw"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className={`absolute inset-0 ${placeholderTones[index % placeholderTones.length]}`}
                />
              )}
              {isActive ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px bg-neutral-700/70 dark:bg-white/80"
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
