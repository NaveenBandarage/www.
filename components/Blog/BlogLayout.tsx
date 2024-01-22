import { Main } from "../Layouts";
import { useRouter } from "next/router";
import { MDXRemote } from "next-mdx-remote";
import formatDate from "../../lib/formatDate";
import { SEO } from "../SEO";

const BlogLayout = ({ meta, source }) => {
  const router = useRouter();

  return (
    <>
      <SEO seo={meta} />
      <Main>
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
        <dl className="list-container">
          <dd className="list-content">
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
            <h3>Tl;dr</h3>
            <p className="time">{meta.tldr}</p>
            <h3>Meta</h3>
            <p className="time">{meta.meta}</p>
          </dt>
        </dl>
      </Main>
    </>
  );
};

export default BlogLayout;
