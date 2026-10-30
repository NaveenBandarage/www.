import React from "react";
import { Main } from "../components/Layouts";
import { SEO } from "../components/SEO";
import Writing from "../components/Home/Writing";
import Link from "next/link";
import { LinkExternal } from "../components/Links";
import Consuming from "../components/Home/Consuming";
import ScrollReveal from "../components/ScrollReveal";
import { getMdxPaths } from "../lib/posts";

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
          <ScrollReveal initiallyVisible duration={0.3} distance={8}>
            <header>
              <h1 className="text-xl text-neutral-800 [font-variation-settings:'opsz'_32,_'wght'_500] dark:text-white sm:pb-6 sm:text-xl">
                Naveen Bandarage
              </h1>
            </header>
          </ScrollReveal>
        </div>
        <ScrollReveal initiallyVisible delay={0.05} duration={0.3} distance={8}>
          <dl className="list-container">
            <dt className="list-title">
              <h2 className="text-neutral-500 dark:text-silver-dark">Intro</h2>
            </dt>
            <dd className="list-content">
              <div>
                Building, breaking, listening and constantly learning. Currently
                accelerating software development at{" "}
                <LinkExternal href="//xero.com">Xero</LinkExternal>
                {"."}
                <div>
                  <br></br>
                  Get some more info about me{" "}
                  <Link
                    href="/about"
                    className="link inline-flex items-center gap-1"
                  >
                    here
                  </Link>
                  .
                </div>
              </div>
            </dd>
          </dl>
        </ScrollReveal>
        <ScrollReveal initiallyVisible delay={0.1} duration={0.3} distance={8}>
          <Writing latestPosts={latestPosts} />
        </ScrollReveal>
        <ScrollReveal initiallyVisible delay={0.15} duration={0.3} distance={8}>
          <Consuming />
        </ScrollReveal>
      </Main>
    </>
  );
}

export async function getStaticProps() {
  const allPosts = await getMdxPaths();

  const latestPosts = allPosts.slice(0, 2).map(({ slug, title, date }) => ({
    slug,
    title,
    date,
  }));

  return {
    props: {
      latestPosts,
    },
  };
}
