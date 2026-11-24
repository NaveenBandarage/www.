import { fileURLToPath } from "node:url";
import { build } from "vite";
import { readFile, writeFile } from "node:fs/promises";
import { addBooks } from "./memory-books.mjs";
import { validateMemory } from "../experiments/memory/src/memory.js";

// Keep the standalone renderer isolated from Next's CSS and shared JS bundles.
await build({
  configFile: false,
  root: fileURLToPath(new URL("../experiments/memory/", import.meta.url)),
  base: "/memory-explorer/",
  css: { postcss: { plugins: [] } },
  build: {
    outDir: fileURLToPath(
      new URL("../public/memory-explorer/", import.meta.url),
    ),
    emptyOutDir: true,
  },
});

const seed = JSON.parse(await readFile(new URL("../experiments/memory/public/naveen-memory.json", import.meta.url), "utf8"));
const books = await readFile(new URL("../data/books.ts", import.meta.url), "utf8");
const memory = validateMemory(addBooks(seed, books));
await writeFile(new URL("../public/memory-explorer/naveen-memory.json", import.meta.url), JSON.stringify(memory, null, 2) + "\n");
