import test from "node:test";
import assert from "node:assert/strict";
import {
  demoMemory,
  validateMemory,
  memoryAt,
  retrieve,
  markdownMemory,
} from "../src/memory.js";
import { projectMemory, LABEL_BUDGET } from "../src/graph-model.js";

test("branches grow outward from a shared center without moving existing domains", () => {
  const data = validateMemory(demoMemory());
  const closed = projectMemory(data);
  const opened = projectMemory(data, { expanded: ["projects", "explorer"] });
  const origin = opened.nodes.find((n) => n.type === "origin");
  assert.deepEqual([origin.x, origin.y], [0, 0]);
  for (const node of closed.nodes) {
    const same = opened.nodes.find((n) => n.id === node.id);
    assert.deepEqual([same.x, same.y], [node.x, node.y]);
  }
  const domains = closed.nodes.filter((n) => n.type === "folder");
  assert.ok(domains.some((n) => n.x < -100));
  assert.ok(domains.some((n) => n.x > 100));
  assert.ok(domains.some((n) => n.y > 100));
  for (const branch of opened.branches) {
    const node = opened.nodes.find((n) => `branch:${n.id}` === branch.id);
    const parent = opened.nodes.find((n) => n.id === node.parent) || origin;
    assert.deepEqual(branch.points[0], [parent.x, parent.y]);
    assert.deepEqual(branch.points.at(-1), [node.x, node.y]);
    assert.ok(Math.hypot(node.x, node.y) > Math.hypot(parent.x, parent.y));
  }
});

test("rejects broken provenance, cyclic folders, duplicate ids and invalid dates", () => {
  const data = demoMemory();
  data.nodes.find((n) => n.id === "three").source_ids = ["missing"];
  assert.throws(() => validateMemory(data), /Unknown source/);
  const cyclic = demoMemory();
  cyclic.nodes[0].parent = "explorer";
  assert.throws(() => validateMemory(cyclic), /cycle/);
  const duplicate = demoMemory();
  duplicate.nodes.push(duplicate.nodes[0]);
  assert.throws(() => validateMemory(duplicate), /unique/);
  const dated = demoMemory();
  dated.nodes[0].created_at = "not a date";
  assert.throws(() => validateMemory(dated), /timestamp/);
});
test("historical validity and corrections preserve earlier claims and sources", () => {
  const data = validateMemory(demoMemory()),
    old = data.nodes.find((n) => n.id === "old-renderer");
  assert.equal(
    memoryAt(old, Date.parse("2026-10-20T23:00:00Z")).status,
    "active",
  );
  assert.equal(memoryAt(old).status, "superseded");
  const n = data.nodes.find((n) => n.id === "three");
  n.revisions = [
    {
      at: "2026-10-29T15:00:00Z",
      content: "Updated rendering instruction",
      source_ids: ["conversation-style"],
      status: "inferred",
    },
  ];
  assert.equal(memoryAt(n, Date.parse("2026-10-22")).content, n.content);
  assert.equal(memoryAt(n).content, "Updated rendering instruction");
  assert.deepEqual(memoryAt(n).source_ids, ["conversation-style"]);
  n.archived_at = "2026-10-29T16:00:00Z";
  assert.ok(memoryAt(n, Date.parse("2026-10-29T15:30:00Z")));
  assert.equal(memoryAt(n), null);
});
test("retrieval returns supported matching memories and excludes superseded claims", () => {
  const data = validateMemory(demoMemory()),
    result = retrieve(data, "Which rendering library should we use?");
  assert.equal(result[0].id, "three");
  assert.ok(result[0].terms.includes("rendering"));
  assert.ok(!result.some((r) => r.id === "old-renderer"));
  assert.deepEqual(retrieve(data, "quasarflamingozzz"), []);
});
test("Markdown sections retain the full original file as evidence", () => {
  const input = "# Project\nUse Three.js.\n## Preferences\nWhite interface.";
  const data = markdownMemory(input, "MEMORY.md");
  assert.equal(data.nodes.find((n) => n.type === "source").content, input);
  assert.equal(data.nodes.filter((n) => n.type === "memory").length, 2);
  for (const n of data.nodes.filter((n) => n.type === "memory"))
    assert.deepEqual(n.source_ids, ["source-file"]);
});
test("a 5,000-memory export keeps scene work bounded and every page reachable", () => {
  const nodes = [
    { id: "root", title: "memories/", type: "folder" },
    ...Array.from({ length: 5000 }, (_, i) => ({
      id: "m" + i,
      title: "memory-" + i + ".md",
      type: "memory",
      parent: "root",
      content: "record " + i,
    })),
  ];
  const data = validateMemory({ nodes, edges: [] });
  const first = projectMemory(data, { expanded: ["root"] });
  assert.ok(first.nodes.length < LABEL_BUDGET);
  assert.ok(first.nodes.some((n) => n.id === "m0"));
  assert.ok(first.nodes.some((n) => n.type === "more"));
  const later = projectMemory(data, {
    expanded: ["root"],
    pages: { root: 834 },
  });
  assert.ok(later.nodes.some((n) => n.id === "m4999"));
  const cycle = projectMemory(data, {
    expanded: ["root"],
    pages: { root: 835 },
  });
  assert.ok(cycle.nodes.length < LABEL_BUDGET);
});
test("corrected provenance changes with the snapshot while original evidence remains historical", () => {
  const data = validateMemory(demoMemory()),
    n = data.nodes.find((n) => n.id === "three");
  n.revisions = [
    {
      at: "2026-10-29T15:00:00Z",
      content: "New instruction",
      source_ids: ["conversation-style"],
      status: "active",
    },
  ];
  const options = { expanded: ["projects", "explorer", "episodes"] };
  const latest = projectMemory(data, options);
  assert.ok(
    !latest.edges.some(
      (e) =>
        e.from === "three" &&
        e.to === "conversation-three" &&
        e.type === "supported_by",
    ),
  );
  assert.ok(
    latest.edges.some(
      (e) =>
        e.from === "three" &&
        e.to === "conversation-style" &&
        e.type === "supported_by",
    ),
  );
  const earlier = projectMemory(data, {
    ...options,
    asOf: Date.parse("2026-10-25T20:00:00Z"),
  });
  assert.ok(
    earlier.edges.some(
      (e) =>
        e.from === "three" &&
        e.to === "conversation-three" &&
        e.type === "supported_by",
    ),
  );
});
