import useReducedMotion from "../../lib/useReducedMotion";
import React, { useEffect, useState } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
  cursor?: boolean;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 50,
  delay = 0,
  className = "",
  onComplete,
  cursor = true,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let startTimeout: NodeJS.Timeout | undefined;
    let typingTimeout: NodeJS.Timeout | undefined;
    let isCancelled = false;

    setDisplayedText("");
    setIsComplete(false);

    const completeImmediately = () => {
      if (isCancelled) return;
      setDisplayedText(text);
      setIsComplete(true);
      onComplete?.();
    };

    if (shouldReduceMotion || speed <= 0 || text.length === 0) {
      if (!shouldReduceMotion && delay > 0) {
        startTimeout = setTimeout(completeImmediately, delay);
      } else {
        completeImmediately();
      }

      return () => {
        isCancelled = true;
        if (startTimeout) clearTimeout(startTimeout);
      };
    }

    const startTyping = () => {
      let currentIndex = 0;

      const typeNextCharacter = () => {
        if (isCancelled) return;

        if (currentIndex < text.length) {
          currentIndex += 1;
          setDisplayedText(text.slice(0, currentIndex));
          typingTimeout = setTimeout(typeNextCharacter, speed);
          return;
        }

        setIsComplete(true);
        onComplete?.();
      };

      typeNextCharacter();
    };

    if (delay > 0) {
      startTimeout = setTimeout(startTyping, delay);
    } else {
      startTyping();
    }

    return () => {
      isCancelled = true;
      if (startTimeout) clearTimeout(startTimeout);
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [text, speed, delay, onComplete, shouldReduceMotion]);

  return (
    <span className={`inline-grid ${className}`}>
      <span className="invisible col-start-1 row-start-1" aria-hidden="true">
        {text}
        {cursor ? "|" : ""}
      </span>
      <span className="sr-only">{text}</span>
      <span className="col-start-1 row-start-1" aria-hidden="true">
        {shouldReduceMotion ? text : displayedText}
        {cursor && !isComplete && !shouldReduceMotion && (
          <span className="animate-pulse text-neutral-400 dark:text-neutral-500">
            |
          </span>
        )}
      </span>
    </span>
  );
};

export default TypewriterText;
