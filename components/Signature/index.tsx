import type { CSSProperties } from "react";
import styles from "./signature.module.css";

interface SignatureProps {
  /** Time taken to write the whole signature, in seconds. */
  duration?: number;
  delay?: number;
}

// Single-line pen strokes, in writing order.
// Keeping the artwork local avoids a font request and preserves the same hand
// on every device. Each letter starts where the previous pen stroke finishes.
const strokes = [
  {
    x: 0,
    d: "M8 76 C19 65 29 37 32 22 C35 7 16 14 14 29 C11 46 18 69 23 77 C27 60 37 32 46 18 C40 38 39 63 48 72 C52 77 56 73 61 67",
  },
  {
    x: 61,
    d: "M0 67 C7 53 22 48 24 58 C25 68 13 80 7 75 C0 68 15 51 24 56 L18 71 C16 79 24 77 32 67",
  },
  {
    x: 93,
    d: "M0 67 L8 54 C4 65 3 78 10 76 C20 72 31 56 27 53 C22 50 21 62 28 64 C31 65 34 65 37 62",
  },
  { x: 130, d: "M0 62 C23 58 14 45 5 56 C-7 71 1 82 14 75 L25 67" },
  { x: 155, d: "M0 67 C23 59 19 46 9 54 C-5 66 -1 82 14 75 L25 67" },
  {
    x: 180,
    d: "M0 67 L9 54 L2 76 C8 63 22 49 24 57 C26 62 15 76 23 76 C28 76 33 71 37 67",
  },
  {
    x: 244,
    d: "M0 79 C10 64 18 37 22 18 C15 39 7 70 11 77 M10 33 C25 6 56 16 43 34 C37 43 25 46 19 46 C39 38 54 47 43 63 C35 76 18 79 11 74 C20 82 38 77 49 67",
  },
  {
    x: 293,
    d: "M0 67 C7 53 22 48 24 58 C25 68 13 80 7 75 C0 68 15 51 24 56 L18 71 C16 79 24 77 32 67",
  },
  {
    x: 325,
    d: "M0 67 L9 54 L2 76 C8 63 22 49 24 57 C26 62 15 76 23 76 C28 76 33 71 37 67",
  },
  {
    x: 362,
    d: "M0 67 C8 53 23 48 24 57 C24 65 12 80 6 75 C-1 69 10 52 24 56 C35 42 43 17 37 16 C31 15 25 45 20 66 C15 85 28 76 36 67",
  },
  {
    x: 398,
    d: "M0 67 C7 53 22 48 24 58 C25 68 13 80 7 75 C0 68 15 51 24 56 L18 71 C16 79 24 77 32 67",
  },
  {
    x: 430,
    d: "M0 67 C6 61 12 53 12 51 C8 52 7 59 12 60 L21 57 C17 64 12 77 19 76 L30 67",
  },
  {
    x: 460,
    d: "M0 67 C7 53 22 48 24 58 C25 68 13 80 7 75 C0 68 15 51 24 56 L18 71 C16 79 24 77 32 67",
  },
  {
    x: 492,
    d: "M0 67 C8 52 23 49 23 58 C22 67 12 79 6 74 C-1 68 12 51 23 56 C19 76 9 108 0 104 C-11 99 15 82 34 67",
  },
  {
    x: 526,
    d: "M0 67 C23 59 19 46 9 54 C-5 66 -1 82 14 75 C23 71 30 64 34 60",
  },
];

// Give loops and capitals more time than the short connecting strokes.
const strokeWeights = [7, 4, 5, 4, 4, 5, 11, 4, 5, 8, 4, 4, 4, 8, 4];
const totalWeight = strokeWeights.reduce((sum, weight) => sum + weight, 0);
const words = [
  { start: 0, end: 6, viewBox: "-5 0 235 115" },
  { start: 6, end: 15, viewBox: "236 0 340 115" },
];

export default function Signature({ duration = 2, delay = 0 }: SignatureProps) {
  return (
    <div className={styles.signature} aria-hidden="true">
      {words.map(({ start, end, viewBox }, word) => (
        <svg
          key={word}
          className={word === 0 ? styles.firstWord : styles.lastWord}
          focusable="false"
          viewBox={viewBox}
          fill="none"
        >
          {strokes.slice(start, end).map(({ x, d }, letter) => {
            const index = start + letter;
            const elapsedWeight = strokeWeights
              .slice(0, index)
              .reduce((sum, weight) => sum + weight, 0);
            return (
              <path
                key={index}
                d={d}
                transform={`translate(${x} 0)`}
                pathLength="1"
                stroke="white"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.stroke}
                style={
                  {
                    "--stroke-duration": `${(duration * strokeWeights[index]) / totalWeight}s`,
                    "--stroke-delay": `${delay + (elapsedWeight * duration) / totalWeight}s`,
                  } as CSSProperties
                }
              />
            );
          })}
        </svg>
      ))}
      <svg
        className={styles.underline}
        focusable="false"
        viewBox="0 0 600 28"
        fill="none"
      >
        <path
          d="M12 19 C149 2 355 7 535 13 C560 14 580 13 590 9"
          pathLength="1"
          stroke="white"
          strokeWidth="2.8"
          strokeLinecap="round"
          className={styles.stroke}
          style={
            {
              "--stroke-duration": "0.3s",
              "--stroke-delay": `${delay + duration}s`,
            } as CSSProperties
          }
        />
      </svg>
    </div>
  );
}
