import type { BlogEngagementSummary } from "./blogReactions";

export async function requestEngagement(
  slug: string,
  action?:
    { type: "view" } | { type: "reaction"; reaction: string; active: boolean },
): Promise<BlogEngagementSummary> {
  const response = await fetch(
    `/api/blog-engagement/${encodeURIComponent(slug)}`,
    {
      method: action ? "POST" : "GET",
      credentials: "same-origin",
      cache: "no-store",
      ...(action
        ? {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(action),
          }
        : {}),
    },
  );
  if (!response.ok) throw new Error("Engagement request failed");
  return response.json();
}

const openingRequests = new Map<string, Promise<BlogEngagementSummary>>();

/** Share the cookie handshake and view request across Strict Mode effect replays. */
export function openBlogEngagement(slug: string) {
  let request = openingRequests.get(slug);
  if (!request) {
    request = (async () => {
      // Establish the HttpOnly reader cookie before the idempotent view write.
      await requestEngagement(slug);
      return requestEngagement(slug, { type: "view" });
    })().finally(() => openingRequests.delete(slug));
    openingRequests.set(slug, request);
  }
  return request;
}
