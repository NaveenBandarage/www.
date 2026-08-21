import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Book } from "../../data/books";

interface BookshelfProps {
  books: Book[];
}

const STACK_TRANSITION = {
  type: "spring",
  stiffness: 240,
  damping: 28,
} as const;

function getPrimaryCoverUrl(isbn: string) {
  return `https://books.google.com/books/content?vid=ISBN${isbn}&printsec=frontcover&img=1&zoom=4&source=gbs_api`;
}

function getFallbackCoverUrl(isbn: string) {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
}

function formatIndex(value: number) {
  return String(value + 1).padStart(2, "0");
}

interface BookCoverProps {
  book: Book;
  sizes: string;
  priority?: boolean;
}

function BookCover({ book, sizes, priority = false }: BookCoverProps) {
  const [src, setSrc] = useState(book.coverSrc ?? getPrimaryCoverUrl(book.isbn));

  useEffect(() => {
    setSrc(book.coverSrc ?? getPrimaryCoverUrl(book.isbn));
  }, [book.coverSrc, book.isbn]);

  return (
    <Image
      src={src}
      alt={`Cover of ${book.title} by ${book.author}`}
      fill
      sizes={sizes}
      priority={priority}
      quality={95}
      className="object-cover"
      onError={() => {
        if (book.coverSrc && src === book.coverSrc) {
          setSrc(getPrimaryCoverUrl(book.isbn));
          return;
        }

        const fallbackSrc = getFallbackCoverUrl(book.isbn);

        if (src !== fallbackSrc) {
          setSrc(fallbackSrc);
        }
      }}
    />
  );
}

export default function Bookshelf({ books }: BookshelfProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeBookId, setActiveBookId] = useState<string | null>(
    books[books.length - 1]?.id ?? null,
  );

  const visibleBooks = books;
  const defaultBookId = visibleBooks[visibleBooks.length - 1]?.id ?? null;
  const activeBookIdOrDefault = activeBookId ?? defaultBookId;
  const activeIndex = visibleBooks.findIndex(
    (book) => book.id === activeBookIdOrDefault,
  );
  const booksReadIn2026 = books.filter(
    (book) => book.readYear === 2026 && book.status === "read",
  ).length;

  useEffect(() => {
    if (!defaultBookId) {
      return;
    }

    const activeIsVisible = visibleBooks.some((book) => book.id === activeBookId);

    if (!activeBookId || !activeIsVisible) {
      setActiveBookId(defaultBookId);
    }
  }, [activeBookId, defaultBookId, visibleBooks]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && defaultBookId) {
        setActiveBookId(defaultBookId);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [defaultBookId]);

  if (visibleBooks.length === 0 || activeIndex === -1) {
    return null;
  }

  const transition = shouldReduceMotion ? { duration: 0 } : STACK_TRANSITION;

  const stackBooks = visibleBooks.map((book, index) => {
    const distance = (index - activeIndex + visibleBooks.length) % visibleBooks.length;

    return {
      book,
      distance,
      isActive: index === activeIndex,
    };
  });

  return (
    <section className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-8 sm:py-10">
      <div className="grid w-full max-w-[56rem] items-center gap-10 lg:grid-cols-[minmax(16rem,24rem)_minmax(18rem,1fr)] lg:gap-16">
        <div className="order-2 mx-auto w-full max-w-[30rem] lg:order-1">
          <div className="mb-6">
            <h2 className="mb-2 font-serif text-[1.9rem] leading-tight text-neutral-800 dark:text-white">
              Bookshelf
            </h2>
            <p className="max-w-[28rem] text-neutral-500 dark:text-silver-dark">
              A bookshelf I vibecoded because I got tired of trying to keep
              Goodreads and Literal in sync. It keeps track of what I&apos;ve
              read in 2026, and I&apos;m aiming for 26 books.
            </p>
            <div className="mt-4">
              <span className="text-sm text-neutral-800 [font-variation-settings:'wght'_500] dark:text-white">
                2026
              </span>
              <p className="mt-1 text-sm text-neutral-500 dark:text-silver-dark">
                {booksReadIn2026} / 26 read
              </p>
            </div>
          </div>

          <div className="space-y-1">
            {visibleBooks.map((book, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => {
                    setActiveBookId(book.id);
                  }}
                  className="flex w-full items-baseline gap-4 py-1.5 text-left"
                >
                  <span className="time w-8 shrink-0 text-xs">
                    {formatIndex(index)}
                  </span>
                  <span
                    className={`leading-snug transition-colors ${
                      isActive
                        ? "text-neutral-800 [font-variation-settings:'wght'_500] dark:text-white"
                        : "text-neutral-500 hover:text-neutral-800 dark:text-silver-dark dark:hover:text-white"
                    }`}
                  >
                    {book.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="order-1 flex items-center justify-center lg:order-2">
          <div
            className="relative h-[18rem] w-[15rem] sm:hidden"
            style={{ perspective: "1400px", perspectiveOrigin: "45% 45%" }}
          >
            {stackBooks.map(({ book, distance, isActive }) => {
              const x = distance * 18;
              const y = 98 - distance * 3;
              const scale = Math.max(0.82, 1 - distance * 0.022);
              const opacity = isActive ? 1 : Math.max(0.76, 1 - distance * 0.03);

              return (
                <motion.button
                  key={book.id}
                  type="button"
                  initial={false}
                  onClick={() => setActiveBookId(book.id)}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          y: y - 4,
                          scale: (isActive ? 1.01 : scale) + 0.01,
                          filter: "grayscale(0) saturate(1.02)",
                        }
                  }
                  animate={{
                    x,
                    y,
                    scale: isActive ? 1.01 : scale,
                    rotateY: isActive ? -1.2 : -2.4,
                    rotateZ: isActive ? -0.35 : -0.85 + distance * 0.04,
                    opacity,
                    filter: isActive
                      ? "grayscale(0) saturate(1)"
                      : `grayscale(${Math.min(0.1, distance * 0.016)}) saturate(${Math.max(0.92, 1 - distance * 0.01)})`,
                  }}
                  transition={transition}
                  className="absolute left-0 top-0 aspect-[3/4] w-[9rem] origin-bottom-left overflow-hidden border border-black/5 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:border-white/8 dark:bg-neutral-950 dark:shadow-[0_20px_45px_rgba(0,0,0,0.35)] dark:focus-visible:ring-white dark:focus-visible:ring-offset-black"
                  style={{
                    transformStyle: "preserve-3d",
                    zIndex: visibleBooks.length - distance,
                  }}
                  aria-pressed={isActive}
                  aria-label={`${book.title} by ${book.author}`}
                >
                  <BookCover
                    book={book}
                    sizes="(max-width: 639px) 144px, 144px"
                    priority={isActive}
                  />
                </motion.button>
              );
            })}
          </div>

          <div
            className="relative hidden h-[24rem] w-[20rem] sm:block lg:h-[28rem] lg:w-[24rem]"
            style={{ perspective: "1800px", perspectiveOrigin: "45% 45%" }}
          >
            {stackBooks.map(({ book, distance, isActive }) => {
              const x = distance * 28;
              const y = 126 - distance * 5;
              const scale = Math.max(0.84, 1 - distance * 0.018);
              const opacity = isActive ? 1 : Math.max(0.78, 1 - distance * 0.028);

              return (
                <motion.button
                  key={book.id}
                  type="button"
                  initial={false}
                  onClick={() => setActiveBookId(book.id)}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          y: y - 6,
                          scale: (isActive ? 1.015 : scale) + 0.01,
                          filter: "grayscale(0) saturate(1.02)",
                        }
                  }
                  animate={{
                    x,
                    y,
                    scale: isActive ? 1.015 : scale,
                    rotateY: isActive ? -1.5 : -2.8,
                    rotateZ: isActive ? -0.45 : -0.9 + distance * 0.05,
                    opacity,
                    filter: isActive
                      ? "grayscale(0) saturate(1)"
                      : `grayscale(${Math.min(0.1, distance * 0.015)}) saturate(${Math.max(0.92, 1 - distance * 0.01)})`,
                  }}
                  transition={transition}
                  className="absolute left-0 top-0 aspect-[3/4] w-[12.5rem] origin-bottom-left overflow-hidden border border-black/5 bg-white shadow-[0_24px_55px_rgba(15,23,42,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:border-white/8 dark:bg-neutral-950 dark:shadow-[0_32px_80px_rgba(0,0,0,0.45)] dark:focus-visible:ring-white dark:focus-visible:ring-offset-black lg:w-[15rem]"
                  style={{
                    transformStyle: "preserve-3d",
                    zIndex: visibleBooks.length - distance,
                  }}
                  aria-pressed={isActive}
                  aria-label={`${book.title} by ${book.author}`}
                >
                  <BookCover
                    book={book}
                    sizes="(max-width: 1023px) 200px, 240px"
                    priority={isActive}
                  />
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
