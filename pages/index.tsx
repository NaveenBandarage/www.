import React from "react";
import { Main } from "../components/Layouts";
import { SEO } from "../components/SEO";
import Writing from "../components/Home/Writing";
import Link from "next/link";
import { LinkExternal } from "../components/Links";
import Consuming from "../components/Home/Consuming";
import ScrollReveal from "../components/ScrollReveal";
import { getMdxPaths } from "./api/getMdxPaths";
import {
  TypewriterText,
  FadeInText,
  SlideUpText,
} from "../components/TextAnimation";

export default function Home({ latestPosts }) {
  return (
    <>
      <SEO
        seo={{
          title: "Naveen Bandarage",
          path: "/",
        }}
      />
      <Main>
        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -left-20 h-56 w-56 rounded-full bg-gradient-to-br from-neutral-200/70 via-indigo-100/40 to-transparent blur-3xl dark:from-neutral-800/50 dark:via-neutral-700/20"
          />
          <ScrollReveal delay={0.05}>
            <header>
              <h1 className="text-xl text-neutral-800 [font-variation-settings:'opsz'_32,_'wght'_500] dark:text-white sm:pb-6 sm:text-xl">
                <TypewriterText
                  text="Naveen Bandarage"
                  speed={100}
                  cursor={true}
                />
              </h1>
            </header>
          </ScrollReveal>
        </div>
        <ScrollReveal delay={0.12}>
          <dl className="list-container">
            <dt className="list-title">
              <h3 className="text-neutral-500 dark:text-silver-dark">
                <FadeInText text="Intro" delay={1500} duration={600} />
              </h3>
            </dt>
            <dd className="list-content">
              <div>
                <SlideUpText
                  text="Building, breaking, listening and constantly learning. Currently accelerating software development at"
                  delay={2200}
                  staggerChildren={true}
                  staggerDelay={80}
                />{" "}
                <FadeInText text="" delay={3500}>
                  <LinkExternal href="//xero.com">Xero</LinkExternal>
                </FadeInText>
                {"."}
                <div>
                  <br></br>
                  <FadeInText text="" delay={4000}>
                    Get some more info about me{" "}
                    <Link
                      href="/about"
                      className="link inline-flex items-center gap-1"
                    >
                      here
                    </Link>
                    .
                  </FadeInText>
                </div>
              </div>
            </dd>
          </dl>
        </ScrollReveal>
        <ScrollReveal delay={0.18}>
          <Writing latestPosts={latestPosts} />
        </ScrollReveal>
        <ScrollReveal delay={0.24}>
          <Consuming />
        </ScrollReveal>
      </Main>
    </>
  );
}

export async function getStaticProps() {
  const allPosts = await getMdxPaths();

  const latestPosts = allPosts.slice(0, 2);

  return {
    props: {
      latestPosts,
    },
  };
}
