import React from "react";
import Link from "next/link";
import { Main } from "../../components/Layouts";
import { SEO } from "../../components/SEO";
import { getMdxPaths } from "../api/getMdxPaths";

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
                    <time className="time">{post.date}</time>
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

  return {
    props: {
      posts,
    },
  };
}
