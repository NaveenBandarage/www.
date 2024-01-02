import "../styles/globals.css";
import type { AppProps as NextAppProps } from "next/app";
import { ApolloCache, ApolloProvider } from "@apollo/client";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import localFont from "next/font/local";

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
  return (
    <>
      <style jsx global>
        {`
          :root {
            --sans-font: ${sansFont.style.fontFamily};
          }
        `}
      </style>
      <Component {...pageProps} />
    </>
  );
}
