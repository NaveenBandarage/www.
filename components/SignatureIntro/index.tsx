import { m } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import useReducedMotion from "../../lib/useReducedMotion";
import Signature from "../Signature";
import styles from "./intro.module.css";

interface SignatureIntroProps {
  onComplete: () => void;
}

const WRITE_DURATION = 2;
const REVEAL_AT = 2.55;
const REVEAL_DURATION = 0.75;

export default function SignatureIntro({ onComplete }: SignatureIntroProps) {
  const reducedMotion = useReducedMotion();
  const [revealing, setRevealing] = useState(false);
  const skipRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (reducedMotion) {
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
    return () => {
      window.clearTimeout(reveal);
      window.clearTimeout(complete);
    };
  }, [onComplete, reducedMotion]);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.documentElement.style.overflow;
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
      document.documentElement.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (previousFocus?.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [onComplete]);

  return (
    <m.div
      className={styles.intro}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Naveen Bandarage’s website"
      initial={false}
      animate={{ opacity: revealing ? 0 : 1 }}
      transition={{ duration: REVEAL_DURATION, ease: [0.22, 1, 0.36, 1] }}
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
