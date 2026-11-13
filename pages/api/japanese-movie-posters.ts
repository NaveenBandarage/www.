import type { NextApiRequest, NextApiResponse } from "next";
import { checkRateLimit, getClientAddress } from "../../lib/rateLimit";

type Movie = { id: number; title: string; release_date?: string };
type Poster = { file_path: string; iso_639_1: string | null };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }

  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (!query || query.length > 100) {
    return res
      .status(400)
      .json({ error: "Enter a movie title (up to 100 characters)." });
  }
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    return res
      .status(503)
      .json({ error: "Movie search is not configured yet." });
  }
  const limit = checkRateLimit(`posters:${getClientAddress(req)}`, 30, 60_000);
  if (!limit.allowed) {
    res.setHeader("Retry-After", limit.retryAfter);
    return res
      .status(429)
      .json({ error: "Too many searches. Please try again in a moment." });
  }

  try {
    const searchUrl = new URL("https://api.themoviedb.org/3/search/movie");
    searchUrl.search = new URLSearchParams({
      api_key: key,
      query,
      include_adult: "false",
    }).toString();
    const searchResponse = await fetch(searchUrl, {
      signal: AbortSignal.timeout(8000),
    });
    if (!searchResponse.ok) throw new Error("Search failed");
    const search = await searchResponse.json();
    const movies: Movie[] = search.results.slice(0, 12);
    const results = await Promise.all(
      movies.map(async (movie) => {
        const url = new URL(
          `https://api.themoviedb.org/3/movie/${movie.id}/images`,
        );
        url.search = new URLSearchParams({
          api_key: key,
          language: "ja",
          include_image_language: "ja,en",
        }).toString();
        const response = await fetch(url, {
          signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) throw new Error("Images failed");
        const images = await response.json();
        const poster: Poster | undefined = images.posters.find(
          (image: Poster) => image.iso_639_1 === "ja",
        );
        return {
          id: movie.id,
          title: movie.title,
          year: movie.release_date?.slice(0, 4) || null,
          poster: poster?.file_path || null,
          englishPoster:
            images.posters.find((image: Poster) => image.iso_639_1 === "en")
              ?.file_path || null,
        };
      }),
    );
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=604800",
    );
    return res.status(200).json({ results });
  } catch {
    return res.status(502).json({
      error: "Movie search is temporarily unavailable. Please try again.",
    });
  }
}
