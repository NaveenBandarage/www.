import type { NextApiRequest, NextApiResponse } from "next";
import { Feed } from "feed";
import { getMdxPaths } from "../getMdxPaths";
import { baseUrl } from "../../../components/SEO";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  try {
    // Create the feed
    const feed = new Feed({
      title: "Naveen Bandarage's Blog",
      description:
        "Building, breaking, listening and constantly learning. Thoughts on software engineering, career, and life.",
      id: baseUrl,
      link: baseUrl,
      language: "en",
      image: `${baseUrl}/logo.png`,
      favicon: `${baseUrl}/favicon.ico`,
      copyright: `All rights reserved ${new Date().getFullYear()}, Naveen Bandarage`,
      updated: new Date(),
      generator: "Next.js + Feed for Node.js",
      feedLinks: {
        rss2: `${baseUrl}/api/posts/rss`,
        json: `${baseUrl}/api/posts/rss?format=json`,
        atom: `${baseUrl}/api/posts/rss?format=atom`,
      },
      author: {
        name: "Naveen Bandarage",
        email: "bandaragenaveen@gmail.com",
        link: baseUrl,
      },
    });

    // Get all blog posts
    const posts = await getMdxPaths();

    // Add each post to the feed
    posts.forEach((post) => {
      const postUrl = `${baseUrl}/blog/${post.slug}`;

      feed.addItem({
        title: post.title,
        id: postUrl,
        link: postUrl,
        description: post.content?.substring(0, 200) + "..." || post.title,
        content: post.content || "",
        author: [
          {
            name: "Naveen Bandarage",
            email: "bandaragenaveen@gmail.com",
            link: baseUrl,
          },
        ],
        date: new Date(post.date),
        image: `${baseUrl}/logo.png`,
      });
    });

    // Determine format from query param
    const format = req.query.format as string;

    if (format === "json") {
      res.setHeader("Content-Type", "application/json");
      return res.status(200).send(feed.json1());
    } else if (format === "atom") {
      res.setHeader("Content-Type", "application/atom+xml");
      return res.status(200).send(feed.atom1());
    } else {
      // Default to RSS 2.0
      res.setHeader("Content-Type", "application/rss+xml");
      return res.status(200).send(feed.rss2());
    }
  } catch (error) {
    console.error("RSS feed generation error:", error);
    return res.status(500).json({ error: "Failed to generate RSS feed" });
  }
}

