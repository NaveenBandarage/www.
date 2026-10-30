import { fileURLToPath } from "node:url";
import { build } from "vite";

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
