import test from "node:test";
import assert from "node:assert/strict";
import { readdir, mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  convertContent,
  exportHtml,
  loadPost,
} from "../scripts/substack/content.mjs";
import {
  createClient,
  syncPost,
  syncSlug,
} from "../scripts/substack/client.mjs";

const sourceUrl = "https://naveenbandarage.com/blog/example";
const post = {
  slug: "example",
  sourceUrl,
  title: "Example",
  subtitle: "Subtitle",
  document: convertContent("Hello **world**.", sourceUrl),
};

// Models draft saves separately from publication, and records every request.
function fixture({
  existing,
  listings = {},
  failReadback = false,
  scheduled = [],
  failPublish = false,
} = {}) {
  const requests = [];
  let draft = existing ? structuredClone(existing) : undefined;
  const client = {
    origin: "https://example.substack.com",
    async request(method, endpoint, body) {
      requests.push({ method, endpoint, body });
      if (endpoint.startsWith("/post_management/")) {
        const status = endpoint.split("/").pop().split("?")[0];
        return listings[status] || { posts: [], total: 0 };
      }
      if (endpoint.endsWith("/scheduled_release")) return scheduled;
      if (endpoint === "/drafts" && method === "POST") {
        draft = {
          ...body,
          id: 42,
          is_published: false,
          draft_updated_at: "2026-11-19T12:00:00Z",
        };
        return draft;
      }
      if (endpoint.endsWith("/publish")) {
        if (failPublish) return { id: 42, is_published: false };
        draft.is_published = true;
        return draft;
      }
      if (endpoint === "/image")
        return {
          url: "https://substackcdn.com/image/upload/test.jpg",
          imageWidth: 1110,
          imageHeight: 666,
        };
      if (method === "PUT") {
        Object.assign(draft, body);
        return draft;
      }
      if (method === "GET")
        return failReadback
          ? { ...draft, draft_title: "Not saved" }
          : structuredClone(draft);
      throw new Error(`Unexpected ${method} ${endpoint}`);
    },
  };
  return {
    client,
    requests,
    writes: () => requests.filter((request) => request.method !== "GET"),
  };
}

test("exports every current MDX post without losing supported blocks", async () => {
  for (const filename of await readdir("posts")) {
    if (!filename.endsWith(".mdx")) continue;
    const loaded = await loadPost(filename);
    assert.ok(loaded.document.content.length > 1, filename);
    assert.equal(
      loaded.document.content.at(-1).content[0].marks[0].attrs.href,
      loaded.sourceUrl,
    );
    assert.match(
      exportHtml(loaded),
      /Originally published on naveenbandarage.com/,
    );
  }
});

test("converts rich text, references, code, lists, relative links and static BlogImage", () => {
  const content =
    '## Heading\n\n**Bold** and *italic* with `code`, [link](/about), [reference][ref].\n\n[ref]: https://example.com\n\n3. Third\n4. Fourth\n\n> Quoted\n\n```js\nconst x = \'<hello>\';\n```\n\n---\n\n<BlogImage src="/blog/test.png" alt="A photo" width={640} height="480" />';
  const document = convertContent(content, sourceUrl);
  const html = exportHtml({
    ...post,
    document,
    title: "<script>alert(1)</script>",
  });
  assert.match(html, /<h2>Heading<\/h2>/);
  assert.match(html, /<strong>Bold<\/strong>/);
  assert.match(html, /<em>italic<\/em>/);
  assert.match(html, /href="https:\/\/naveenbandarage.com\/about"/);
  assert.match(html, /<ol start="3">/);
  assert.match(html, /<blockquote><p>Quoted/);
  assert.match(html, /&lt;hello&gt;/);
  assert.match(html, /src="https:\/\/naveenbandarage.com\/blog\/test.png"/);
  assert.match(html, /width="640" height="480"/);
  assert.ok(!html.includes("<script>alert(1)</script>"));
  assert.equal(
    document.content.find((node) => node.type === "highlighted_code_block")
      .attrs.language,
    "js",
  );
});

test("splits inline images into valid Substack block images", () => {
  const document = convertContent("Before ![alt](/a.jpg) after", sourceUrl);
  assert.deepEqual(
    document.content.slice(0, 3).map((node) => node.type),
    ["paragraph", "captionedImage", "paragraph"],
  );
});

test("rejects unsupported MDX and unsafe URL protocols instead of discarding content", () => {
  for (const content of [
    "<Unknown />",
    "{1 + 1}",
    "export const x = 1",
    '<BlogImage src={getImage()} alt="test" />',
    "<BlogImage {...props} />",
    "[click](javascript:alert)",
    "![image](data:image/png;base64,abc)",
  ]) {
    assert.throws(() => convertContent(content, sourceUrl), undefined, content);
  }
});

test("rejects paths outside posts/", async () => {
  for (const filename of ["../README", "posts/example", "..", "a\\b"])
    await assert.rejects(loadPost(filename), /filename/);
});

test("default sync creates a draft, reads it back, and never publishes", async () => {
  const mock = fixture();
  const ids = [];
  const result = await syncPost(post, {
    client: mock.client,
    userId: "123",
    onTarget: async (id) => ids.push(id),
  });
  assert.deepEqual(ids, [42]);
  assert.equal(result.id, 42);
  assert.equal(result.mode, "draft");
  assert.equal(mock.writes().length, 1);
  assert.equal(mock.writes()[0].body.should_send_email, false);
  assert.equal(mock.writes()[0].body.slug, syncSlug(post));
});

test("reruns find the stable slug and update the same ID after a title change", async () => {
  const mock = fixture({
    existing: { id: 42, is_published: false, slug: syncSlug(post) },
    listings: {
      drafts: { posts: [{ id: 42, slug: syncSlug(post) }], total: 1 },
    },
  });
  const result = await syncPost(
    { ...post, title: "New title" },
    { client: mock.client },
  );
  assert.equal(result.id, 42);
  assert.equal(mock.writes().length, 1);
  assert.equal(mock.writes()[0].method, "PUT");
  assert.equal(mock.writes()[0].body.draft_title, "New title");
});

test("frontmatter IDs update hand-created posts without changing their slug or audience", async () => {
  const mock = fixture({
    existing: {
      id: 42,
      is_published: true,
      slug: "original-slug",
      audience: "only_paid",
      draft_updated_at: "timestamp",
    },
  });
  const result = await syncPost(
    { ...post, substackId: 42 },
    { client: mock.client, mode: "publish" },
  );
  assert.equal(result.wasPublished, true);
  assert.equal(mock.writes()[0].body.draft_updated_at, "timestamp");
  assert.ok(!("slug" in mock.writes()[0].body));
  assert.ok(!("audience" in mock.writes()[0].body));
  assert.deepEqual(mock.writes().at(-1), {
    method: "POST",
    endpoint: "/drafts/42/publish",
    body: { send: false },
  });
});

test("first publish requires explicit email intent and writes it before publishing", async () => {
  const mock = fixture();
  await syncPost(post, {
    client: mock.client,
    userId: 123,
    mode: "publish",
    sendEmail: true,
  });
  assert.equal(mock.writes()[0].body.should_send_email, true);
  assert.deepEqual(mock.writes().at(-1).body, { send: true });
});

test("rejects emailing an already published post, scheduled posts, and conflicting IDs before writes", async () => {
  const published = fixture({ existing: { id: 42, is_published: true } });
  await assert.rejects(
    syncPost(post, {
      client: published.client,
      existingId: 42,
      mode: "publish",
      sendEmail: true,
    }),
    /already published/,
  );
  assert.equal(published.writes().length, 0);
  const scheduled = fixture({
    existing: { id: 42, is_published: false },
    scheduled: [{ trigger_at: "tomorrow" }],
  });
  await assert.rejects(
    syncPost(post, { client: scheduled.client, existingId: 42 }),
    /scheduled/,
  );
  assert.equal(scheduled.writes().length, 0);
  await assert.rejects(
    syncPost(
      { ...post, substackId: 42 },
      { client: published.client, existingId: 43 },
    ),
    /disagrees/,
  );
  await assert.rejects(
    syncPost(post, { client: published.client, sendEmail: true }),
    /publish mode/,
  );
});

test("a failed save verification prevents publication and a bad publish result fails", async () => {
  const save = fixture({ failReadback: true });
  await assert.rejects(
    syncPost(post, { client: save.client, userId: 123, mode: "publish" }),
    /read-back verification/,
  );
  assert.ok(
    !save.requests.some((request) => request.endpoint.endsWith("/publish")),
  );
  const publish = fixture({ failPublish: true });
  await assert.rejects(
    syncPost(post, { client: publish.client, userId: 123, mode: "publish" }),
    /could not be verified/,
  );
});

test("refuses incomplete or ambiguous matching rather than creating duplicates", async () => {
  const capped = fixture({
    listings: { drafts: { posts: [], total: 10, isCapped: true } },
  });
  await assert.rejects(
    syncPost(post, { client: capped.client, userId: 123 }),
    /reliably list/,
  );
  assert.equal(capped.writes().length, 0);
  const duplicate = fixture({
    listings: {
      drafts: {
        posts: [
          { id: 42, slug: syncSlug(post) },
          { id: 43, slug: syncSlug(post) },
        ],
        total: 2,
      },
    },
  });
  await assert.rejects(
    syncPost(post, { client: duplicate.client, userId: 123 }),
    /Multiple/,
  );
  assert.equal(duplicate.writes().length, 0);
});

test("invalid pinned IDs fail before any API request", async () => {
  const mock = fixture();
  for (const substackId of [0, null, "invalid", -1]) {
    await assert.rejects(
      syncPost({ ...post, substackId }, { client: mock.client, userId: 123 }),
      /positive integer/,
    );
  }
  assert.equal(mock.requests.length, 0);
});

test("read-back allows editor attributes but rejects missing content", async () => {
  for (const removeContent of [false, true]) {
    const mock = fixture();
    const request = mock.client.request;
    mock.client.request = async (method, endpoint, body) => {
      const result = await request(method, endpoint, body);
      if (method === "GET" && endpoint === "/drafts/42") {
        const doc = JSON.parse(result.draft_body);
        doc.attrs = { schemaVersion: "v1" };
        doc.content[0].attrs = { textAlign: null };
        if (removeContent) doc.content.pop();
        result.draft_body = JSON.stringify(doc);
      }
      return result;
    };
    const operation = syncPost(post, {
      client: mock.client,
      userId: 123,
      mode: "publish",
    });
    if (removeContent) {
      await assert.rejects(operation, /read-back verification/);
      assert.ok(
        !mock.requests.some((request) => request.endpoint.endsWith("/publish")),
      );
    } else assert.equal((await operation).mode, "publish");
  }
});

test("matching paginates past the first hundred posts", async () => {
  const mock = fixture({
    existing: { id: 42, is_published: false, slug: syncSlug(post) },
  });
  const request = mock.client.request;
  let pages = 0;
  mock.client.request = async (method, endpoint, body) => {
    if (endpoint.startsWith("/post_management/drafts")) {
      pages++;
      return {
        posts: endpoint.includes("offset=0&")
          ? Array.from({ length: 100 }, (_, id) => ({
              id: id + 100,
              slug: "other",
            }))
          : [{ id: 42, slug: syncSlug(post) }],
        total: 101,
      };
    }
    return request(method, endpoint, body);
  };
  assert.equal((await syncPost(post, { client: mock.client })).id, 42);
  assert.equal(pages, 2);
});

test("uploads local BlogImage bytes to Substack before saving", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "substack-image-"));
  try {
    await mkdir(path.join(root, "public"));
    await writeFile(
      path.join(root, "public", "pixel.gif"),
      Buffer.from(
        "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        "base64",
      ),
    );
    const loaded = {
      ...post,
      document: convertContent(
        '<BlogImage src="/pixel.gif" alt="Pixel" width={1} height={1} />',
        sourceUrl,
      ),
    };
    const mock = fixture();
    await syncPost(loaded, { client: mock.client, root, userId: 123 });
    assert.equal(mock.writes()[0].endpoint, "/image");
    assert.match(mock.writes()[0].body.image, /^data:image\/gif;base64,/);
    const doc = JSON.parse(
      mock.writes().find((request) => request.endpoint === "/drafts").body
        .draft_body,
    );
    assert.equal(
      doc.content.find((node) => node.type === "captionedImage").content[0]
        .attrs.src,
      "https://substackcdn.com/image/upload/test.jpg",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("image symlinks cannot read files outside public/", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "substack-test-"));
  try {
    await mkdir(path.join(root, "public"));
    await writeFile(path.join(root, "private.jpg"), "private");
    const { symlink } = await import("node:fs/promises");
    await symlink(
      path.join(root, "private.jpg"),
      path.join(root, "public", "photo.jpg"),
    );
    const mock = fixture();
    await assert.rejects(
      syncPost(
        { ...post, document: convertContent("![alt](/photo.jpg)", sourceUrl) },
        { client: mock.client, root, userId: 123 },
      ),
      /inside public/,
    );
    assert.equal(mock.writes().length, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("API auth, redirects, non-JSON, transport failures and API errors fail without exposing secrets or retrying", async () => {
  const env = {
    SUBSTACK_PUBLICATION_URL: "https://example.substack.com",
    SUBSTACK_SESSION_TOKEN: "secret-token",
  };
  for (const response of [
    new Response("secret-token", { status: 403 }),
    new Response("<html>secret-token</html>"),
    Response.json({ errors: ["secret-token"] }),
  ]) {
    let calls = 0;
    const client = createClient(env, async (_url, options) => {
      calls++;
      assert.equal(options.redirect, "error");
      assert.equal(options.headers.Cookie, "substack.sid=secret-token");
      return response;
    });
    await assert.rejects(
      client.request("POST", "/drafts", {}),
      (error) => !error.message.includes("secret-token"),
    );
    assert.equal(calls, 1);
  }
  await assert.rejects(
    createClient(env, async () => {
      throw new Error("secret-token");
    }).request("GET", "/drafts"),
    /may have completed/,
  );
  assert.throws(
    () =>
      createClient({
        ...env,
        SUBSTACK_PUBLICATION_URL: "https://attacker.example",
      }),
    /PUBLICATION_URL/,
  );
  assert.throws(
    () =>
      createClient({ ...env, SUBSTACK_SESSION_TOKEN: "token; other=value" }),
    /value only/,
  );
});
