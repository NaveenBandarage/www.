import { motion, useReducedMotion } from "framer-motion";
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
    <motion.span
      className={`transition-all ${className}`}
      initial={
        shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10, filter: "blur(6px)" }
      }
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : {
              duration: duration / 1000,
              delay: delay / 1000,
              ease: [0.22, 1, 0.36, 1],
            }
      }
      style={{ willChange: "opacity, transform, filter" }}
    >
      {children || text}
    </motion.span>
  );
};

export default FadeInText;
