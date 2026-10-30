/** Format Spotify's last-played timestamp without inventing a missing time. */
export function formatLastPlayed(playedAt: string | null, now = Date.now()) {
  if (!playedAt) return null;
  const timestamp = Date.parse(playedAt);
  if (!Number.isFinite(timestamp)) return null;
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (seconds < 60) return "just now";
  const units = [
    [31_536_000, "year"],
    [2_592_000, "month"],
    [86_400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ] as const;
  for (const [size, label] of units) {
    if (seconds >= size) {
      const count = Math.floor(seconds / size);
      return `${count} ${label}${count === 1 ? "" : "s"} ago`;
    }
  }
  return null;
}
