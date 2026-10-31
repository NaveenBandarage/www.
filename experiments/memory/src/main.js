import "./style.css";
import { revealMemory } from "./graph-model.js";
import { TreeView } from "./tree-view.js";
import {
  demoMemory,
  validateMemory,
  memoryAt,
  markdownMemory,
  readMemory,
  saveMemory,
  ensureSourceFolder,
  validateRecallQuery,
} from "./memory.js";

const $ = (s) => document.querySelector(s);
const worker = new Worker(new URL("./memory.worker.js", import.meta.url), {
  type: "module",
});
const pending = new Map();
let serial = 0;
worker.onmessage = ({ data }) => {
  const p = pending.get(data.id);
  if (!p) return;
  clearTimeout(p.timer);
  pending.delete(data.id);
  data.error ? p.reject(Error(data.error)) : p.resolve(data.result);
};
worker.onerror = () => {
  for (const p of pending.values()) {
    clearTimeout(p.timer);
    p.reject(
      Error(
        "The memory worker could not start. Reload this page to try again.",
      ),
    );
  }
  pending.clear();
};
function request(type, payload = {}) {
  return new Promise((resolve, reject) => {
    const id = ++serial,
      timer = setTimeout(() => {
        pending.delete(id);
        reject(Error("Memory processing took too long. Try a smaller export."));
      }, 20000);
    pending.set(id, { resolve, reject, timer });
    worker.postMessage({ id, type, ...payload });
  });
}
const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "America/New_York",
});
const displayDate = (value) =>
  Number.isFinite(Date.parse(value))
    ? dateFormat.format(new Date(value))
    : "Unknown";
let store,
  byId = new Map(),
  expanded = new Set(),
  pages = {},
  asOf = Infinity,
  times = [],
  selected = null,
  currentRecall = null,
  editing = null,
  pendingImport = null,
  projectionSerial = 0,
  querySerial = 0,
  saveQueue = Promise.resolve(),
  lastFocused = null;
const view = new TreeView($("#viewport"), {
  onSelect: (id) => run(() => inspect(id)),
  onFolder: (n) => run(() => toggleFolder(n)),
  onMore: (n) => {
    const key = n.parent ?? "__roots";
    pages[key] = (pages[key] || 1) + 1;
    run(redraw);
  },
  onZoom: (z) => ($("#zoom-status").textContent = z + "%"),
});
function notice(message, action = null) {
  $("#notice").replaceChildren(document.createTextNode(message));
  if (action)
    addButton($("#notice"), action.label, action.run, "notice-action");
  $("#notice").hidden = !message;
}
function run(action) {
  return Promise.resolve()
    .then(action)
    .catch((e) => notice(e.message));
}
function current(id) {
  const n = byId.get(id);
  return n ? memoryAt(n, asOf) : null;
}
function refreshIndex() {
  byId = new Map(store.nodes.map((n) => [n.id, n]));
}
function ancestry(id) {
  const found = [];
  let n = byId.get(id);
  while (n) {
    found.unshift(n);
    n = byId.get(n.parent);
  }
  return found;
}
function reveal(id) {
  ({ expanded, pages } = revealMemory(store, id, { expanded, pages, asOf }));
}
function saveView() {
  try {
    localStorage.setItem(
      "memory-view",
      JSON.stringify({ agent: store.agent.id, expanded: [...expanded], pages }),
    );
  } catch {
    /* Memory itself remains in IndexedDB. */
  }
}
function persist() {
  const snapshot = structuredClone(store);
  saveQueue = saveQueue
    .catch(() => {})
    .then(() => saveMemory(snapshot))
    .catch((e) => {
      notice(
        "Changes are visible, but this browser could not save them. Export a copy to keep them.",
      );
      throw e;
    });
  saveQueue.catch(() => {});
  return saveQueue;
}
async function sync() {
  refreshIndex();
  await request("init", { store });
  updateTimeline();
  await redraw();
}
async function redraw() {
  if (!store) return;
  const token = ++projectionSerial,
    result = await request("project", {
      options: { expanded: [...expanded], pages, asOf },
    });
  if (token !== projectionSerial) return;
  view.setGraph(result, expanded);
  const high = new Set(
    currentRecall?.results.flatMap((r) => [
      r.id,
      ...(current(r.id)?.source_ids || []),
    ]) || [],
  );
  view.setSelection(selected, high);
  $("#item-count").textContent =
    `${result.nodes.filter((n) => n.type !== "origin").length} visible · ${result.total} records${result.limited ? " · view limit" : ""}`;
  $("#agent-label").replaceChildren(document.createTextNode(store.agent.name));
  const label = document.createElement("i");
  label.textContent = store.agent.demo
    ? " · fictional sample"
    : " · browser local";
  $("#agent-label").append(label);
  $("#workspace-caption").textContent =
    asOf === Infinity
      ? "Open a branch. See what grows."
      : `Memory as it was on ${displayDate(new Date(asOf).toISOString())}.`;
  let empty = $(".empty-branches");
  if (!result.nodes.length) {
    if (!empty) {
      empty = document.createElement("div");
      empty.className = "empty-branches";
      empty.textContent = "No memories at this point in time.";
      const button = document.createElement("button");
      button.textContent = "Return to now ↗";
      button.onclick = () => run(() => setTime(Infinity));
      empty.append(button);
      $("#viewport").append(empty);
    }
  } else empty?.remove();
  saveView();
}
async function toggleFolder(n) {
  expanded.has(n.id) ? expanded.delete(n.id) : expanded.add(n.id);
  await redraw();
}
function setMenu(open) {
  $("#options-menu").hidden = !open;
  $("#menu-toggle").setAttribute("aria-expanded", String(open));
}
function closeInspector() {
  selected = null;
  $("#inspector").hidden = true;
  view.setSelection(
    null,
    new Set(
      currentRecall?.results.flatMap((r) => [
        r.id,
        ...(current(r.id)?.source_ids || []),
      ]) || [],
    ),
  );
  if (lastFocused?.isConnected) lastFocused.focus({ preventScroll: true });
}
function openInspector(kind) {
  $("#inspector").hidden = false;
  $("#inspector").scrollTop = 0;
  $("#inspector-kind").textContent = kind;
  $("#inspector-content").className = "inspector-content";
}
function element(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}
function sectionTitle(container, text) {
  container.append(element("h2", "memory-section-title", text));
}
function addButton(container, text, action, cls = "") {
  const b = element("button", cls, text);
  b.type = "button";
  b.onclick = () => run(action);
  container.append(b);
  return b;
}
async function inspect(id, { focus = false } = {}) {
  const n = current(id);
  if (!n) {
    notice(
      "That record does not exist in this snapshot. Return to Now to inspect it.",
    );
    return;
  }
  if (n.type === "folder") {
    reveal(id);
    expanded.add(id);
    await redraw();
    if (focus) view.focus(id);
    return;
  }
  lastFocused = document.activeElement;
  selected = id;
  reveal(id);
  // Expose supporting episodes and immediate related records without expanding the entire graph.
  for (const sid of n.source_ids || []) reveal(sid);
  for (const e of store.edges
    .filter((e) => e.from === id || e.to === id)
    .slice(0, 8)) {
    reveal(e.from);
    reveal(e.to);
  }
  // Related records may share a paginated folder; the selected record wins.
  reveal(id);
  openInspector(
    n.type === "source"
      ? "ORIGINAL SOURCE"
      : n.type === "entity"
        ? "ENTITY"
        : "MEMORY",
  );
  renderInspector(n);
  await redraw();
  if (focus) {
    view.focus(id);
    $("#inspector-close").focus({ preventScroll: true });
  }
}
function renderInspector(n) {
  const c = $("#inspector-content");
  c.replaceChildren();
  const path = element("nav", "memory-path");
  path.setAttribute("aria-label", "Memory location");
  for (const folder of ancestry(n.id).slice(0, -1)) {
    addButton(path, folder.title.replace(/\/$/, ""), async () => {
      closeInspector();
      await inspect(folder.id, { focus: true });
    });
    path.append(element("span", "", "/"));
  }
  if (path.children.length) c.append(path);
  c.append(
    element("h1", "", n.title),
    element("div", "memory-body", n.content || "No content has been added."),
  );
  const dl = element("dl", "memory-meta");
  for (const [label, value] of [
    ["Status", n.status === "active" ? "Active" : n.status],
    ["Scope", n.scope || "This agent"],
    ["Created", displayDate(n.created_at)],
    ["Evidence", n.evidence || "Original source"],
  ]) {
    const group = element("div");
    group.append(element("dt", "", label), element("dd", "", value));
    dl.append(group);
  }
  c.append(dl);
  if (n.status === "superseded" && n.valid_to && Date.parse(n.valid_to) <= asOf)
    c.append(
      element(
        "p",
        "historical-note",
        `Superseded on ${displayDate(n.valid_to)}. Kept here as history; current recall excludes it.`,
      ),
    );
  if (asOf !== Infinity)
    c.append(
      element(
        "p",
        "historical-note",
        "Historical snapshot. Return to Now to add or change memories.",
      ),
    );
  if (n.type !== "source") {
    sectionTitle(c, "Original sources");
    if (!n.source_ids?.length)
      c.append(
        element("p", "recall-explainer", "No original source is attached."),
      );
    for (const sid of n.source_ids || []) {
      const source = current(sid);
      if (!source) {
        c.append(
          element(
            "p",
            "recall-explainer",
            "Source unavailable in this snapshot.",
          ),
        );
        continue;
      }
      const b = addButton(
        c,
        source.title,
        () => inspect(sid, { focus: true }),
        "source-link",
      );
      b.append(
        element(
          "small",
          "",
          `${source.kind || "source"} · ${displayDate(source.created_at)} ↗`,
        ),
      );
      c.append(
        element(
          "blockquote",
          "memory-source-quote",
          source.content.length > 280
            ? source.content.slice(0, 280) + "…"
            : source.content,
        ),
      );
    }
  }
  const related = store.edges
    .filter((e) => e.from === n.id || e.to === n.id)
    .filter((e) => current(e.from) && current(e.to))
    .filter(
      (e) =>
        e.type !== "supported_by" ||
        !byId.get(e.from)?.revisions?.length ||
        current(e.from).source_ids.includes(e.to),
    );
  if (related.length) {
    sectionTitle(c, "Relationships");
    for (const e of related) {
      const other = current(e.from === n.id ? e.to : e.from);
      const b = addButton(
        c,
        other.title,
        () => inspect(other.id, { focus: true }),
        "relationship-link",
      );
      b.append(
        element(
          "small",
          "",
          `${e.from === n.id ? "→" : "←"} ${e.type.replaceAll("_", " ")}`,
        ),
      );
    }
  }
  if (n.type === "source") {
    const memories = store.nodes
      .map((x) => memoryAt(x, asOf))
      .filter((x) => x?.source_ids?.includes(n.id));
    if (memories.length) {
      sectionTitle(c, "Supports these memories");
      for (const item of memories)
        addButton(
          c,
          item.title,
          () => inspect(item.id, { focus: true }),
          "source-link",
        );
    }
  }
  const original = byId.get(n.id);
  if (original.revisions?.length) {
    sectionTitle(c, "Revision history");
    addButton(
      c,
      `${displayDate(original.created_at)} · Original`,
      () => jumpRevision(original.created_at, n.id),
      "revision-link",
    );
    for (const r of original.revisions.filter((r) => Date.parse(r.at) <= asOf))
      addButton(
        c,
        `${displayDate(r.at)} · Correction`,
        () => jumpRevision(r.at, n.id),
        "revision-link",
      );
  }
  const uses = store.recalls.filter(
    (r) => Date.parse(r.at) <= asOf && r.results.some((x) => x.id === n.id),
  );
  if (uses.length) {
    sectionTitle(c, "Retrieved in");
    for (const r of uses.slice(-4).reverse()) {
      const b = addButton(c, r.query, () => showRecall(r), "history-row");
      b.append(element("small", "", `${r.method} · ${displayDate(r.at)}`));
    }
  }
  if (asOf === Infinity) {
    const actions = element("div", "memory-actions");
    if (n.type === "memory") {
      addButton(actions, n.pinned ? "Unpin" : "Pin", async () => {
        original.pinned = !original.pinned;
        await persist();
        await sync();
        renderInspector(current(n.id));
      });
      addButton(actions, "Correct…", () => openEditor(n));
      addButton(
        actions,
        "Archive",
        async () => {
          const archivedAt = new Date().toISOString();
          original.archived_at = archivedAt;
          await persist();
          closeInspector();
          await sync();
          notice("Memory archived. Its history is kept in the timeline.", {
            label: "Undo",
            run: async () => {
              const record = byId.get(n.id);
              if (record?.archived_at !== archivedAt) return;
              record.archived_at = null;
              await persist();
              await sync();
              await inspect(n.id, { focus: true });
              notice("Memory restored.");
            },
          });
        },
        "subtle-action",
      );
    } else
      addButton(actions, "Copy text", async () => {
        try {
          await navigator.clipboard.writeText(n.content);
          notice("Source copied.");
        } catch {
          notice(
            "Copy is unavailable in this browser. Export the workspace to keep the source.",
          );
        }
      });
    c.append(actions);
  }
}
function updateTimeline() {
  times = [
    ...new Set(
      store.nodes
        .flatMap((n) => [
          n.created_at,
          n.valid_to,
          n.archived_at,
          ...(n.revisions || []).map((r) => r.at),
        ])
        .filter(Boolean)
        .map((d) => Date.parse(d)),
    ),
  ].sort((a, b) => a - b);
  const s = $("#time-slider");
  s.max = times.length;
  s.value =
    asOf === Infinity
      ? times.length
      : Math.max(
          0,
          times.findIndex((t) => t === asOf),
        );
  $("#time-label").textContent =
    asOf === Infinity ? "Now" : displayDate(new Date(asOf).toISOString());
  $("#status-date").textContent =
    asOf === Infinity
      ? "Now"
      : displayDate(new Date(asOf).toISOString()).replace(", 2026", "");
}
async function setTime(value) {
  asOf = value;
  querySerial++;
  if (!$(".search-box").hidden) run(updateSearch);
  currentRecall = null;
  $("#recall-strip").hidden = true;
  updateTimeline();
  await redraw();
  if (selected) {
    const n = current(selected);
    if (n) renderInspector(n);
    else closeInspector();
  }
}
async function jumpRevision(at, id) {
  $("#timeline").hidden = false;
  $("#timeline-toggle").setAttribute("aria-expanded", "true");
  await setTime(Date.parse(at));
  await inspect(id);
}
function setSearch(open) {
  $(".search-box").hidden = !open;
  $("#search-toggle").setAttribute("aria-expanded", String(open));
  if (open) {
    $("#search").focus();
    run(updateSearch);
  } else {
    clearTimeout(searchTimer);
    querySerial++;
    if ($(".search-box").contains(document.activeElement))
      $("#search-toggle").focus();
  }
}
let searchTimer;
async function updateSearch() {
  const q = $("#search").value.trim(),
    token = ++querySerial,
    results = $("#search-results");
  results.replaceChildren();
  if (!q) {
    results.append(
      element(
        "p",
        "",
        "Search a title, a phrase, or a tag. ↓ to browse results · Enter to open.",
      ),
    );
    return;
  }
  const ranked = await request("retrieve", { query: q, asOf });
  if (token !== querySerial) return;
  const ids = new Set(ranked.map((r) => r.id));
  const extra = store.nodes
    .map((n) => memoryAt(n, asOf))
    .filter(
      (n) =>
        n && n.title.toLowerCase().includes(q.toLowerCase()) && !ids.has(n.id),
    )
    .slice(0, 5);
  for (const n of [...ranked.map((r) => current(r.id)), ...extra]
    .filter(Boolean)
    .slice(0, 10)) {
    const b = addButton(results, n.title, async () => {
      setSearch(false);
      await inspect(n.id, { focus: true });
    });
    b.append(
      element(
        "small",
        "",
        `${n.type} · ${
          ancestry(n.id)
            .slice(0, -1)
            .map((folder) => folder.title.replace(/\/$/, ""))
            .join(" / ") || store.agent.name
        }`,
      ),
      element("span", "search-excerpt", searchExcerpt(n.content, q)),
    );
  }
  if (!results.children.length)
    results.append(
      element(
        "p",
        "",
        "No matching memories. Try “rendering”, “sources”, or import your own.",
      ),
    );
}
function searchExcerpt(content = "", query) {
  const text = content.replace(/\s+/g, " ").trim();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = terms
    .map((term) => text.toLowerCase().indexOf(term))
    .filter((index) => index >= 0);
  const start = Math.max(0, (matches.length ? Math.min(...matches) : 0) - 35);
  return (
    (start ? "…" : "") +
    text.slice(start, start + 150) +
    (text.length > start + 150 ? "…" : "")
  );
}
$(".search-box").addEventListener("keydown", (event) => {
  if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
  const buttons = [...$("#search-results").querySelectorAll("button")];
  if (!buttons.length) return;
  event.preventDefault();
  const index = buttons.indexOf(document.activeElement);
  const next =
    event.key === "ArrowDown"
      ? (index + 1) % buttons.length
      : index <= 0
        ? buttons.length - 1
        : index - 1;
  buttons[next].focus();
});

async function recall() {
  const q = validateRecallQuery($("#search").value.trim());
  if (!q) {
    $("#search").focus();
    return;
  }
  const results = await request("retrieve", { query: q, asOf });
  if (!results.length) {
    $("#search-results").replaceChildren(
      element("p", "", "No matching memories. No recall was recorded."),
    );
    return;
  }
  const r = {
    id: crypto.randomUUID(),
    query: q,
    at:
      asOf === Infinity
        ? new Date().toISOString()
        : new Date(asOf).toISOString(),
    method:
      asOf === Infinity ? "Local text retrieval" : "Historical text retrieval",
    results: results.map((r) => {
      const n = current(r.id);
      return {
        ...r,
        snapshot: {
          title: n.title,
          content: n.content,
          source_ids: n.source_ids,
          status: n.status,
        },
      };
    }),
  };
  if (asOf === Infinity) {
    store.recalls.push(r);
    store.recalls = store.recalls.slice(-200);
    await persist();
    await request("init", { store });
  }
  setSearch(false);
  await showRecall(r);
}
async function showRecall(r) {
  currentRecall = r;
  selected = null;
  for (const item of r.results) {
    reveal(item.id);
    for (const sid of current(item.id)?.source_ids || []) reveal(sid);
  }
  $("#recall-strip").hidden = false;
  $("#recall-summary").textContent =
    `${r.results.length} recalled · “${r.query.slice(0, 65)}${r.query.length > 65 ? "…" : ""}”`;
  openInspector("RECALL RECORD");
  const c = $("#inspector-content");
  c.replaceChildren();
  c.append(
    element("h1", "recall-query", r.query),
    element(
      "p",
      "recall-explainer",
      `${r.method} · ${displayDate(r.at)}. This records retrieved memories, not an agent’s private reasoning.`,
    ),
  );
  sectionTitle(c, "Retrieved memories");
  for (const result of r.results) {
    const original = byId.get(result.id),
      n = result.snapshot
        ? { ...original, ...result.snapshot }
        : original && memoryAt(original, Math.min(asOf, Date.parse(r.at)));
    if (!n) continue;
    const b = addButton(
      c,
      n.title,
      async () => {
        await setTime(Math.min(asOf, Date.parse(r.at)));
        $("#timeline").hidden = false;
        $("#timeline-toggle").setAttribute("aria-expanded", "true");
        await inspect(result.id, { focus: true });
      },
      "source-link",
    );
    b.append(
      element(
        "small",
        "",
        result.terms.length
          ? `Matched: ${result.terms.join(", ")}`
          : "Imported retrieval result",
      ),
    );
    c.append(
      element(
        "p",
        "recall-explainer",
        n.content.slice(0, 160) + (n.content.length > 160 ? "…" : ""),
      ),
    );
  }
  await redraw();
  view.fit();
}
function showHistory() {
  setMenu(false);
  openInspector("RECALL HISTORY");
  const c = $("#inspector-content");
  c.replaceChildren(element("h1", "", "What was recalled."));
  const runs = store.recalls
    .filter((r) => Date.parse(r.at) <= asOf)
    .slice()
    .reverse();
  if (!runs.length)
    c.append(
      element(
        "p",
        "recall-explainer",
        "No recalls yet. Open search, enter a task or topic, then choose Recall. Imported retrieval logs also appear here.",
      ),
    );
  for (const r of runs) {
    const b = addButton(c, r.query, () => showRecall(r), "history-row");
    b.append(
      element(
        "small",
        "",
        `${r.results.length} memories · ${displayDate(r.at)} · ${r.method}`,
      ),
    );
  }
}
function openImport() {
  setMenu(false);
  pendingImport = null;
  $("#memory-file").value = "";
  $("#import-review").hidden = true;
  $("#import-error").textContent = "";
  $("#import-dialog").showModal();
}
async function importFile(file) {
  if (!file) return;
  if (file.size > 10 * 1024 * 1024)
    throw Error("Choose a file smaller than 10 MB.");
  const text = await file.text();
  pendingImport = /\.json$/i.test(file.name)
    ? validateMemory(JSON.parse(text))
    : markdownMemory(text, file.name);
  $("#import-summary").textContent =
    `${pendingImport.agent.name} · ${pendingImport.nodes.length} records · ${pendingImport.edges.length} relationships`;
  $("#import-review").hidden = false;
}
async function replaceWorkspace(next) {
  await persist();
  store = next;
  expanded = new Set();
  pages = {};
  asOf = Infinity;
  currentRecall = null;
  selected = null;
  $("#recall-strip").hidden = true;
  closeInspector();
  await persist();
  await sync();
  view.fit();
}
function exportMemory() {
  download(
    JSON.stringify(store, null, 2),
    `${store.agent.name.replace(/[^a-z0-9-]/gi, "-")}-memory.json`,
    "application/json",
  );
}
function download(content, name, type) {
  const url = URL.createObjectURL(new Blob([content], { type })),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function openEditor(node = null) {
  if (asOf !== Infinity) {
    notice("Return to Now before changing memory.");
    return;
  }
  setMenu(false);
  editing = node?.id || null;
  $("#edit-kicker").textContent = editing ? "CORRECT A MEMORY" : "NEW MEMORY";
  $("#edit-title").textContent = editing
    ? "Let the memory change."
    : "A new leaf.";
  $("#memory-title").value = node?.title || "";
  $("#memory-title").disabled = !!editing;
  $("#memory-content").value = node?.content || "";
  $("#memory-evidence").value = "";
  $("#memory-status").value = ["inferred", "disputed"].includes(node?.status)
    ? node.status
    : "active";
  $("#edit-error").textContent = "";
  const select = $("#memory-parent");
  select.replaceChildren();
  for (const folder of store.nodes.filter(
    (n) => n.type === "folder" && !n.archived_at,
  )) {
    const o = element(
      "option",
      "",
      ancestry(folder.id)
        .map((n) => n.title.replace(/\/$/, ""))
        .join(" / "),
    );
    o.value = folder.id;
    select.append(o);
  }
  if (!select.options.length) {
    const o = element("option", "", "memories/");
    o.value = "";
    select.append(o);
  }
  select.value = node?.parent || select.options[0].value;
  select.disabled = !!editing;
  $("#edit-dialog").showModal();
}
async function saveEditor() {
  const content = $("#memory-content").value.trim(),
    evidence = $("#memory-evidence").value.trim(),
    title = $("#memory-title").value.trim();
  if (!content || !evidence || !title)
    throw Error("Add a title, memory, and source evidence.");
  const draft = structuredClone(store);
  const now = new Date().toISOString();
  let parent = $("#memory-parent").value;
  if (!parent) {
    parent = "memories-" + crypto.randomUUID();
    draft.nodes.push({
      id: parent,
      title: "memories/",
      type: "folder",
      parent: null,
      created_at: now,
    });
  }
  const sources = ensureSourceFolder(draft, now);
  const sid = "source-" + crypto.randomUUID();
  draft.nodes.push({
    id: sid,
    title: editing ? "memory-correction.txt" : "memory-note.txt",
    type: "source",
    parent: sources.id,
    content: evidence,
    created_at: now,
    kind: "user note",
    scope: "This agent",
    evidence: "User supplied",
  });
  let id = editing;
  if (editing) {
    const n = draft.nodes.find((node) => node.id === editing);
    (n.revisions ??= []).push({
      at: now,
      content,
      source_ids: [sid],
      status: $("#memory-status").value,
    });
  } else {
    id = "memory-" + crypto.randomUUID();
    draft.nodes.push({
      id,
      title,
      type: "memory",
      parent,
      content,
      source_ids: [sid],
      created_at: now,
      status: $("#memory-status").value,
      scope: "This agent",
      evidence: "User supplied",
      tags: [],
    });
  }
  store = validateMemory(draft);
  await persist();
  $("#edit-dialog").close();
  await sync();
  reveal(id);
  await inspect(id, { focus: true });
  notice(
    editing
      ? "Correction saved with its original history."
      : "Memory saved with its source.",
  );
}
function help(format = false) {
  setMenu(false);
  const c = $("#help-content");
  c.replaceChildren();
  const div = element("div", "help-text");
  if (format) {
    div.append(
      element(
        "p",
        "",
        "Use version 1 with an agent, nodes, edges, and optional recalls. Node types: folder, memory, source, entity. Memory records reference original source ids. Edges use existing node ids.",
      ),
    );
    const pre = element("pre");
    pre.append(
      element(
        "code",
        "",
        JSON.stringify(
          {
            version: 1,
            agent: { id: "my-agent", name: "My agent" },
            nodes: [
              { id: "projects", type: "folder", title: "projects/" },
              {
                id: "source",
                type: "source",
                title: "instruction.txt",
                content: "Use Three.js.",
              },
              {
                id: "choice",
                type: "memory",
                title: "rendering.md",
                parent: "projects",
                content: "Use Three.js for rendering.",
                source_ids: ["source"],
                created_at: "2026-10-29T12:00:00Z",
              },
            ],
            edges: [{ from: "choice", to: "source", type: "supported_by" }],
            recalls: [],
          },
          null,
          2,
        ),
      ),
    );
    div.append(pre);
  } else {
    for (const text of [
      "Open folders to grow the tree. Select a memory to inspect its evidence, relationships, and revisions. The sample workspace is fictional.",
      "Import JSON to preserve explicit entities and relationships. Markdown headings become memory sections with the original file attached as evidence. No facts or links are inferred by an AI.",
      "Recall searches memory titles, text, and tags locally, and records the actual results. It does not query a live agent or an embedding service. Import an agent’s retrieval logs to inspect its recorded recalls.",
      "Memories are saved in this browser with IndexedDB. Export JSON to back them up or move them to another device. There is no live agent connection yet.",
      "Use the timeline to inspect earlier states. Corrections preserve original text and add a source; archived memories remain available in earlier snapshots.",
      "Keyboard: Cmd/Ctrl+F to search, Cmd/Ctrl+N for a memory, Escape to close, +/- to zoom, and 0 to fit.",
    ])
      div.append(element("p", "", text));
    const credit = element(
      "a",
      "",
      "Inspired by Finn Taylor’s literal file tree ↗",
    );
    credit.href = "https://x.com/FinnoTaylor/status/2112286571999428676";
    credit.target = "_blank";
    credit.rel = "noopener noreferrer";
    div.append(credit);
  }
  c.append(div);
  $("#help-dialog").showModal();
}

$("#menu-toggle").onclick = () => setMenu($("#options-menu").hidden);
$("#home").onclick = () => {
  closeInspector();
  view.fit();
};
$("#fit").onclick = () => view.fit();
$("#zoom-in").onclick = () => view.zoomBy(1.25);
$("#zoom-out").onclick = () => view.zoomBy(0.8);
$("#grow-all").onclick = () =>
  run(async () => {
    for (const n of store.nodes) if (n.type === "folder") expanded.add(n.id);
    await redraw();
    view.fit();
  });
$("#collapse").onclick = () =>
  run(async () => {
    setMenu(false);
    expanded.clear();
    pages = {};
    await redraw();
    view.fit();
  });
$("#links-toggle").onclick = () => {
  const show = $("#links-toggle").getAttribute("aria-pressed") !== "true";
  $("#links-toggle").setAttribute("aria-pressed", String(show));
  $("#links-toggle").textContent = show
    ? "Hide relationships"
    : "Show relationships";
  view.setLinks(show);
  setMenu(false);
};
$("#timeline-toggle").onclick = () => {
  const show = $("#timeline").hidden;
  $("#timeline").hidden = !show;
  $("#timeline-toggle").setAttribute("aria-expanded", String(show));
};
$("#status-date").onclick = () => $("#timeline-toggle").click();
$("#time-slider").oninput = (e) =>
  run(() =>
    setTime(
      +e.target.value === times.length ? Infinity : times[+e.target.value],
    ),
  );
$("#time-now").onclick = () => run(() => setTime(Infinity));
$("#search-toggle").onclick = () => setSearch($(".search-box").hidden);
$("#search-close").onclick = () => setSearch(false);
$("#search").oninput = () => {
  querySerial++;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => run(updateSearch), 120);
};
$("#search-form").onsubmit = (e) => {
  e.preventDefault();
  run(recall);
};
$("#inspector-close").onclick = closeInspector;
$("#clear-recall").onclick = () => {
  currentRecall = null;
  $("#recall-strip").hidden = true;
  view.setSelection(selected, new Set());
};
$("#recall-details").onclick = () =>
  run(() => currentRecall && showRecall(currentRecall));
$("#recall-history").onclick = showHistory;
$("#import-open").onclick = openImport;
$("#import-shortcut").onclick = openImport;
$("#memory-file").onchange = async (e) => {
  pendingImport = null;
  $("#import-error").textContent = "";
  $("#import-review").hidden = true;
  try {
    await importFile(e.target.files[0]);
  } catch (error) {
    $("#import-error").textContent =
      error instanceof SyntaxError
        ? "This file is not valid JSON. Check the example format."
        : error.message;
  }
};
$("#import-confirm").onclick = () =>
  run(async () => {
    if (!pendingImport) return;
    await replaceWorkspace(pendingImport);
    $("#import-dialog").close();
    notice("Memory imported and saved in this browser.");
  });
$("#import-help").onclick = () => help(true);
$("#export").onclick = () => {
  setMenu(false);
  exportMemory();
};
$("#add-open").onclick = () => openEditor();
$("#edit-close").onclick = () => $("#edit-dialog").close();
$("#edit-form").onsubmit = async (e) => {
  e.preventDefault();
  try {
    await saveEditor();
  } catch (error) {
    $("#edit-error").textContent = error.message;
  }
};
$("#help-open").onclick = () => help();
$("#demo-open").onclick = () => {
  setMenu(false);
  help();
  const c = $("#help-content");
  c.replaceChildren(
    element(
      "p",
      "dialog-copy",
      "Opening sample memory replaces this browser’s current workspace. Export your memory first if you want to keep it.",
    ),
  );
  addButton(c, "Export current memory ↓", exportMemory, "soft-button");
  addButton(
    c,
    "Open sample memory",
    async () => {
      await replaceWorkspace(validateMemory(demoMemory()));
      $("#help-dialog").close();
      notice("Sample memory opened.");
    },
    "soft-button",
  );
};
$("#viewport").addEventListener("dragover", (e) => {
  e.preventDefault();
});
$("#viewport").addEventListener("drop", (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) {
    openImport();
    run(async () => {
      try {
        await importFile(file);
      } catch (error) {
        $("#import-error").textContent = error.message;
      }
    });
  }
});
document.addEventListener("click", (e) => {
  if (!e.target.closest("#options-menu,#menu-toggle")) setMenu(false);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    setMenu(false);
    setSearch(false);
    if (!document.querySelector("dialog[open]")) closeInspector();
  }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
    e.preventDefault();
    setSearch(true);
  }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
    e.preventDefault();
    openEditor();
  }
  if (
    e.target.matches("input,textarea,select") ||
    document.querySelector("dialog[open]")
  )
    return;
  if (e.key === "0") view.fit();
  if (e.key === "+" || e.key === "=") view.zoomBy(1.25);
  if (e.key === "-") view.zoomBy(0.8);
});
window.addEventListener("pagehide", (e) => {
  if (!e.persisted) {
    view.destroy();
    worker.terminate();
  }
});
async function boot() {
  try {
    store = await readMemory();
  } catch {
    notice(
      "Browser storage is unavailable. You can still explore and export this session.",
    );
  }
  store ??= validateMemory(demoMemory());
  try {
    const state = JSON.parse(localStorage.getItem("memory-view") || "null");
    if (state?.agent === store.agent.id) {
      expanded = new Set(
        state.expanded.filter((id) => store.nodes.some((n) => n.id === id)),
      );
      pages = state.pages || {};
    }
  } catch {
    /* Ignore an incompatible saved camera state. */
  }
  await sync();
}
run(boot);
