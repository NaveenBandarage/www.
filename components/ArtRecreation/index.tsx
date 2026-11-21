import { useState } from "react";
import Image from "next/image";
import useReducedMotion from "../../lib/useReducedMotion";
import styles from "./art.module.css";

// Keep the full engraving out of the React tree. Its SVG paths are a separate,
// cacheable plate; only the tiny flame layers animate, without per-frame JS.
function CandleFlame() {
  return (
    <>
      <svg viewBox="0 0 960 767" className={styles.glow} aria-hidden="true">
        <defs>
          <radialGradient id="candle-light">
            <stop offset="0" stopColor="#ffe6a1" stopOpacity="0.42" />
            <stop offset="0.32" stopColor="#f4d28d" stopOpacity="0.18" />
            <stop offset="1" stopColor="#f4d28d" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse
          cx="477"
          cy="348"
          rx="136"
          ry="168"
          fill="url(#candle-light)"
        />
      </svg>

      <div className={styles.flameAnchor}>
        <div className={styles.flameSway}>
          <svg viewBox="0 0 88 172" className={styles.flame} aria-hidden="true">
            <defs>
              <linearGradient id="candle-flame" x1="0" y1="0" x2="0.22" y2="1">
                <stop offset="0" stopColor="#e4d7b5" />
                <stop offset="0.58" stopColor="#efdfb4" />
                <stop offset="1" stopColor="#d9c596" />
              </linearGradient>
              <linearGradient id="candle-heart" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fff0c8" stopOpacity="0" />
                <stop offset="0.6" stopColor="#fff0c8" stopOpacity="0.7" />
                <stop offset="1" stopColor="#fff0c8" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path
              d="M44 158 C30 150 16 137 16 116 C15 94 24 76 26 58 C28 42 27 28 39 14 C35 35 42 52 48 66 C57 87 70 108 67 126 C65 144 54 154 44 158 Z"
              fill="url(#candle-flame)"
              stroke="#706344"
              strokeWidth="0.9"
            />
            <path
              className={styles.flameHeart}
              d="M44 155 C32 141 29 127 34 109 C38 96 41 89 40 76 C52 96 57 115 53 134 C51 143 47 150 44 155 Z"
              fill="url(#candle-heart)"
            />
            <g fill="none" stroke="#6c5e3f" strokeLinecap="round">
              <path
                d="M35 145 C29 133 28 124 29 114 M38 143 C34 131 34 125 35 121 M51 143 C59 131 60 120 57 110 M55 137 C58 128 57 121 56 117"
                strokeWidth="1"
              />
              <path
                d="M24 120 L25 126 M26 133 L29 141 M31 110 L31 116 M30 93 L31 98 M33 81 L34 86 M34 66 L35 71 M43 60 L45 65 M51 87 L53 93 M61 116 L61 124 M48 145 L47 151 M39 147 L40 153"
                strokeWidth="0.7"
              />
              <path
                d="M42 152 C36 139 38 126 40 118 C39 133 43 139 44 149 C46 142 48 137 47 129"
                strokeWidth="1.8"
              />
            </g>
          </svg>
        </div>
      </div>

      <svg viewBox="0 0 960 767" className={styles.wick} aria-hidden="true">
        <path
          d="M476 401 C477 393 474 389 475 381"
          fill="none"
          stroke="#29251c"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M475 382 L476 386"
          fill="none"
          stroke="#b78b51"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </>
  );
}

export default function ArtRecreation() {
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();

  return (
    <figure className="mt-8">
      <div
        className={styles.artwork}
        data-paused={paused}
        role="img"
        aria-label={`An engraving in dark ink on aged paper: three hands shelter a ${reducedMotion ? "candle" : "flickering candle"} and hold a taper to its flame.`}
      >
        <Image
          src="/fun/art-recreation/engraving.svg"
          alt=""
          width={960}
          height={767}
          priority
          className={styles.engraving}
          draggable={false}
        />
        <CandleFlame />
        <svg className={styles.grain} viewBox="0 0 960 767" aria-hidden="true">
          <filter id="engraving-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="3"
              stitchTiles="stitch"
              seed="8"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect
            width="960"
            height="767"
            filter="url(#engraving-grain)"
            opacity="0.22"
          />
        </svg>
      </div>
      <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm text-neutral-500 dark:text-silver-dark">
        <span>A little light, held between hands.</span>
        <span className={`${styles.reducedMotionNote} text-xs`}>
          Reduced motion is on
        </span>
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          className={styles.pauseButton}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="currentColor"
            aria-hidden="true"
          >
            {paused ? (
              <path d="M3 1.5 10 6 3 10.5Z" />
            ) : (
              <path d="M2.5 2h2.25v8H2.5zm4.75 0H9.5v8H7.25z" />
            )}
          </svg>
          {paused ? "Resume flame" : "Pause flame"}
        </button>
      </figcaption>
    </figure>
  );
}
