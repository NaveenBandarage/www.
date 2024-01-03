import { Main } from "../components/Layouts";
import { SEO } from "../components/SEO";
import { useRouter } from "next/router";
import React from "react";
import formatDate from "../lib/formatDate";

export default function BlogPost() {
  const router = useRouter();

  return (
    <>
      <SEO
        seo={{
          title: "Goals for 2024",
          description: "My goals for 2024",
          path: "/goals-for-2024",
        }}
      />
      <Main>
        <div className="flex w-full flex-col justify-between sm:flex-row">
          <header>
            <h1 className="text-xl text-neutral-800 [font-variation-settings:'opsz'_32,_'wght'_500] dark:text-white sm:pb-6 sm:text-xl">
              Goals for 2024
            </h1>
          </header>
          <p
            onClick={() => router.back()}
            className="text-neutral-700 sm:pb-6 sm:align-left cursor-pointer"
          >
            Go Back
          </p>
        </div>
        <dl className="list-container">
          <dd className="list-content">
            <div className="prose-custom">
              <p>Intro:</p>
              <p>
                It&#39;s scary and I&#39;m not used to doing it but I&#39;m
                going to put my goals out there into the ether that is the
                internet. Let&#39;s see what happens. Some of them are too
                personal and I don&#39;t feel comfortable putting them out there
                just yet so I&#39;ve redacted them.{" "}
              </p>
              <blockquote>
                <p>
                  I&#39;m in the arena trying stuff. Some will work, some
                  won&#39;t. But always learning.{" "}
                </p>
                Chamath Palihapitiya{" "}
              </blockquote>
              <p>
                I&#39;m not the biggest fan of setting goals for the entirety of
                the year and working towards them. 1 because a year is so far
                away and things change, 2 I tend to forget them, and 3 because I
                find it easier to work in a kanban style approach. By that I
                mean I pull in goals and work on them in shorter periods. So
                this list will ebb and flow as the year goes on. But here goes:
              </p>
              <ol>
                <li>
                  [Redacted career related] -{" "}
                  <i> will unredact if I accomplish it</i>
                </li>
                <li>
                  <li>
                    [Redacted health related] -{" "}
                    <i> will unredact if I accomplish it</i>
                  </li>
                </li>
                <li>
                  Cut down on useless spending and keep my investments and
                  savings growing. I have specific numbers I want to hit but
                  will keep them on the dlow{" "}
                </li>
                <li>
                  Have more consistent wake-up and bedtimes. Aim for 7-8 hours
                  of sleep
                </li>
                <li>Stop using devices be it my phone or computer in bed</li>
                <li>Get my RHR (resting heart rate) to 55</li>
                <li>
                  [Redacted personal related] -{" "}
                  <i> will unredact if I accomplish it</i>
                </li>
                <li>
                  Get back to uploading YouTube videos after completing{" "}
                  [Redacted career goal], and aim to get 1000 subscribers
                </li>
                <li>
                  Keep a regular habit of journalling either via computer-based
                  apps or ideally offline with pen and paper
                </li>
                <li>Make meditating a habit</li>
                <li>
                  Add to my tech repertoire (how to define this I have no idea
                  but we shall see)
                </li>
                <li>Travel to more places and try different things</li>
                <li>Say yes to more stuff (within reason)</li>
              </ol>
              <p>
                If you have any goals that you&#39;re working towards please let
                me know. I love to hear about what people are working on and
                thinking about doing.
              </p>
              <p>Naveen</p>
            </div>
          </dd>
          <dt className="list-title">
            <h3>Date</h3>
            <p>
              <time className="time" dateTime="2024-01-03">
                {formatDate("2024-01-03", false)}
              </time>
            </p>
            <h3>Tl;dr</h3>
            <p className="time">
              My goals for 2024, written 3 days into 2024.{" "}
            </p>
            <h3>Meta</h3>
            <p className="time">
              Still got Anita Max Wynn stuck in my head. Other than that{" "}
            </p>
          </dt>
        </dl>
      </Main>
    </>
  );
}
