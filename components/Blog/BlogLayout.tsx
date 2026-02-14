import { Main } from "../Layouts";
import { useRouter } from "next/router";
import { MDXRemote } from "next-mdx-remote";
import formatDate from "../../lib/formatDate";
import calculateReadingTime from "../../lib/readingTime";
import { SEO } from "../SEO";
import { ClockIcon } from "../Icons";
import ScrollReveal from "../ScrollReveal";

const BlogLayout = ({ meta, source, rawContent }) => {
  const router = useRouter();

  // Calculate reading time from the raw content for consistency with blog listing
  const readingTime = calculateReadingTime(rawContent);

  return (
    <>
      <SEO seo={meta} />
      <Main>
        <ScrollReveal delay={0.05}>
          <div className="flex w-full flex-col justify-between sm:flex-row">
            <header>
              <h1 className="text-xl text-neutral-800 [font-variation-settings:'opsz'_32,_'wght'_500] dark:text-white sm:pb-6 sm:text-xl">
                {meta.title}
              </h1>
            </header>
            <p
              onClick={() => router.back()}
              className="text-neutral-700 sm:pb-6 sm:align-left cursor-pointer"
            >
              Go Back
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.12}>
          <dl className="list-container">
            <dd className="list-content">
              <div className="flex items-center gap-2 mb-4 text-sm text-neutral-500 dark:text-silver-dark">
                <span className="inline-flex items-center gap-1">
                  <ClockIcon size={16} />
                  {readingTime}
                </span>
              </div>
              <div className="prose-custom">
                <MDXRemote {...source} />
              </div>
            </dd>
            <dt className="list-title">
              <h3>Date</h3>
              <p>
                <time className="time" dateTime={meta.date}>
                  {formatDate(meta.date, false)}
                </time>
              </p>
              <h3>Reading Time</h3>
              <p className="time">{readingTime}</p>
              <h3>Description</h3>
              <p className="time">{meta.description}</p>
              <h3>Tl;dr</h3>
              <p className="time">{meta.tldr}</p>
              <h3>Meta</h3>
              <p className="time">{meta.meta}</p>
            </dt>
          </dl>
        </ScrollReveal>
      </Main>
    </>
  );
};

export default BlogLayout;
