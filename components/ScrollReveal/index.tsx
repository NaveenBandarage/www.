import { m } from "framer-motion";
import useReducedMotion from "../../lib/useReducedMotion";
import { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  distance?: number;
  blur?: number;
  once?: boolean;
  amount?: number;
  initiallyVisible?: boolean;
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.55,
  distance = 18,
  blur = 0,
  once = true,
  amount = 0.2,
  initiallyVisible = false,
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      className={className}
      initial={{
        opacity: initiallyVisible ? 1 : 0,
        y: distance,
        ...(blur > 0 ? { filter: `blur(${blur}px)` } : {}),
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        ...(blur > 0 ? { filter: "blur(0px)" } : {}),
      }}
      viewport={{ once, amount }}
      transition={{
        delay,
        duration,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </m.div>
  );
}
