import assert from "node:assert/strict";
import { test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  EngagementConflictError,
  engagementKey,
  engagementSummary,
  readerKey,
  updateEngagement,
} from "../lib/blogEngagement";
import {
  localEngagementStore,
  getEngagementStore,
} from "../lib/blogEngagementStore";
export function memoryStore() {
  const documents = new Map();
  let revision = 0;
  return {
    async read(key) {
      return structuredClone(documents.get(key) ?? null);
    },
    async write(key, document, etag) {
      if ((documents.get(key)?.etag ?? null) !== etag)
        throw new EngagementConflictError();
      documents.set(key, {
        document: structuredClone(document),
        etag: String(++revision),
      });
    },
  };
}
const today = new Date("2026-11-27T18:00:00Z");
const react = (reaction, active = true) => ({
  type: "reaction",
  reaction,
  active,
});
test("reactions persist for independent readers, can coexist, and undo safely", async () => {
  const store = memoryStore();
  await updateEngagement(store, "post", "reader-a", react("heart"));
  await updateEngagement(store, "post", "reader-a", react("idea"));
  const shared = await updateEngagement(
    store,
    "post",
    "reader-b",
    react("heart"),
  );
  assert.deepEqual(shared.counts, { heart: 2, clap: 0, idea: 1, thinking: 0 });
  assert.deepEqual(shared.selected, ["heart"]);
  await updateEngagement(store, "post", "reader-a", react("heart", false));
  const document = (await store.read(engagementKey("post"))).document;
  assert.deepEqual(engagementSummary(document, "reader-a").selected, ["idea"]);
  assert.equal(document.counts.heart, 1);
  assert.deepEqual(engagementSummary(document, "reader-b").selected, ["heart"]);
});
test("duplicate add, remove, and view requests are idempotent", async () => {
  const store = memoryStore();
  for (let i = 0; i < 3; i++) {
    await updateEngagement(store, "post", "reader", react("clap"));
    await updateEngagement(store, "post", "reader", { type: "view" }, today);
  }
  for (let i = 0; i < 3; i++)
    await updateEngagement(store, "post", "reader", react("clap", false));
  const state = (await store.read(engagementKey("post"))).document;
  assert.equal(state.views, 1);
  assert.equal(state.counts.clap, 0);
  assert.deepEqual(state.reactions, {});
});
test("views deduplicate per post/browser/UTC day and discard older daily hashes", async () => {
  const store = memoryStore();
  await updateEngagement(store, "post", "reader-a", { type: "view" }, today);
  await updateEngagement(store, "post", "reader-b", { type: "view" }, today);
  await updateEngagement(
    store,
    "other-post",
    "reader-a",
    { type: "view" },
    today,
  );
  const tomorrow = new Date("2026-11-28T00:00:00Z");
  const summary = await updateEngagement(
    store,
    "post",
    "reader-a",
    { type: "view" },
    tomorrow,
  );
  assert.equal(summary.views, 3);
  const state = (await store.read(engagementKey("post"))).document;
  assert.deepEqual(state.viewers, { "reader-a": true });
  assert.equal(
    (await store.read(engagementKey("other-post"))).document.views,
    1,
  );
});
test("concurrent creation and updates retain every reader's reactions and views", async () => {
  const store = memoryStore();
  await Promise.all(
    Array.from({ length: 12 }, (_, i) =>
      updateEngagement(store, "post", `reader-${i}`, react("heart")),
    ),
  );
  await Promise.all(
    Array.from({ length: 12 }, (_, i) =>
      updateEngagement(store, "post", `reader-${i}`, { type: "view" }, today),
    ),
  );
  const state = (await store.read(engagementKey("post"))).document;
  assert.equal(state.counts.heart, 12);
  assert.equal(state.views, 12);
  // Replaying overlapping requests from one reader also stays idempotent.
  await Promise.all(
    Array.from({ length: 4 }, () =>
      updateEngagement(store, "post", "same-reader", react("idea")),
    ),
  );
  assert.equal(
    (await store.read(engagementKey("post"))).document.counts.idea,
    1,
  );
});
test("storage failures propagate without inventing a successful save", async () => {
  const store = memoryStore();
  store.write = async () => {
    throw new Error("Storage offline");
  };
  await assert.rejects(
    updateEngagement(store, "post", "reader", react("heart")),
    /Storage offline/,
  );
  assert.equal(await store.read(engagementKey("post")), null);
});
test("public summaries exclude identifiers and hashes cannot correlate posts", async () => {
  const store = memoryStore();
  const id = readerKey("post", "browser-id");
  const summary = await updateEngagement(store, "post", id, react("heart"));
  assert.deepEqual(Object.keys(summary).sort(), [
    "counts",
    "selected",
    "views",
  ]);
  assert.ok(!JSON.stringify(summary).includes(id));
  assert.notEqual(
    readerKey("post", "browser-id"),
    readerKey("another", "browser-id"),
  );
  assert.match(engagementKey("people-who've-replied-to-me"), /^[a-f0-9]{64}$/);
});
test("local preview persists across store instances and rejects stale writes", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "blog-engagement-"));
  try {
    const first = localEngagementStore(directory);
    const second = localEngagementStore(directory);
    await updateEngagement(first, "post", "reader-a", react("clap"));
    const stale = await first.read(engagementKey("post"));
    await updateEngagement(second, "post", "reader-b", react("clap"));
    assert.equal(
      (await first.read(engagementKey("post"))).document.counts.clap,
      2,
    );
    await assert.rejects(
      second.write(engagementKey("post"), stale.document, stale.etag),
      EngagementConflictError,
    );
    await Promise.all(
      Array.from({ length: 8 }, (_, i) =>
        updateEngagement(
          i % 2 ? first : second,
          "post",
          `reader-${i}`,
          { type: "view" },
          today,
        ),
      ),
    );
    assert.equal((await first.read(engagementKey("post"))).document.views, 8);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
test("production never falls back to local storage without configuration", () => {
  const environment = { ...process.env };
  try {
    process.env.NODE_ENV = "production";
    delete process.env.BLOG_ENGAGEMENT_BLOB_READ_WRITE_TOKEN;
    assert.throws(getEngagementStore, /not configured/);
  } finally {
    process.env.NODE_ENV = environment.NODE_ENV;
    if (environment.BLOG_ENGAGEMENT_BLOB_READ_WRITE_TOKEN)
      process.env.BLOG_ENGAGEMENT_BLOB_READ_WRITE_TOKEN =
        environment.BLOG_ENGAGEMENT_BLOB_READ_WRITE_TOKEN;
  }
});
