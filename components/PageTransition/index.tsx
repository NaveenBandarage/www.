import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const shouldReduceMotion = useReducedMotion();
  const hiddenState = shouldReduceMotion
    ? { opacity: 1 }
    : {
        opacity: 0,
        y: 20,
        scale: 0.995,
        filter: "blur(10px)",
      };
  const visibleState = shouldReduceMotion
    ? { opacity: 1, transition: { duration: 0 } }
    : {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: {
          duration: 0.55,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      };
  const exitState = shouldReduceMotion
    ? { opacity: 1, transition: { duration: 0 } }
    : {
        opacity: 0,
        y: -12,
        scale: 1,
        filter: "blur(8px)",
        transition: {
          duration: 0.26,
          ease: [0.4, 0, 1, 1] as const,
        },
      };

  return (
    <motion.div
      initial={hiddenState}
      animate={visibleState}
      exit={exitState}
      style={{ willChange: "opacity, transform, filter" }}
    >
      {children}
    </motion.div>
  );
}
