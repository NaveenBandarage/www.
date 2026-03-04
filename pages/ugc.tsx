import React from "react";
import Image from "next/image";
import Script from "next/script";
import { Main } from "../components/Layouts";
import { SEO } from "../components/SEO";
import { AnimatedLink } from "../components/Links";
import Badge from "../components/Badge";
import { TikTokEmbed } from "../components/TikTok";

const stats = [
  { label: "Followers", value: "400+" },
  { label: "Total Likes", value: "34K+" },
  { label: "Avg. Views per Video", value: "34K+" },
  { label: "Engagement Rate", value: "4.6%+" },
  { label: "Videos Posted", value: "200+" },
  { label: "Profile Views (30d)", value: "4.5K+" },
];

const featuredVideos: { url: string; caption?: string }[] = [
  { url: "https://www.tiktok.com/@hokageoftheeastvillage/video/7612122388683164959" },
  { url: "https://www.tiktok.com/@hokageoftheeastvillage/video/7608751567696563486" },
  { url: "https://www.tiktok.com/@hokageoftheeastvillage/video/7601320556884987166" },
  { url: "https://www.tiktok.com/@hokageoftheeastvillage/video/7601949298082843934" },
];

export default function UGC() {
  return (
    <>
      <SEO
        seo={{
          title: "Naveen Bandarage - UGC",
          path: "/ugc",
        }}
      />
      <Main>
        <header>
          <h1 className="text-xl text-neutral-800 [font-variation-settings:'opsz'_32,_'wght'_500] dark:text-white sm:pb-6 sm:text-xl">
            UGC
          </h1>
        </header>

        <dl className="list-container">
          <dt className="list-title">
            <h3 className="text-neutral-500 dark:text-silver-dark">Overview</h3>
          </dt>
          <dd className="list-content">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              <Image
                src="/ugc.jpeg"
                alt="Naveen Bandarage"
                width={96}
                height={96}
                className="rounded-full object-cover shrink-0"
              />
              <p>
                I create authentic, short-form video content across tech, lifestyle, food, and travel —
                producing UGC that drives real engagement. With a strong engagement rate and 120+ videos,
                I partner with brands to tell genuine product stories that resonate with real audiences.
                Multi-niche coverage means broader brand category reach, and an authentic storytelling
                style over polished production delivers higher trust signals.
              </p>
            </div>
          </dd>
        </dl>

        <dl className="list-container">
          <dt className="list-title">
            <h3 className="flex items-center gap-2 text-neutral-500 dark:text-silver-dark">
              Stats
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
            </h3>
          </dt>
          <dd className="list-content">
            <div className="grid grid-cols-3 gap-4">
              {stats.map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className="time">{label}</span>
                  <span className="font-semibold text-neutral-800 dark:text-white">{value}</span>
                </div>
              ))}
            </div>
          </dd>
        </dl>

        <dl className="list-container">
          <dt className="list-title">
            <h3 className="text-neutral-500 dark:text-silver-dark">Niches</h3>
          </dt>
          <dd className="list-content">
            <div className="flex flex-wrap gap-2">
              <Badge>Tech</Badge>
              <Badge>Lifestyle</Badge>
              <Badge>Fashion</Badge>
              <Badge>Food &amp; Dining</Badge>
              <Badge>Travel</Badge>
            </div>
          </dd>
        </dl>

        <dl className="list-container">
          <dt className="list-title">
            <h3 className="text-neutral-500 dark:text-silver-dark">Featured</h3>
            <p className="time mt-1">Scroll down for contact details.</p>
          </dt>
          <dd className="list-content">
            <div className="flex flex-wrap gap-6">
              {featuredVideos.map(({ url, caption }, i) => (
                <TikTokEmbed key={i} url={url} caption={caption} />
              ))}
            </div>
            <Script src="https://www.tiktok.com/embed.js" strategy="afterInteractive" />
          </dd>
        </dl>

        <dl className="list-container">
          <dt className="list-title">
            <h3 className="text-neutral-500 dark:text-silver-dark">Collab</h3>
          </dt>
          <dd className="list-content">
            <p className="pb-2">
              Interested in working together? I&apos;m open to brand partnerships, sponsored content,
              and product collaborations across my content niches.
            </p>
            <AnimatedLink href="mailto:partnerwithnav@gmail.com">
              Get in touch
            </AnimatedLink>
          </dd>
        </dl>
      </Main>
    </>
  );
}
