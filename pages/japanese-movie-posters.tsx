import Image from "next/image";
import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { m } from "framer-motion";
import { Main } from "../components/Layouts";
import { SEO } from "../components/SEO";
import styles from "../styles/movie-poster-search.module.css";
import useReducedMotion from "../lib/useReducedMotion";

type Movie = {
  id: number;
  title: string;
  year: string | null;
  poster: string | null;
  englishPoster: string | null;
};

export default function JapaneseMoviePosters() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showEnglish, setShowEnglish] = useState(false);
  const reducedMotion = useReducedMotion();
  const request = useRef(0);
  const selectedMovie = results?.find((movie) => movie.id === selectedId);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = query.trim();
    if (!title) return;
    const current = ++request.current;
    setLoading(true);
    setError("");
    setResults(null);
    setSelectedId(null);
    setShowEnglish(false);
    try {
      const response = await fetch(
        `/api/japanese-movie-posters?q=${encodeURIComponent(title)}`,
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Search failed. Please try again.");
      if (current === request.current) {
        setResults(data.results);
        setSelectedId(data.results[0]?.id ?? null);
      }
    } catch (err) {
      if (current === request.current)
        setError(
          err instanceof Error
            ? err.message
            : "Search failed. Please try again.",
        );
    } finally {
      if (current === request.current) setLoading(false);
    }
  }

  return (
    <>
      <SEO
        seo={{
          title: "Japanese Movie Posters - Naveen Bandarage",
          description: "Search for Japanese movie posters.",
          path: "/japanese-movie-posters",
        }}
      />
      <Main>
        <Link
          href="/fun"
          className="link-fade text-sm text-neutral-500 dark:text-silver-dark"
        >
          ← Fun
        </Link>
        <m.h1
          initial={reducedMotion ? false : { opacity: 0.85, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="mt-6 text-center text-xl text-neutral-800 [font-variation-settings:'opsz'_32,_'wght'_500] dark:text-white"
        >
          Japanese movie posters
        </m.h1>
        <form
          onSubmit={search}
          className={`${styles.search} mt-8`}
          role="search"
        >
          <label htmlFor="movie-search" className="sr-only">
            Movie title
          </label>
          {!query && (
            <span className={styles.placeholder} aria-hidden="true">
              <span>Search </span>
              <span className={styles.exampleWindow}>
                <span className={styles.examples}>
                  <span>Spirited Away</span>
                  <span>Interstellar</span>
                  <span>Perfect Days</span>
                  <span>Past Lives</span>
                  <span>Spirited Away</span>
                </span>
              </span>
            </span>
          )}
          <input
            id="movie-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            maxLength={100}
            autoComplete="off"
            className={styles.input}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            aria-label="Search movies"
            className={styles.submit}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              width="20"
              height="20"
            >
              <path
                d="M12 19V5m0 0-6 6m6-6 6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
        <div className="mt-8" aria-live="polite" aria-busy={loading}>
          {loading && (
            <p className="text-neutral-500 dark:text-silver-dark">Searching…</p>
          )}
          {error && (
            <p className="text-neutral-500 dark:text-silver-dark">{error}</p>
          )}
          {results && results.length === 0 && (
            <p className="text-neutral-500 dark:text-silver-dark">
              No movies found. Try another title.
            </p>
          )}
          {selectedMovie && (
            <m.article
              key={selectedMovie.id}
              initial={reducedMotion ? false : { opacity: 0.85, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className={styles.result}
            >
              <div className={styles.resultHeader}>
                <div>
                  <h2 className="text-neutral-800 dark:text-white">
                    {selectedMovie.title}
                  </h2>
                  {selectedMovie.year && (
                    <p className="mt-1 text-sm text-neutral-500 dark:text-silver-dark">
                      {selectedMovie.year}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className={styles.compare}
                  onClick={() => setShowEnglish(!showEnglish)}
                  aria-pressed={showEnglish}
                >
                  {showEnglish ? "Hide English" : "See English"}
                </button>
              </div>
              <div
                className={`${styles.posters} ${showEnglish ? styles.comparing : ""}`}
              >
                <div>
                  {showEnglish && (
                    <p className={styles.posterLabel}>Japanese</p>
                  )}
                  {selectedMovie.poster ? (
                    <a
                      href={`https://image.tmdb.org/t/p/original${selectedMovie.poster}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`View the Japanese poster for ${selectedMovie.title}`}
                    >
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster}`}
                        alt={`Japanese poster for ${selectedMovie.title}`}
                        width={500}
                        height={750}
                        unoptimized
                        className={styles.poster}
                      />
                    </a>
                  ) : (
                    <div className={styles.missingPoster}>
                      No Japanese poster available
                    </div>
                  )}
                </div>
                {showEnglish && (
                  <div>
                    <p className={styles.posterLabel}>English</p>
                    {selectedMovie.englishPoster ? (
                      <a
                        href={`https://image.tmdb.org/t/p/original${selectedMovie.englishPoster}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`View the English poster for ${selectedMovie.title}`}
                      >
                        <Image
                          src={`https://image.tmdb.org/t/p/w500${selectedMovie.englishPoster}`}
                          alt={`English poster for ${selectedMovie.title}`}
                          width={500}
                          height={750}
                          unoptimized
                          className={styles.poster}
                        />
                      </a>
                    ) : (
                      <div className={styles.missingPoster}>
                        No English poster available
                      </div>
                    )}
                  </div>
                )}
              </div>
              {results && results.length > 1 && (
                <div className="mt-7 text-sm text-neutral-500 dark:text-silver-dark">
                  <label htmlFor="movie-match">
                    Looking for another movie?{" "}
                  </label>
                  <select
                    id="movie-match"
                    value={selectedMovie.id}
                    onChange={(event) => {
                      setSelectedId(Number(event.target.value));
                      setShowEnglish(false);
                    }}
                    className={styles.matches}
                  >
                    {results.map((movie) => (
                      <option key={movie.id} value={movie.id}>
                        {movie.title}
                        {movie.year ? ` (${movie.year})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </m.article>
          )}
        </div>
        <section
          aria-label="Credits"
          className="mt-12 text-xs text-neutral-500 dark:text-silver-dark"
        >
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noreferrer"
            aria-label="The Movie Database"
          >
            <Image
              src="/tmdb-logo.svg"
              alt="TMDB"
              width={100}
              height={20}
              className="h-auto w-24"
            />
          </a>
          <p className="mt-3">
            This product uses the TMDB API but is not endorsed or certified by
            TMDB.
          </p>
        </section>
      </Main>
    </>
  );
}
