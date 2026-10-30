import React from "react";
import { Main } from "../../components/Layouts";
import { SEO } from "../../components/SEO";
import { getMdxPaths } from "../../lib/posts";
import calculateReadingTime from "../../lib/readingTime";
import YearTabs, { YearTabPost } from "../../components/Blog/YearTabs";
import ScrollReveal from "../../components/ScrollReveal";

interface BlogIndexProps {
  posts: YearTabPost[];
}

const BlogIndex = ({ posts }: BlogIndexProps) => {
  return (
    <>
      <SEO seo={{ title: "Blog", path: "/blog" }} />
      <Main>
        <ScrollReveal initiallyVisible duration={0.3} distance={8}>
          <header>
            <h1 className="text-xl text-neutral-800 [font-variation-settings:'opsz'_32,_'wght'_500] dark:text-white sm:pb-6 sm:text-xl">
              Blog
            </h1>
          </header>
        </ScrollReveal>
        <ScrollReveal initiallyVisible delay={0.05} duration={0.3} distance={8}>
          <YearTabs posts={posts} />
        </ScrollReveal>
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
