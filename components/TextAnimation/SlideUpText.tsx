import React, { useState, useEffect } from "react";

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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay]);

  if (staggerChildren && !children) {
    const words = text.split(" ");
    return (
      <span className={className}>
        {words.map((word, index) => (
          <SlideUpText
            key={index}
            text={word}
            delay={delay + index * staggerDelay}
            duration={duration}
            className="inline-block mr-1"
          />
        ))}
      </span>
    );
  }

  return (
    <span
      className={`inline-block transition-all ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {children || text}
    </span>
  );
};

export default SlideUpText;
