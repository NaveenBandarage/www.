import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const hash = (value) => createHash("sha256").update(value).digest("hex").slice(0, 24);
const site = "https://naveenbandarage.com";
const normalize = (text) => text.replace(/\s+/g, " ").trim();
const literal = (node) => {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return node.text;
  if (node.kind === ts.SyntaxKind.TrueKeyword) return "true";
  if (node.kind === ts.SyntaxKind.FalseKeyword) return "false";
  return null;
};
const unwrap = (node) => ts.isAsExpression(node) || ts.isSatisfiesExpression(node) ? unwrap(node.expression) : node;

// Read only literal JSX content. Never execute application code or include API responses.
function jsxText(node) {
  if (ts.isJsxText(node)) return node.text;
  if (ts.isJsxExpression(node)) return node.expression && literal(node.expression) || "";
  if (ts.isJsxElement(node) || ts.isJsxFragment(node)) return node.children.map(jsxText).join(" ");
  return "";
}
function findReturn(node) {
  if (!node.body || !ts.isBlock(node.body)) return null;
  const statement = node.body.statements.find(ts.isReturnStatement);
  if (!statement?.expression) return null;
  let expr = statement.expression;
  while (ts.isParenthesizedExpression(expr)) expr = expr.expression;
  return expr;
}
function addRecord(result, { key, title, body, folder, url, kind }) {
  if (!title || !body) return;
  const id = `website:${key}`;
  const sourceId = `website:source:${hash(key)}`;
  result.nodes.push({ id: sourceId, type: "source", title, parent: "sources", content: `${url}\n\n${body}`, kind, scope: "Published website", evidence: "Published on naveenbandarage.com" });
  result.nodes.push({ id, type: "memory", title, parent: folder, content: body, source_ids: [sourceId], kind, scope: "Published website", evidence: "Published on naveenbandarage.com", tags: ["website"] });
  result.edges.push({ from: id, to: sourceId, type: "supported_by" });
}
function objectFields(node) {
  const fields = {};
  for (const prop of node.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const key = prop.name && (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name)) ? prop.name.text : null;
    const value = literal(unwrap(prop.initializer));
    if (key && value !== null) fields[key] = value;
  }
  return fields;
}
function collectArrays(source) {
  const arrays = [];
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const value = unwrap(node.initializer);
      if (ts.isArrayLiteralExpression(value)) {
        const items = value.elements.filter(ts.isObjectLiteralExpression).map(objectFields);
        if (items.some((item) => item.title || item.name || item.alt)) arrays.push({ name: node.name.text, items });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return arrays;
}

export async function addSiteContent(seed, root) {
  const result = structuredClone(seed);
  result.nodes.push(
    { id: "website:pages", type: "folder", title: "the site/", parent: null },
    { id: "website:collections", type: "folder", title: "collections/", parent: null },
    { id: "website:experiments", type: "folder", title: "experiments/", parent: null },
    { id: "website:movies", type: "folder", title: "films seen/", parent: null },
  );
  const read = async (file) => ts.createSourceFile(file, await readFile(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const pageDir = path.join(root, "pages");
  const pages = (await readdir(pageDir)).filter((f) => /\.tsx?$/.test(f) && !f.startsWith("_") && f !== "memory.tsx").sort();
  const collections = [];
  const dataRoutes = new Map();
  for (const file of pages) {
    const slug = file.replace(/\.tsx?$/, "");
    const url = site + (slug === "index" ? "/" : `/${slug}`);
    const source = await read(path.join(pageDir, file));
    for (const statement of source.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
      const specifier = statement.moduleSpecifier.text;
      if (!specifier.startsWith("../data/")) continue;
      const name = specifier.slice("../data/".length).replace(/\.tsx?$/, "");
      if (!dataRoutes.has(name)) dataRoutes.set(name, url);
    }
    const component = source.statements.find((n) => ts.isFunctionDeclaration(n) && n.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword));
    const returned = component && findReturn(component);
    const body = returned ? normalize(jsxText(returned)) : "";
    if (body) addRecord(result, { key: `page:${hash(slug)}`, title: `${slug === "index" ? "Home" : slug.replace(/-/g, " ")} — website`, body, folder: "website:pages", url, kind: "Published website content" });
    collections.push(...collectArrays(source).map((array) => ({ ...array, origin: `pages/${file}`, url })));
    if (slug === "fun" && returned) {
      function links(node) {
        if (ts.isJsxElement(node) && ts.isIdentifier(node.openingElement.tagName) && node.openingElement.tagName.text === "Link") {
          const attr = node.openingElement.attributes.properties.find((p) => ts.isJsxAttribute(p) && p.name.text === "href");
          const href = attr?.initializer && literal(attr.initializer);
          const title = normalize(jsxText(node)).replace(/\s*↗$/, "");
          if (href?.startsWith("/") && href !== "/memory" && title) {
            const parent = node.parent;
            const body = normalize(jsxText(parent)) || title;
            addRecord(result, { key: `experiment:${hash(href)}`, title, body, folder: "website:experiments", url: site + href, kind: "Published website content" });
          }
        }
        ts.forEachChild(node, links);
      }
      links(returned);
    }
  }
  const dataDir = path.join(root, "data");
  for (const file of (await readdir(dataDir)).filter((f) => /\.tsx?$/.test(f)).sort()) {
    const name = file.replace(/\.tsx?$/, "");
    if (name === "books" || (!dataRoutes.has(name) && name !== "movies")) continue;
    const source = await read(path.join(dataDir, file));
    const url = name === "movies" ? site + "/movies" : dataRoutes.get(name);
    collections.push(...collectArrays(source).map((array) => ({ ...array, origin: `data/${file}`, url })));
  }
  if (dataRoutes.has("gallery")) {
    const photos = JSON.parse(await readFile(path.join(dataDir, "gallery-photos.json"), "utf8"));
    collections.push({
      name: "galleryPhotos",
      items: photos,
      origin: "data/gallery.ts",
      url: site + "/photos",
    });
  }
  const seen = new Set();
  for (const { name, items, origin, url } of collections) {
    for (const fields of items) {
      const title = fields.title || fields.name || fields.alt;
      if (!title) continue;
      const identity = fields.id || fields.src || fields.slug || title;
      const key = `item:${hash(`${origin}:${name}:${identity}`)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const body = Object.entries(fields).filter(([key, value]) => ["string", "number", "boolean"].includes(typeof value) && !["id", "src", "coverSrc", "isbn", "width", "height", "slug", "coordinates"].includes(key)).map(([key, value]) => `${key}: ${value}`).join("\n");
      const isSeenFilm = origin === "data/movies.ts" && name === "movies";
      addRecord(result, { key, title, body: isSeenFilm ? `Film listed in Things I’ve seen.\n${body}` : body, folder: isSeenFilm ? "website:movies" : "website:collections", url: name === "galleryPhotos" && fields.src
        ? `${site}/photo/${encodeURIComponent(fields.slug || path.basename(fields.src, path.extname(fields.src)))}`
        : url, kind: "Published website content" });
    }
  }
  return result;
}
