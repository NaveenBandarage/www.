import React from "react";
import { Main } from "../../components/Layouts";
import { SEO } from "../../components/SEO";
import { getMdxPaths } from "../api/getMdxPaths";
import calculateReadingTime from "../../lib/readingTime";
import YearTabs, { YearTabPost } from "../../components/Blog/YearTabs";

interface BlogIndexProps {
  posts: YearTabPost[];
}

const BlogIndex = ({ posts }: BlogIndexProps) => {
  return (
    <>
      <SEO seo={{ title: "Blog", path: "/blog" }} />
      <Main>
        <header>
          <h1 className="text-xl text-neutral-800 [font-variation-settings:'opsz'_32,_'wght'_500] dark:text-white sm:pb-6 sm:text-xl">
            Blog
          </h1>
        </header>
        <YearTabs posts={posts} />
      </Main>
    </>
  );
};

export default BlogIndex;

export async function getStaticProps() {
  const posts = await getMdxPaths();

  const postsWithReadingTime: YearTabPost[] = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    readingTime: post.content ? calculateReadingTime(post.content) : undefined,
  }));

  return {
    props: {
      posts: postsWithReadingTime,
    },
  };
}
