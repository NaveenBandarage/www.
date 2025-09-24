import React from "react";
import { Main } from "../components/Layouts";
import { SEO } from "../components/SEO";
import { AnimatedLink } from "../components/Links";

export default function Fun() {
  return (
    <>
      <SEO
        seo={{
          title: "Naveen Bandarage - Fun",
          path: "/fun",
        }}
      />
      <Main>
        <header>
          <h1 className="text-xl text-neutral-800 [font-variation-settings:'opsz'_32,_'wght'_500] dark:text-white sm:pb-6 sm:text-xl">
            Fun
          </h1>
        </header>
        <dl className="list-container">
          <dt className="list-title">
            <h3 className="text-neutral-500 dark:text-silver-dark">
              Random Stuff
            </h3>
          </dt>
          <dd className="list-content">
            <div className="pb-2 last-of-type:pb-0">
              <div className="text-neutral-500 [font-variation-settings:'opsz'_14] dark:text-silver-dark">
                This is my collection of random, fun things. More to come
                soon...
              </div>
            </div>
          </dd>
        </dl>
        <dl className="list-container">
          <dt className="list-title">
            <h3 className="text-neutral-500 dark:text-silver-dark">
              Coming Soon
            </h3>
          </dt>
          <dd className="list-content">
            <div className="pb-2 last-of-type:pb-0">
              <div className="text-neutral-400 dark:text-neutral-600 italic">
                • Cool projects
                <br />
                • Interesting experiments
                <br />
                • Random discoveries
                <br />• Fun tools and demos
              </div>
            </div>
          </dd>
        </dl>
      </Main>
    </>
  );
}
