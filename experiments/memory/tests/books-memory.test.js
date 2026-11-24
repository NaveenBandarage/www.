import { test } from "node:test";
import assert from "node:assert/strict";
import { addBooks } from "../../../scripts/memory-books.mjs";
import { initialWorkspace } from "../src/personal-memory.js";
import { memoryAt, validateMemory } from "../src/memory.js";

const seed = { nodes: [], edges: [] };
const entry = (id, status) => `{ id: "${id}", title: "A title", author: "An author", status: "${status}" }`;
const build = (entries) => addBooks(seed, `export const booksData: Book[] = [${entries}];`);

test("books follow additions, status changes and removals with stable sources", () => {
  const first = build(entry("a", "reading"));
  assert.match(first.nodes.find(n => n.id === "website:book:a").content, /Currently reading/);
  assert.match(first.nodes.find(n => n.id === "website:book-source:a").content, /naveenbandarage.com\/books/);
  const updated = build(`${entry("a", "read")}, ${entry("b", "reading")}`);
  assert.match(updated.nodes.find(n => n.id === "website:book:a").content, /Read/);
  assert.ok(updated.nodes.find(n => n.id === "website:book:b"));
  assert.equal(build(entry("b", "reading")).nodes.some(n => n.id === "website:book:a"), false);
});

test("book updates retain historical content and source evidence", () => {
  const makeSeed = (status) => {
    const data = build(entry("a", status));
    data.nodes.push({ id: "sources", title: "sources/", type: "folder" });
    return validateMemory({ agent: { id: "personal", name: "Naveen" }, ...data });
  };
  const first = makeSeed("reading");
  const updated = initialWorkspace(first, makeSeed("read"));
  const book = updated.nodes.find((node) => node.id === "website:book:a");
  const source = updated.nodes.find((node) => node.id === book.source_ids[0]);
  const before = Date.parse(book.revisions[0].at) - 1;
  assert.match(memoryAt(book, before).content, /Currently reading/);
  assert.match(memoryAt(book).content, /Read/);
  assert.match(memoryAt(source, before).content, /reading/);
  assert.match(memoryAt(source).content, /Read/);
  assert.deepEqual(initialWorkspace(updated, makeSeed("read")), updated);
});
