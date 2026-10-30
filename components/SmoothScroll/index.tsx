import { useEffect } from "react";

export default function SmoothScroll() {
  useEffect(() => {
    let isMounted = true;
    let generation = 0;
    let destroy: (() => void) | undefined;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    // Load the scroll enhancement after hydration so it does not delay the
    // initial page render or run during server-side rendering.
    const syncScroll = async () => {
      const currentGeneration = ++generation;
      destroy?.();
      destroy = undefined;
      if (reducedMotion.matches || !finePointer.matches) return;

      try {
        const { default: Lenis } = await import("lenis");
        if (!isMounted || currentGeneration !== generation) return;

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
      } catch {
        // Native scrolling remains available if the enhancement cannot load.
      }
    };
    void syncScroll();
    reducedMotion.addEventListener("change", syncScroll);
    finePointer.addEventListener("change", syncScroll);

    return () => {
      isMounted = false;
      reducedMotion.removeEventListener("change", syncScroll);
      finePointer.removeEventListener("change", syncScroll);
      destroy?.();
    };
  }, []);

  return null;
}
