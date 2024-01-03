import React from "react";
import { Main } from "../components/Layouts";
import { SEO } from "../components/SEO";
import { LinkExternal } from "../components/Links";

export default function Links() {
  return (
    <>
      <SEO
        seo={{
          title: "Naveen Bandarage - Links",
          path: "/links",
        }}
      />
      <Main>
        <header>
          <h1 className="text-xl text-neutral-800 [font-variation-settings:'opsz'_32,_'wght'_500] dark:text-white sm:pb-6 sm:text-xl">
            Links
          </h1>
        </header>
        <dl className="list-container">
          <dt className="list-title">
            <h3 className="text-neutral-500 dark:text-silver-dark">Business</h3>
          </dt>
          <dd className="list-content">
            <div className="pb-2 last-of-type:pb-0">
              <div>
                <LinkExternal href="mailto:im@naveenbandarage.com">
                  Email
                </LinkExternal>
                <time className="time">im@naveenbandarage.com</time>
                <br />
              </div>
              <div>
                <LinkExternal href="//linkedin.com/in/naveenbandarage/">
                  LinkedIn
                </LinkExternal>
                <time className="time">@naveenbandarage</time>
                <br />
              </div>
            </div>
          </dd>
        </dl>
        <dl className="list-container">
          <dt className="list-title">
            <h3 className="text-neutral-500 dark:text-silver-dark">Social</h3>
          </dt>
          <dd className="list-content">
            <div className="pb-2 last-of-type:pb-0">
              <div>
                <LinkExternal href="//twitter.com/naveenbandarage">
                  Twitter
                </LinkExternal>
                <time className="time">@naveenbandarage</time>
                <br />
              </div>
              <div>
                <LinkExternal href="//instagram.com/naveenbandarage">
                  Instagram
                </LinkExternal>
                <time className="time">@naveenbandarage</time>
                <br />
              </div>

              <div>
                <LinkExternal href="//open.spotify.com/user/naveen.bandarage?si=c56b9826f9294134">
                  Spotify
                </LinkExternal>
                <time className="time">@naveenbandarage</time>
                <br />
              </div>

              <div>
                <LinkExternal href="//literal.club/naveenbandarage">
                  Literal
                </LinkExternal>
                <time className="time">@naveenbandarage</time>
              </div>

              <div>
                <LinkExternal href="//naveenbandarage.substack.com/">
                  Substack
                </LinkExternal>
                <time className="time">@naveenbandarage</time>
              </div>
            </div>
          </dd>
        </dl>
      </Main>
    </>
  );
}
