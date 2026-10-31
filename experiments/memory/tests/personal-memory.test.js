import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { demoMemory, validateMemory, retrieve } from "../src/memory.js";
import { initialWorkspace } from "../src/personal-memory.js";
import { projectMemory, revealMemory } from "../src/graph-model.js";

const seed = validateMemory(
  JSON.parse(
    readFileSync(
      new URL("../public/naveen-memory.json", import.meta.url),
      "utf8",
    ),
  ),
);

test("personal tree preserves evidence and distinguishes creative hypotheses", () => {
  const threads = seed.nodes.filter((n) => n.tags.includes("connection"));
  assert.equal(threads.length, 6);
  for (const node of seed.nodes.filter((n) => n.type === "memory")) {
    assert.ok(node.source_ids.length);
    assert.ok(node.evidence);
  }
  for (const thread of threads) {
    assert.equal(thread.status, "inferred");
    assert.match(thread.content, /not a confirmed personal fact/);
    const related = seed.edges.filter((e) => e.from === thread.id);
    assert.ok(related.length >= 3);
    assert.ok(related.every((e) => e.type === "may_connect"));
    const options = revealMemory(seed, thread.id);
    const graph = projectMemory(seed, {
      ...options,
      expanded: [...options.expanded],
    });
    assert.ok(graph.nodes.some((n) => n.id === thread.id));
  }
  assert.ok(retrieve(seed, "Monet").some((r) => r.id === "monet"));
  assert.equal(
    projectMemory(seed).nodes.filter((n) => n.type === "folder").length,
    6,
  );
});

test("new visitors and untouched starters receive personal interests without overwriting edits", () => {
  const fresh = initialWorkspace(null, seed);
  assert.equal(fresh.agent.id, seed.agent.id);
  assert.notEqual(fresh, seed);
  assert.equal(
    initialWorkspace(validateMemory(demoMemory()), seed).agent.id,
    seed.agent.id,
  );
  const edited = validateMemory(demoMemory());
  edited.nodes.find((n) => n.id === "three").pinned = true;
  assert.equal(initialWorkspace(edited, seed), edited);
  const imported = validateMemory({ agent: { id: "my-agent" }, nodes: [] });
  assert.equal(initialWorkspace(imported, seed), imported);
  assert.equal(initialWorkspace(edited, undefined), edited);
});

test("ordinary interests connect directly, with undiscovered destinations routed to closed branches", () => {
  const options = { expanded: ["making"] };
  const before = structuredClone(options);
  const graph = projectMemory(seed, options);
  assert.deepEqual(options, before);
  assert.ok(!graph.nodes.some((n) => n.id === "photography"));
  assert.ok(
    graph.nodes.find((n) => n.id === "interfaces").hiddenConnections > 0,
  );
  assert.ok(graph.nodes.find((n) => n.id === "craft").hiddenConnections > 0);
  const partial = graph.edges.find(
    (e) => e.originalFrom === "interfaces" && e.originalTo === "objects",
  );
  assert.ok(partial.partial);
  assert.equal(partial.from, "interfaces");
  assert.equal(partial.to, "craft");
  const uncovered = projectMemory(seed, { expanded: ["making", "craft"] });
  const full = uncovered.edges.find(
    (e) => e.originalFrom === "interfaces" && e.originalTo === "objects",
  );
  assert.equal(full.partial, false);
  assert.equal(full.to, "objects");
  assert.ok(
    seed.edges.filter(
      (e) => !e.from.startsWith("thread:") && !e.to.startsWith("thread:"),
    ).length >= 30,
  );
});
