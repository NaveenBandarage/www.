import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { addPublishedPosts } from "../../../scripts/memory-posts.mjs";
import { initialWorkspace } from "../src/personal-memory.js";
import { validateMemory, retrieve, memoryAt } from "../src/memory.js";

const base = { agent: { id: "personal", name: "Naveen" }, nodes: [{ id: "sources", type: "folder", title: "sources/" }], edges: [] };
const post = (body) => `---\ntitle: My writing\ndate: "2026-11-17"\n---\n\n${body}\n`;

test("published posts are searchable and retain source provenance on updates", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "memory-posts-"));
  try {
    await writeFile(path.join(dir, "first.mdx"), post("A **bright** discovery."));
    const first = validateMemory(await addPublishedPosts(base, dir));
    const record = first.nodes.find((n) => n.id.startsWith("website:post:"));
    assert.ok(retrieve(first, "discovery").some((r) => r.id === record.id));
    assert.match(first.nodes.find((n) => n.id === record.source_ids[0]).content, /\/blog\/first/);
    record.pinned = true;
    record.revisions.push({ at: "2026-11-18T00:00:00.000Z", content: "My local correction", source_ids: record.source_ids, status: "active" });
    await writeFile(path.join(dir, "first.mdx"), post("A newer discovery."));
    await writeFile(path.join(dir, "second.mdx"), post("Another addition."));
    const next = validateMemory(await addPublishedPosts(base, dir));
    const merged = initialWorkspace(first, next);
    const updated = merged.nodes.find((n) => n.id === record.id);
    assert.match(updated.content, /bright discovery/);
    assert.match(memoryAt(updated).content, /newer discovery/);
    const changedAt = Date.parse(updated.revisions.find((r) => r.origin === "website").at);
    assert.match(memoryAt(updated, changedAt - 1).content, /My local correction/);
    const source = merged.nodes.find((n) => n.id === record.source_ids[0]);
    assert.match(memoryAt(source, changedAt - 1).content, /bright discovery/);
    assert.match(memoryAt(source).content, /newer discovery/);
    assert.equal(updated.pinned, true);
    assert.equal(updated.revisions[0].content, "My local correction");
    assert.equal(merged.nodes.filter((n) => n.id.startsWith("website:post:")).length, 2);
    assert.deepEqual(initialWorkspace(merged, next), merged);
    const imported = validateMemory({ ...first, agent: { ...first.agent, imported: true } });
    assert.equal(initialWorkspace(imported, next), imported);
    await rm(path.join(dir, "first.mdx"));
    const removed = initialWorkspace(merged, validateMemory(await addPublishedPosts(base, dir)));
    assert.ok(removed.nodes.find((n) => n.id === record.id).archived_at);
    assert.equal(initialWorkspace({ ...first, agent: { ...first.agent, id: "other" } }, next).agent.id, "other");
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("blog image descriptions and captions are searchable with their post as evidence", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "memory-post-images-"));
  try {
    const file = path.join(dir, "photos.mdx");
    await writeFile(file, post('A day out.\n\n<BlogImage src="/blog/photo.webp" alt="Coffee and a notebook" caption="Taken at the tea room" />'));
    const first = validateMemory(await addPublishedPosts(base, dir));
    const record = first.nodes.find((n) => n.id.startsWith("website:post:"));
    const source = first.nodes.find((n) => n.id === record.source_ids[0]);
    assert.match(source.content, /\/blog\/photos\n\nA day out\./);
    assert.match(source.content, /Coffee and a notebook\nTaken at the tea room/);
    assert.ok(retrieve(first, "tea room").some((result) => result.id === record.id));

    await writeFile(file, post('A day out.\n\n<BlogImage src="/blog/photo.webp" alt="Coffee and a notebook" />'));
    const next = validateMemory(await addPublishedPosts(base, dir));
    assert.match(next.nodes.find((n) => n.id === record.id).content, /Coffee and a notebook/);
    assert.equal(retrieve(next, "tea room").length, 0);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("public pages, experiments and structured collections follow site changes", async () => {
  const { mkdir } = await import("node:fs/promises");
  const { addSiteContent } = await import("../../../scripts/memory-site.mjs");
  const dir = await mkdtemp(path.join(tmpdir(), "memory-site-"));
  try {
    await mkdir(path.join(dir, "pages"));
    await mkdir(path.join(dir, "data"));
    const fun = (description) => `export default function Fun() { return <main><div><Link href="/film-tool">Film tool ↗</Link><p>${description}</p></div></main>; }`;
    await writeFile(path.join(dir, "pages", "fun.tsx"), fun("Explore posters"));
    await writeFile(path.join(dir, "pages", "about.tsx"), 'export default function About() { return <main>Making things in New York</main>; }');
    await writeFile(path.join(dir, "data", "movies.ts"), 'export const movies = [{ id: "one", title: "A Movie", status: "watched" }];');
    await writeFile(path.join(dir, "pages", "photos.tsx"), 'import { galleryPhotos } from "../data/gallery";');
    await writeFile(path.join(dir, "data", "gallery-photos.json"), JSON.stringify([{ src: "/gallery/first.jpg", alt: "A riverside photo" }]));
    const first = validateMemory(await addSiteContent(base, dir));
    const photo = first.nodes.find((n) => n.type === "memory" && n.title === "A riverside photo");
    assert.match(first.nodes.find((n) => n.id === photo.source_ids[0]).content, /\/photo\/first/);
    assert.ok(retrieve(first, "posters").some((r) => first.nodes.find((n) => n.id === r.id)?.title === "Film tool"));
    assert.ok(retrieve(first, "A Movie").length);
    const movie = first.nodes.find((n) => n.type === "memory" && n.title === "A Movie");
    assert.match(movie.content, /status: watched/);
    assert.equal(movie.parent, "website:movies");
    assert.match(first.nodes.find((n) => n.id === movie.source_ids[0]).content, /naveenbandarage\.com\/movies/);
    await writeFile(path.join(dir, "pages", "fun.tsx"), fun("Discover posters"));
    await writeFile(path.join(dir, "data", "movies.ts"), 'export const movies = [{ id: "one", title: "A Movie", status: "watched" }, { id: "two", title: "Another Movie", status: "planned" }];');
    const next = validateMemory(await addSiteContent(base, dir));
    const merged = initialWorkspace(first, next);
    assert.ok(retrieve(merged, "Discover posters").length);
    assert.ok(retrieve(merged, "Another Movie").length);
    assert.equal(merged.nodes.filter((n) => n.type === "memory" && n.title === "Film tool").length, 1);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("outfits and shared wardrobe pieces follow additions, edits and removals", async () => {
  const { mkdir } = await import("node:fs/promises");
  const { addSiteContent } = await import("../../../scripts/memory-site.mjs");
  const dir = await mkdtemp(path.join(tmpdir(), "memory-outfits-"));
  try {
    for (const folder of ["pages", "data", "lib"])
      await mkdir(path.join(dir, folder));
    await writeFile(
      path.join(dir, "pages/outfits.tsx"),
      'import { outfits } from "../data/outfits"; export default function Outfits() { return <main>Outfits</main>; }',
    );
    await writeFile(
      path.join(dir, "data/outfits.ts"),
      'export const outfits = [{ id: "look-1", title: "First look", note: "A look" }];',
    );
    const uses = (note) =>
      `export const usesItems = [{ id: "hat", name: "A hat", category: "Wardrobe", note: "${note}" }, { id: "desk", name: "A desk", category: "Desk" }];`;
    await writeFile(path.join(dir, "lib/uses.ts"), uses("A gray hat"));
    const first = validateMemory(await addSiteContent(base, dir));
    const hat = first.nodes.find(
      (node) => node.type === "memory" && node.title === "A hat",
    );
    assert.match(
      first.nodes.find((node) => node.id === hat.source_ids[0]).content,
      /naveenbandarage\.com\/outfits/,
    );
    assert.ok(
      first.nodes.some(
        (node) => node.type === "memory" && node.title === "First look",
      ),
    );
    assert.ok(
      !first.nodes.some(
        (node) => node.type === "memory" && node.title === "A desk",
      ),
    );
    await writeFile(path.join(dir, "lib/uses.ts"), uses("A black hat"));
    await writeFile(
      path.join(dir, "data/outfits.ts"),
      "export const outfits = [];",
    );
    const next = validateMemory(await addSiteContent(base, dir));
    const merged = initialWorkspace(first, next);
    const updatedHat = merged.nodes.find((node) => node.id === hat.id);
    const source = merged.nodes.find((node) => node.id === hat.source_ids[0]);
    const changedAt = Date.parse(
      updatedHat.revisions.find((revision) => revision.origin === "website").at,
    );
    assert.match(updatedHat.content, /A gray hat/);
    assert.match(memoryAt(updatedHat).content, /A black hat/);
    assert.match(memoryAt(updatedHat, changedAt - 1).content, /A gray hat/);
    assert.match(memoryAt(source).content, /A black hat/);
    assert.match(memoryAt(source, changedAt - 1).content, /A gray hat/);
    assert.ok(
      merged.nodes.find(
        (node) => node.title === "First look" && node.type === "memory",
      ).archived_at,
    );
    assert.deepEqual(initialWorkspace(merged, next), merged);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
