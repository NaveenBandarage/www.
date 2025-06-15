import React, { useState, useEffect } from "react";

interface BouncyTextProps {
  text: string;
  delay?: number;
  className?: string;
  letterDelay?: number;
}

const BouncyText: React.FC<BouncyTextProps> = ({
  text,
  delay = 0,
  className = "",
  letterDelay = 80,
}) => {
  const [visibleLetters, setVisibleLetters] = useState<number>(0);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      let currentLetter = 0;

      const showNextLetter = () => {
        if (currentLetter <= text.length) {
          setVisibleLetters(currentLetter);
          currentLetter++;
          if (currentLetter <= text.length) {
            setTimeout(showNextLetter, letterDelay);
          }
        }
      };

      showNextLetter();
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, delay, letterDelay]);

  return (
    <span className={className}>
      {text.split("").map((letter, index) => (
        <span
          key={index}
          className={`inline-block transition-all duration-300 ${
            index < visibleLetters
              ? "opacity-100 transform translate-y-0"
              : "opacity-0 transform translate-y-2"
          }`}
          style={{
            transitionDelay: index < visibleLetters ? `${index * 30}ms` : "0ms",
            animation:
              index < visibleLetters ? "bounce-in 0.6s ease-out" : "none",
          }}
        >
          {letter === " " ? "\u00A0" : letter}
        </span>
      ))}
      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: translateY(10px) scale(0.8);
            opacity: 0;
          }
          50% {
            transform: translateY(-5px) scale(1.1);
            opacity: 0.8;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </span>
  );
};

export default BouncyText;
