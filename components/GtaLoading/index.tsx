import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import useReducedMotion from "../../lib/useReducedMotion";
import Scene, { type SceneHandle } from "./Scene";
import { STAR_PATH as STAR } from "./motion";
import { DURATION, FPS, LAST_FRAME } from "./sequence";
import styles from "./loading.module.css";

type Phase = "loading" | "ready" | "playing" | "paused" | "finished";
function Star() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={STAR} fill="currentColor" />
    </svg>
  );
}
function RockstarMark() {
  return (
    <svg viewBox="0 0 160 160" fill="none" aria-hidden="true">
      <rect
        x="2"
        y="2"
        width="156"
        height="156"
        rx="27"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M45 30H82C104 30 113 41 109 58C107 70 100 78 90 80C99 83 101 89 99 101L97 111H73L76 97C78 87 75 85 66 85H56L50 111H27L45 30ZM63 49L59 67H75C82 67 86 64 87 58C89 52 85 49 78 49H63Z"
      />
      <path
        d="m109 91 3 18h19l-16 11 3 19-15-11-19 11 9-20-13-10h20l9-18Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function GtaLoading() {
  const rootRef = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const sceneRef = useRef<SceneHandle>(null);
  const animations = useRef<Animation[]>([]);
  const masterRef = useRef<Animation | null>(null);
  const startFrameRef = useRef<number | null>(null);
  const renderFrameRef = useRef<number | null>(null);
  const soundEnabled = useRef(false);
  const reducedRef = useRef(false);
  const shouldReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("loading");
  const [sound, setSound] = useState(false);
  const [study, setStudy] = useState(false);
  const [frame, setFrame] = useState(0);
  const [error, setError] = useState("");

  const stop = useCallback(() => {
    if (renderFrameRef.current !== null) {
      window.cancelAnimationFrame(renderFrameRef.current);
      renderFrameRef.current = null;
    }
    if (startFrameRef.current !== null) {
      window.cancelAnimationFrame(startFrameRef.current);
      startFrameRef.current = null;
    }
    animations.current.forEach((animation) => {
      animation.onfinish = null;
      animation.cancel();
    });
    animations.current = [];
    masterRef.current = null;
    audioRef.current?.pause();
  }, []);
  const renderPlayback = useCallback(() => {
    if (renderFrameRef.current !== null)
      window.cancelAnimationFrame(renderFrameRef.current);
    const paint = () => {
      renderFrameRef.current = null;
      const master = masterRef.current;
      if (!master) return;
      sceneRef.current?.draw(
        Math.min(
          LAST_FRAME,
          Math.max(0, (Number(master.currentTime ?? 0) / 1000) * FPS),
        ),
        reducedRef.current,
      );
      if (master.playState === "running")
        renderFrameRef.current = window.requestAnimationFrame(paint);
    };
    renderFrameRef.current = window.requestAnimationFrame(paint);
  }, []);
  const syncAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !soundEnabled.current) return;
    const seconds = Math.max(
      0,
      Number(masterRef.current?.currentTime ?? 0) / 1000,
    );
    if (audio.readyState > 0) audio.currentTime = Math.min(seconds, 13.99);
    void audio.play().catch(() => {
      soundEnabled.current = false;
      setSound(false);
    });
  }, []);

  const begin = useCallback(
    (initialFrame = 0, paused = false) => {
      const root = rootRef.current;
      if (!root) return;
      if (!root.animate) {
        setPhase("ready");
        setError("This browser doesn’t support the animation.");
        return;
      }
      stop();
      setError("");
      const reduced = reducedRef.current;
      const time = (initialFrame / FPS) * 1000;
      const add = (element: Element | null, frames: Keyframe[]) => {
        if (!element) return null;
        const animation = element.animate(frames, {
          duration: DURATION,
          fill: "both",
          easing: "linear",
        });
        // Build the whole timeline while stopped. Starting the clock before
        // preparing its layers used to consume the first animation frames.
        animation.pause();
        animation.currentTime = time;
        animations.current.push(animation);
        return animation;
      };
      const at = (n: number, other: Omit<Keyframe, "offset">): Keyframe => ({
        offset: n / LAST_FRAME,
        ...other,
      });
      const master = add(root.querySelector("[data-progress]"), [
        { transform: "scaleX(0)" },
        { transform: "scaleX(1)" },
      ]);
      masterRef.current = master;
      if (master)
        master.onfinish = () => {
          sceneRef.current?.draw(LAST_FRAME, reducedRef.current);
          audioRef.current?.pause();
          setFrame(LAST_FRAME);
          setPhase("finished");
        };
      sceneRef.current?.draw(initialFrame, reduced);
      root
        .querySelectorAll("[data-star]")
        .forEach((star, i) =>
          add(star, [
            at(0, { opacity: 0 }),
            at(reduced ? 1 : i * 2 + 34, { opacity: 0 }),
            at(reduced ? 15 : i * 2 + 53, { opacity: 1 }),
            at(840, { opacity: 1, transform: "none" }),
          ]),
        );
      add(root.querySelector("[data-stars]"), [
        at(0, { opacity: 0, transform: "scale(1,1)" }),
        at(20, { opacity: 0, transform: "scale(1,1)" }),
        at(30, { opacity: 1, transform: "scale(1,1)" }),
        at(86, { opacity: 1, transform: "scale(1,1)" }),
        at(95, {
          opacity: 0,
          transform: reduced ? "scale(1,1)" : "scale(.08,.2)",
        }),
        at(840, { opacity: 0 }),
      ]);
      add(root.querySelector("[data-burst]"), [
        at(0, { opacity: 0, transform: "scale(.08)" }),
        at(92, { opacity: 0, transform: "scale(.08)" }),
        at(105, {
          opacity: reduced ? 0 : 0.85,
          transform: "scale(.55)",
        }),
        at(124, {
          opacity: 0,
          transform: reduced ? "scale(1)" : "scale(8)",
        }),
        at(840, { opacity: 0 }),
      ]);
      add(root.querySelector("[data-streaks]"), [
        at(0, { opacity: 0, transform: "scale(.9)" }),
        at(113, { opacity: 0, transform: "scale(.9)" }),
        at(118, { opacity: reduced ? 0 : 0.18, transform: "scale(1.05)" }),
        at(128, { opacity: 0, transform: "scale(1.2)" }),
        at(616, { opacity: 0, transform: "scale(.85)" }),
        at(639, { opacity: reduced ? 0 : 0.22, transform: "scale(1.05)" }),
        at(657, { opacity: reduced ? 0 : 0.35, transform: "scale(1.2)" }),
        at(671, { opacity: 0, transform: "scale(1.4)" }),
        at(840, { opacity: 0 }),
      ]);
      add(root.querySelector("[data-spark]"), [
        at(0, { opacity: 0 }),
        at(668, { opacity: 0 }),
        at(678, { opacity: 1 }),
        at(699, { opacity: 1 }),
        at(713, { opacity: 0 }),
        at(840, { opacity: 0 }),
      ]);
      add(root.querySelector("[data-mark]"), [
        at(0, { opacity: 0, transform: "scale(.95)" }),
        at(697, { opacity: 0, transform: "scale(.95)" }),
        at(736, { opacity: 1, transform: "scale(1)" }),
        at(840, { opacity: 1, transform: "scale(1)" }),
      ]);
      add(root.querySelector("[data-glow]"), [
        at(0, { opacity: 0 }),
        at(699, { opacity: 0 }),
        at(741, { opacity: 1 }),
        at(786, { opacity: 0.65 }),
        at(840, { opacity: 0.08 }),
      ]);
      if (!paused) {
        // A fresh paint boundary gives every track the same new clock tick,
        // even if preparing a cold timeline occupied the previous main-thread task.
        startFrameRef.current = window.requestAnimationFrame(() => {
          startFrameRef.current = null;
          const startTime = Number(document.timeline.currentTime) - time;
          animations.current.forEach((animation) => {
            animation.play();
            animation.startTime = startTime;
          });
          syncAudio();
          renderPlayback();
        });
      }
      setFrame(initialFrame);
      setPhase(paused ? "paused" : "playing");
    },
    [stop, syncAudio, renderPlayback],
  );

  useEffect(() => {
    let disposed = false;
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    void sceneRef.current
      ?.prepare()
      .then(() => {
        if (disposed) return;
        const query = new URLSearchParams(window.location.search).get("frame");
        if (query !== null && Number.isFinite(Number(query))) {
          const position = Math.max(
            0,
            Math.min(LAST_FRAME, Math.round(Number(query))),
          );
          setStudy(true);
          begin(position, true);
        } else if (reducedRef.current) setPhase("ready");
        else begin();
      })
      .catch(() => {
        if (!disposed) {
          setPhase("ready");
          setError("Some artwork couldn’t load. Refresh to try again.");
        }
      });
    return () => {
      disposed = true;
      stop();
    };
  }, [begin, stop]);
  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (shouldReduceMotion && masterRef.current) {
      const position = Math.round(
        (Number(masterRef.current.currentTime ?? 0) / 1000) * FPS,
      );
      begin(position, true);
    }
  }, [shouldReduceMotion, begin]);
  useEffect(() => {
    if (!study || phase !== "playing") return;
    const timer = window.setInterval(
      () =>
        setFrame(
          Math.min(
            LAST_FRAME,
            Math.floor(
              (Number(masterRef.current?.currentTime ?? 0) / 1000) * FPS,
            ),
          ),
        ),
      100,
    );
    return () => window.clearInterval(timer);
  }, [study, phase]);

  function pause() {
    if (renderFrameRef.current !== null) {
      window.cancelAnimationFrame(renderFrameRef.current);
      renderFrameRef.current = null;
    }
    if (startFrameRef.current !== null) {
      window.cancelAnimationFrame(startFrameRef.current);
      startFrameRef.current = null;
    }
    const time = Number(masterRef.current?.currentTime ?? 0);
    sceneRef.current?.draw(
      Math.min(LAST_FRAME, Math.max(0, (time / 1000) * FPS)),
      reducedRef.current,
    );
    animations.current.forEach((animation) => {
      animation.pause();
      animation.currentTime = time;
    });
    audioRef.current?.pause();
    setFrame(Math.min(LAST_FRAME, Math.round((time / 1000) * FPS)));
    setPhase("paused");
  }
  function togglePlayback() {
    if (phase === "playing") pause();
    else if (
      phase === "paused" &&
      Number(masterRef.current?.currentTime ?? 0) < DURATION
    ) {
      const time = Number(masterRef.current?.currentTime ?? 0),
        start = Number(document.timeline.currentTime) - time;
      animations.current.forEach((animation) => {
        animation.play();
        animation.startTime = start;
      });
      setPhase("playing");
      syncAudio();
      renderPlayback();
    } else begin();
  }
  function seek(position: number) {
    if (renderFrameRef.current !== null) {
      window.cancelAnimationFrame(renderFrameRef.current);
      renderFrameRef.current = null;
    }
    if (startFrameRef.current !== null) {
      window.cancelAnimationFrame(startFrameRef.current);
      startFrameRef.current = null;
    }
    const next = Math.max(0, Math.min(LAST_FRAME, Math.round(position)));
    if (!masterRef.current) begin(next, true);
    else {
      animations.current.forEach((animation) => {
        animation.pause();
        animation.currentTime = (next / FPS) * 1000;
      });
      audioRef.current?.pause();
      setFrame(next);
      sceneRef.current?.draw(next, reducedRef.current);
      setPhase("paused");
    }
  }
  function toggleStudy() {
    if (!study && phase === "playing") pause();
    setStudy((value) => !value);
  }
  function toggleSound() {
    soundEnabled.current = !soundEnabled.current;
    setSound(soundEnabled.current);
    if (soundEnabled.current && phase === "playing") syncAudio();
    else audioRef.current?.pause();
  }
  const still = phase === "loading" || phase === "ready";

  return (
    <main
      ref={rootRef}
      className={styles.experiment}
      data-ui-sound="off"
      data-still={still}
      aria-label="GTA 6 animation experiment"
    >
      <h1 className="sr-only">GTA 6</h1>
      <div className={styles.stage} aria-hidden="true">
        <Scene ref={sceneRef} />
        <svg
          data-streaks
          className={styles.streaks}
          viewBox="0 0 1000 1000"
          fill="none"
        >
          {Array.from({ length: 40 }, (_, i) => (
            <path
              key={i}
              d={`M${620 + (i % 4) * 33} 500H1000`}
              stroke="currentColor"
              strokeWidth={i % 3 ? 0.5 : 1.5}
              transform={`rotate(${i * 9} 500 500)`}
            />
          ))}
        </svg>
        <div data-stars className={styles.stars}>
          {Array.from({ length: 6 }, (_, i) => (
            <span
              key={i}
              style={{
                color: [
                  "#ffc88c",
                  "#ffc2ba",
                  "#ffa9d1",
                  "#f68be2",
                  "#e85be7",
                  "#d538ed",
                ][i],
              }}
            >
              <Star />
              <span data-star className={styles.starWhite}>
                <Star />
              </span>
            </span>
          ))}
        </div>
        <div data-burst className={styles.burst}>
          <Star />
        </div>
        <div data-spark className={styles.spark}>
          <Star />
        </div>
        <div data-mark className={styles.mark}>
          <div data-glow className={styles.glow}>
            <RockstarMark />
          </div>
          <div className={styles.logo}>
            <RockstarMark />
          </div>
        </div>
        <div className={styles.grain} />
        <div className={styles.vignette} />
      </div>
      <header className={styles.header}>
        <Link href="/fun" className={styles.back} aria-label="Back to Fun">
          ← <span>Experiments</span>
        </Link>
        <span className={styles.title}>
          GTA 6 <span>/</span> 001
        </span>
      </header>
      <footer className={styles.footer}>
        <div className={styles.controls}>
          <button
            type="button"
            onClick={togglePlayback}
            disabled={phase === "loading"}
            aria-label={
              phase === "playing"
                ? "Pause animation"
                : phase === "paused"
                  ? "Resume animation"
                  : "Play animation"
            }
          >
            {phase === "loading"
              ? "Loading"
              : phase === "playing"
                ? "Pause"
                : phase === "paused"
                  ? "Resume"
                  : "Play"}
          </button>
          <button
            type="button"
            onClick={() => begin()}
            disabled={phase === "loading"}
            aria-label="Replay animation"
          >
            Replay <span aria-hidden="true">↻</span>
          </button>
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={sound}
            aria-label={sound ? "Turn sound off" : "Turn sound on"}
          >
            Sound <span>{sound ? "on" : "off"}</span>
          </button>
          <button
            type="button"
            onClick={toggleStudy}
            aria-expanded={study}
            aria-controls="frame-study"
            disabled={phase === "loading"}
          >
            Frame study
          </button>
        </div>
        <span className={styles.note}>Welcome to Leonida.</span>
      </footer>
      {study ? (
        <section
          id="frame-study"
          className={styles.study}
          aria-label="Frame-by-frame animation study"
        >
          <button
            type="button"
            onClick={() => seek(frame - 1)}
            aria-label="Previous frame"
          >
            ←
          </button>
          <input
            type="range"
            min="0"
            max={LAST_FRAME}
            step="1"
            value={frame}
            onChange={(event) => seek(Number(event.target.value))}
            aria-label="Animation frame"
            aria-valuetext={`Frame ${frame} of ${LAST_FRAME}, ${(frame / FPS).toFixed(2)} seconds`}
          />
          <button
            type="button"
            onClick={() => seek(frame + 1)}
            aria-label="Next frame"
          >
            →
          </button>
          <output aria-live="off">
            {String(Math.floor(frame / FPS)).padStart(2, "0")}:
            {String(frame % FPS).padStart(2, "0")}{" "}
            <span>
              {frame} / {LAST_FRAME}
            </span>
          </output>
        </section>
      ) : null}
      <div className={styles.progress} aria-hidden="true">
        <div data-progress />
      </div>
      <p className="sr-only" role="status">
        {phase === "finished"
          ? "Animation finished. Replay is available."
          : phase === "paused"
            ? "Animation paused."
            : phase === "ready"
              ? "Press play to start the animation."
              : ""}
      </p>
      {error ? (
        <p className={styles.error} role="status">
          {error}
        </p>
      ) : null}
      <audio
        ref={audioRef}
        src="/fun/gta-vi/intro.m4a"
        preload="none"
        onLoadedMetadata={() => {
          if (audioRef.current)
            audioRef.current.currentTime = Math.min(
              Number(masterRef.current?.currentTime ?? 0) / 1000,
              13.99,
            );
        }}
      />
    </main>
  );
}
