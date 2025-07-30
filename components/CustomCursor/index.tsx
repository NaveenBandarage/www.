"use client";

import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hidden, setHidden] = useState(true);
  const [clicked, setClicked] = useState(false);
  const [linkHovered, setLinkHovered] = useState(false);

  useEffect(() => {
    // Check if we should disable custom cursor first
    if (typeof navigator !== "undefined") {
      const isSafari = /^((?!chrome|android).)*safari/i.test(
        navigator.userAgent,
      );
      const isTouchDevice =
        navigator.maxTouchPoints > 0 ||
        "ontouchstart" in window ||
        /iPad|iPhone|iPod/.test(navigator.userAgent);

      // Don't set up custom cursor if we're going to disable it
      if (isSafari || isTouchDevice) {
        return;
      }
    }

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
      // Safari-compatible hover detection using document.elementFromPoint
      const hoveredElements = document.querySelectorAll(
        "a:hover, button:hover, [role=button]:hover, input[type=button]:hover, input[type=submit]:hover, .cursor-pointer:hover",
      );
      setLinkHovered(hoveredElements.length > 0);
    };

    // Alternative Safari-compatible hover detection using mouse position
    const checkHoverAtPosition = (x: number, y: number) => {
      const elementAtPoint = document.elementFromPoint(x, y);
      if (elementAtPoint) {
        const isHoverable = elementAtPoint.closest(
          "a, button, [role=button], input[type=button], input[type=submit], .cursor-pointer",
        );
        setLinkHovered(!!isHoverable);
      }
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

      // Use Safari-compatible hover detection
      try {
        checkHoverAtPosition(current.x, current.y);
      } catch {
        // Fallback to original method if elementFromPoint fails
        updateLinkHoverStatus();
      }

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

  // Don't render cursor on touch devices or Safari
  if (typeof navigator !== "undefined") {
    // Check for Safari (any version - desktop or mobile)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    // More comprehensive touch device detection
    const isTouchDevice =
      navigator.maxTouchPoints > 0 ||
      "ontouchstart" in window ||
      /iPad|iPhone|iPod/.test(navigator.userAgent);

    // Disable custom cursor on Safari or touch devices
    if (isSafari || isTouchDevice) {
      return null;
    }
  }

  const scale = linkHovered ? 1.1 : clicked ? 0.95 : 1;

  // Calculate cursor hotspot offsets (adjust these based on your image hotspots)
  const arrowOffset = { x: -2, y: -2 }; // Arrow tip offset
  const handOffset = { x: -12, y: -8 }; // Hand pointing finger offset
  const offset = linkHovered ? handOffset : arrowOffset;

  return (
    <>
      {/* Custom Cursor */}
      <div
        className={`fixed pointer-events-none z-50 transition-opacity duration-300 ${
          hidden ? "opacity-0" : "opacity-100"
        }`}
        style={{
          transform: `translate(${position.x + offset.x}px, ${position.y + offset.y}px) scale(${scale})`,
          left: "0px",
          top: "0px",
          transition: "transform 0.15s ease-out",
        }}
      >
        {linkHovered ? (
          // Hand pointing cursor for links
          <img
            src="/handpointing@2x.png"
            alt=""
            width={32}
            height={32}
            className="w-8 h-8"
            style={{
              filter: "drop-shadow(1px 1px 3px rgba(0,0,0,0.3))",
            }}
          />
        ) : (
          // Default arrow cursor
          <img
            src="/default@2x.png"
            alt=""
            width={32}
            height={32}
            className="w-8 h-8"
            style={{
              filter: "drop-shadow(1px 1px 3px rgba(0,0,0,0.3))",
            }}
          />
        )}
      </div>
    </>
  );
}
