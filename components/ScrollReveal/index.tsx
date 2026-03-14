import { motion, useReducedMotion } from "framer-motion";
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
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.55,
  distance = 18,
  blur = 8,
  once = true,
  amount = 0.2,
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance, filter: `blur(${blur}px)` }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, amount }}
      transition={{
        delay,
        duration,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ willChange: "opacity, transform, filter" }}
    >
      {children}
    </motion.div>
  );
}
