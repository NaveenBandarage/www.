"use client";

import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hidden, setHidden] = useState(true);
  const [clicked, setClicked] = useState(false);
  const [linkHovered, setLinkHovered] = useState(false);

  useEffect(() => {
    // Hide default cursor
    document.body.style.cursor = "none";
    // Add the custom-cursor-active class to the body
    document.body.classList.add("custom-cursor-active");

    // Target position
    const target = { x: 0, y: 0 };
    // Current position (for smooth interpolation)
    const current = { x: 0, y: 0 };
    // Speed of cursor following (lower = smoother but more lag)
    const ease = 0.15;

    const updateCursorPosition = (e: MouseEvent) => {
      setHidden(false);
      target.x = e.clientX;
      target.y = e.clientY;
    };

    const updateLinkHoverStatus = () => {
      const hoveredElements = document.querySelectorAll(
        "a:hover, button:hover, [role=button]:hover, input[type=button]:hover, input[type=submit]:hover, .cursor-pointer:hover",
      );
      setLinkHovered(hoveredElements.length > 0);
    };

    const handleMouseDown = () => setClicked(true);
    const handleMouseUp = () => setClicked(false);

    const handleMouseLeave = () => setHidden(true);
    const handleMouseEnter = () => setHidden(false);

    // Animation loop for smooth following
    let animationFrameId: number;

    const render = () => {
      // Linear interpolation for smooth movement
      current.x += (target.x - current.x) * ease;
      current.y += (target.y - current.y) * ease;

      // Update cursor position
      setPosition({
        x: current.x,
        y: current.y,
      });

      // Check if hovering over links
      updateLinkHoverStatus();

      // Continue animation loop
      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", updateCursorPosition);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mouseenter", handleMouseEnter);

    // Start animation loop
    animationFrameId = requestAnimationFrame(render);

    // Cleanup
    return () => {
      document.body.style.cursor = "auto";
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", updateCursorPosition);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Don't render cursor on touch devices
  if (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) {
    return null;
  }

  const scale = linkHovered ? 1.1 : clicked ? 0.95 : 1;

  return (
    <>
      {/* Vintage macOS Arrow Cursor */}
      <div
        className={`fixed pointer-events-none z-50 transition-opacity duration-300 ${
          hidden ? "opacity-0" : "opacity-100"
        }`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          left: "0px",
          top: "0px",
          transition: "transform 0.15s ease-out",
        }}
      >
        {linkHovered ? (
          // Simple hand cursor for links
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter:
                "drop-shadow(1px 1px 2px rgba(0,0,0,0.8)) drop-shadow(-1px -1px 0px rgba(255,255,255,0.3))",
            }}
          >
            <path
              d="M7 3V9H6V5C6 4.5 5.5 4 5 4S4 4.5 4 5V11L7 14H13C14 14 15 13 15 12V8C15 7.5 14.5 7 14 7S13 7.5 13 8H12V6C12 5.5 11.5 5 11 5S10 5.5 10 6V7H9V4C9 3.5 8.5 3 8 3S7 3.5 7 4V3Z"
              fill="#2d2d2d"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          // Arrow cursor
          <>
            {/* White border for visibility on dark backgrounds */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute"
              style={{
                filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.6))",
              }}
            >
              <path
                d="M2 2L2 15L7 11.5L9.5 16.5L12 15L9.5 10L15 10L2 2Z"
                fill="#ffffff"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>

            {/* Black arrow fill */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute"
            >
              <path
                d="M2.5 2.5L2.5 14L6.5 11L8.5 15.5L11 14.5L8.5 9.5L14 9.5L2.5 2.5Z"
                fill="#2d2d2d"
              />
            </svg>

            {/* Classic macOS highlight dot */}
            <div
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: "3px",
                top: "3px",
                opacity: clicked ? 1 : 0.7,
                filter: "drop-shadow(0px 0px 1px rgba(0,0,0,0.5))",
              }}
            />
          </>
        )}
      </div>
    </>
  );
}
