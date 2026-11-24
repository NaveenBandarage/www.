import { demoMemory, validateMemory } from "./memory.js";

// Website records have stable IDs; visitor-created records remain browser-local.
export function initialWorkspace(saved, seed) {
  if (!saved) return structuredClone(seed);
  if (!seed || saved.agent.imported) return saved;
  if (JSON.stringify(saved) === JSON.stringify(validateMemory(demoMemory())))
    return structuredClone(seed);
  if (saved.agent.id !== seed.agent.id) return saved;

  const draft = structuredClone(saved);
  const incoming = seed.nodes.filter((node) => node.id.startsWith("website:"));
  const incomingIds = new Set(incoming.map((node) => node.id));
  const byId = new Map(draft.nodes.map((node) => [node.id, node]));
  const syncedAt = new Date().toISOString();
  for (const node of incoming) {
    const previous = byId.get(node.id);
    if (!previous) {
      draft.nodes.push(structuredClone(node));
    } else {
      // Compare with the last website version, preserving visitor revisions.
      const websiteVersion = previous.revisions.filter((revision) => revision.origin === "website").at(-1) || previous;
      if (previous.type !== "folder" && (
        websiteVersion.content !== node.content ||
        JSON.stringify(websiteVersion.source_ids) !== JSON.stringify(node.source_ids) ||
        websiteVersion.status !== node.status
      )) {
        previous.revisions.push({
          at: syncedAt,
          content: node.content,
          source_ids: node.source_ids,
          status: node.status,
          origin: "website",
        });
      }
      Object.assign(previous, node, {
        content: previous.content,
        source_ids: previous.source_ids,
        status: previous.status,
        revisions: previous.revisions,
        pinned: previous.pinned,
        archived_at: previous.kind === "Removed published content" || previous.kind === "Removed published blog post" ? null : previous.archived_at,
      });
    }
  }
  for (const node of draft.nodes) {
    if (node.type === "memory" && node.id.startsWith("website:") && !incomingIds.has(node.id) && (["Published blog post", "Published website content"].includes(node.kind) || node.id.startsWith("website:book:")) && !node.archived_at) {
      node.archived_at = new Date().toISOString();
      node.kind = "Removed published content";
    }
  }
  const edgeKeys = new Set(draft.edges.map((edge) => `${edge.from}\0${edge.to}\0${edge.type}`));
  for (const edge of seed.edges.filter((edge) => edge.from.startsWith("website:"))) {
    if (!edgeKeys.has(`${edge.from}\0${edge.to}\0${edge.type}`)) draft.edges.push(structuredClone(edge));
  }
  return validateMemory(draft);
}
