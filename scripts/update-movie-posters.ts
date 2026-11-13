import { readFile, writeFile } from "node:fs/promises";
import { movies } from "../data/movies";

const path = new URL("../data/moviePosters.json", import.meta.url);
const posters: Record<string, string> = JSON.parse(
  await readFile(path, "utf8"),
);
const aliases: Record<string, { query: string; title: string; year?: number }> =
  {
    seven: { query: "se7en", title: "Seven", year: 1995 },
    "glass-onion": { query: "glass onion", title: "Glass Onion", year: 2022 },
    "wake-up-dead-man": {
      query: "wake up dead man",
      title: "Wake Up Dead Man",
      year: 2025,
    },
    "the-force-awakens": {
      query: "the force awakens",
      title: "Star Wars: Episode VII - The Force Awakens",
      year: 2015,
    },
    "the-last-jedi": {
      query: "the last jedi",
      title: "Star Wars: Episode VIII - The Last Jedi",
      year: 2017,
    },
    "the-rise-of-skywalker": {
      query: "the rise of skywalker",
      title: "Star Wars: Episode IX - The Rise of Skywalker",
      year: 2019,
    },
    "my-hero-academia-unspecified": {
      query: "my hero academia world heroes mission",
      title: "My Hero Academia: World Heroes' Mission",
      year: 2021,
    },
  };
const normalize = (value: string) =>
  value
    .normalize("NFKD")
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]/g, "");

for (const movie of movies) {
  if (posters[movie.id]) continue;
  const alias = aliases[movie.id];
  const title = alias?.title ?? movie.title;
  const query = (alias?.query ?? title).toLowerCase().replaceAll(" ", "_");
  try {
    const response = await fetch(
      `https://v3.sg.media-imdb.com/suggestion/${encodeURIComponent(query[0])}/${encodeURIComponent(query)}.json`,
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as {
      d?: Array<{
        l?: string;
        qid?: string;
        y?: number;
        i?: { imageUrl?: string };
      }>;
    };
    const year = alias?.year ?? movie.releaseYear;
    const match = data.d?.find(
      (item) =>
        item.qid === "movie" &&
        normalize(item.l ?? "") === normalize(title) &&
        (!year || item.y === year) &&
        item.i?.imageUrl,
    );
    if (match?.i?.imageUrl) {
      posters[movie.id] = match.i.imageUrl;
      console.log(`Matched ${movie.title}`);
    } else console.log(`No confident match: ${movie.title}`);
  } catch (error) {
    console.error(`Could not look up ${movie.title}:`, error);
  }
}
await writeFile(path, `${JSON.stringify(posters, null, 2)}\n`);
