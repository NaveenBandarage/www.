import { useCallback, useEffect, useRef, useState } from "react";
import { play, type SoundName } from "cuelume";
import {
  BLOG_REACTIONS,
  type BlogEngagementSummary,
  type ReactionId,
} from "../../../lib/blogReactions";
import {
  openBlogEngagement,
  requestEngagement,
} from "../../../lib/blogEngagementClient";
import { useInteractionSounds } from "../../InteractionSounds";
import styles from "./engagement.module.css";

interface BlogEngagementProps {
  slug: string;
}

const cues: Record<ReactionId, SoundName> = {
  heart: "success",
  clap: "tap",
  idea: "select",
  thinking: "toggle",
};
const numbers = new Intl.NumberFormat("en-US");

export default function BlogEngagement({ slug }: BlogEngagementProps) {
  const [summary, setSummary] = useState<BlogEngagementSummary | null>(null);
  const [pending, setPending] = useState<ReactionId | null>(null);
  const [error, setError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [retry, setRetry] = useState(0);
  const busy = useRef(false);
  const sequence = useRef(0);
  const mounted = useRef(false);
  const { enabled: soundEnabled, toggleSounds } = useInteractionSounds();

  useEffect(() => {
    mounted.current = true;
    let active = true;
    let ready = false;
    const request = ++sequence.current;
    openBlogEngagement(slug)
      .then((next) => {
        if (active && request === sequence.current) {
          ready = true;
          setSummary(next);
          setError("");
        }
      })
      .catch(() => {
        if (active && request === sequence.current) {
          setError("Couldn’t load reactions. Try again in a moment.");
        }
      });

    const refresh = () => {
      if (!ready || document.visibilityState !== "visible" || busy.current)
        return;
      const request = ++sequence.current;
      requestEngagement(slug)
        .then((next) => {
          if (active && request === sequence.current && !busy.current)
            setSummary(next);
        })
        .catch(() => {
          /* Keep the last confirmed totals during background failures. */
        });
    };
    const interval = window.setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      active = false;
      mounted.current = false;
      sequence.current += 1;
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [slug, retry]);

  const react = useCallback(
    async (reaction: ReactionId) => {
      if (!summary || busy.current) return;
      busy.current = true;
      const request = ++sequence.current;
      const previous = summary;
      const active = !summary.selected.includes(reaction);
      setPending(reaction);
      setError("");
      setAnnouncement("Saving reaction.");
      setSummary({
        ...summary,
        counts: {
          ...summary.counts,
          [reaction]: summary.counts[reaction] + (active ? 1 : -1),
        },
        selected: active
          ? [...summary.selected, reaction]
          : summary.selected.filter((id) => id !== reaction),
      });
      // This control opts out of the delegated click sound to avoid two cues.
      if (soundEnabled)
        play(active ? cues[reaction] : "toggle", {
          emphasis: "subtle",
          volume: 0.65,
          direction: active ? "forward" : "back",
        });

      try {
        const next = await requestEngagement(slug, {
          type: "reaction",
          reaction,
          active,
        });
        if (mounted.current && request === sequence.current) {
          setSummary(next);
          setAnnouncement(
            active ? "Reaction saved. Thank you!" : "Reaction removed.",
          );
        }
      } catch {
        if (mounted.current && request === sequence.current) {
          setSummary(previous);
          setError("Couldn’t confirm your reaction. Please try again.");
          setAnnouncement("");
        }
      } finally {
        busy.current = false;
        if (mounted.current) setPending(null);
      }
    },
    [slug, summary, soundEnabled],
  );

  return (
    <section
      aria-labelledby="blog-reactions-title"
      className={`${styles.section} mt-12 border-t border-neutral-200 pt-7 dark:border-neutral-800`}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2
          id="blog-reactions-title"
          className="text-sm font-medium text-neutral-800 dark:text-white"
        >
          What did you think?
        </h2>
        <span
          className="inline-flex items-center gap-1.5 text-xs tabular-nums text-neutral-500 dark:text-silver-dark"
          title="Counted once per browser per post each day (UTC)."
        >
          <svg
            aria-hidden="true"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {summary
            ? `${numbers.format(summary.views)} ${summary.views === 1 ? "view" : "views"}`
            : "Views —"}
        </span>
      </div>
      <p className="mt-1 text-sm text-neutral-500 dark:text-silver-dark">
        A little reaction goes a long way.
      </p>
      <div
        role="group"
        aria-label="React to this post"
        className="mt-4 grid grid-cols-4 gap-2 sm:flex sm:flex-wrap"
      >
        {BLOG_REACTIONS.map(({ id, emoji, label }) => {
          const selected = summary?.selected.includes(id) ?? false;
          const count = summary?.counts[id];
          return (
            <button
              key={id}
              type="button"
              aria-pressed={selected}
              aria-label={`${label}${count === undefined ? "" : `, ${numbers.format(count)} ${count === 1 ? "reaction" : "reactions"}`}`}
              title={label}
              disabled={!summary}
              aria-disabled={pending !== null || !summary}
              data-pending={pending === id ? "true" : undefined}
              data-ui-sound="off"
              onClick={() => void react(id)}
              className={`${styles.reaction} relative inline-flex min-h-[48px] min-w-0 items-center justify-center gap-2 rounded-full border border-neutral-200 px-3 py-2 text-sm text-neutral-600 outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-500 disabled:cursor-wait dark:border-neutral-700 dark:text-silver sm:min-w-[80px] sm:px-4`}
            >
              <span aria-hidden="true" className={styles.emoji}>
                {emoji}
              </span>
              <span aria-hidden="true" className="min-w-[1ch] tabular-nums">
                {count === undefined ? "—" : numbers.format(count)}
              </span>
              <span className={styles.selection} aria-hidden="true">
                ✓
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex min-h-[44px] flex-wrap items-center justify-between gap-x-4 text-xs text-neutral-500 dark:text-silver-dark">
        <p>Pick any that resonate. Tap again to undo.</p>
        <button
          type="button"
          data-ui-sound="off"
          aria-label="Reaction sounds"
          aria-pressed={soundEnabled}
          onClick={toggleSounds}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-sm underline decoration-neutral-300 underline-offset-4 outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-500 dark:decoration-neutral-700"
        >
          Sound {soundEnabled ? "on" : "off"}
        </button>
      </div>
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={
          error ? "mt-1 text-sm text-neutral-600 dark:text-silver" : "sr-only"
        }
      >
        {error || announcement}
      </p>
      {error && !summary ? (
        <button
          type="button"
          onClick={() => {
            setError("");
            setRetry((value) => value + 1);
          }}
          className="mt-1 min-h-[44px] rounded-sm text-sm underline underline-offset-4 outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-500"
        >
          Retry
        </button>
      ) : null}
    </section>
  );
}
