import React from "react";
import { Main } from "../components/Layouts";
import { SEO } from "../components/SEO";
import ScrollReveal from "../components/ScrollReveal";
import Link from "next/link";
import Image from "next/image";

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
        <div className="relative lg:min-h-[480px]">
          <div className="lg:pr-[200px] min-[1440px]:pr-0">
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
                  <Link
                    href="/memory"
                    className="link-fade text-neutral-800 dark:text-white"
                  >
                    Memory ↗
                  </Link>
                  <p className="mt-2 text-neutral-500 dark:text-silver-dark">
                    A living tree of agent memories. Open a folder, follow its
                    roots, and see what gets remembered.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
          <figure className="pointer-events-none mx-auto mt-10 w-[240px] select-none sm:w-[280px] lg:absolute lg:left-[calc(100%-10rem)] lg:top-0 lg:m-0 min-[1440px]:left-[calc(100%+2rem)] min-[1440px]:w-[min(20vw,320px)]">
            <Image
              src="/images/fun/naveen-manga-cartoon.webp"
              alt="Manga illustration of Naveen standing with his arms crossed."
              width={800}
              height={1200}
              sizes="(min-width: 1440px) 320px, (min-width: 640px) 280px, 240px"
              className="h-auto w-full drop-shadow-[0_2px_2px_rgba(255,255,255,0.12)]"
            />
          </figure>
        </div>
      </Main>
    </>
  );
}
