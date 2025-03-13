import React, { useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";

interface RevealHeadingProps {
  children: React.ReactNode;
  className?: string;
  once?: boolean;
  threshold?: number;
  staggerLines?: number;
  duration?: number;
  delay?: number;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  lineHeight?: string;
}

export const RevealHeading: React.FC<RevealHeadingProps> = ({
  children,
  className = "",
  once = true,
  threshold = 0.2,
  staggerLines = 0.15,
  duration = 0.7,
  delay = 0,
  tag = "h2",
  lineHeight = "1.2em",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });

  // Convert children to string if possible
  const content = React.Children.toArray(children);

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        delay,
        staggerChildren: staggerLines,
      },
    },
  };

  const lineVariants: Variants = {
    hidden: { y: "100%" },
    visible: {
      y: 0,
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
      aria-label={typeof children === "string" ? children : undefined}
      style={{ lineHeight: 0 }}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {content.map((line, index) => {
        // If the content is a string, we can split it by line breaks
        if (typeof line === "string") {
          return line.split("\n").map((textLine, lineIndex) => (
            <span
              key={`${index}-${lineIndex}`}
              className="block overflow-hidden"
              style={{ lineHeight }}
            >
              <motion.span className="inline-block" variants={lineVariants}>
                {textLine}
              </motion.span>
            </span>
          ));
        }

        // If it's not a string (e.g., React element), wrap it in the animation
        return (
          <span
            key={index}
            className="block overflow-hidden"
            style={{ lineHeight }}
          >
            <motion.span className="inline-block" variants={lineVariants}>
              {line}
            </motion.span>
          </span>
        );
      })}
    </Component>
  );
};

export default RevealHeading;
