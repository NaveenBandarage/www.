import { useEffect, useState } from "react";
import type { ListeningTrack } from "../../lib/music";

interface NowPlayingProps {
  enabled?: boolean;
}

export default function NowPlaying({ enabled = true }: NowPlayingProps) {
  const [track, setTrack] = useState<ListeningTrack | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    let fetching = false;
    const update = async () => {
      if (document.hidden || fetching) return;
      fetching = true;
      try {
        const response = await fetch("/api/now-playing", {
          signal: controller.signal,
        });
        if (response.ok) {
          const data = await response.json();
          if (!controller.signal.aborted) setTrack(data.track ?? null);
        }
      } catch {
        /* Keep the footer quiet when offline. */
      } finally {
        fetching = false;
      }
    };
    void update();
    const interval = window.setInterval(update, 60_000);
    document.addEventListener("visibilitychange", update);
    return () => {
      controller.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", update);
    };
  }, [enabled]);

  if (!track) return null;
  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group mt-6 flex max-w-sm items-center gap-3 rounded-sm text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
      aria-label={`${track.isPlaying ? "Now listening to" : "Last listened to"} ${track.title} by ${track.artist}. Open in Spotify`}
    >
      <span
        aria-hidden="true"
        className={`listening-bars flex h-5 items-end gap-[3px] text-neutral-500 dark:text-silver-dark ${track.isPlaying ? "is-playing" : ""}`}
      >
        {[0, 1, 2, 3].map((bar) => (
          <span
            key={bar}
            className="w-[2px] bg-current"
            style={{
              height: `${[45, 90, 65, 35][bar]}%`,
              animationDelay: `${bar * -0.2}s`,
            }}
          />
        ))}
      </span>
      <span className="min-w-0">
        <span className="block text-xs text-neutral-500 dark:text-silver-dark">
          {track.isPlaying ? "On the stereo" : "Last on the stereo"}
        </span>
        <span className="block truncate text-neutral-800 group-hover:underline dark:text-white">
          {track.title}{" "}
          <span className="text-neutral-500 dark:text-silver-dark">
            · {track.artist}
          </span>
        </span>
      </span>
    </a>
  );
}
