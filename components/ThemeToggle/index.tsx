import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "crazy";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get initial theme from localStorage or default to light
    const savedTheme = (localStorage.getItem("theme") as Theme) || "light";
    applyTheme(savedTheme, false);
    setTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: Theme, animate = true) => {
    const html = document.documentElement;

    // Apply theme with View Transitions API
    const updateTheme = () => {
      // Remove all theme classes
      html.classList.remove("light", "dark", "crazy");

      // Add new theme class
      html.classList.add(newTheme);

      // Save to localStorage
      localStorage.setItem("theme", newTheme);

      setTheme(newTheme);
    };

    // Check if View Transitions API is supported and animation is requested
    if (animate && "startViewTransition" in document) {
      // @ts-ignore - View Transitions API
      document.startViewTransition(() => {
        updateTheme();
      });
    } else {
      updateTheme();
    }
  };

  const cycleTheme = () => {
    const themes: Theme[] = ["light", "dark", "crazy"];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    applyTheme(nextTheme);
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        className="relative h-9 w-9 rounded-lg border border-neutral-200 dark:border-neutral-800"
        aria-label="Toggle theme"
      />
    );
  }

  return (
    <button
      onClick={cycleTheme}
      className="link-fade group relative h-9 w-9 rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 crazy:border-transparent crazy:bg-gradient-to-br crazy:from-pink-500 crazy:via-purple-500 crazy:to-cyan-500"
      aria-label={`Current theme: ${theme}. Click to cycle to next theme.`}
      title={`Current: ${theme} mode`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Light mode icon */}
        <svg
          className={`absolute h-5 w-5 transition-all duration-300 ${
            theme === "light"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
        </svg>

        {/* Dark mode icon */}
        <svg
          className={`absolute h-5 w-5 transition-all duration-300 ${
            theme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>

        {/* Crazy mode icon */}
        <svg
          className={`absolute h-5 w-5 transition-all duration-300 ${
            theme === "crazy"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-180 scale-0 opacity-0"
          }`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm10 0c.83 0 1.5-.67 1.5-1.5S17.83 8 17 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-5 5.5l-3.5 1.5c.93 1.26 2.42 2 4 2s3.07-.74 4-2l-3.5-1.5H12z" />
        </svg>
      </div>
    </button>
  );
}
