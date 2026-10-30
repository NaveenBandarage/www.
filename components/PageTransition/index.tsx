import { m } from "framer-motion";
import useReducedMotion from "../../lib/useReducedMotion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const shouldReduceMotion = useReducedMotion();
  const hiddenState = shouldReduceMotion
    ? { opacity: 1 }
    : {
        opacity: 1,
        y: 8,
      };
  const visibleState = shouldReduceMotion
    ? { opacity: 1, transition: { duration: 0 } }
    : {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      };
  const exitState = shouldReduceMotion
    ? { opacity: 1, transition: { duration: 0 } }
    : {
        opacity: 0,
        y: -12,
        transition: {
          duration: 0.18,
          ease: [0.4, 0, 1, 1] as const,
        },
      };

  return (
    <m.div initial={hiddenState} animate={visibleState} exit={exitState}>
      {children}
    </m.div>
  );
}
