import ts from "typescript";

// Extract literal entries without executing the site's TypeScript.
export function addBooks(seed, sourceText) {
  const source = ts.createSourceFile("books.ts", sourceText, ts.ScriptTarget.Latest, true);
  let array;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === "booksData" && node.initializer && ts.isArrayLiteralExpression(node.initializer)) array = node.initializer;
    ts.forEachChild(node, visit);
  }
  visit(source);
  if (!array) throw new Error("Could not find booksData array");
  const result = structuredClone(seed);
  result.nodes.push({ id: "website:books", title: "bookshelf/", type: "folder", parent: null });
  for (const item of array.elements) {
    if (!ts.isObjectLiteralExpression(item)) throw new Error("Book entry must be an object literal");
    const fields = {};
    for (const property of item.properties) {
      if (ts.isPropertyAssignment(property) && (ts.isStringLiteral(property.initializer) || ts.isNumericLiteral(property.initializer))) fields[property.name.getText(source)] = property.initializer.text;
    }
    if (!fields.id || !fields.title || !fields.author || !fields.status) throw new Error("Book entry is missing required literal fields");
    const sourceId = `website:book-source:${fields.id}`;
    const id = `website:book:${fields.id}`;
    const status = { reading: "Currently reading", read: "Read", "want-to-read": "Want to read" }[fields.status];
    if (!status) throw new Error(`Unknown book status: ${fields.status}`);
    const content = `${fields.title} by ${fields.author}. ${status}${fields.readYear ? ` in ${fields.readYear}` : ""}.`;
    result.nodes.push({ id: sourceId, title: `${fields.title} — bookshelf source`, type: "source", parent: "sources", content: `https://www.naveenbandarage.com/books\n\n${content}`, kind: "Published bookshelf", scope: "Published website", evidence: "Bookshelf" });
    result.nodes.push({ id, title: fields.title, type: "memory", parent: "website:books", content, source_ids: [sourceId], tags: ["books", fields.status], status: "active", evidence: "Bookshelf", scope: "Published website" });
    result.edges.push({ from: id, to: sourceId, type: "supported_by" });
  }
  return result;
}
