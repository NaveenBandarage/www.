import "../styles/globals.css";
import type { AppProps as NextAppProps } from "next/app";
import { ApolloCache, ApolloProvider } from "@apollo/client";
import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import PageTransition from "../components/PageTransition";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

// Import GlobalClickSound with dynamic loading (no SSR)
const GlobalClickSound = dynamic(
  () => import("../components/GlobalClickSound"),
  {
    ssr: false,
  },
);

type AppProps<P = any> = {
  pageProps: P;
} & Omit<NextAppProps<P>, "pageProps">;

interface CustomPageProps {
  initialApolloState?: ApolloCache<any>;
}

export default function MyApp({
  Component,
  pageProps,
}: AppProps<CustomPageProps>) {
  const router = useRouter();

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
    <div className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <style jsx global>
        {`
          :root {
            --font-geist-sans: ${GeistSans.style.fontFamily};
            --font-geist-mono: ${GeistMono.style.fontFamily};
          }
        `}
      </style>
      <AnimatePresence mode="wait">
        <PageTransition key={router.asPath}>
          <Component {...pageProps} />
        </PageTransition>
      </AnimatePresence>

      <GlobalClickSound />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
