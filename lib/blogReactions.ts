export const BLOG_REACTIONS = [
  { id: "heart", emoji: "❤️", label: "Loved it" },
  { id: "clap", emoji: "👏", label: "Applause" },
  { id: "idea", emoji: "💡", label: "Made me think" },
  { id: "thinking", emoji: "🤔", label: "Interesting" },
] as const;

export type ReactionId = (typeof BLOG_REACTIONS)[number]["id"];

export interface BlogEngagementSummary {
  views: number;
  counts: Record<ReactionId, number>;
  selected: ReactionId[];
}

export function isReactionId(value: unknown): value is ReactionId {
  return BLOG_REACTIONS.some((reaction) => reaction.id === value);
}

export function emptyReactionCounts(): Record<ReactionId, number> {
  return { heart: 0, clap: 0, idea: 0, thinking: 0 };
}
