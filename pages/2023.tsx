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
          title: "2023 in Review",
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
              <p>Intro:</p>
              <p>
                Amongst the endless amounts of reflective year-in-review
                content, I add another such post. This comes in the form of my
                first blog post of 2024.{" "}
              </p>
              <blockquote>
                <p>Anita Max Wynn</p>
                Drake{" "}
              </blockquote>
              <p>
                2023 was an eventful year for me, filled with twists and turns,
                ups and downs and everything in between. Leading into 2023, 2022
                was a tough year with mixed success. I succeeded on a
                professional front but on an emotional and personal level, it
                was a year filled with immense loss, anger and struggle. 2023
                began with me carrying over those feelings. However, as the year
                went on I wouldn’t say those feelings went away or diminished
                but rather they were abstracted away. Location played a big part
                in that.
              </p>
              <p>Travelling:</p>
              <p>
                I started the year off in Korea and Japan. An experience I will
                truly never forget and never likely experience again. Not
                because I wouldn’t go back (For example I went back to Japan for
                a second time later on in the year), it’s because I went when
                the borders had just opened up. Because of that, there were
                barely any tourists let alone locals out and about in either of
                those countries. If there was one thing I would want back from
                the pandemic it would be for the whole world to be that quiet
                again. That being said I did heaps of travel in 2023:
              </p>
              <ul>
                <li>Japan x2</li>
                <li>Korea</li>
                <li>Canada</li>
                <li>Australia x2</li>
                <li>
                  New Zealand (Travelling to Auckland as I'm based in
                  Wellington) x2
                </li>
              </ul>
              <p>
                I have been fortunate enough to visit some incredible cities, my
                favourites that I visited were Melbourne, Yokohama, Tokyo, and
                Toronto. Each of these cities had an amazing vibe, and I would
                love to go back and visit them again. For me, travelling is not
                just an escape, but it's also a way to recharge my energy and
                get inspired. Every time I come back from a trip, I feel more
                motivated to just get some shit done. I look forward to
                travelling some more in 2024 and exploring more of this
                beautiful world. I think life is too short to not do so. Managed
                to fly business class for the first time as well.
              </p>
              <p>Growth:</p>
              <p>
                I have undergone tremendous personal growth over the past year.
                However, not all of the changes I have experienced can be easily
                expressed, and I am still in the process of understanding them
                myself. Nevertheless, I can confidently say that I am not the
                same person I was at the beginning of 2023. Of course, I am not
                perfect, and there is still a lot I need to work on, but that's
                just a part of life.
              </p>
              <blockquote>
                <p>I’M THE ELDEST BOY!!</p>
                Kendall Roy{" "}
              </blockquote>
              <p>Goals:</p>
              <p>
                I am not one to declare my goals in public I'm a build in
                silence rather than in public kinda guy. Or to be more honest I
                just have a deep-seated fear of putting my goals out there and
                being laughed at. I find it challenging to deal with the added
                pressure of someone else knowing what I am working towards,
                especially on top of my already lofty and ambitious goals.
                Therefore, I deeply admire those who confidently put their goals
                out in the open and pursue them despite the noise. I hope to
                reach that level of confidence someday, but I am not there yet.
              </p>
              <p>
                The few things that I feel confident enough to talk about are on
                the professional front. I achieved my goal of being promoted
                going from an Associate Engineer to a Software Engineer at Xero.
                I was able to pass my AWS Certified Solutions Architect –
                Associate exam and I was able to buddy and mentor a grad for the
                course of their rotation in my team. On a fitness front, I had a
                mixed bag as my year started well and I felt dialled in.
                However, halfway through the year around the same time some
                other personal issues reared their head in and on top of that
                Xero was going through layoffs. During that same period, I tore
                my meniscus playing football. I can vividly remember going to
                the physio to get my diagnosis and as I was waiting, my slack
                was blowing up, I was waiting in anticipation for an email that
                would indicate whether my time at the company was up. That was
                not a pleasant day, to say the least. I’ve been able to recover
                and make decent progress on my fitness-related goals but I
                wouldn’t say I accomplished them.
              </p>
              <p>Consumerism:</p>
              <p>
                There were a few things that added to my life this year and that
                I enjoyed “wasting” my hard-earned dollars and doing my part to
                keep the capitalistic locomotive thriving:
              </p>
              <ul>
                <li>Whoop</li>
                <li>AirPods Max</li>
                <li>Asics Novablast 3</li>
                <li>Uniqlo socks and underwear</li>
                <li>LIFX smart light</li>
                <li>Arcteryx Granville 25 backpack</li>
                <li>More Chrome Heart rings</li>
                <li>Travelling</li>
              </ul>
              <p>
                Lastly, I finally purchased a new laptop! The base model Intel
                2017 Macbook I had that was by my side in university and which
                got me internships, and helped eventually get me my gig at Xero
                was on its last legs. So I decided to finally join the M series
                of chips picking up a pretty beefy (and very expensive) M3 pro.
                I really should’ve done this sooner as it’s a night and day
                difference between them.
              </p>
              <p>The year ahead:</p>
              <p>
                I feel quite deeply about this but for me at least 2023 was
                kinda of a filler year, a warmup, a precursor, however, you want
                to phrase it. I made some deep inroads and great progress,
                however, it still felt like I didn’t really do anything and I
                just middling or meandering around. In a way it feels like 2023
                was Avengers: Infinity War. A movie that had its’ ups and downs
                but it was more so a movie to build suspense and set up a grand
                finale. That’s how 2024 feels for me at least. I’m excited
                though to see what happens.
              </p>
              <p>Naveen</p>
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
              2023, my thoughts and feelings encapsulated into chars{" "}
            </p>
            <h3>Meta</h3>
            <p className="time">
              First blog post, so hopefully over time my writing muscle builds
              up. It definitely was a struggle to be concise and still get the
              points I wanted to get across out.{" "}
            </p>
          </dt>
        </dl>
      </Main>
    </>
  );
}
