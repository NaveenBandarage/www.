import React from "react";
import { Main } from "../components/Layouts";
import { SEO } from "../components/SEO";
import ScrollReveal from "../components/ScrollReveal";

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
        <ScrollReveal delay={0.05}>
          <header>
            <h1 className="text-xl text-neutral-800 [font-variation-settings:'opsz'_32,_'wght'_500] dark:text-white sm:pb-6 sm:text-xl">
              Fun
            </h1>
          </header>
        </ScrollReveal>
        <ScrollReveal delay={0.14}>
          <div className="list-container">
            <div className="list-content">
              <p className="text-neutral-500 dark:text-silver-dark">
                Coming soon... This is where the fun stuff will live! 🎉
              </p>
            </div>
          </div>
        </ScrollReveal>
      </Main>
    </>
  );
}
