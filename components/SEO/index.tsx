import Head from "next/head";
import { DefaultSeo } from "next-seo";
import React from "react";

export const baseUrl = "https://naveenbandarage.com";

export const defaultSEO = {
  title: "Naveen Bandarage",
  description:
    "Building, breaking, listening and constantly learning. This is my personal website.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    site_name: "Naveen Bandarage",
    images: [
      {
        url: `${baseUrl}/logo.png`,
        alt: "Naveen Bandarage",
      },
    ],
  },
  twitter: {
    handle: "@naveenbandarage",
    site: "@naveenbandarage",
    cardType: "summary_large_image",
  },
};

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
}

export function SEO({ seo }: { seo?: SEOProps }) {
  return (
    <>
      <DefaultSeo {...{ ...defaultSEO, ...seo }} />
      <Head>
        <meta name="googlebot" content="index,follow" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />

        {/* Need to see if its worth having an svg version */}
        {/* <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any" /> */}
        {seo.path ? (
          <link
            rel="canonical"
            href={`${baseUrl}${seo.path === "/" ? "" : seo.path}`}
          />
        ) : null}

        <link
          rel="preload"
          href="/inter.roman.var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "http://schema.org",
              "@type": "WebSite",
              name: defaultSEO.title,
              url: baseUrl,
              image: defaultSEO.openGraph.images[0].url,
              author: {
                "@context": "http://schema.org",
                "@type": "Person",
                name: defaultSEO.title,
                url: baseUrl,
                jobTitle: "Software Engineer",
                image: defaultSEO.openGraph.images[0].url,
                sameAs: [
                  "https://twitter.com/naveenbandarage",
                  "https://www.linkedin.com/in/naveenbandarage",
                ],
              },
            }),
          }}
        />

        <meta name="author" content="Naveen Bandarage" />
        <meta
          name="theme-color"
          content="#DFDFDE"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#000"
          media="(prefers-color-scheme: dark)"
        />
        <meta
          name="google-site-verification"
          content="xISZxUJo1e-8oVJhupfam7uFwrDyn6H2kzS_dfqv7f0"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="RSS feed"
          href={`${baseUrl}/posts/rss`}
        />
      </Head>
    </>
  );
}
