import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";

const parser = unified().use(remarkParse).use(remarkMdx);
const textOf = (node) => {
  if (["text", "inlineCode", "code"].includes(node.type)) return node.value;
  if (node.type === "image") return node.alt || "";
  if (node.type === "mdxJsxFlowElement" && node.name === "BlogImage") {
    return node.attributes
      .filter((attr) => ["alt", "caption"].includes(attr.name) && typeof attr.value === "string")
      .map((attr) => attr.value)
      .join("\n");
  }
  if (node.type.startsWith("mdx")) return (node.children || []).map(textOf).join(" ");
  return (node.children || []).map(textOf).join(node.type === "paragraph" ? "" : "\n");
};

export async function addPublishedPosts(seed, directory) {
  const result = structuredClone(seed);
  const files = (await readdir(directory)).filter((file) => file.endsWith(".mdx")).sort();
  result.nodes.push({ id: "website:writing", type: "folder", title: "writing/", parent: null });
  for (const file of files) {
    const { data, content } = matter(await readFile(path.join(directory, file), "utf8"));
    const date = new Date(data.date);
    if (typeof data.title !== "string" || !data.title.trim() || Number.isNaN(date.getTime()))
      throw new Error(`Invalid memory metadata in ${file}: title and date are required`);
    const slug = file.slice(0, -4);
    const key = createHash("sha256").update(slug).digest("hex").slice(0, 24);
    const id = `website:post:${key}`;
    const sourceId = `website:source:${key}`;
    const url = `https://naveenbandarage.com/blog/${encodeURIComponent(slug)}`;
    const body = textOf(parser.parse(content)).replace(/\n{3,}/g, "\n\n").trim();
    result.nodes.push({ id: sourceId, type: "source", title: data.title, parent: "sources", created_at: date.toISOString(), content: `${url}\n\n${body}`, kind: "Published blog post", scope: "Published writing", evidence: "Published on naveenbandarage.com" });
    result.nodes.push({ id, type: "memory", title: data.title, parent: "website:writing", created_at: date.toISOString(), content: body, source_ids: [sourceId], kind: "Published blog post", scope: "Published writing", evidence: "Published on naveenbandarage.com", tags: ["writing", "blog"] });
    result.edges.push({ from: id, to: sourceId, type: "supported_by" });
  }
  return result;
}
