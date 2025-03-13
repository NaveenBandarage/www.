import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface SlideTextProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: "left" | "right" | "up" | "down";
  className?: string;
  once?: boolean;
  threshold?: number;
}

export const SlideText: React.FC<SlideTextProps> = ({
  children,
  delay = 0,
  duration = 0.5,
  direction = "up",
  className = "",
  once = true,
  threshold = 0.5,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });

  // Define the initial and animate positions based on direction
  const getDirectionVariants = () => {
    switch (direction) {
      case "left":
        return {
          hidden: { x: "100%" },
          visible: { x: 0 },
        };
      case "right":
        return {
          hidden: { x: "-100%" },
          visible: { x: 0 },
        };
      case "down":
        return {
          hidden: { y: "-100%" },
          visible: { y: 0 },
        };
      case "up":
      default:
        return {
          hidden: { y: "100%" },
          visible: { y: 0 },
        };
    }
  };

  const directionVariants = getDirectionVariants();

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{ display: "inline-block" }}
    >
      <div className="relative" style={{ opacity: 0 }}>
        {children}
      </div>
      <motion.div
        className="absolute top-0 left-0"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={directionVariants}
        transition={{
          duration,
          delay,
          ease: [0.2, 0.65, 0.3, 0.9], // Custom easing curve for a smooth effect
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SlideText;
