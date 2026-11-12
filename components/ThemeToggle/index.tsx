import { m } from "framer-motion";
import useReducedMotion from "../../lib/useReducedMotion";
import { useTheme } from "../ThemeProvider";
import styles from "./theme-toggle.module.css";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const reducedMotion = useReducedMotion();
  const label =
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <m.button
      type="button"
      className={styles.toggle}
      aria-label={theme ? label : "Toggle color theme"}
      title={theme ? label : "Toggle color theme"}
      onClick={toggleTheme}
      whileHover={reducedMotion ? undefined : { scale: 1.04 }}
      whileTap={reducedMotion ? undefined : { scale: 0.94 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
    >
      <span className={styles.sky} aria-hidden="true">
        <span className={styles.stars}>
          <span />
          <span />
          <span />
        </span>
        <span className={`${styles.body} ${styles.sun}`}>
          <svg viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="6" fill="currentColor" />
            <path
              d="M16 2v3m0 22v3M2 16h3m22 0h3M6.1 6.1l2.1 2.1m15.6 15.6 2.1 2.1M6.1 25.9l2.1-2.1M23.8 8.2l2.1-2.1"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className={`${styles.body} ${styles.moon}`}>
          <svg viewBox="0 0 32 32" fill="none">
            <path
              d="M25.4 20.3A11 11 0 0 1 11.7 6.6a11 11 0 1 0 13.7 13.7Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span className={styles.horizon} />
      </span>
    </m.button>
  );
}
