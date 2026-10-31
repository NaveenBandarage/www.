import "../styles/globals.css";
import "lenis/dist/lenis.css";
import type { AppProps } from "next/app";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, LazyMotion, MotionConfig } from "framer-motion";
import { useRouter } from "next/router";
import PageTransition from "../components/PageTransition";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import SmoothScroll from "../components/SmoothScroll";
import SignatureIntro from "../components/SignatureIntro";
import NowPlaying from "../components/NowPlaying";
import InteractionSounds from "../components/InteractionSounds";

const loadMotionFeatures = () =>
  import("../lib/motionFeatures").then((module) => module.default);

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  // Play only on a fresh homepage visit. Client-side navigation stays immediate.
  const [introFinished, setIntroFinished] = useState(
    () => router.pathname !== "/",
  );
  const contentRef = useRef<HTMLDivElement>(null);
  const completeIntro = useCallback(() => setIntroFinished(true), []);
  const showIntro = !introFinished && router.pathname === "/";

  useEffect(() => {
    router.events.on("routeChangeStart", completeIntro);
    return () => router.events.off("routeChangeStart", completeIntro);
  }, [router.events, completeIntro]);

  useEffect(() => {
    const send = (path: string) => {
      // Best-effort mirror to Blob-backed API. Keep it non-blocking.
      fetch("/api/analytics-ingest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "pageview", path }),
        keepalive: true,
      }).catch(() => {});
    };

    if (typeof window !== "undefined") {
      send(window.location.pathname);
    }

    const onRoute = (url: string) => {
      try {
        const next = new URL(
          url,
          typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost",
        );
        send(next.pathname);
      } catch {
        // no-op
      }
    };

    router.events.on("routeChangeComplete", onRoute);
    return () => router.events.off("routeChangeComplete", onRoute);
  }, [router.events]);

  return (
    <InteractionSounds>
      <MotionConfig reducedMotion="user">
        <LazyMotion features={loadMotionFeatures} strict>
          {showIntro ? (
            <SignatureIntro
              onComplete={completeIntro}
              contentRef={contentRef}
            />
          ) : null}
          <div ref={contentRef}>
            {router.pathname === "/memory" ||
            router.pathname === "/photos" ||
            router.pathname.startsWith("/photo/") ||
            router.pathname.startsWith("/photos/") ? (
              <Component {...pageProps} />
            ) : (
              <AnimatePresence mode="wait">
                <PageTransition key={router.asPath}>
                  <Component {...pageProps} />
                </PageTransition>
              </AnimatePresence>
            )}
            <NowPlaying />
          </div>
        </LazyMotion>
      </MotionConfig>

      <SmoothScroll />
      <Analytics />
      <SpeedInsights />
    </InteractionSounds>
  );
}
