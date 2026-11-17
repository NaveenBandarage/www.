import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const siteUrl = "https://naveenbandarage.com";
const escapeXml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
})[character]);

const files = (await readdir("posts")).filter((file) => file.endsWith(".mdx"));
const posts = await Promise.all(files.map(async (file) => {
  const { data } = matter(await readFile(path.join("posts", file), "utf8"));
  const date = new Date(data.date);
  if (!data.title || !data.description || Number.isNaN(date.getTime())) {
    throw new Error(`Invalid RSS metadata in ${file}: title, description, and a valid date are required`);
  }
  return { slug: file.slice(0, -4), title: data.title, description: data.description, date };
}));
posts.sort((a, b) => b.date.getTime() - a.date.getTime());

const items = posts.map(({ slug, title, description, date }) => {
  const url = `${siteUrl}/blog/${encodeURIComponent(slug)}`;
  return `    <item>\n      <title>${escapeXml(title)}</title>\n      <link>${escapeXml(url)}</link>\n      <guid isPermaLink="true">${escapeXml(url)}</guid>\n      <pubDate>${date.toUTCString()}</pubDate>\n      <description>${escapeXml(description)}</description>\n    </item>`;
}).join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n    <title>Naveen Bandarage's Blog</title>\n    <link>${siteUrl}/blog</link>\n    <description>Writing by Naveen Bandarage.</description>\n    <language>en</language>\n    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />\n${items}\n  </channel>\n</rss>\n`;
await writeFile("public/rss.xml", xml);
console.log(`Generated RSS feed with ${posts.length} posts.`);
