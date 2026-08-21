import { useEffect } from "react";

export default function SmoothScroll() {
  useEffect(() => {
    let isMounted = true;
    let destroy: (() => void) | undefined;

    // Load the scroll enhancement after hydration so it does not delay the
    // initial page render or run during server-side rendering.
    void import("lenis").then(({ default: Lenis }) => {
      if (!isMounted) return;

      const lenis = new Lenis({
        anchors: true,
        autoRaf: true,
        lerp: 0.09,
        smoothWheel: true,
        stopInertiaOnNavigate: true,
        respectReducedMotion: true,
        wheelMultiplier: 0.95,
      });

      destroy = () => lenis.destroy();
    });

    return () => {
      isMounted = false;
      destroy?.();
    };
  }, []);

  return null;
}
