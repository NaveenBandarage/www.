import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { addPublishedPosts } from "../../../scripts/memory-posts.mjs";
import { initialWorkspace } from "../src/personal-memory.js";
import { validateMemory, retrieve } from "../src/memory.js";

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
    assert.match(updated.content, /newer discovery/);
    assert.equal(updated.pinned, true);
    assert.equal(updated.revisions[0].content, "My local correction");
    assert.equal(merged.nodes.filter((n) => n.id.startsWith("website:post:")).length, 2);
    assert.deepEqual(initialWorkspace(merged, next), merged);
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
