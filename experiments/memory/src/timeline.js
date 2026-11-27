import { memoryAt, UNKNOWN_MEMORY_DATE } from "./memory.js";

const unknownTime = Date.parse(UNKNOWN_MEMORY_DATE);
const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "America/New_York",
});
const dayFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function memoryTimestamp(value) {
  const time = typeof value === "number" ? value : Date.parse(value);
  return Number.isFinite(time) && time !== unknownTime ? time : null;
}

export function displayDate(value) {
  const time = memoryTimestamp(value);
  if (time === null) return "Undated";
  // The site stores publication days as midnight UTC. Keep their written day.
  return (time % 86_400_000 === 0 ? dayFormat : dateFormat).format(time);
}

const actions = {
  added: "Added",
  corrected: "Corrected",
  superseded: "Superseded",
  archived: "Archived",
};

export function memoryTimeline(store) {
  const byTime = new Map();
  function add(value, action, node) {
    const time = memoryTimestamp(value);
    if (time === null) return;
    const changes = byTime.get(time) || [];
    changes.push({ action, id: node.id, title: node.title, type: node.type });
    byTime.set(time, changes);
  }
  for (const node of store.nodes) {
    const created = memoryTimestamp(node.created_at) ?? -Infinity;
    const archived = memoryTimestamp(node.archived_at) ?? Infinity;
    if (created >= archived) continue;
    add(node.created_at, "added", node);
    add(node.archived_at, "archived", node);
    const superseded = memoryTimestamp(node.valid_to);
    if (
      superseded !== null &&
      superseded > created &&
      superseded < archived &&
      memoryAt(node, superseded - 1)?.status !==
        memoryAt(node, superseded)?.status
    ) {
      add(node.valid_to, "superseded", node);
    }
    for (const revision of node.revisions || []) {
      const time = memoryTimestamp(revision.at);
      if (time !== null && time > created && time < archived)
        add(time, "corrected", node);
    }
  }

  return [...byTime]
    .sort(([a], [b]) => a - b)
    .map(([time, events]) => {
      const substantive = events.filter(
        ({ type }) => type === "memory" || type === "entity",
      );
      const changes = substantive.length ? substantive : events;
      const counts = new Map();
      for (const { action } of changes)
        counts.set(action, (counts.get(action) || 0) + 1);
      const summary =
        changes.length === 1
          ? `${actions[changes[0].action]} “${changes[0].title.replace(/\/$/, "")}”`
          : [...counts]
              .map(([action, count]) => `${count} ${action}`)
              .join(" · ");
      return { time, changes, summary };
    });
}
