import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { siteUrl } from "./content.mjs";

// Undocumented endpoints: keep this adapter separate from content conversion.
// Reference: https://github.com/marcomoauro/substack-mcp/tree/main/src/api/substack
export function createClient(env = process.env, fetchImpl = fetch) {
  const url = new URL(
    env.SUBSTACK_PUBLICATION_URL || "https://invalid.example",
  );
  if (
    url.protocol !== "https:" ||
    !/^[a-z0-9-]+\.substack\.com$/.test(url.hostname) ||
    url.port ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "Set SUBSTACK_PUBLICATION_URL to https://your-publication.substack.com (no path).",
    );
  }
  const token = env.SUBSTACK_SESSION_TOKEN;
  if (!token || /[;\s]/.test(token))
    throw new Error(
      "Set SUBSTACK_SESSION_TOKEN to the session cookie value only.",
    );
  const cookieName = env.SUBSTACK_COOKIE_NAME || "substack.sid";
  if (!["substack.sid", "connect.sid"].includes(cookieName))
    throw new Error(
      "SUBSTACK_COOKIE_NAME must be substack.sid or connect.sid.",
    );
  return {
    origin: url.origin,
    async request(method, endpoint, body) {
      let response;
      try {
        response = await fetchImpl(`${url.origin}/api/v1${endpoint}`, {
          method,
          redirect: "error",
          signal: AbortSignal.timeout(30_000),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Cookie: `${cookieName}=${token}`,
            Origin: url.origin,
            Referer: `${url.origin}/publish/posts`,
          },
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        });
      } catch {
        throw new Error(
          `Substack ${method} request failed. Check the dashboard before retrying; the operation may have completed.`,
        );
      }
      // Never print response bodies: auth failures can contain session information.
      if (!response.ok)
        throw new Error(
          `Substack ${method} returned HTTP ${response.status}.${[401, 403].includes(response.status) ? " Refresh SUBSTACK_SESSION_TOKEN; Substack may also block GitHub-hosted runners. Use the HTML export if it persists." : " Check the dashboard before retrying."}`,
        );
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Substack returned non-JSON content. Check the session or use the HTML export.",
        );
      }
      if (!data || data.error || data.errors?.length)
        throw new Error(
          "Substack returned an API error. Check the dashboard before retrying.",
        );
      return data;
    },
  };
}

export function postId(value) {
  if (!/^[1-9]\d*$/.test(String(value)) || !Number.isSafeInteger(Number(value)))
    throw new Error("Substack post ID must be a positive integer.");
  return Number(value);
}

export function syncSlug(post) {
  const prefix =
    post.slug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 70) || "post";
  return `${prefix}-${createHash("sha256").update(post.sourceUrl).digest("hex").slice(0, 10)}`;
}

// Substack can add editor attributes and reorder JSON keys when saving.
// Require every authored field and every content node, while allowing those additions.
function matchesSaved(actual, expected) {
  if (Array.isArray(expected))
    return (
      Array.isArray(actual) &&
      actual.length === expected.length &&
      expected.every((value, index) => matchesSaved(actual[index], value))
    );
  if (expected && typeof expected === "object")
    return (
      actual &&
      typeof actual === "object" &&
      Object.entries(expected).every(([key, value]) =>
        matchesSaved(actual[key], value),
      )
    );
  return actual === expected;
}

async function findExisting(client, slug) {
  const ids = new Set();
  for (const status of ["drafts", "published", "scheduled"]) {
    for (let offset = 0; ; offset += 100) {
      const order = status === "published" ? "post_date" : "draft_updated_at";
      const page = await client.request(
        "GET",
        `/post_management/${status}?limit=100&offset=${offset}&order_by=${order}&order_direction=desc`,
      );
      if (
        !Array.isArray(page.posts) ||
        page.isCapped ||
        !Number.isInteger(page.total)
      )
        throw new Error(
          "Cannot reliably list Substack posts. Supply an existing post ID instead.",
        );
      for (const item of page.posts)
        if (item.slug === slug) ids.add(postId(item.id));
      if (offset + page.posts.length >= page.total) break;
      if (!page.posts.length || offset >= 100_000)
        throw new Error(
          "Substack pagination did not complete. Supply an existing post ID.",
        );
    }
  }
  if (ids.size > 1)
    throw new Error(
      "Multiple Substack posts match this source. Supply the intended post ID.",
    );
  return [...ids][0];
}

async function rehostImages(document, client, root) {
  const result = structuredClone(document);
  const cache = new Map();
  async function walk(node) {
    if (node.type === "image2") {
      const src = node.attrs.src;
      const url = new URL(src);
      if (
        url.hostname === "substack-post-media.s3.amazonaws.com" ||
        url.hostname === "substackcdn.com" ||
        url.hostname.endsWith(".substackcdn.com")
      )
        return;
      if (!cache.has(src)) {
        if (url.origin !== siteUrl)
          throw new Error(
            "Automatic sync supports local public/ images and Substack-hosted images. Save external images in public/blog/ first, or use the HTML export.",
          );
        const publicDir = await realpath(path.join(root, "public"));
        const filename = await realpath(
          path.join(publicDir, decodeURIComponent(url.pathname)),
        );
        if (!filename.startsWith(publicDir + path.sep))
          throw new Error("Image must be inside public/.");
        const bytes = await readFile(filename);
        if (bytes.length > 10 * 1024 * 1024)
          throw new Error("Substack images must be 10 MB or smaller.");
        const meta = await sharp(bytes).metadata();
        const mime = {
          jpeg: "image/jpeg",
          png: "image/png",
          webp: "image/webp",
          gif: "image/gif",
        }[meta.format];
        if (!mime)
          throw new Error("Use JPEG, PNG, WebP or GIF images for Substack.");
        const uploaded = await client.request("POST", "/image", {
          image: `data:${mime};base64,${bytes.toString("base64")}`,
        });
        const uploadedUrl = new URL(uploaded.url);
        if (
          uploadedUrl.protocol !== "https:" ||
          !(
            uploadedUrl.hostname === "substack-post-media.s3.amazonaws.com" ||
            uploadedUrl.hostname === "substackcdn.com" ||
            uploadedUrl.hostname.endsWith(".substackcdn.com")
          )
        )
          throw new Error("Substack returned an unexpected image URL.");
        cache.set(src, {
          src: uploadedUrl.href,
          width: uploaded.imageWidth || meta.width,
          height: uploaded.imageHeight || meta.height,
        });
      }
      Object.assign(node.attrs, cache.get(src));
    }
    for (const child of node.content || []) await walk(child);
  }
  await walk(result);
  return result;
}

export async function syncPost(
  post,
  {
    client,
    mode = "draft",
    existingId,
    sendEmail = false,
    userId,
    root = process.cwd(),
    onTarget = () => {},
  },
) {
  if (!["draft", "publish"].includes(mode))
    throw new Error("Sync mode must be draft or publish.");
  if (sendEmail && mode !== "publish")
    throw new Error("Email is only available with publish mode.");
  const slug = syncSlug(post);
  const inputId = existingId === "" ? undefined : existingId;
  const specifiedId = inputId !== undefined ? inputId : post.substackId;
  const hasSpecifiedId = specifiedId !== undefined;
  if (
    inputId !== undefined &&
    post.substackId !== undefined &&
    postId(inputId) !== postId(post.substackId)
  )
    throw new Error("Input post ID disagrees with substack_id in frontmatter.");
  let id = hasSpecifiedId
    ? postId(specifiedId)
    : await findExisting(client, slug);
  let current;
  if (id) {
    await onTarget(id);
    current = await client.request("GET", `/drafts/${id}`);
    if (postId(current.id) !== id || typeof current.is_published !== "boolean")
      throw new Error("Substack returned an unexpected draft shape.");
    const scheduled = await client.request(
      "GET",
      `/drafts/${id}/scheduled_release`,
    );
    if (!Array.isArray(scheduled) || scheduled.length)
      throw new Error(
        "This post is scheduled or its scheduling state is unknown. Unschedule it in Substack before syncing.",
      );
    if (current.is_published && sendEmail)
      throw new Error(
        "This post is already published. Update it with email disabled to avoid sending it twice.",
      );
  } else {
    postId(userId); // Validate before uploading any images or creating a draft.
  }
  const document = await rehostImages(post.document, client, root);
  const fields = {
    draft_title: post.title,
    draft_subtitle: post.subtitle,
    draft_body: JSON.stringify(document),
    should_send_email: sendEmail,
    ...(current?.draft_updated_at
      ? { draft_updated_at: current.draft_updated_at }
      : {}),
  };
  if (id) await client.request("PUT", `/drafts/${id}`, fields);
  else {
    const created = await client.request("POST", "/drafts", {
      ...fields,
      slug,
      type: "newsletter",
      audience: "everyone",
      section_chosen: true,
      draft_section_id: null,
      draft_bylines: [{ id: postId(userId), is_guest: false }],
    });
    id = postId(created.id);
    await onTarget(id); // Record the ID before further operations, including publish.
  }
  const saved = await client.request("GET", `/drafts/${id}`);
  let savedBody;
  try {
    savedBody =
      typeof saved.draft_body === "string"
        ? JSON.parse(saved.draft_body)
        : saved.draft_body;
  } catch {
    /* handled below */
  }
  if (
    saved.draft_title !== post.title ||
    saved.draft_subtitle !== post.subtitle ||
    !matchesSaved(savedBody, document) ||
    saved.should_send_email !== sendEmail
  ) {
    throw new Error(
      `Substack post ${id} failed read-back verification. Review it in the dashboard; nothing was published by this run.`,
    );
  }
  if (!hasSpecifiedId && saved.slug !== slug)
    throw new Error(
      `Substack did not preserve the sync slug. Save substack_id: ${id} in the post frontmatter before rerunning.`,
    );
  if (mode === "publish") {
    // POST is the current dashboard operation; do not retry mutating requests automatically.
    const published = await client.request("POST", `/drafts/${id}/publish`, {
      send: sendEmail,
    });
    if (published.is_published !== true || postId(published.id) !== id)
      throw new Error(
        `Publish result for ${id} could not be verified. Check Substack before retrying.`,
      );
  }
  return {
    id,
    editorUrl: `${client.origin}/publish/post/${id}`,
    mode,
    wasPublished: current?.is_published === true,
  };
}
