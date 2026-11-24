import { test } from "node:test";
import assert from "node:assert/strict";
import { addBooks } from "../../../scripts/memory-books.mjs";

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
