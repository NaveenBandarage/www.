import { useSyncExternalStore } from "react";
let preference: MediaQueryList | undefined;
const listeners = new Set<() => void>();
const getPreference = () =>
  (preference ??= window.matchMedia("(prefers-reduced-motion: reduce)"));
const notify = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  const media = getPreference();
  if (!listeners.size) media.addEventListener("change", notify);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) media.removeEventListener("change", notify);
  };
};
const clientSnapshot = () => getPreference().matches;
const serverSnapshot = () => false;

/** Match server markup during hydration, then apply the user's motion preference. */
export default function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
}
