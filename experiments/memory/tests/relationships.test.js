import test from "node:test";
import assert from "node:assert/strict";
import { relationshipsFor } from "../src/relationships.js";
import { validateMemory } from "../src/memory.js";

const makeStore = () =>
  validateMemory({
    nodes: [
      {
        id: "a",
        type: "memory",
        title: "Urban images",
        content: "Photographic composition studies daylight reflections.",
        tags: ["photography", "light"],
      },
      {
        id: "b",
        type: "memory",
        title: "Paint studies",
        content: "Photographic composition studies daylight reflections.",
        tags: ["photography", "light"],
      },
      {
        id: "c",
        type: "memory",
        title: "Unrelated",
        content: "Baking sourdough bread.",
      },
    ],
    edges: [],
  });

test("topic hints follow actual content and disappear when that content changes", () => {
  const store = makeStore();
  const hints = relationshipsFor(store);
  assert.equal(hints.length, 1);
  assert.equal(hints[0].type, "shared_topics");
  assert.match(hints[0].reason, /inferred connection/);
  store.nodes[1].tags = [];
  // Still matches the rare words in the source content, independently of tags.
  assert.equal(relationshipsFor(store).length, 1);
  store.nodes[1].content = "Bread and butter.";
  assert.equal(relationshipsFor(store).length, 0);
});

test("explicit edges win; archived endpoints and generic repeated topics create no hints", () => {
  const store = makeStore();
  store.edges.push({
    from: "a",
    to: "b",
    type: "may_connect",
    reason: "Editorial connection.",
  });
  assert.equal(relationshipsFor(store).length, 1);
  assert.equal(validateMemory(store).edges[0].reason, "Editorial connection.");
  store.nodes[1].archived_at = "2026-10-30";
  assert.equal(relationshipsFor(store).length, 0);
  const many = validateMemory({
    nodes: Array.from({ length: 200 }, (_, i) => ({
      id: `n${i}`,
      type: "memory",
      title: "Repeated",
      content: "Photographic composition studies daylight reflections.",
      tags: ["photography", "light"],
    })),
  });
  assert.equal(relationshipsFor(many).length, 0);
});
