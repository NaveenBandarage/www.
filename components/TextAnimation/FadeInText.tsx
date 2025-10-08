import React, { useState, useEffect } from "react";

interface FadeInTextProps {
  text?: string;
  delay?: number;
  duration?: number;
  className?: string;
  children?: React.ReactNode;
}

const FadeInText: React.FC<FadeInTextProps> = ({
  text = "",
  delay = 0,
  duration = 800,
  className = "",
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <span
      className={`transition-all ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(10px)",
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {children || text}
    </span>
  );
};

export default FadeInText;
