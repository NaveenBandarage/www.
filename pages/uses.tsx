import React from "react";
import { Main } from "../components/Layouts";
import { SEO } from "../components/SEO";
import { LinkExternal } from "../components/Links";

export default function Uses() {
  return (
    <>
      <SEO
        seo={{
          title: "Naveen Bandarage - Uses",
          path: "/uses",
        }}
      />
      <Main>
        <header>
          <h1 className="text-xl text-neutral-800 [font-variation-settings:'opsz'_32,_'wght'_500] dark:text-white sm:pb-6 sm:text-xl">
            Uses
          </h1>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-neutral-600 dark:text-neutral-400">
            A collection of hardware and software I use daily to build, create,
            and stay productive. Will be updated as I change things.
          </p>
        </div>

        <dl className="list-container">
          <dt className="list-title">
            <h3 className="text-neutral-500 dark:text-silver-dark">Laptop</h3>
          </dt>
          <dd className="list-content">
            <div className="space-y-2">
              <div>
                <strong className="text-neutral-800 dark:text-white">
                  MacBook Pro 14&quot;
                </strong>
              </div>
              <div className="text-neutral-600 dark:text-neutral-400">
                M3 Pro, 36GB RAM, 512GB SSD
              </div>
            </div>
          </dd>
        </dl>

        <dl className="list-container">
          <dt className="list-title">
            <h3 className="text-neutral-500 dark:text-silver-dark">
              Peripherals
            </h3>
          </dt>
          <dd className="list-content">
            <div className="space-y-4">
              <div>
                <strong className="text-neutral-800 dark:text-white">
                  MX Master 3S
                </strong>
                <div className="text-neutral-600 dark:text-neutral-400">
                  Gold standard techbro mouse.
                </div>
              </div>
              <div>
                <strong className="text-neutral-800 dark:text-white">
                  Wired Apple Earphones
                </strong>
                <div className="text-neutral-600 dark:text-neutral-400">
                  Literally can&apos;t beat a classic{" "}
                </div>
              </div>
              <div>
                <strong className="text-neutral-800 dark:text-white">
                  Apple AirPods Max 1st Gen{" "}
                </strong>
                <div className="text-neutral-600 dark:text-neutral-400">
                  When I need to go wireless and beat a classic I&apos;ll use
                  these and do stuff on the go. Sucks that they use lightning
                  though.{" "}
                </div>
              </div>
            </div>
          </dd>
        </dl>

        <dl className="list-container">
          <dt className="list-title">
            <h3 className="text-neutral-500 dark:text-silver-dark">Software</h3>
          </dt>
          <dd className="list-content">
            <div className="space-y-2">
              <div>
                <LinkExternal href="https://cursor.com">Cursor</LinkExternal> -
                Best editor out there for code.
              </div>
              <div>
                <LinkExternal href="https://www.raycast.com">
                  Raycast
                </LinkExternal>{" "}
                - Spotlight just doesn&apos;t cut it.
              </div>
              <div>
                <LinkExternal href="https://www.diabrowser.com/">
                  Dia
                </LinkExternal>{" "}
                - Goated browser and I&apos;m a big fan of them
              </div>
            </div>
          </dd>
        </dl>
      </Main>
    </>
  );
}
