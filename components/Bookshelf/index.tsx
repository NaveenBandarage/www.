import Image from "next/image";
import { m, useAnimationControls } from "framer-motion";
import useReducedMotion from "../../lib/useReducedMotion";
import { useState } from "react";
import type { Book } from "../../data/books";

interface BookshelfProps {
  books: Book[];
}

const READING_YEAR = 2026;
const READING_GOAL = 26;

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
  const [src, setSrc] = useState(
    book.coverSrc ?? getPrimaryCoverUrl(book.isbn),
  );

  return (
    <Image
      src={src}
      alt={`Cover of ${book.title} by ${book.author}`}
      fill
      sizes={sizes}
      priority={priority}
      quality={85}
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

interface FinishedBookStackProps {
  books: Book[];
  onSelect: (id: string) => void;
}

function FinishedBookStack({ books, onSelect }: FinishedBookStackProps) {
  const controls = useAnimationControls();
  const shouldReduceMotion = useReducedMotion();
  const stackBooks = books.slice(-7);

  if (!stackBooks.length) return null;

  return (
    <button
      type="button"
      aria-label={`Preview the most recently finished book and fan out ${stackBooks.length} book covers`}
      title="Give the finished books a shuffle"
      onClick={() => {
        onSelect(stackBooks[stackBooks.length - 1].id);
        void controls.start(shouldReduceMotion ? "rest" : "burst");
      }}
      className="absolute right-0 bottom-0 h-full w-[55%] max-w-[22rem] overflow-hidden rounded-t-sm focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-neutral-500 dark:focus-visible:outline-silver-dark"
    >
      <span aria-hidden="true" className="absolute inset-0">
        {stackBooks.map((book, index) => {
          const position =
            stackBooks.length === 1 ? 0 : index / (stackBooks.length - 1) - 0.5;
          const rotation = [-7, 4, -3, 6, -5, 3, -2][index];
          const restingY = index % 2 === 0 ? 28 : 23;
          const liftedY = -14 - (1 - Math.abs(position) * 2) * 12;

          return (
            <m.span
              key={book.id}
              initial="rest"
              animate={controls}
              variants={{
                rest: { x: 0, y: restingY, rotate: rotation },
                burst: {
                  x: [0, position * 28, position * 28, 0],
                  y: [restingY, liftedY, liftedY, restingY],
                  rotate: [rotation, position * 28, position * 28, rotation],
                  transition: {
                    duration: 0.7,
                    times: [0, 0.32, 0.5, 1],
                    ease: [0.22, 1, 0.36, 1],
                  },
                },
              }}
              className="absolute bottom-0 block aspect-[2/3] w-11 origin-bottom overflow-hidden border-2 border-white bg-neutral-100 shadow-[0_2px_8px_#00000020] dark:border-neutral-700 dark:bg-neutral-900 sm:w-16"
              style={{
                left: `${20 + (position + 0.5) * 56}%`,
                marginLeft: "-1.375rem",
                zIndex: index + 1,
              }}
            >
              <BookCover book={book} sizes="(max-width: 639px) 44px, 64px" />
            </m.span>
          );
        })}
      </span>
    </button>
  );
}

export default function Bookshelf({ books }: BookshelfProps) {
  const shouldReduceMotion = useReducedMotion();
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const selectedBook =
    books.find((book) => book.id === selectedBookId) ?? books[books.length - 1];
  const booksRead = books.filter(
    (book) => book.readYear === READING_YEAR && book.status === "read",
  ).length;
  const finishedBooks = books.filter((book) => book.status === "read");

  return (
    <>
      <header className="relative flex h-28 items-end sm:h-32">
        <h1 className="pb-6 text-xl text-neutral-800 [font-variation-settings:'opsz'_32,_'wght'_500] dark:text-white">
          Bookshelf
        </h1>
        <FinishedBookStack books={finishedBooks} onSelect={setSelectedBookId} />
      </header>

      <section className="list-container" aria-labelledby="bookshelf-about">
        <h2
          id="bookshelf-about"
          className="list-title text-neutral-500 dark:text-silver-dark"
        >
          On the shelf
        </h2>
        <div className="list-content">
          <p>
            A little home for what I&apos;ve been reading. I built this because
            I got tired of keeping Goodreads and Literal in sync.
          </p>
        </div>
      </section>

      <section className="list-container" aria-labelledby="reading-year">
        <div className="list-title flex items-start justify-between gap-6 pb-5 sm:block sm:pb-0">
          <div className="min-w-0 flex-1">
            <h2
              id="reading-year"
              className="text-neutral-500 dark:text-silver-dark"
            >
              {READING_YEAR} reading
            </h2>
            <p className="mt-3 text-sm text-neutral-500 dark:text-silver-dark">
              <span className="text-neutral-800 tabular-nums dark:text-white">
                {booksRead}
              </span>{" "}
              of {READING_GOAL} books
            </p>
            <progress
              value={booksRead}
              max={READING_GOAL}
              aria-label={`${READING_YEAR} reading goal`}
              className="mt-3 block h-1 w-full max-w-[8rem] overflow-hidden rounded-full bg-neutral-200 accent-neutral-500 dark:bg-neutral-900 dark:accent-silver-dark [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-neutral-500 dark:[&::-moz-progress-bar]:bg-silver-dark [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-neutral-500 dark:[&::-webkit-progress-value]:bg-silver-dark"
            />
            <p className="mt-3 text-sm text-neutral-500 dark:text-silver-dark">
              Aiming for {READING_GOAL} this year.
            </p>
          </div>

          {selectedBook ? (
            <figure
              id="selected-book-cover"
              className="w-24 shrink-0 sm:mt-8 sm:w-36"
            >
              <m.div
                key={selectedBook.id}
                initial={false}
                animate={{ y: 0 }}
                whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                className="relative aspect-[2/3] overflow-hidden rounded-r-sm bg-neutral-100 shadow-[0_2px_4px_#00000012,0_8px_20px_#0000000a] ring-1 ring-inset ring-black/5 dark:bg-neutral-900 dark:shadow-none dark:ring-white/10"
              >
                <BookCover
                  key={selectedBook.id}
                  book={selectedBook}
                  sizes="(max-width: 639px) 96px, 144px"
                  priority
                />
              </m.div>
              <figcaption
                className="mt-3 hidden text-xs leading-relaxed text-neutral-500 dark:text-silver-dark sm:block"
                aria-live="polite"
                aria-atomic="true"
              >
                {selectedBook.title}
                <span className="mt-1 block">{selectedBook.author}</span>
              </figcaption>
            </figure>
          ) : null}
        </div>

        <div className="list-content min-w-0">
          {books.length ? (
            <>
              <ol className="divide-y divide-neutral-500/10 dark:divide-neutral-900">
                {books.map((book, index) => {
                  const isSelected = book.id === selectedBook?.id;

                  return (
                    <li key={book.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedBookId(book.id)}
                        aria-pressed={isSelected}
                        aria-controls="selected-book-cover"
                        className={`group -mx-3 flex w-[calc(100%+1.5rem)] items-start gap-3 rounded-md px-3 py-4 text-left motion-safe:transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500 dark:focus-visible:outline-silver-dark ${isSelected ? "bg-neutral-500/[0.05] dark:bg-white/[0.04]" : "hover:bg-neutral-500/[0.03] dark:hover:bg-white/[0.02]"}`}
                      >
                        <span
                          className="time w-5 shrink-0 pt-0.5 text-xs"
                          aria-hidden="true"
                        >
                          {formatIndex(index)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block leading-snug text-neutral-800 dark:text-silver ${isSelected ? "[font-variation-settings:'wght'_500] dark:text-white" : ""}`}
                          >
                            {book.title}
                          </span>
                          <span className="mt-1 block text-sm text-neutral-500 dark:text-silver-dark">
                            {book.author}
                          </span>
                          {book.status !== "read" ? (
                            <span className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-silver-dark">
                              {book.status === "reading" ? (
                                <span
                                  aria-hidden="true"
                                  className="relative flex h-1.5 w-1.5 shrink-0"
                                >
                                  <span className="absolute inset-0 rounded-full bg-emerald-600/40 motion-safe:animate-[ping_2.5s_ease-out_infinite] dark:bg-emerald-400/40" />
                                  <span className="relative h-full w-full rounded-full bg-emerald-600 dark:bg-emerald-400" />
                                </span>
                              ) : null}
                              {book.status === "reading"
                                ? "Currently reading"
                                : "Want to read"}
                            </span>
                          ) : null}
                        </span>
                        <span
                          aria-hidden="true"
                          className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${isSelected ? "bg-neutral-500 dark:bg-silver-dark" : "bg-transparent"}`}
                        />
                      </button>
                    </li>
                  );
                })}
              </ol>
            </>
          ) : (
            <p className="text-neutral-500 dark:text-silver-dark">
              The first book is still to come.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
