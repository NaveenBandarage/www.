import React from "react";
import Link from "next/link";
import { Main } from "../../components/Layouts";
import { SEO } from "../../components/SEO";
import { getMdxPaths } from "../api/getMdxPaths";
import { ClockIcon } from "../../components/Icons";
import calculateReadingTime from "../../lib/readingTime";

const BlogIndex = ({ posts }) => {
  return (
    <>
      <SEO seo={{ title: "Blog", path: "/blog" }} />
      <Main>
        <header>
          <h1 className="text-xl text-neutral-800 [font-variation-settings:'opsz'_32,_'wght'_500] dark:text-white sm:pb-6 sm:text-xl">
            Blog
          </h1>
        </header>
        <dl className="list-container">
          <dd className="list-content">
            <ul>
              {posts.map((post) => (
                <li key={post.slug} className="pb-2 last-of-type:pb-0">
                  <div>
                    <Link href={`/blog/${post.slug}`}>
                      <h3 className="text-neutral-500 dark:text-silver-dark">
                        {post.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-4">
                      <time className="time">{post.date}</time>
                      {post.readingTime && (
                        <span className="time flex items-center gap-1">
                          <ClockIcon size={14} />
                          {post.readingTime}
                        </span>
                      )}
                    </div>
                    <br />
                  </div>
                </li>
              ))}
            </ul>
          </dd>
        </dl>
      </Main>
    </>
  );
};

export default BlogIndex;

export async function getStaticProps() {
  const posts = await getMdxPaths();

  // For each post, calculate reading time from content
  const postsWithReadingTime = await Promise.all(
    posts.map(async (post) => {
      // You'll need to modify getMdxPaths to include the content
      // or fetch the content here
      if (post.content) {
        return {
          ...post,
          readingTime: calculateReadingTime(post.content),
        };
      }
      return post;
    }),
  );

  return {
    props: {
      posts: postsWithReadingTime,
    },
  };
}
