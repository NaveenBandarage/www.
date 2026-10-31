import { memoryAt } from "./memory.js";

const ignored = new Set(
  "about after again alongside already also across because before being between could describes different explicitly exploration favorite favorites interest interests itself making other personal possible profile recurring records related research researched should snapshot something source summary their these thing things those through useful verified which while without would".split(
    " ",
  ),
);
const pairKey = (a, b) => [a, b].sort().join("\0");

// Topic overlap is a navigation hint, never an assertion of taste or causality.
// Inverted indexes and bounded topic buckets avoid an all-pairs text comparison.
export function relationshipsFor(store, asOf = Infinity) {
  const available = store.nodes.map((n) => memoryAt(n, asOf)).filter(Boolean);
  const byId = new Map(available.map((n) => [n.id, n]));
  const edges = store.edges.filter((e) => byId.has(e.from) && byId.has(e.to));
  const known = new Set(edges.map((e) => pairKey(e.from, e.to)));
  const buckets = new Map();
  const candidates = new Map();
  for (const n of available) {
    if (n.type !== "memory" || n.tags.includes("connection")) continue;
    const tags = new Set(
      n.tags.map((t) => t.toLowerCase()).filter((t) => !ignored.has(t)),
    );
    const words = new Set(
      (`${n.title} ${n.content}`.toLowerCase().match(/[a-z]{5,}/g) || [])
        .filter((w) => !ignored.has(w))
        .slice(0, 80),
    );
    for (const topic of new Set([...tags, ...words])) {
      const bucket = buckets.get(topic) || [];
      bucket.push({ id: n.id, tag: tags.has(topic) });
      buckets.set(topic, bucket);
    }
  }
  for (const [topic, bucket] of buckets) {
    if (bucket.length < 2 || bucket.length > 24) continue;
    for (let i = 0; i < bucket.length; i++)
      for (let j = i + 1; j < bucket.length; j++) {
        const a = bucket[i],
          b = bucket[j],
          key = pairKey(a.id, b.id);
        if (known.has(key)) continue;
        const candidate = candidates.get(key) || {
          from: a.id,
          to: b.id,
          topics: [],
          tags: 0,
        };
        candidate.topics.push(topic);
        if (a.tag && b.tag) candidate.tags++;
        candidates.set(key, candidate);
      }
  }
  const counts = new Map();
  const inferred = [...candidates.values()]
    .filter((c) => c.tags >= 2 || c.topics.length >= 4)
    .sort(
      (a, b) =>
        b.tags * 3 + b.topics.length - (a.tags * 3 + a.topics.length) ||
        pairKey(a.from, a.to).localeCompare(pairKey(b.from, b.to)),
    );
  const result = [...edges];
  for (const c of inferred) {
    if ((counts.get(c.from) || 0) >= 3 || (counts.get(c.to) || 0) >= 3)
      continue;
    result.push({
      from: c.from,
      to: c.to,
      type: "shared_topics",
      reason: `Content overlap: ${c.topics.slice(0, 5).join(", ")}. An inferred connection, not a confirmed personal fact.`,
    });
    for (const id of [c.from, c.to]) counts.set(id, (counts.get(id) || 0) + 1);
  }
  return result;
}
