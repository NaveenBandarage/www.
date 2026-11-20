// Run with: bun test tests/gta-artwork.test.mjs
import { test } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import sharp from "sharp";
import { PIECES, VECTOR_ASSETS } from "../components/GtaLoading/sequence";

test("every runtime SVG has explicit scaling bounds and remains vector artwork", () => {
  for (const asset of VECTOR_ASSETS) {
    const svg = readFileSync(
      new URL(`../public${asset}`, import.meta.url),
      "utf8",
    );
    const root = svg.match(/<svg\b[^>]*>/)?.[0] ?? "";
    assert.match(root, /viewBox="-?[\d.]+ -?[\d.]+ [\d.]+ [\d.]+"/, asset);
    assert.match(root, /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, asset);
    assert.doesNotMatch(svg, /<image\b|data:image/, asset);
  }
});

test("foliage and snake silhouettes have transparent space around every edge", async () => {
  for (const kind of ["palm", "palm-frond", "gold-snake"]) {
    const svg = readFileSync(
      new URL(`../public/fun/gta-vi/objects/${kind}.svg`, import.meta.url),
    );
    const { data, info } = await sharp(svg)
      .resize({ width: 400 })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const edges = [
      ...Array.from({ length: info.width }, (_, x) => [x, 0]),
      ...Array.from({ length: info.width }, (_, x) => [x, info.height - 1]),
      ...Array.from({ length: info.height }, (_, y) => [0, y]),
      ...Array.from({ length: info.height }, (_, y) => [info.width - 1, y]),
    ];
    for (const [x, y] of edges) {
      assert.equal(
        data[(y * info.width + x) * info.channels + 3],
        0,
        `${kind} touches its crop at ${x},${y}`,
      );
    }
  }
});

test("the complete opening figures fit in the uncropped composition", () => {
  for (const kind of ["uncle-sam", "liberty", "saloon-woman"]) {
    const figure = PIECES.find(
      (piece) => piece.world === "americana" && piece.kind === kind,
    );
    assert.ok(figure, `Missing opening figure: ${kind}`);
    assert.ok(
      figure.y - figure.h / 2 >= -0.01,
      `${kind} is cut off above the composition`,
    );
    assert.ok(
      figure.x - figure.w / 2 >= 0,
      `${kind} is cut off at the left edge`,
    );
    assert.ok(
      figure.x + figure.w / 2 <= 1600,
      `${kind} is cut off at the right edge`,
    );
  }
});
