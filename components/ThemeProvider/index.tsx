import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme | null;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme requires ThemeProvider");
  return context;
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme | null>(null);
  const preference = useRef<Theme | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout>>();

  function applyTheme(next: Theme, animate = false) {
    const root = document.documentElement;
    clearTimeout(transitionTimer.current);
    if (
      animate &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      root.dataset.themeChanging = "true";
      // Commit transition styles before changing the palette in the same event.
      void root.offsetWidth;
      transitionTimer.current = setTimeout(() => {
        delete root.dataset.themeChanging;
      }, 500);
    } else {
      delete root.dataset.themeChanging;
    }
    root.classList.toggle("dark", next === "dark");
    root.style.colorScheme = next;
    setTheme(next);
  }

  useEffect(() => {
    const system = window.matchMedia("(prefers-color-scheme: dark)");
    const readPreference = () => {
      try {
        const saved = localStorage.getItem("site-theme");
        preference.current =
          saved === "light" || saved === "dark" ? saved : null;
      } catch {
        // Theme switching still works when storage is unavailable.
      }
      applyTheme(preference.current ?? (system.matches ? "dark" : "light"));
    };
    const onSystemChange = () => {
      if (!preference.current)
        applyTheme(system.matches ? "dark" : "light", true);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === "site-theme" || event.key === null) readPreference();
    };

    readPreference();
    system.addEventListener("change", onSystemChange);
    window.addEventListener("storage", onStorage);
    return () => {
      system.removeEventListener("change", onSystemChange);
      window.removeEventListener("storage", onStorage);
      clearTimeout(transitionTimer.current);
      delete document.documentElement.dataset.themeChanging;
    };
  }, []);

  function toggleTheme() {
    const next = document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";
    preference.current = next;
    applyTheme(next, true);
    try {
      localStorage.setItem("site-theme", next);
    } catch {
      // Retain the choice for this visit even without persistent storage.
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
