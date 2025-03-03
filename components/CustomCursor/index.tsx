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
        "a:hover, button:hover, [role=button]:hover",
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

  return (
    <>
      {/* Main cursor dot */}
      <div
        className={`fixed pointer-events-none z-50 rounded-full transition-opacity duration-300 ${
          hidden ? "opacity-0" : "opacity-100"
        }`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          width: linkHovered ? "40px" : "12px",
          height: linkHovered ? "40px" : "12px",
          backgroundColor: clicked
            ? "rgba(255, 255, 255, 0.5)"
            : "rgba(255, 255, 255, 0.8)",
          mixBlendMode: "difference",
          left: linkHovered ? "-20px" : "-6px",
          top: linkHovered ? "-20px" : "-6px",
          transition:
            "width 0.2s, height 0.2s, background-color 0.2s, left 0.2s, top 0.2s",
        }}
      />

      {/* Subtle outer ring */}
      <div
        className={`fixed pointer-events-none z-40 rounded-full border border-white/30 transition-opacity duration-300 ${
          hidden ? "opacity-0" : "opacity-100"
        }`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          width: linkHovered ? "60px" : "30px",
          height: linkHovered ? "60px" : "30px",
          backgroundColor: "transparent",
          left: linkHovered ? "-30px" : "-15px",
          top: linkHovered ? "-30px" : "-15px",
          transition: "width 0.3s, height 0.3s, left 0.3s, top 0.3s",
          transitionTimingFunction: "ease-out",
        }}
      />
    </>
  );
}
