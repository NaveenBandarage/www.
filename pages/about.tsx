import React from "react";
import { Main } from "../components/Layouts";
import { SEO } from "../components/SEO";
import Writing from "../components/Home/Writing";
import { LinkExternal } from "../components/Links";
import Badge from "../components/Badge";

export default function Colophon() {
  return (
    <>
      <SEO
        seo={{
          title: "About",
          path: "/about",
        }}
      />
      <Main>
        <header>
          <h1 className="text-xl text-neutral-800 [font-variation-settings:'opsz'_32,_'wght'_500] dark:text-white sm:pb-6 sm:text-xl">
            About
          </h1>
        </header>
        <dl className="list-container">
          <dt className="list-title">
            <h3 className="text-neutral-500 dark:text-silver-dark">
              <div className="flex items-center gap-2">Work</div>
            </h3>
          </dt>
          <dd className="list-content">
            <div>
              Currently, I work as a Software Engineer at{" "}
              <LinkExternal href="//xero.com">Xero</LinkExternal>, a leading
              innovator in cloud-based accounting sofware for SMB's.
            </div>
            <br />
            <div className="text-neutral-500 [font-variation-settings:'opsz'_14] dark:text-silver-dark">
              I am apart of the team that helps accelerate development within
              Xero. We're solving complex problems around creating services,
              provisioning infrastructure, and providing the boilerplate code
              needed for teams to go ahead and providing value to our customers.
              Instead of having to start from scratch we enable teams within
              Xero to focus on building awesome new products.
            </div>
          </dd>
        </dl>
        <dt className="list-title">
          <h3 className="text-neutral-500 dark:text-silver-dark">
            <div className="flex items-center gap-2">Experience</div>
          </h3>
        </dt>
        <dl className="list-container">
          <dt className="list-title">
            <h3 className="text-neutral-500 dark:text-silver-dark">
              <div className="flex items-center gap-2">
                2023
                <Badge>Present</Badge>
              </div>
            </h3>
          </dt>
          <dd className="list-content">
            <div>Software Engineer</div>
            <div>
              <LinkExternal href="//xero.com">Xero</LinkExternal>
            </div>
            <div className="pt-1 text-sm text-neutral-500 [font-variation-settings:'opsz'_14] dark:text-silver-dark">
              Wellington, NZ
            </div>
          </dd>
          <dt className="list-title mt-4 border-none pt-0 sm:mt-0">
            <h3 className="text-neutral-500 dark:text-silver-dark">2022</h3>
          </dt>
          <dd className="list-content border-none pt-0">
            <div>Graduate Engineer</div>
            <div>
              <LinkExternal href="//xero.com">Xero</LinkExternal>
            </div>
            <div className="pt-1 text-sm text-neutral-500 [font-variation-settings:'opsz'_14] dark:text-silver-dark">
              Wellington, NZ
            </div>
          </dd>
          <dt className="list-title mt-4 border-none pt-0 sm:mt-0">
            <h3 className="text-neutral-500 dark:text-silver-dark">2021</h3>
          </dt>
          <dd className="list-content border-none pt-0">
            <div>Data Developer Intern</div>
            <div>
              <LinkExternal href="//anz.com">ANZ</LinkExternal>
            </div>
            <div className="pt-1 text-sm text-neutral-500 [font-variation-settings:'opsz'_14] dark:text-silver-dark">
              Wellington, NZ
            </div>
          </dd>

          <dt className="list-title mt-4 border-none pt-0 sm:mt-0">
            <h3 className="text-neutral-500 dark:text-silver-dark">2020</h3>
          </dt>
          <dd className="list-content border-none pt-0">
            <div>Fullstack Developer Intern</div>
            <div>
              <LinkExternal href="//myclearhead.com">Clearhead</LinkExternal>
            </div>
            <div className="pt-1 text-sm text-neutral-500 [font-variation-settings:'opsz'_14] dark:text-silver-dark">
              Auckland, NZ
            </div>
          </dd>

          <dt className="list-title mt-4 border-none pt-0 sm:mt-0">
            <h3 className="text-neutral-500 dark:text-silver-dark">2019</h3>
          </dt>
          <dd className="list-content border-none pt-0">
            <div>Cybersecurity Engineer Intern</div>
            <div>
              <LinkExternal href="//dia.govt.nz">
                Department of Internal Affairs NZ
              </LinkExternal>
            </div>
            <div className="pt-1 text-sm text-neutral-500 [font-variation-settings:'opsz'_14] dark:text-silver-dark">
              Wellington, NZ
            </div>
          </dd>
        </dl>
      </Main>
    </>
  );
}
