import React from "react";
import { Main } from "../components/Layouts";
import { SEO } from "../components/SEO";
import { AnimatedLink } from "../components/Links";

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
                <AnimatedLink href="mailto:bandaragenaveen@gmail.com">
                  Email
                </AnimatedLink>
                <br />
                <time className="time blur-sm hover:blur-none transition-all duration-300 select-none">
                  bandaragenaveen@gmail.com
                </time>
                <span className="text-xs text-neutral-400 dark:text-neutral-600">
                  blurred to be less easily be available to scrapers :)
                </span>
                <br />
              </div>
              <div>
                <AnimatedLink href="//linkedin.com/in/naveenbandarage/">
                  LinkedIn
                </AnimatedLink>
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
                <AnimatedLink href="//x.com/naveenbandarage">
                  X/Twitter
                </AnimatedLink>
                <time className="time">@naveenbandarage</time>
                <br />
              </div>
              <div>
                <AnimatedLink href="//instagram.com/naveenbandarage">
                  Instagram
                </AnimatedLink>
                <time className="time">@naveenbandarage</time>
                <br />
              </div>
              <div>
                <AnimatedLink href="//open.spotify.com/user/naveen.bandarage?si=c56b9826f9294134">
                  Spotify
                </AnimatedLink>
                <time className="time">@naveenbandarage</time>
                <br />
              </div>
              <div>
                <AnimatedLink href="//literal.club/naveenbandarage">
                  Literal
                </AnimatedLink>
                <time className="time">@naveenbandarage</time>
                <br />
              </div>
              <div>
                <AnimatedLink href="//naveenbandarage.substack.com/">
                  Substack
                </AnimatedLink>
                <time className="time">@naveenbandarage</time>
                <br />
              </div>
              <div>
                <AnimatedLink href="//cosmos.so/naveenb/">Cosmos</AnimatedLink>
                <time className="time">@naveenb</time>
                <br />
              </div>
              <div>
                <AnimatedLink href="//youtube.com/@naveenbandarage/">
                  Youtube
                </AnimatedLink>
                <time className="time">@naveenbandarage</time>
                <br />
              </div>
            </div>
          </dd>
        </dl>
      </Main>
    </>
  );
}
