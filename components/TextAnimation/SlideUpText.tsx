import { m } from "framer-motion";
import useReducedMotion from "../../lib/useReducedMotion";
import React from "react";

interface SlideUpTextProps {
  text: string;
  delay?: number;
  duration?: number;
  className?: string;
  staggerChildren?: boolean;
  staggerDelay?: number;
  children?: React.ReactNode;
}

const SlideUpText: React.FC<SlideUpTextProps> = ({
  text,
  delay = 0,
  duration = 600,
  className = "",
  staggerChildren = false,
  staggerDelay = 50,
  children,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (staggerChildren && !children) {
    const words = text.split(" ");

    return (
      <span className={className}>
        {words.map((word, index) => (
          <m.span
            key={`${word}-${index}`}
            className="inline-block mr-1"
            initial={
              shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    duration: duration / 1000,
                    delay: (delay + index * staggerDelay) / 1000,
                    ease: [0.22, 1, 0.36, 1],
                  }
            }
          >
            {word}
          </m.span>
        ))}
      </span>
    );
  }

  return (
    <m.span
      className={`inline-block ${className}`}
      initial={
        shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
      }
      animate={{ opacity: 1, y: 0 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : {
              duration: duration / 1000,
              delay: delay / 1000,
              ease: [0.22, 1, 0.36, 1],
            }
      }
    >
      {children || text}
    </m.span>
  );
};

export default SlideUpText;
