import assert from "node:assert/strict";
import { test } from "node:test";
import { getLinkPreview } from "../lib/linkPreview.ts";

const current = "https://naveenbandarage.com/about";
function link(href, attributes = {}) {
  return {
    href: new URL(href, current).href,
    textContent: "Example link",
    getAttribute: (name) =>
      name === "href" ? href : (attributes[name] ?? null),
    hasAttribute: (name) => Object.hasOwn(attributes, name),
    closest: () => (attributes.disabled ? {} : null),
  };
}

test("malformed mail encoding does not break preview events", () => {
  const preview = getLinkPreview(link("mailto:hello%ZZ@example.com"), current);
  assert.equal(preview.summary, "hello%ZZ@example.com");
  assert.equal(preview.screenshot, undefined);
});

test("query-dependent destinations never capture a different page or expose their query", () => {
  for (const href of [
    "https://example.com/watch?v=123",
    "https://example.com/read?token=private-token",
    "https://www.google.com/maps?q=40,-70",
    "/blog?year=2025",
  ]) {
    const preview = getLinkPreview(link(href), current);
    assert.equal(preview.screenshot, undefined, href);
    assert.equal(preview.url, new URL(href, current).href);
    assert.ok(!preview.summary.includes("private-token"));
  }
});

test("tracking-only queries and fragments are removed from screenshot requests", () => {
  const preview = getLinkPreview(
    link("https://example.com/article?utm_source=test&si=tracking#section"),
    current,
  );
  const request = new URL(preview.screenshot);
  assert.equal(request.searchParams.get("url"), "https://example.com/article");
});

test("same-page, download, disabled, and non-web links keep their native behavior", () => {
  for (const [href, attributes] of [
    ["#section"],
    ["/about#section"],
    ["/about"],
    ["/file.zip", { download: "" }],
    ["/blog", { disabled: true }],
    ["tel:123"],
  ]) {
    assert.equal(getLinkPreview(link(href, attributes), current), null);
  }
});

test("credentials and private hosts are not sent to the screenshot service", () => {
  assert.equal(
    getLinkPreview(link("https://user:password@example.com/"), current),
    null,
  );
  for (const href of [
    "http://localhost:3000/page",
    "http://192.168.1.5/",
    "http://home.local/",
    "http://[::1]/",
  ]) {
    assert.equal(getLinkPreview(link(href), current).screenshot, undefined);
  }
});

test("internal links retain useful titles and a published-page preview", () => {
  // Resolve this test anchor against the local page, as browsers do.
  const local = { ...link("/blog"), href: "http://localhost:3000/blog" };
  const localPreview = getLinkPreview(local, "http://localhost:3000/about");
  assert.equal(localPreview.title, "Writing");
  assert.equal(
    new URL(localPreview.screenshot).searchParams.get("url"),
    "https://naveenbandarage.com/blog",
  );
});
