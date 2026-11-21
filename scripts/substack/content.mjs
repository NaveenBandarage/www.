import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";

export const siteUrl = "https://naveenbandarage.com";
const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );

function absoluteUrl(value, sourceUrl, image = false) {
  const url = new URL(value, sourceUrl);
  if (
    !(image ? ["https:"] : ["https:", "http:", "mailto:"]).includes(
      url.protocol,
    )
  ) {
    throw new Error(`Unsupported URL protocol: ${url.protocol}`);
  }
  return url.href;
}

function unsupported(node) {
  throw new Error(
    `Cannot export ${node.name || node.type} at line ${node.position?.start.line ?? "?"}. Use Markdown or a static BlogImage instead.`,
  );
}

function imageNode(src, alt, sourceUrl, dimensions = {}) {
  return {
    type: "captionedImage",
    content: [
      {
        type: "image2",
        attrs: {
          src: absoluteUrl(src, sourceUrl, true),
          alt: alt || "",
          ...dimensions,
        },
      },
    ],
  };
}

function blogImage(node, sourceUrl) {
  if (node.name !== "BlogImage" || node.children.length) unsupported(node);
  const attrs = {};
  for (const attr of node.attributes) {
    if (attr.type !== "mdxJsxAttribute") unsupported(node);
    if (["priority", "className"].includes(attr.name)) continue;
    if (!["src", "alt", "width", "height", "caption"].includes(attr.name))
      unsupported(node);
    let value = attr.value;
    if (value && typeof value === "object") {
      const expression = value.data?.estree?.body?.[0]?.expression;
      if (expression?.type !== "Literal") unsupported(node);
      value = expression.value;
    }
    attrs[attr.name] = value;
  }
  if (typeof attrs.src !== "string" || typeof attrs.alt !== "string")
    unsupported(node);
  const dimensions = {};
  for (const key of ["width", "height"]) {
    if (attrs[key] !== undefined) {
      const dimension = Number(attrs[key]);
      if (!Number.isFinite(dimension) || dimension <= 0) unsupported(node);
      dimensions[key] = dimension;
    }
  }
  const image = imageNode(attrs.src, attrs.alt, sourceUrl, dimensions);
  if (attrs.caption)
    image.content.push({
      type: "caption",
      content: [{ type: "text", text: String(attrs.caption) }],
    });
  return image;
}

export function convertContent(content, sourceUrl) {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(content);
  const definitions = new Map();
  function collect(node) {
    if (node.type === "definition") definitions.set(node.identifier, node);
    node.children?.forEach(collect);
  }
  collect(tree);
  const children = (node, marks = []) =>
    node.children.flatMap((child) => inline(child, marks));
  function inline(node, marks = []) {
    switch (node.type) {
      case "text":
        return node.value
          ? [
              {
                type: "text",
                text: node.value,
                ...(marks.length ? { marks } : {}),
              },
            ]
          : [];
      case "inlineCode":
        return [
          {
            type: "text",
            text: node.value,
            marks: [...marks, { type: "code" }],
          },
        ];
      case "strong":
        return children(node, [...marks, { type: "strong" }]);
      case "emphasis":
        return children(node, [...marks, { type: "em" }]);
      case "break":
        return [{ type: "hard_break" }];
      case "linkReference": {
        const definition = definitions.get(node.identifier);
        if (!definition) unsupported(node);
        return children(node, [
          ...marks,
          {
            type: "link",
            attrs: { href: absoluteUrl(definition.url, sourceUrl) },
          },
        ]);
      }
      case "link":
        return children(node, [
          ...marks,
          { type: "link", attrs: { href: absoluteUrl(node.url, sourceUrl) } },
        ]);
      default:
        return unsupported(node);
    }
  }
  function blocks(nodes) {
    return nodes.flatMap((node) => {
      switch (node.type) {
        case "definition":
          return [];
        case "paragraph": {
          // Images are block nodes in Substack, even when Markdown puts them inside a paragraph.
          const result = [];
          let run = [];
          const flush = () => {
            if (run.length) result.push({ type: "paragraph", content: run });
            run = [];
          };
          for (const child of node.children) {
            if (
              ["image", "imageReference", "mdxJsxTextElement"].includes(
                child.type,
              )
            ) {
              flush();
              if (child.type === "mdxJsxTextElement")
                result.push(blogImage(child, sourceUrl));
              else {
                const image =
                  child.type === "imageReference"
                    ? definitions.get(child.identifier)
                    : child;
                if (!image) unsupported(child);
                result.push(imageNode(image.url, child.alt, sourceUrl));
              }
            } else run.push(...inline(child));
          }
          flush();
          return result;
        }
        case "heading":
          return [
            {
              type: "heading",
              attrs: { level: node.depth },
              content: children(node),
            },
          ];
        case "blockquote":
          return [{ type: "blockquote", content: blocks(node.children) }];
        case "list":
          return [
            {
              type: node.ordered ? "ordered_list" : "bullet_list",
              ...(node.ordered
                ? { attrs: { order: node.start ?? 1, start: node.start ?? 1 } }
                : {}),
              content: blocks(node.children),
            },
          ];
        case "listItem":
          return [{ type: "list_item", content: blocks(node.children) }];
        case "code":
          return [
            {
              type: "highlighted_code_block",
              ...(node.lang ? { attrs: { language: node.lang } } : {}),
              content: node.value ? [{ type: "text", text: node.value }] : [],
            },
          ];
        case "thematicBreak":
          return [{ type: "horizontal_rule" }];
        case "mdxJsxFlowElement":
          return [blogImage(node, sourceUrl)];
        default:
          return unsupported(node);
      }
    });
  }
  return {
    type: "doc",
    content: [
      ...blocks(tree.children),
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Originally published on naveenbandarage.com.",
            marks: [{ type: "link", attrs: { href: sourceUrl } }],
          },
        ],
      },
    ],
  };
}

export async function loadPost(input, root = process.cwd()) {
  const slug = input?.replace(/\.mdx$/, "");
  if (!slug || slug === "." || slug === ".." || /[/\\\x00-\x1f]/.test(slug)) {
    throw new Error("Choose a post filename from posts/, without directories.");
  }
  const postsDir = await realpath(path.join(root, "posts"));
  const filename = await realpath(path.join(postsDir, `${slug}.mdx`));
  if (path.dirname(filename) !== postsDir)
    throw new Error("Post must be inside posts/.");
  const { data, content } = matter(await readFile(filename, "utf8"));
  if (
    typeof data.title !== "string" ||
    !data.title.trim() ||
    typeof data.description !== "string"
  ) {
    throw new Error("Post needs a title and description in its frontmatter.");
  }
  const sourceUrl = `${siteUrl}/blog/${encodeURIComponent(slug)}`;
  return {
    slug,
    title: data.title,
    subtitle: data.description,
    sourceUrl,
    substackId: data.substack_id,
    document: convertContent(content, sourceUrl),
  };
}

export function renderHtml(node) {
  const content = () => (node.content || []).map(renderHtml).join("");
  switch (node.type) {
    case "doc":
    case "captionedImage":
      return content();
    case "text":
      return (node.marks || []).reduce((html, mark) => {
        if (mark.type === "link")
          return `<a href="${escapeHtml(mark.attrs.href)}">${html}</a>`;
        const tag = { strong: "strong", em: "em", code: "code" }[mark.type];
        return `<${tag}>${html}</${tag}>`;
      }, escapeHtml(node.text));
    case "hard_break":
      return "<br>";
    case "horizontal_rule":
      return "<hr>";
    case "image2":
      return `<img src="${escapeHtml(node.attrs.src)}" alt="${escapeHtml(node.attrs.alt || "")}"${node.attrs.width ? ` width="${node.attrs.width}"` : ""}${node.attrs.height ? ` height="${node.attrs.height}"` : ""}>`;
    case "highlighted_code_block":
      return `<pre><code>${content()}</code></pre>`;
    default: {
      const tag = {
        paragraph: "p",
        blockquote: "blockquote",
        bullet_list: "ul",
        ordered_list: "ol",
        list_item: "li",
        caption: "figcaption",
        heading: `h${node.attrs?.level}`,
      }[node.type];
      if (!tag) throw new Error(`Cannot render ${node.type}.`);
      return `<${tag}${node.type === "ordered_list" ? ` start="${node.attrs.order}"` : ""}>${content()}</${tag}>`;
    }
  }
}

export function exportHtml(post) {
  return `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(post.title)} — Substack export</title>
<style>body{max-width:720px;margin:48px auto;padding:0 24px;font:18px/1.7 Georgia,serif;color:#222}img{max-width:100%;height:auto}pre{overflow:auto}button{font:inherit;cursor:pointer}header{font:14px/1.6 system-ui;margin-bottom:32px}h1{line-height:1.2}</style>
<header><p>Title: <strong>${escapeHtml(post.title)}</strong><br>Subtitle: ${escapeHtml(post.subtitle)}</p><button id="copy">Copy formatted body</button> <span id="status" role="status"></span><p>Paste into the Substack editor. Enter the title and subtitle separately. Images need the website deployment to be live.</p></header>
<article id="body">${renderHtml(post.document)}</article>
<script>document.getElementById('copy').onclick=async()=>{const body=document.getElementById('body');const status=document.getElementById('status');try{await navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([body.innerHTML],{type:'text/html'}),'text/plain':new Blob([body.innerText],{type:'text/plain'})})]);status.textContent='Copied.';}catch{const range=document.createRange();range.selectNodeContents(body);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);status.textContent=document.execCommand('copy')?'Copied.':'Body selected — press Command+C or Ctrl+C.';}};</script></html>\n`;
}
