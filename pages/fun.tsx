import React from "react";
import { Main } from "../components/Layouts";
import { SEO } from "../components/SEO";
import WorldMap from "../components/WorldMap";
import { FadeInText, SlideUpText } from "../components/TextAnimation";

export default function Fun() {
  return (
    <>
      <SEO
        seo={{
          title: "Naveen Bandarage - Fun",
          description:
            "Interactive analytics and fun visualizations from Naveen's website",
          path: "/fun",
        }}
      />
      <Main>
        <header className="mb-8">
          <SlideUpText text="" delay={0}>
            <h1 className="text-xl text-neutral-800 [font-variation-settings:'opsz'_32,_'wght'_500] dark:text-white sm:pb-6 sm:text-xl">
              Fun
            </h1>
          </SlideUpText>
          <FadeInText text="" delay={300}>
            <p className="text-neutral-500 dark:text-silver-dark">
              Interactive visualizations and analytics from around the site 📊✨
            </p>
          </FadeInText>
        </header>

        <div className="space-y-8">
          <FadeInText text="" delay={600}>
            <div>
              <WorldMap />
            </div>
          </FadeInText>

          <FadeInText text="" delay={900}>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800">
              <h3 className="mb-4 text-lg font-semibold text-neutral-800 dark:text-white">
                🎨 More Fun Coming Soon
              </h3>
              <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
                <p>
                  This page will be home to various interactive visualizations
                  and fun analytics from the site:
                </p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>📈 Reading time trends across blog posts</li>
                  <li>🌙 Dark mode vs light mode usage</li>
                  <li>📱 Device and browser analytics</li>
                  <li>⏰ Peak visiting hours heatmap</li>
                  <li>🔗 Most popular pages and referrers</li>
                  <li>🎵 Currently playing on Spotify</li>
                </ul>
                <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
                  Check back soon for more interactive elements! 🚀
                </p>
              </div>
            </div>
          </FadeInText>
        </div>
      </Main>
    </>
  );
}
