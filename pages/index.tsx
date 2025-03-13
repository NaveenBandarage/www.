import React from "react";
import { Main } from "../components/Layouts";
import { SEO } from "../components/SEO";
import Writing from "../components/Home/Writing";
import Link from "next/link";
import { LinkExternal } from "../components/Links";
import Consuming from "../components/Home/Consuming";
import { getMdxPaths } from "./api/getMdxPaths";
import {
  SlideText,
  RevealText,
  RevealHeading,
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
        <header>
          <RevealHeading
            tag="h1"
            className="text-xl text-neutral-800 [font-variation-settings:'opsz'_32,_'wght'_500] dark:text-white sm:pb-6 sm:text-xl"
            duration={0.8}
          >
            Naveen Bandarage
          </RevealHeading>
        </header>
        <dl className="list-container">
          <dt className="list-title">
            <SlideText direction="right" duration={0.6}>
              <h3 className="text-neutral-500 dark:text-silver-dark">Intro</h3>
            </SlideText>
          </dt>
          <dd className="list-content">
            <div>
              <RevealText
                text="Building, breaking, listening and constantly learning. Currently accelerating software development at"
                type="words"
                staggerChildren={0.02}
                duration={0.4}
                className="inline"
              />{" "}
              <SlideText direction="up" delay={1.2} className="inline-block">
                <LinkExternal href="//xero.com">Xero</LinkExternal>
              </SlideText>
              <RevealText text="." delay={1.4} className="inline" />
              <div>
                <br></br>
                <RevealText
                  text="Get some more info about me"
                  type="words"
                  staggerChildren={0.03}
                  delay={1.6}
                  className="inline"
                />{" "}
                <SlideText
                  direction="left"
                  delay={2.2}
                  className="inline-block"
                >
                  <Link
                    href="/about"
                    className="link inline-flex items-center gap-1"
                  >
                    here
                  </Link>
                </SlideText>
                <RevealText text="." delay={2.4} className="inline" />
              </div>
            </div>
          </dd>
        </dl>
        <Writing latestPosts={latestPosts} />
        <Consuming />
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
