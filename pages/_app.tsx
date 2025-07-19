import "../styles/globals.css";
import type { AppProps as NextAppProps } from "next/app";
import { ApolloCache, ApolloProvider } from "@apollo/client";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import localFont from "next/font/local";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import PageTransition from "../components/PageTransition";

// Import CustomCursor with dynamic loading (no SSR)
const CustomCursor = dynamic(() => import("../components/CustomCursor"), {
  ssr: false,
});

// Import GlobalClickSound with dynamic loading (no SSR)
const GlobalClickSound = dynamic(
  () => import("../components/GlobalClickSound"),
  {
    ssr: false,
  },
);

const sansFont = localFont({
  src: "../public/inter.roman.var.woff2",
  weight: "100 900",
  display: "swap",
});

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

  return (
    <>
      <style jsx global>
        {`
          :root {
            --sans-font: ${sansFont.style.fontFamily};
          }
        `}
      </style>
      <AnimatePresence mode="wait">
        <PageTransition key={router.asPath}>
          <Component {...pageProps} />
        </PageTransition>
      </AnimatePresence>
      <CustomCursor />
      <GlobalClickSound />
    </>
  );
}
