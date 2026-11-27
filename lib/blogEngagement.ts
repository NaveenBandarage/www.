import { createHash } from "node:crypto";
import {
  emptyReactionCounts,
  type BlogEngagementSummary,
  type ReactionId,
} from "./blogReactions";

export interface BlogEngagementDocument {
  version: 1;
  views: number;
  counts: Record<ReactionId, number>;
  reactions: Record<string, ReactionId[]>;
  viewDay: string;
  viewers: Record<string, true>;
}

export interface BlogEngagementStore {
  read: (key: string) => Promise<{
    document: BlogEngagementDocument;
    etag: string;
  } | null>;
  /** Atomically create if etag is null, otherwise replace only that version. */
  write: (
    key: string,
    document: BlogEngagementDocument,
    etag: string | null,
  ) => Promise<void>;
}

export class EngagementConflictError extends Error {}

export type EngagementAction =
  | { type: "view" }
  | { type: "reaction"; reaction: ReactionId; active: boolean };

export function engagementKey(slug: string) {
  return createHash("sha256").update(slug).digest("hex");
}

export function readerKey(slug: string, reader: string) {
  // An unguessable browser ID, scoped to a post. Never store IPs or raw cookies.
  return createHash("sha256").update(`${slug}:${reader}`).digest("hex");
}

export function emptyEngagement(): BlogEngagementDocument {
  return {
    version: 1,
    views: 0,
    counts: emptyReactionCounts(),
    reactions: {},
    viewDay: "",
    viewers: {},
  };
}

export function engagementSummary(
  document: BlogEngagementDocument,
  reader: string,
): BlogEngagementSummary {
  return {
    views: document.views,
    counts: { ...document.counts },
    selected: [...(document.reactions[reader] ?? [])],
  };
}

export async function updateEngagement(
  store: BlogEngagementStore,
  slug: string,
  reader: string,
  action: EngagementAction,
  now = new Date(),
): Promise<BlogEngagementSummary> {
  const key = engagementKey(slug);
  const day = now.toISOString().slice(0, 10);

  for (let attempt = 0; attempt < 6; attempt++) {
    const current = await store.read(key);
    const document = current?.document ?? emptyEngagement();

    if (action.type === "view") {
      if (document.viewDay !== day) {
        document.viewDay = day;
        document.viewers = {};
      }
      if (document.viewers[reader]) return engagementSummary(document, reader);
      document.viewers[reader] = true;
      document.views += 1;
    } else {
      const selected = document.reactions[reader] ?? [];
      const wasActive = selected.includes(action.reaction);
      // Desired state, rather than a toggle: retries cannot double-count a click.
      if (wasActive === action.active)
        return engagementSummary(document, reader);
      const next = action.active
        ? [...selected, action.reaction]
        : selected.filter((reaction) => reaction !== action.reaction);
      if (next.length) document.reactions[reader] = next;
      else delete document.reactions[reader];
      document.counts[action.reaction] += action.active ? 1 : -1;
    }

    try {
      await store.write(key, document, current?.etag ?? null);
      return engagementSummary(document, reader);
    } catch (error) {
      if (!(error instanceof EngagementConflictError)) throw error;
      if (attempt === 5) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, 20 + Math.random() * 40 * (attempt + 1)),
      );
    }
  }
  throw new EngagementConflictError("Engagement is busy; please retry");
}
