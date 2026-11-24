import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Artwork, { type ArtworkKind } from "../../components/GtaLoading/Artwork";

// Keep the authored SVG source in Artwork.tsx, but render each illustration once.
// All repeated instances share one decoded image instead of thousands of SVG DOM
// nodes, gradients, and paint operations during the camera flight.
const kinds: ArtworkKind[] = [
  "palm",
  "orange",
  "blossom",
  "portal",
  "arch",
  "flame",
  "cloud",
  "poster",
  "leaf-sign",
  "medallion",
  "panorama",
  "palm-frond",
  "gold-snake",
];
for (const kind of kinds) {
  const svg = renderToStaticMarkup(createElement(Artwork, { kind }));
  writeFileSync(
    resolve(
      dirname(fileURLToPath(import.meta.url)),
      `../../public/fun/gta-vi/objects/${kind}.svg`,
    ),
    svg,
  );
}
console.log(`Drew ${kinds.length} reusable SVG illustrations.`);
