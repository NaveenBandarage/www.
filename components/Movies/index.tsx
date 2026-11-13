import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { movies } from "../../data/movies";
import posterUrls from "../../data/moviePosters.json";
import type { Movie } from "../../data/movies";
import styles from "./movies.module.css";

function movieYear(movie: Movie): number | undefined {
  const date = movie.watchedDate ?? movie.purchasedDate;
  return date ? Number(date.slice(0, 4)) : movie.watchedYear;
}

export default function MovieCollection() {
  const years = Array.from(
    new Set(
      movies
        .map(movieYear)
        .filter((year): year is number => year !== undefined),
    ),
  ).sort((a, b) => b - a);
  const undated = movies.filter((movie) => movieYear(movie) === undefined);

  return (
    <div className={styles.collection}>
      {years.map((year) => {
        const films = movies
          .filter((movie) => movieYear(movie) === year)
          .sort((a, b) =>
            (b.watchedDate ?? b.purchasedDate ?? "").localeCompare(
              a.watchedDate ?? a.purchasedDate ?? "",
            ),
          );
        return (
          <MovieRow
            key={year}
            label={String(year)}
            films={films}
            showTrackingNote={year === 2024}
          />
        );
      })}
      {undated.length > 0 && (
        <MovieRow label="Seen but forget when" films={undated} />
      )}
    </div>
  );
}

function MovieRow({
  label,
  films,
  showTrackingNote = false,
}: {
  label: string;
  films: Movie[];
  showTrackingNote?: boolean;
}) {
  const row = useRef<HTMLUListElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [nearbyPosters, setNearbyPosters] = useState<Set<string>>(
    () => new Set(),
  );

  function updateScroll() {
    const element = row.current;
    if (!element) return;
    setCanScrollLeft(element.scrollLeft > 1);
    setCanScrollRight(
      element.scrollLeft + element.clientWidth < element.scrollWidth - 1,
    );
  }

  useEffect(() => {
    const element = row.current;
    if (!element) return;
    const observer = new ResizeObserver(updateScroll);
    observer.observe(element);
    updateScroll();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = row.current;
    if (!element || !("IntersectionObserver" in window)) return;

    const posterObserver = new IntersectionObserver(
      (entries) => {
        const ids = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => (entry.target as HTMLElement).dataset.movieId)
          .filter((id): id is string => Boolean(id));
        if (ids.length === 0) return;
        setNearbyPosters((previous) => {
          const next = new Set(previous);
          ids.forEach((id) => next.add(id));
          return next.size === previous.size ? previous : next;
        });
        entries.forEach((entry) => {
          if (entry.isIntersecting) posterObserver.unobserve(entry.target);
        });
      },
      { root: element, rootMargin: "0px 600px" },
    );
    const rowObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element
            .querySelectorAll("[data-movie-id]")
            .forEach((card) => posterObserver.observe(card));
        } else {
          posterObserver.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    rowObserver.observe(element);
    return () => {
      rowObserver.disconnect();
      posterObserver.disconnect();
    };
  }, []);

  function scrollRow(direction: number) {
    const element = row.current;
    if (!element) return;
    element.scrollBy({
      left: direction * element.clientWidth * 0.8,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }

  return (
    <section className={styles.year} aria-label={label}>
      {showTrackingNote && (
        <p className={styles.trackingNote}>
          My tracking from 2024 onwards is a little patchy because I lost some
          of my data.
        </p>
      )}
      <div className={styles.yearHeading}>
        <div className={styles.yearTitle}>
          <h2>{label}</h2>
          <span>
            {films.length} {films.length === 1 ? "film" : "films"}
          </span>
        </div>
        <div className={styles.rowControls}>
          <button
            type="button"
            className={styles.viewAll}
            onClick={() => dialog.current?.showModal()}
            aria-haspopup="dialog"
          >
            View all <span aria-hidden="true">↗</span>
            <span className="sr-only"> {label} films</span>
          </button>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => scrollRow(-1)}
            disabled={!canScrollLeft}
            aria-label={`Scroll ${label} films left`}
          >
            ←
          </button>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => scrollRow(1)}
            disabled={!canScrollRight}
            aria-label={`Scroll ${label} films right`}
          >
            →
          </button>
        </div>
      </div>
      <ul
        ref={row}
        className={styles.row}
        tabIndex={0}
        onScroll={updateScroll}
        aria-label={`${label} films, scroll horizontally`}
      >
        {films.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            preloadPoster={nearbyPosters.has(movie.id)}
          />
        ))}
      </ul>
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby={titleId}
        data-lenis-prevent
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const bounds = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < bounds.left ||
              event.clientX > bounds.right ||
              event.clientY < bounds.top ||
              event.clientY > bounds.bottom
            )
              event.currentTarget.close();
          }
        }}
      >
        <div className={styles.dialogHeader}>
          <div>
            <h2 id={titleId}>{label}</h2>
            <p>
              {films.length} {films.length === 1 ? "film" : "films"}
            </p>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={() => dialog.current?.close()}
            aria-label="Close films"
          >
            ×
          </button>
        </div>
        <ul className={styles.dialogGrid}>
          {films.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </ul>
      </dialog>
    </section>
  );
}

function MovieCard({
  movie,
  preloadPoster = false,
}: {
  movie: Movie;
  preloadPoster?: boolean;
}) {
  const content = (
    <>
      <MoviePoster movie={movie} preload={preloadPoster} />
      <span className={styles.movieTitle}>{movie.title}</span>
      {movie.releaseYear && (
        <span className={styles.watchedDate}>Released {movie.releaseYear}</span>
      )}
      {movie.watchedDate ? (
        <time className={styles.watchedDate} dateTime={movie.watchedDate}>
          Watched{" "}
          {new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC",
          }).format(new Date(`${movie.watchedDate}T00:00:00Z`))}
        </time>
      ) : (
        <>
          <span className={styles.watchedDate}>
            {movie.dateNote ??
              (movie.timing === "opening-week"
                ? "Watched opening week"
                : movie.timing === "around-release"
                  ? "Watched around release"
                  : "Watched, date unknown")}
          </span>
          {movie.purchasedDate && (
            <time className={styles.watchedDate} dateTime={movie.purchasedDate}>
              Ticket purchased{" "}
              {new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC",
              }).format(new Date(`${movie.purchasedDate}T00:00:00Z`))}
            </time>
          )}
        </>
      )}
    </>
  );

  return (
    <li className={styles.card} data-movie-id={movie.id}>
      {movie.href ? (
        <a href={movie.href} className={styles.cardLink}>
          {content}
        </a>
      ) : (
        content
      )}
      {movie.seenInTheatres && (
        <button
          type="button"
          className={styles.theatre}
          aria-label="Seen in theatres"
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4" />
          </svg>
          <span aria-hidden="true" className={styles.theatreTooltip}>
            Seen in theatres
          </span>
        </button>
      )}
    </li>
  );
}

function MoviePoster({ movie, preload }: { movie: Movie; preload: boolean }) {
  const [failed, setFailed] = useState(false);
  const poster =
    movie.poster ?? (posterUrls as Record<string, string>)[movie.id];
  return (
    <span className={styles.poster}>
      {poster && !failed ? (
        <Image
          src={poster}
          alt=""
          width={300}
          height={450}
          sizes="(max-width: 639px) 132px, 180px"
          loading={preload ? "eager" : "lazy"}
          fetchPriority={preload ? "low" : "auto"}
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true" className={styles.posterTitle}>
          {movie.title}
        </span>
      )}
    </span>
  );
}
