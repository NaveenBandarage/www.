import { m } from "framer-motion";
import useReducedMotion from "../../lib/useReducedMotion";
import React from "react";

interface FadeInTextProps {
  text: string;
  delay?: number;
  duration?: number;
  className?: string;
  children?: React.ReactNode;
}

const FadeInText: React.FC<FadeInTextProps> = ({
  text,
  delay = 0,
  duration = 800,
  className = "",
  children,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <m.span
      className={className}
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
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

export default FadeInText;
