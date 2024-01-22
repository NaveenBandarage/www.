import fs from "fs/promises"; // Use fs.promises for the asynchronous API
import matter from "gray-matter";
import path from "path";

export interface GetMdxPathsResult {
  slug: string;
  title: string;
  date: string;
}

const PostsDirectory = path.join(process.cwd(), "posts");

export const getMdxPaths = async (): Promise<GetMdxPathsResult[]> => {
  try {
    const mdxFiles = await fs.readdir(PostsDirectory);

    const posts = mdxFiles.map(async (file) => {
      const filePath = path.join(PostsDirectory, file);
      const content = await fs.readFile(filePath, "utf-8");
      const { data } = matter(content);

      return {
        slug: file.replace(/\.mdx$/, ""),
        title: data.title || "Untitled",
        date: data.date || "Untitled",
      };
    });

    return Promise.all(posts);
  } catch (error) {
    console.error("Error reading directory:", error);
    throw error;
  }
};
