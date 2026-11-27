import assert from "node:assert/strict";
import { test } from "bun:test";
import {
  openBlogEngagement,
  requestEngagement,
} from "../lib/blogEngagementClient";

const summary = {
  views: 1,
  counts: { heart: 0, clap: 0, idea: 0, thinking: 0 },
  selected: [],
};

test("overlapping initial loads share the cookie handshake before counting a view", async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];
  let finishHandshake;
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    if (options.method === "GET")
      await new Promise((resolve) => {
        finishHandshake = resolve;
      });
    return Response.json(summary);
  };
  try {
    const first = openBlogEngagement("a post");
    const second = openBlogEngagement("a post");
    assert.equal(first, second);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].options.method, "GET");
    assert.equal(requests[0].url, "/api/blog-engagement/a%20post");
    finishHandshake();
    await Promise.all([first, second]);
    assert.equal(requests.length, 2);
    assert.equal(requests[1].options.method, "POST");
    assert.deepEqual(JSON.parse(requests[1].options.body), { type: "view" });
    assert.equal(requests[1].options.credentials, "same-origin");
    assert.equal(requests[1].options.cache, "no-store");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("a failed load can be retried and an unsuccessful save never becomes a fake success", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("Unavailable", { status: 503 });
  try {
    await assert.rejects(openBlogEngagement("retry-post"));
    globalThis.fetch = async () => Response.json(summary);
    assert.deepEqual(await openBlogEngagement("retry-post"), summary);
    globalThis.fetch = async () =>
      new Response("Too many requests", { status: 429 });
    await assert.rejects(
      requestEngagement("retry-post", {
        type: "reaction",
        reaction: "heart",
        active: true,
      }),
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
