import assert from "node:assert/strict";
import { test } from "bun:test";
import { randomUUID } from "node:crypto";
import { createEngagementHandler } from "../pages/api/blog-engagement/[slug]";
import { EngagementConflictError } from "../lib/blogEngagement";
function setup() {
  const documents = new Map();
  let revision = 0;
  const store = {
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
  return {
    store,
    handler: createEngagementHandler({
      getStore: () => store,
      isPublished: async (slug) => slug === "people-who've-replied-to-me",
    }),
  };
}
async function request(handler, options = {}) {
  const req = {
    method: "GET",
    query: { slug: "people-who've-replied-to-me" },
    headers: { host: "localhost:3000", "content-type": "application/json" },
    cookies: {},
    socket: { remoteAddress: randomUUID() },
    ...options,
  };
  const result = {
    status: 200,
    body: null,
    headers: {},
  };
  const res = {
    setHeader(name, value) {
      result.headers[name] = value;
      return this;
    },
    status(status) {
      result.status = status;
      return this;
    },
    json(body) {
      result.body = body;
      return this;
    },
  };
  await handler(req, res);
  return result;
}
test("API establishes a private reader cookie and exposes only public counts", async () => {
  const { handler } = setup();
  const initial = await request(handler);
  assert.equal(initial.status, 200);
  assert.match(initial.headers["Set-Cookie"], /HttpOnly; SameSite=Lax/);
  assert.match(initial.headers["Set-Cookie"], /Path=\/api\/blog-engagement/);
  assert.equal(initial.headers["Cache-Control"], "private, no-store");
  const cookie = initial.headers["Set-Cookie"].split(";")[0].split("=")[1];
  const cookies = { blog_reader_v1: cookie };
  const view = await request(handler, {
    method: "POST",
    cookies,
    body: { type: "view" },
  });
  assert.equal(view.body.views, 1);
  const duplicateView = await request(handler, {
    method: "POST",
    cookies,
    body: { type: "view" },
  });
  assert.equal(duplicateView.body.views, 1);
  const reaction = await request(handler, {
    method: "POST",
    cookies,
    body: { type: "reaction", reaction: "heart", active: true },
  });
  assert.equal(reaction.body.counts.heart, 1);
  assert.deepEqual(reaction.body.selected, ["heart"]);
  const other = await request(handler, {
    cookies: { blog_reader_v1: randomUUID() },
  });
  assert.equal(other.body.counts.heart, 1);
  assert.deepEqual(other.body.selected, []);
  assert.deepEqual(Object.keys(other.body).sort(), [
    "counts",
    "selected",
    "views",
  ]);
});
test("invalid methods, posts and reaction payloads cannot mutate storage", async () => {
  const { handler } = setup();
  assert.equal((await request(handler, { method: "DELETE" })).status, 405);
  assert.equal(
    (await request(handler, { query: { slug: "../../drafts/private" } }))
      .status,
    404,
  );
  assert.equal(
    (await request(handler, { query: { slug: ["a", "b"] } })).status,
    400,
  );
  for (const body of [
    null,
    [],
    { type: "other" },
    { type: "reaction", reaction: "__proto__", active: true },
    { type: "reaction", reaction: "heart", active: "true" },
  ]) {
    assert.equal(
      (await request(handler, { method: "POST", body })).status,
      400,
    );
  }
  assert.equal(
    (
      await request(handler, {
        method: "POST",
        headers: { host: "localhost:3000", "content-type": "text/plain" },
        body: { type: "view" },
      })
    ).status,
    415,
  );
  assert.equal((await request(handler)).body.views, 0);
});
test("cross-site requests and writes without a reader cookie are rejected", async () => {
  const { handler } = setup();
  assert.equal(
    (
      await request(handler, {
        headers: { host: "localhost:3000", origin: "https://attacker.example" },
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request(handler, {
        headers: { host: "localhost:3000", "sec-fetch-site": "cross-site" },
      })
    ).status,
    403,
  );
  assert.equal(
    (await request(handler, { method: "POST", body: { type: "view" } })).status,
    400,
  );
});
test("the API reports storage failure and does not return fake totals", async () => {
  const handler = createEngagementHandler({
    getStore() {
      throw new Error("Not configured");
    },
    isPublished: async () => true,
  });
  const result = await request(handler);
  assert.equal(result.status, 503);
  assert.ok(result.body.error);
  assert.equal(result.body.views, undefined);
});
test("rate limiting returns retry guidance", async () => {
  const { handler } = setup();
  const socket = { remoteAddress: randomUUID() };
  for (let i = 0; i < 90; i++)
    assert.equal((await request(handler, { socket })).status, 200);
  const result = await request(handler, { socket });
  assert.equal(result.status, 429);
  assert.ok(result.headers["Retry-After"] > 0);
});
