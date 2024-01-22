// pages/blog/[slug].tsx
import { serialize } from "next-mdx-remote/serialize";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import BlogLayout from "../../components/Blog/BlogLayout";

const BlogPost = ({ meta, source }) => {
  return <BlogLayout meta={meta} source={source} />;
};

export default BlogPost;

const PostsDirectory = path.join(process.cwd(), "posts");

const getPostData = async (slug) => {
  const source = fs.readFileSync(
    path.join(PostsDirectory, `${slug}.mdx`),
    "utf8",
  );
  const { content, data } = matter(source);

  const mdxSource = await serialize(content);

  return {
    meta: data,
    source: mdxSource,
  };
};

export async function getStaticPaths() {
  const posts = fs.readdirSync(PostsDirectory);

  const paths = posts.map((post) => ({
    params: { slug: post.replace(/\.mdx$/, "") },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { meta, source } = await getPostData(params.slug);

  return {
    props: {
      meta,
      source,
    },
  };
}
