import { m } from "framer-motion";
import { useEffect, useRef, useState, type RefObject } from "react";
import useReducedMotion from "../../lib/useReducedMotion";
import Signature from "../Signature";
import styles from "./intro.module.css";

interface SignatureIntroProps {
  onComplete: () => void;
  contentRef: RefObject<HTMLDivElement>;
}

const WRITE_DURATION = 2;
const REVEAL_AT = 2.55;
const REVEAL_DURATION = 0.75;

export default function SignatureIntro({
  onComplete,
  contentRef,
}: SignatureIntroProps) {
  const reducedMotion = useReducedMotion();
  const [revealing, setRevealing] = useState(false);
  const skipRef = useRef<HTMLButtonElement>(null);
  const introRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) {
      onComplete();
      return;
    }

    // The CSS deadline starts at first paint, which may precede hydration.
    // Never acquire interaction locks for an intro that has already disappeared.
    const intro = introRef.current;
    if (!intro) return;
    const { visibility, display } = window.getComputedStyle(intro);
    if (visibility === "hidden" || display === "none") {
      onComplete();
      return;
    }

    const reveal = window.setTimeout(
      () => setRevealing(true),
      REVEAL_AT * 1000,
    );
    // A deadline also guarantees dismissal if motion features fail to load.
    const complete = window.setTimeout(
      onComplete,
      (REVEAL_AT + REVEAL_DURATION) * 1000,
    );
    const content = contentRef.current;
    const previousInert = content?.inert ?? false;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.documentElement.style.overflow;
    if (content) content.inert = true;
    document.documentElement.style.overflow = "hidden";
    skipRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onComplete();
      if (event.key === "Tab") {
        event.preventDefault();
        skipRef.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(reveal);
      window.clearTimeout(complete);
      if (content) content.inert = previousInert;
      document.documentElement.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (previousFocus?.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [onComplete, reducedMotion, contentRef]);

  return (
    <m.div
      ref={introRef}
      className={styles.intro}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Naveen Bandarage’s website"
      initial={false}
      animate={{ opacity: revealing ? 0 : 1 }}
      transition={{ duration: REVEAL_DURATION, ease: [0.22, 1, 0.36, 1] }}
      onAnimationEnd={(event) => {
        // Also release React state and locks when the paint-based fallback wins.
        // Letter stroke animations bubble through this element too.
        if (event.target === event.currentTarget) onComplete();
      }}
    >
      <m.div
        aria-hidden="true"
        className="relative flex w-full justify-center px-8 text-white sm:px-12"
        initial={false}
        animate={{
          opacity: revealing ? 0 : 1,
          y: revealing ? -8 : 0,
          scale: revealing ? 1.025 : 1,
        }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <Signature duration={WRITE_DURATION} delay={0.15} />
      </m.div>

      <button
        ref={skipRef}
        type="button"
        onClick={onComplete}
        className="absolute bottom-8 right-8 rounded-full px-3 py-2 text-xs text-neutral-500 outline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-neutral-500 sm:bottom-10 sm:right-10"
      >
        Skip intro
      </button>
    </m.div>
  );
}
