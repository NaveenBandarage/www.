import fs from "fs/promises"; // Use fs.promises for the asynchronous API
import matter from "gray-matter";
import path from "path";

export interface GetMdxPathsResult {
  slug: string;
  title: string;
  date: string;
  content?: string;
}

const PostsDirectory = path.join(process.cwd(), "posts");

export const getMdxPaths = async (): Promise<GetMdxPathsResult[]> => {
  try {
    const mdxFiles = await fs.readdir(PostsDirectory);

    const posts = await Promise.all(
      mdxFiles.map(async (file) => {
        const filePath = path.join(PostsDirectory, file);
        const content = await fs.readFile(filePath, "utf-8");
        const { data, content: mdxContent } = matter(content);

        return {
          slug: file.replace(/\.mdx$/, ""),
          title: data.title || "Untitled",
          date: data.date || "0",
          content: mdxContent,
        };
      }),
    );

    posts.sort((a, b) => b.date.localeCompare(a.date));

    return Promise.all(posts);
  } catch (error) {
    console.error("Error reading directory:", error);
    throw error;
  }
};
