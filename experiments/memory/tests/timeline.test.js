import test from "node:test";
import assert from "node:assert/strict";
import {
  validateMemory,
  memoryAt,
  UNKNOWN_MEMORY_DATE,
} from "../src/memory.js";
import { displayDate, memoryTimeline } from "../src/timeline.js";

test("timeline uses dated changes while keeping undated records as context", () => {
  const store = validateMemory({
    nodes: [
      { id: "folder", type: "folder", title: "Writing" },
      {
        id: "undated",
        type: "memory",
        title: "Undated note",
        content: "Original",
        revisions: [{ at: "2026-10-30T16:00:00Z", content: "Revised" }],
      },
      {
        id: "post",
        type: "memory",
        title: "New post",
        parent: "folder",
        created_at: "2026-11-23",
        source_ids: ["source"],
        valid_to: "2026-11-24",
        archived_at: "2026-11-25",
      },
      {
        id: "source",
        type: "source",
        title: "Post source",
        created_at: "2026-11-23",
      },
    ],
  });
  const snapshots = memoryTimeline(store);
  assert.deepEqual(
    snapshots.map(({ time, summary }) => [displayDate(time), summary]),
    [
      ["Oct 30, 2026", "Corrected “Undated note”"],
      ["Nov 23, 2026", "Added “New post”"],
      ["Nov 24, 2026", "Superseded “New post”"],
      ["Nov 25, 2026", "Archived “New post”"],
    ],
  );
  assert.equal(displayDate(UNKNOWN_MEMORY_DATE), "Undated");
  assert.equal(memoryAt(store.nodes[1], snapshots[0].time).content, "Revised");
  assert.equal(memoryAt(store.nodes[2], snapshots[0].time), null);
  assert.equal(memoryAt(store.nodes[2], snapshots[1].time).title, "New post");
  assert.equal(memoryAt(store.nodes[2], snapshots[3].time), null);
  assert.deepEqual(memoryTimeline({ nodes: [store.nodes[0]] }), []);
});
