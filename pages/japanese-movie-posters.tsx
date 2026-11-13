import Image from "next/image";
import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { Main } from "../components/Layouts";
import { SEO } from "../components/SEO";

type Movie = {
  id: number;
  title: string;
  year: string | null;
  poster: string | null;
};

export default function JapaneseMoviePosters() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const request = useRef(0);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = query.trim();
    if (!title) return;
    const current = ++request.current;
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const response = await fetch(
        `/api/japanese-movie-posters?q=${encodeURIComponent(title)}`,
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Search failed. Please try again.");
      if (current === request.current) setResults(data.results);
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
        <h1 className="mt-6 text-xl text-neutral-800 [font-variation-settings:'opsz'_32,_'wght'_500] dark:text-white">
          Japanese movie posters
        </h1>
        <p className="mt-3 text-neutral-500 dark:text-silver-dark">
          Find a film and see its Japanese poster.
        </p>
        <form onSubmit={search} className="mt-8 flex gap-3" role="search">
          <label htmlFor="movie-search" className="sr-only">
            Movie title
          </label>
          <input
            id="movie-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            maxLength={100}
            placeholder="Search for a movie"
            className="min-w-0 flex-1 rounded-md border border-neutral-300 bg-transparent px-4 py-3 text-neutral-800 placeholder:text-neutral-400 focus:outline-2 focus:outline-offset-2 focus:outline-neutral-500 dark:border-neutral-700 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="rounded-md bg-neutral-800 px-5 py-3 text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
          >
            Search
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
          {results && results.length > 0 && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6">
              {results.map((movie) => (
                <article key={movie.id}>
                  {movie.poster ? (
                    <a
                      href={`https://image.tmdb.org/t/p/original${movie.poster}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`View the Japanese poster for ${movie.title}`}
                    >
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${movie.poster}`}
                        alt={`Japanese poster for ${movie.title}`}
                        width={500}
                        height={750}
                        unoptimized
                        className="aspect-[2/3] w-full rounded-sm object-cover"
                      />
                    </a>
                  ) : (
                    <div className="flex aspect-[2/3] items-center justify-center rounded-sm bg-neutral-100 p-4 text-center text-sm text-neutral-500 dark:bg-neutral-800 dark:text-silver-dark">
                      No Japanese poster available
                    </div>
                  )}
                  <h2 className="mt-3 text-sm text-neutral-800 dark:text-white">
                    {movie.title}
                  </h2>
                  {movie.year && (
                    <p className="mt-1 text-sm text-neutral-500 dark:text-silver-dark">
                      {movie.year}
                    </p>
                  )}
                </article>
              ))}
            </div>
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
