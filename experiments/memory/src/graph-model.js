import { memoryAt } from "./memory.js";
import { relationshipsFor } from "./relationships.js";

export const LABEL_BUDGET = 100;
export const PAGE_SIZE = 6;

function seedFor(id) {
  return (
    [...id].reduce(
      (seed, char) => (Math.imul(seed, 31) + char.charCodeAt(0)) | 0,
      17,
    ) >>> 0
  );
}

// Match projection ordering and historical visibility when opening a search result.
export function revealMemory(
  store,
  id,
  { expanded = [], pages = {}, asOf = Infinity } = {},
) {
  const available = store.nodes
    .map((node) => memoryAt(node, asOf))
    .filter(Boolean);
  const byId = new Map(available.map((node) => [node.id, node]));
  const open = new Set(expanded);
  const nextPages = { ...pages };
  let node = byId.get(id);
  while (node) {
    const siblings = available.filter(
      (sibling) => sibling.parent === node.parent,
    );
    nextPages[node.parent ?? "__roots"] =
      Math.floor(
        siblings.findIndex((sibling) => sibling.id === node.id) / PAGE_SIZE,
      ) + 1;
    node = byId.get(node.parent);
    if (node) open.add(node.id);
  }
  return { expanded: open, pages: nextPages };
}

// Every path grows away from its parent. The seeded bend preserves the organic
// particle renderer without moving established nodes when another branch opens.
function branchFor(node, parent) {
  const start = parent || { x: 0, y: 0 },
    dx = node.x - start.x,
    dy = node.y - start.y,
    length = Math.hypot(dx, dy),
    seed = seedFor(node.id),
    bend = ((seed % 47) - 23) * 1.4,
    nx = -dy / length,
    ny = dx / length;
  return {
    id: `branch:${node.id}`,
    owner: node.parent || node.id,
    parentBranch: parent ? `branch:${parent.id}` : null,
    width: node.type === "folder" ? Math.max(2.8, 7.8 - node.depth * 1.3) : 2.5,
    seed,
    depth: node.depth,
    points: [
      [start.x, start.y],
      [start.x + dx * 0.28 + nx * bend, start.y + dy * 0.28 + ny * bend],
      [
        start.x + dx * 0.64 - nx * bend * 0.55,
        start.y + dy * 0.64 - ny * bend * 0.55,
      ],
      [node.x, node.y],
    ],
  };
}

export function projectMemory(
  store,
  { expanded = [], pages = {}, asOf = Infinity } = {},
) {
  const open = new Set(expanded),
    available = store.nodes.map((n) => memoryAt(n, asOf)).filter(Boolean),
    byId = new Map(available.map((n) => [n.id, n])),
    children = new Map();
  for (const n of available) {
    if (n.parent && !byId.has(n.parent)) continue;
    const list = children.get(n.parent) || [];
    list.push(n);
    children.set(n.parent, list);
  }
  const roots = children.get(null) || [],
    rootCount = Math.min(PAGE_SIZE, roots.length),
    rootPage =
      Number.isInteger(pages.__roots) && pages.__roots > 0 ? pages.__roots : 1,
    rootOffset =
      ((rootPage - 1) % Math.max(1, Math.ceil(roots.length / PAGE_SIZE))) *
      PAGE_SIZE,
    projected = [],
    positions = new Map(),
    branches = [];

  let originId = "__memory_origin__";
  while (byId.has(originId)) originId += "_";
  if (roots.length)
    projected.push({
      id: originId,
      type: "origin",
      title: store.agent.demo ? "Naveen" : store.agent.name,
      x: 0,
      y: 0,
      parent: null,
    });

  function addNode(node, parent, index, siblingCount, depth) {
    if (projected.length >= LABEL_BUDGET) return;
    const angle = parent
        ? parent.angle +
          (siblingCount === 1 ? 0 : index / (siblingCount - 1) - 0.5) *
            parent.spread
        : Math.PI / 2 + (index * Math.PI * 2) / Math.max(1, rootCount),
      length = parent ? 225 + depth * 12 : 225,
      item = {
        id: node.id,
        title: node.title,
        type: node.type,
        parent: node.parent,
        x: (parent?.x || 0) + Math.cos(angle) * length,
        y: (parent?.y || 0) + Math.sin(angle) * length,
        angle,
        depth,
        spread: parent
          ? Math.max(0.4, parent.spread * 0.62)
          : Math.min(1.7, ((Math.PI * 2) / Math.max(1, rootCount)) * 0.68),
        status: node.status,
        pinned: node.pinned,
        count: (children.get(node.id) || []).length,
      };
    projected.push(item);
    positions.set(item.id, item);
    branches.push(branchFor(item, parent));
    if (item.type !== "folder" || !open.has(item.id)) return;

    const list = children.get(item.id) || [],
      pageNumber =
        Number.isInteger(pages[item.id]) && pages[item.id] > 0
          ? pages[item.id]
          : 1,
      offset =
        ((pageNumber - 1) % Math.max(1, Math.ceil(list.length / PAGE_SIZE))) *
        PAGE_SIZE,
      page = list.slice(offset, offset + PAGE_SIZE);
    page.forEach((child, i) =>
      addNode(child, item, i, Math.min(PAGE_SIZE, list.length), depth + 1),
    );
    if (list.length > PAGE_SIZE && projected.length < LABEL_BUDGET) {
      addNode(
        {
          id: `more:${item.id}`,
          title: `next ${PAGE_SIZE}… (${offset + page.length}/${list.length})`,
          type: "more",
          parent: item.id,
        },
        item,
        PAGE_SIZE,
        PAGE_SIZE + 1,
        depth + 1,
      );
    }
  }

  roots
    .slice(rootOffset, rootOffset + PAGE_SIZE)
    .forEach((node, i) => addNode(node, null, i, rootCount, 0));
  if (roots.length > PAGE_SIZE && projected.length < LABEL_BUDGET) {
    const more = {
      id: "more:roots",
      title: `next roots… (${Math.min(rootOffset + PAGE_SIZE, roots.length)}/${roots.length})`,
      type: "more",
      parent: null,
      x: 0,
      y: -130,
      depth: 0,
    };
    projected.push(more);
    branches.push(branchFor(more, null));
  }
  const edges = relationshipsFor(store, asOf)
      .filter(
        (e) =>
          e.type !== "supported_by" ||
          !byId.get(e.from)?.revisions?.length ||
          byId.get(e.from)?.source_ids.includes(e.to),
      )
      .map((e) => ({ ...e })),
    edgeIds = new Set(edges.map((e) => e.from + "\0" + e.to));
  for (const n of available)
    for (const source of n.source_ids || []) {
      const key = n.id + "\0" + source;
      if (!edgeIds.has(key)) {
        edges.push({ from: n.id, to: source, type: "supported_by" });
        edgeIds.add(key);
      }
    }
  // Route an undiscovered endpoint to its nearest visible ancestor. The route
  // moves outward as folders open, without changing expansion state.
  function anchor(id) {
    let n = byId.get(id);
    while (n && !positions.has(n.id)) n = byId.get(n.parent);
    return n && positions.get(n.id);
  }
  const routed = [],
    hidden = new Map(),
    visibleCounts = new Map();
  for (const e of edges) {
    const fromVisible = positions.has(e.from),
      toVisible = positions.has(e.to);
    if (e.type !== "supported_by") {
      for (const [id, other, isVisible] of [
        [e.from, e.to, toVisible],
        [e.to, e.from, fromVisible],
      ]) {
        const own = anchor(id);
        if (!own) continue;
        if (positions.has(id))
          visibleCounts.set(id, (visibleCounts.get(id) || 0) + 1);
        if (!isVisible && anchor(other)?.id !== own.id) {
          const peers = hidden.get(own.id) || new Set();
          peers.add(other);
          hidden.set(own.id, peers);
        }
      }
    }
    if (!fromVisible && !toVisible) continue;
    const a = anchor(e.from),
      b = anchor(e.to);
    if (!a || !b || a.id === b.id) continue;
    // Sources keep their existing explicit-selection behavior.
    if (e.type === "supported_by" && (!fromVisible || !toVisible)) continue;
    routed.push({
      ...e,
      from: a.id,
      to: b.id,
      originalFrom: e.from,
      originalTo: e.to,
      partial: !fromVisible || !toVisible,
    });
  }
  for (const n of projected) {
    n.hiddenConnections = hidden.get(n.id)?.size || 0;
    n.connectionCount = visibleCounts.get(n.id) || 0;
  }
  return {
    nodes: projected,
    branches,
    edges: routed,
    total: available.length,
    limited: projected.length >= LABEL_BUDGET || roots.length > 6,
  };
}
