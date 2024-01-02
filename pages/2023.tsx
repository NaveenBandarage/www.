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
          title: "2023",
          description:
            "2023 the year that was, my reflections, thoughts and feelings of one orbit of the sun.",
          path: "/2023",
        }}
      />
      <Main>
        <div className="flex w-full flex-col justify-between sm:flex-row">
          <header>
            <h1 className="text-xl text-neutral-800 [font-variation-settings:'opsz'_32,_'wght'_500] dark:text-white sm:pb-6 sm:text-xl">
              2023
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
              <p>
                {/* Wutang Ipsum lmao */}
                Protect Ya Neck, my sword still remain imperial before I blast
                the mic, RZA scratch off the serial. I breaks it down to the
                bone gristle, Ill speaking Scud missile heat seeking, Johnny
                Blazing. Well I'm a sire, I set the microphone on fire, rap
                styles vary and carry like Mariah. I grew up on the crime side,
                the New York Times side, Stayin' alive was no jive. Handcuffed
                in the back of a bus, forty of us. I'm no joker! Play me like
                poker! Be on you like a house on fire! Smoke ya! I come with
                that ol' loco style from my vocal, Couldn't peep it with a pair
                of bi-focals. I leave the mic in body bags, my rap style has,
                the force to leave you lost, like the tribe of Shabazz. As the
                world turns I spread like germs, bless the globe with the
                pestilence, the hard-headed never learn.
              </p>
              <blockquote>
                <p>
                  I come with that ol' loco style from my vocal, Couldn't peep
                  it with a pair of bi-focals.
                </p>
                WuTang{" "}
              </blockquote>
              <p></p>
              <p>
                Now, lo and behold, another deadly episode, bound to catch
                another charge when I explode The rebel, I make more noise than
                heavy metal. Cache rules everything around me, dollar dollar
                bill, ya'll. Step through your section with the Force like Luke
                Skywalker, rhyme author, orchestrate mind torture. Yes, the
                rhythm, the rebel, alone in my level heat it up past the boiling
                point of metal. I come with that ol' loco style from my vocal,
                Couldn't peep it with a pair of bi-focals. To kick the truth to
                the young black youth. My DJ the catcher, he's my man, anyway
                he's the one who devised the plan. Now, lo and behold, another
                deadly episode, bound to catch another charge when I explode
              </p>
            </div>
          </dd>
          <dt className="list-title">
            <h3>Date</h3>
            <p>
              <time className="time" dateTime="2024-01-01">
                {formatDate("2024-01-01", false)}
              </time>
            </p>
            <h3>Tl;dr</h3>
            <p className="time">
              2023, my thoughts and feelings encapsulated into bytes of text{" "}
            </p>
            <h3>Meta</h3>
            <p className="time">
              First blog post so excuse my sorry attempts at writing.{" "}
            </p>
          </dt>
        </dl>
      </Main>
    </>
  );
}
