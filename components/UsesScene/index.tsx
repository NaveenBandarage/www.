import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import useReducedMotion from "../../lib/useReducedMotion";
import { createWalkingScene, loadWalkingArt } from "./walk";
import styles from "./scene.module.css";

export default function UsesScene() {
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const reducedMotion = useReducedMotion();
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<ReturnType<typeof createWalkingScene> | null>(null);
  const motionPaused = useRef(paused || reducedMotion);

  useEffect(() => {
    motionPaused.current = paused || reducedMotion;
    scene.current?.setPaused(motionPaused.current);
  }, [paused, reducedMotion]);

  useEffect(() => {
    let disposed = false;
    loadWalkingArt()
      .then((art) => {
        if (disposed || !canvas.current) return;
        scene.current = createWalkingScene(
          canvas.current,
          art,
          motionPaused.current,
        );
        setReady(Boolean(scene.current));
      })
      .catch(() => {
        /* The original painted illustration remains visible if loading fails. */
      });
    return () => {
      disposed = true;
      scene.current?.destroy();
      scene.current = null;
    };
  }, []);

  return (
    <section
      className={styles.intro}
      aria-label="A continuous painted walking loop"
    >
      <div className={styles.scene} data-ready={ready}>
        <div className={styles.wallLabel}>ALWAYS A WORK IN PROGRESS.</div>
        <div className={styles.fallback} aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => (
            <Image
              key={index}
              src="/uses/walking-cartoon.webp"
              alt=""
              width={580}
              height={700}
              sizes="180px"
            />
          ))}
        </div>
        <canvas ref={canvas} className={styles.canvas} aria-hidden="true" />
      </div>
      <div className={styles.caption}>
        <span>01 / ON THE MOVE</span>
        <button
          type="button"
          disabled={reducedMotion || !ready}
          aria-pressed={paused || reducedMotion}
          onClick={() => setPaused((value) => !value)}
        >
          {reducedMotion ? "Motion reduced" : paused ? "Play ↗" : "Pause Ⅱ"}
        </button>
      </div>
    </section>
  );
}
