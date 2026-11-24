/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Only production deployments from main should announce an update.
  env: {
    NEXT_PUBLIC_SITE_UPDATE_ID:
      process.env.VERCEL_ENV === "production" &&
      process.env.VERCEL_GIT_COMMIT_REF === "main"
        ? process.env.VERCEL_GIT_COMMIT_SHA || ""
        : "",
    NEXT_PUBLIC_SITE_UPDATE_PATH: process.env.SITE_UPDATE_PATH || "",
    NEXT_PUBLIC_SITE_UPDATE_MESSAGE:
      process.env.VERCEL_ENV === "production" &&
      process.env.VERCEL_GIT_COMMIT_REF === "main"
        ? process.env.SITE_UPDATE_MESSAGE || "Hey! I’ve made a few updates to the site. Take a look around 🙂"
        : "",
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
      {
        protocol: "https",
        hostname: "**.digitaloceanspaces.com",
      },
      {
        protocol: "https",
        hostname: "books.google.com",
      },
      {
        protocol: "https",
        hostname: "assets.literal.club",
      },
      {
        protocol: "https",
        hostname: "covers.openlibrary.org",
      },
      {
        protocol: "https",
        hostname: "**.spotifycdn.com",
      },
    ],
  },
  async redirects() {
    return [{ source: "/posts/rss", destination: "/rss.xml", permanent: true }];
  },
  async headers() {
    const headers = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
    ];

    if (process.env.NODE_ENV === "production") {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }

    return [
      { source: "/(.*)", headers },
      {
        source: "/rss.xml",
        headers: [{ key: "Content-Type", value: "application/rss+xml; charset=utf-8" }],
      },
    ];
  },
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(nextConfig);
