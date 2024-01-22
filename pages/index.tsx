import React from "react";
import { Main } from "../components/Layouts";
import { SEO } from "../components/SEO";
import Writing from "../components/Home/Writing";
import Link from "next/link";
import { LinkExternal } from "../components/Links";
import Consuming from "../components/Home/Consuming";
import { getMdxPaths } from "./api/getMdxPaths";

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
          <h1 className="text-xl text-neutral-800 [font-variation-settings:'opsz'_32,_'wght'_500] dark:text-white sm:pb-6 sm:text-xl">
            Naveen Bandarage
          </h1>
        </header>
        <dl className="list-container">
          <dt className="list-title">
            <h3 className="text-neutral-500 dark:text-silver-dark">Intro</h3>
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
