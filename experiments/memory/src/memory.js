export const SCHEMA_VERSION = 1;
export const ROOT_ID = "memory-root";
const date = (day, hour = "12:00") => `2026-10-${day}T${hour}:00-04:00`;
export function demoMemory() {
  const folder = (id, title, parent = null, day = 20) => ({
    id,
    title,
    type: "folder",
    parent,
    created_at: date(day),
  });
  const source = (id, title, content, day) => ({
    id,
    title,
    type: "source",
    parent: "episodes",
    content,
    created_at: date(day),
    kind: "conversation",
  });
  const memory = (id, title, parent, content, source_ids, day, extra = {}) => ({
    id,
    title,
    type: "memory",
    parent,
    content,
    source_ids,
    created_at: date(day),
    status: "active",
    scope: "Memory explorer",
    evidence: "Explicit instruction",
    ...extra,
  });
  return {
    version: 1,
    agent: { id: "demo-agent", name: "Orchid", demo: true },
    nodes: [
      folder("projects", "projects/"),
      folder("preferences", "preferences/"),
      folder("episodes", "episodes/"),
      folder("explorer", "memory-explorer/", "projects"),
      memory(
        "three",
        "use-three-js.md",
        "explorer",
        "Use Three.js for the visualization. Preserve the white Finder window and organic, lime-green particle branches.",
        ["conversation-three"],
        21,
        { tags: ["rendering", "library", "three.js", "WebGL"] },
      ),
      memory(
        "provenance",
        "keep-the-sources.md",
        "projects",
        "Every extracted memory should link to the original message or document. A correction should preserve the previous version.",
        ["conversation-memory"],
        22,
        { tags: ["evidence", "history", "source", "provenance"] },
      ),
      memory(
        "organic",
        "organic-branches.md",
        "explorer",
        "Keep the original mossy branches, generous white space, and small file labels. Opening a folder should grow its branch.",
        ["conversation-style"],
        24,
        { tags: ["design", "style", "appearance"] },
      ),
      folder("retrieval", "recall/", "explorer", 23),
      memory(
        "trace",
        "trace-retrieval.md",
        "retrieval",
        "Show which memories a retrieval operation returned, the matching terms, and the supporting sources. Do not present a decorative animation as an agent reasoning trace.",
        ["conversation-memory"],
        23,
        { tags: ["search", "retrieval", "recall"] },
      ),
      memory(
        "budget",
        "local-neighborhood.md",
        "retrieval",
        "Expand one neighborhood at a time. Keep labels and particle geometry bounded, even when the stored memory contains thousands of records.",
        ["conversation-scale"],
        25,
        { tags: ["scale", "performance", "graph"] },
      ),
      memory(
        "calm",
        "quiet-interface.md",
        "preferences",
        "Use a calm, white interface with thin gray icons. Keep the moss-green highlights for branches, selection, and recall.",
        ["conversation-style"],
        24,
        { tags: ["design", "style", "white", "interface"], pinned: true },
      ),
      memory(
        "camera",
        "mostly-flat-camera.md",
        "preferences",
        "Use a mostly flat camera. Keep labels readable and allow dragging, scrolling, and touch gestures.",
        ["conversation-style"],
        24,
        { tags: ["camera", "zoom", "navigation"] },
      ),
      memory(
        "old-renderer",
        "canvas-experiment.md",
        "explorer",
        "Try a 2D canvas for the branch renderer.",
        ["conversation-early"],
        20,
        {
          status: "superseded",
          valid_to: date(21),
          superseded_by: "three",
          tags: ["rendering", "library"],
        },
      ),
      source(
        "conversation-early",
        "initial-experiment.txt",
        "Early experiment: try a 2D canvas for the branch renderer. This was replaced by the Three.js decision.",
        20,
      ),
      source(
        "conversation-three",
        "rendering-choice.txt",
        "Use Three.js for the visualization. The original uses Three.js too.",
        21,
      ),
      source(
        "conversation-memory",
        "memory-brief.txt",
        "Build a knowledge graph for an agent’s memory. Each memory should keep its evidence, and we should be able to inspect what was recalled.",
        22,
      ),
      source(
        "conversation-style",
        "design-direction.txt",
        "Keep the same design style as the original: white Finder window, lime-green particle branches, and quiet file labels.",
        24,
      ),
      source(
        "conversation-scale",
        "scaling-notes.md",
        "Use progressive expansion and bounded visible neighborhoods. The full memory store should not become a single giant scene.",
        25,
      ),
    ],
    edges: [
      { from: "three", to: "conversation-three", type: "supported_by" },
      { from: "provenance", to: "conversation-memory", type: "supported_by" },
      { from: "organic", to: "calm", type: "related_to" },
      { from: "three", to: "old-renderer", type: "supersedes" },
      { from: "trace", to: "provenance", type: "depends_on" },
      { from: "budget", to: "trace", type: "related_to" },
    ],
    recalls: [],
  };
}
export function validateRecallQuery(query) {
  if (typeof query !== "string") return "";
  if (query.length > 2000)
    throw Error(
      "Recall queries can contain up to 2,000 characters. Shorten your query and try again.",
    );
  return query;
}

export function validateMemory(input) {
  if (!input || typeof input !== "object" || !Array.isArray(input.nodes))
    throw Error("Use a memory JSON export with a nodes array.");
  if (input.version !== undefined && input.version !== 1)
    throw Error("This export version is not supported. Use version 1.");
  if (input.nodes.length > 10000)
    throw Error(
      "An export can contain up to 10,000 records. Split larger exports by agent or project.",
    );
  const ids = new Set(),
    types = new Set(["folder", "memory", "source", "entity"]);
  const text = (v, max = 100000) => {
    if (typeof v !== "string") return "";
    if (v.length > max)
      throw Error(
        `A text field exceeds the ${max.toLocaleString("en-US")}-character limit. Shorten it or split the document before importing. Nothing was imported.`,
      );
    return v;
  };
  const stamp = (v, fallback) => {
    if (v === undefined || v === null || v === "") return fallback;
    if (typeof v !== "string" || !Number.isFinite(Date.parse(v)))
      throw Error("Every timestamp must be a valid date string.");
    return new Date(v).toISOString();
  };
  const normalized = input.nodes.map((n) => {
    if (
      !n ||
      typeof n.id !== "string" ||
      !n.id.trim() ||
      n.id.length > 160 ||
      ids.has(n.id) ||
      ["__proto__", "constructor", "prototype"].includes(n.id)
    )
      throw Error(
        "Each record needs a unique, nonempty id (up to 160 characters).",
      );
    ids.add(n.id);
    if (!types.has(n.type)) throw Error(`Unsupported record type for ${n.id}.`);
    if (typeof n.title !== "string" || !n.title.trim())
      throw Error(`Add a title to ${n.id}.`);
    const created = stamp(n.created_at, "1970-01-01T00:00:00.000Z");
    const revisions = Array.isArray(n.revisions)
      ? n.revisions
          .map((r) => ({
            at: stamp(r.at, created),
            content: text(r.content),
            source_ids: Array.isArray(r.source_ids)
              ? r.source_ids.filter((x) => typeof x === "string")
              : [],
            status: ["active", "inferred", "disputed", "superseded"].includes(
              r.status,
            )
              ? r.status
              : "active",
          }))
          .sort((a, b) => a.at.localeCompare(b.at))
      : [];
    return {
      id: n.id,
      title: text(n.title, 200),
      type: n.type,
      parent:
        n.parent === null || n.parent === undefined
          ? null
          : text(n.parent, 160),
      content: text(n.content),
      created_at: created,
      source_ids: Array.isArray(n.source_ids)
        ? [...new Set(n.source_ids.filter((x) => typeof x === "string"))]
        : [],
      status: ["active", "inferred", "disputed", "superseded"].includes(
        n.status,
      )
        ? n.status
        : "active",
      scope: text(n.scope, 200) || "This agent",
      evidence: text(n.evidence, 200) || "Imported record",
      tags: Array.isArray(n.tags)
        ? n.tags
            .filter((x) => typeof x === "string")
            .slice(0, 30)
            .map((x) => x.slice(0, 80))
        : [],
      pinned: n.pinned === true,
      valid_to: stamp(n.valid_to, null),
      archived_at: stamp(n.archived_at, null),
      superseded_by: text(n.superseded_by, 160) || null,
      revisions,
      kind: text(n.kind, 100),
    };
  });
  const byId = new Map(normalized.map((n) => [n.id, n]));
  for (const n of normalized) {
    if (n.parent && !byId.has(n.parent))
      throw Error(`Unknown parent for ${n.id}.`);
    if (n.parent && byId.get(n.parent).type !== "folder")
      throw Error(`The parent of ${n.id} must be a folder.`);
    const seen = new Set([n.id]);
    let p = n.parent;
    while (p) {
      if (seen.has(p)) throw Error("Folder relationships cannot form a cycle.");
      seen.add(p);
      p = byId.get(p)?.parent;
    }
    for (const id of [
      ...n.source_ids,
      ...n.revisions.flatMap((r) => r.source_ids),
    ])
      if (byId.get(id)?.type !== "source")
        throw Error(`Unknown source ${id} for ${n.id}.`);
    if (n.superseded_by && !byId.has(n.superseded_by))
      throw Error(`Unknown replacement for ${n.id}.`);
  }
  const edges = (Array.isArray(input.edges) ? input.edges : []).map((e) => {
    if (!byId.has(e.from) || !byId.has(e.to))
      throw Error("Every relationship must refer to existing record ids.");
    return { from: e.from, to: e.to, type: text(e.type, 80) || "related_to" };
  });
  if (edges.length > 50000)
    throw Error("An export can contain up to 50,000 relationships.");
  const recalls = (Array.isArray(input.recalls) ? input.recalls : [])
    .slice(-200)
    .map((r) => ({
      id: text(r.id, 160) || crypto.randomUUID(),
      query: validateRecallQuery(r.query),
      at: stamp(r.at, new Date().toISOString()),
      method: text(r.method, 100) || "Imported retrieval log",
      results: (Array.isArray(r.results) ? r.results : [])
        .filter((x) => byId.has(x.id))
        .slice(0, 100)
        .map((x) => ({
          id: x.id,
          score: Number.isFinite(x.score) ? x.score : 0,
          terms: Array.isArray(x.terms)
            ? x.terms.filter((t) => typeof t === "string").slice(0, 30)
            : [],
          ...(x.snapshot && typeof x.snapshot === "object"
            ? {
                snapshot: {
                  title: text(x.snapshot.title, 200),
                  content: text(x.snapshot.content),
                  source_ids: Array.isArray(x.snapshot.source_ids)
                    ? x.snapshot.source_ids.filter(
                        (id) => byId.get(id)?.type === "source",
                      )
                    : [],
                  status: text(x.snapshot.status, 80),
                },
              }
            : {}),
        })),
    }));
  return {
    version: 1,
    agent: {
      id: text(input.agent?.id, 160) || "imported-agent",
      name: text(input.agent?.name, 100) || "My agent",
      demo: input.agent?.demo === true,
    },
    nodes: normalized,
    edges,
    recalls,
  };
}
export function memoryAt(node, asOf = Infinity) {
  if (
    Date.parse(node.created_at) > asOf ||
    (node.archived_at && Date.parse(node.archived_at) <= asOf)
  )
    return null;
  const revision = (node.revisions || [])
    .filter((r) => Date.parse(r.at) <= asOf)
    .at(-1);
  const current = revision ? { ...node, ...revision } : node;
  const superseded =
    node.valid_to &&
    Date.parse(node.valid_to) <= asOf &&
    (!revision || Date.parse(revision.at) < Date.parse(node.valid_to));
  return {
    ...current,
    status: superseded
      ? "superseded"
      : !revision && node.valid_to && node.status === "superseded"
        ? "active"
        : current.status,
  };
}
export function retrieve(store, query, asOf = Infinity) {
  const stop = new Set([
    "a",
    "an",
    "the",
    "what",
    "which",
    "is",
    "are",
    "was",
    "were",
    "do",
    "does",
    "did",
    "we",
    "i",
    "to",
    "for",
    "of",
    "and",
    "in",
    "it",
    "how",
    "should",
    "use",
    "with",
    "our",
    "my",
    "agent",
    "remember",
    "about",
  ]);
  const terms = [
    ...new Set(query.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []),
  ].filter((t) => t.length > 1 && !stop.has(t));
  return store.nodes
    .map((n) => memoryAt(n, asOf))
    .filter(
      (n) =>
        n &&
        n.type === "memory" &&
        !["superseded", "disputed"].includes(n.status),
    )
    .map((n) => {
      const title = n.title.toLowerCase(),
        content = n.content.toLowerCase(),
        tags = n.tags.join(" ").toLowerCase();
      const hits = terms.filter((t) =>
        `${title} ${content} ${tags}`.includes(t),
      );
      return {
        id: n.id,
        terms: hits,
        score:
          hits.reduce(
            (s, t) =>
              s +
              (title.includes(t) ? 4 : 0) +
              (tags.includes(t) ? 3 : 0) +
              (content.includes(t) ? 1 : 0),
            0,
          ) + (hits.length && n.pinned ? 0.5 : 0),
      };
    })
    .filter((r) => r.terms.length)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}
export function markdownMemory(text, filename) {
  const now = new Date().toISOString(),
    stem = filename.replace(/\.(md|markdown|txt)$/i, ""),
    parts = text.split(/^#{1,6}\s+(.+)$/m),
    nodes = [
      { id: "imported", title: stem + "/", type: "folder", created_at: now },
      { id: "episodes", title: "sources/", type: "folder", created_at: now },
      {
        id: "source-file",
        title: filename,
        type: "source",
        parent: "episodes",
        content: text,
        created_at: now,
        kind: "document",
      },
    ];
  if (parts.length === 1)
    nodes.push({
      id: "memory-1",
      title: stem + ".md",
      type: "memory",
      parent: "imported",
      content: text,
      created_at: now,
      source_ids: ["source-file"],
      evidence: "Imported document",
    });
  else {
    if (parts[0].trim())
      nodes.push({
        id: "memory-intro",
        title: "introduction.md",
        type: "memory",
        parent: "imported",
        content: parts[0].trim(),
        created_at: now,
        source_ids: ["source-file"],
      });
    for (let i = 1; i < parts.length; i += 2)
      nodes.push({
        id: `memory-${i}`,
        title: parts[i].trim() + ".md",
        type: "memory",
        parent: "imported",
        content: (parts[i + 1] || "").trim() || parts[i],
        created_at: now,
        source_ids: ["source-file"],
        evidence: "Document section",
      });
  }
  return validateMemory({
    version: 1,
    agent: { id: crypto.randomUUID(), name: stem },
    nodes,
    edges: [],
    recalls: [],
  });
}
const DB = "literal-memory-grove";
function database() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore("state");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function readMemory() {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const req = db.transaction("state").objectStore("state").get("memory");
      req.onsuccess = () => {
        try {
          resolve(req.result ? validateMemory(req.result) : null);
        } catch (error) {
          reject(error);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}
export async function saveMemory(store) {
  // Never replace a readable workspace with unchecked runtime data.
  const validated = validateMemory(store);
  const db = await database();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction("state", "readwrite");
      tx.objectStore("state").put(validated, "memory");
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

// Imported workspaces may use arbitrary ids. Reuse the evidence folder we create.
export function ensureSourceFolder(store, now) {
  let folder = store.nodes.find(
    (node) =>
      node.type === "folder" &&
      !node.archived_at &&
      (["episodes", "sources"].includes(node.id) ||
        (node.parent === null && node.title === "sources/")),
  );
  if (!folder) {
    folder = {
      id: "sources-" + crypto.randomUUID(),
      title: "sources/",
      type: "folder",
      parent: null,
      created_at: now,
    };
    store.nodes.push(folder);
  }
  return folder;
}
