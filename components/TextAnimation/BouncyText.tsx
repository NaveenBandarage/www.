import { motion, useReducedMotion } from "framer-motion";
import React, { useEffect, useState } from "react";

interface BouncyTextProps {
  text: string;
  delay?: number;
  className?: string;
  letterDelay?: number;
}

const BouncyText: React.FC<BouncyTextProps> = ({
  text,
  delay = 0,
  className = "",
  letterDelay = 80,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [visibleLetters, setVisibleLetters] = useState<number>(0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setVisibleLetters(text.length);
      return;
    }

    const timeouts: NodeJS.Timeout[] = [];
    setVisibleLetters(0);

    const startTimeout = setTimeout(() => {
      let currentLetter = 0;

      const showNextLetter = () => {
        if (currentLetter <= text.length) {
          setVisibleLetters(currentLetter);
          currentLetter += 1;
          if (currentLetter <= text.length) {
            const timeout = setTimeout(showNextLetter, letterDelay);
            timeouts.push(timeout);
          }
        }
      };

      showNextLetter();
    }, delay);

    timeouts.push(startTimeout);

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [text, delay, letterDelay, shouldReduceMotion]);

  if (shouldReduceMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {text.split("").map((letter, index) => {
        const isVisible = index < visibleLetters;

        return (
          <motion.span
            key={`${text}-${index}`}
            className="inline-block"
            initial={{ opacity: 0, y: 8, scale: 0.85, rotate: -3 }}
            animate={
              isVisible
                ? { opacity: 1, y: 0, scale: 1, rotate: 0 }
                : { opacity: 0, y: 8, scale: 0.85, rotate: -3 }
            }
            transition={{
              type: "spring",
              stiffness: 520,
              damping: 26,
              mass: 0.7,
              delay: isVisible ? index * 0.015 : 0,
            }}
          >
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        );
      })}
    </span>
  );
};

export default BouncyText;
