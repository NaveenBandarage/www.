import React, { useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";

interface RevealTextProps {
  text: string;
  className?: string;
  once?: boolean;
  threshold?: number;
  type?: "words" | "sentences";
  staggerChildren?: number;
  duration?: number;
  delay?: number;
  delayChildren?: number;
  tag?: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span" | "div";
}

export const RevealText: React.FC<RevealTextProps> = ({
  text,
  className = "",
  once = true,
  threshold = 0.2,
  type = "words",
  staggerChildren = 0.05,
  duration = 0.5,
  delay = 0,
  delayChildren = 0,
  tag = "p",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });

  // Split text into words or sentences
  const items =
    type === "words"
      ? text.split(/\s+/).map((word) => word)
      : text.split(/(?<=[.!?])\s+/).filter(Boolean);

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        delay,
        staggerChildren,
        delayChildren,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      y: "100%",
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    },
  };

  // Dynamically create the component based on the tag prop
  const Component = motion[tag as keyof typeof motion];

  return (
    <Component
      ref={ref}
      className={`${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {items.map((item, index) => (
        <span key={index} className="inline-block overflow-hidden">
          <motion.span className="inline-block" variants={itemVariants}>
            {item}
          </motion.span>
        </span>
      ))}
      {type === "words" &&
        items.length > 0 &&
        items.map((_, index) =>
          index < items.length - 1 ? (
            <span
              key={`space-${index}`}
              className="inline-block overflow-hidden"
            >
              <motion.span
                className="inline-block"
                variants={itemVariants}
                style={{ marginRight: "0.25em" }}
              >
                {/* Space between words */}
              </motion.span>
            </span>
          ) : null,
        )}
    </Component>
  );
};

export default RevealText;
