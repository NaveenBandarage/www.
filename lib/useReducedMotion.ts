import { useSyncExternalStore } from "react";
import { useReducedMotion as useMotionReducedMotion } from "framer-motion";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/** Match server markup during hydration, then apply the user's motion preference. */
export default function useReducedMotion(): boolean {
  const hydrated = useSyncExternalStore(
    subscribe,
    clientSnapshot,
    serverSnapshot,
  );
  const reducedMotion = useMotionReducedMotion();
  return hydrated && Boolean(reducedMotion);
}
