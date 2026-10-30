import { m } from "framer-motion";
import { useEffect, useState } from "react";
import type { ListeningTrack } from "../../lib/music";
import { formatLastPlayed } from "../../lib/listeningTime";
import useReducedMotion from "../../lib/useReducedMotion";

const listeningPhrases = [
  { present: "listening to", past: "listened to" },
  { present: "vibing to", past: "vibed to" },
  { present: "grooving to", past: "grooved to" },
  { present: "jamming to", past: "jammed to" },
  { present: "unwinding to", past: "unwound to" },
  { present: "tuning in to", past: "tuned in to" },
  { present: "zoning out to", past: "zoned out to" },
];

export default function NowPlaying() {
  const [{ track, phraseIndex }, setListening] = useState<{
    track: ListeningTrack | null;
    phraseIndex: number;
  }>({ track: null, phraseIndex: 0 });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let fetching = false;
    let configured = true;
    // Keep the identity across pauses, temporary errors, and visibility changes.
    let previousUrl: string | undefined;
    let previousIsPlaying: boolean | undefined;
    let currentPhrase = -1;
    const update = async () => {
      clearTimeout(timer);
      if (document.hidden || fetching || !configured) return;
      fetching = true;
      try {
        const response = await fetch("/api/now-playing", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Listening status unavailable");
        const data = await response.json();
        if (controller.signal.aborted) return;
        configured = data.configured !== false;
        const nextTrack: ListeningTrack | null = data.track ?? null;
        if (
          nextTrack &&
          (nextTrack.url !== previousUrl ||
            nextTrack.isPlaying !== previousIsPlaying)
        ) {
          // Choose a new phrase on song/status changes, never on ordinary polls.
          currentPhrase =
            currentPhrase < 0
              ? Math.floor(Math.random() * listeningPhrases.length)
              : (currentPhrase +
                  1 +
                  Math.floor(Math.random() * (listeningPhrases.length - 1))) %
                listeningPhrases.length;
          previousUrl = nextTrack.url;
          previousIsPlaying = nextTrack.isPlaying;
        }
        setListening({
          track: nextTrack,
          phraseIndex: Math.max(0, currentPhrase),
        });
      } catch {
        if (!controller.signal.aborted) {
          setListening((previous) => ({ ...previous, track: null }));
        }
      } finally {
        fetching = false;
        if (!controller.signal.aborted && !document.hidden && configured) {
          timer = setTimeout(update, 20_000);
        }
      }
    };
    void update();
    document.addEventListener("visibilitychange", update);
    return () => {
      controller.abort();
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  if (!track) return null;
  const words = listeningPhrases[phraseIndex];
  const phrase = track.isPlaying ? words.present : words.past;
  const lastPlayed = track.isPlaying ? null : formatLastPlayed(track.playedAt);

  return (
    <aside
      aria-label="Naveen’s Spotify"
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 max-w-[calc(100vw-2rem)] text-right text-xs leading-relaxed text-neutral-500 [overflow-wrap:anywhere] dark:text-silver-dark sm:bottom-6 sm:right-6 sm:max-w-lg"
    >
      <a
        href={track.url}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        aria-label={`Naveen ${track.isPlaying ? "is" : "last"} ${phrase} ${track.title} by ${track.artist}${lastPlayed ? `, ${lastPlayed}` : ""}. Open in Spotify`}
        title={`${track.title} — ${track.artist} · Spotify`}
      >
        Naveen {track.isPlaying ? "is" : "last"}{" "}
        <m.span
          key={phrase}
          className="inline-block"
          initial={{ y: reducedMotion ? 0 : 3 }}
          animate={{ y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.3 }}
        >
          <span className="listening-shimmer">{phrase}</span>
        </m.span>{" "}
        <span className="text-neutral-800 dark:text-white">{track.title}</span>
        {lastPlayed ? (
          <>
            {" "}
            <time className="whitespace-nowrap" dateTime={track.playedAt}>
              {lastPlayed}
            </time>
          </>
        ) : null}
      </a>
    </aside>
  );
}
