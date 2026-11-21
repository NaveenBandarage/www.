import { mkdir, writeFile, appendFile, rm } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { loadPost, exportHtml } from "./substack/content.mjs";
import { createClient, syncPost } from "./substack/client.mjs";

try {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      mode: { type: "string", default: process.env.SUBSTACK_MODE || "export" },
      "post-id": { type: "string" },
      "send-email": { type: "boolean", default: false },
    },
  });
  const input = positionals[0] || process.env.SUBSTACK_POST;
  if (!input || positionals.length > 1)
    throw new Error(
      "Usage: bun run substack <post-slug> [--mode=export|draft|publish] [--post-id=123] [--send-email]",
    );
  if (!["export", "draft", "publish"].includes(values.mode))
    throw new Error("Mode must be export, draft or publish.");
  const sendEmail =
    values["send-email"] || process.env.SUBSTACK_SEND_EMAIL === "true";
  if (sendEmail && values.mode !== "publish")
    throw new Error("Choose publish mode to send email.");
  const post = await loadPost(input);
  const outputDir = path.join(process.cwd(), ".substack-export");
  await mkdir(outputDir, { recursive: true });
  await Promise.all(
    ["target.json", "result.json"].map((file) =>
      rm(path.join(outputDir, file), { force: true }),
    ),
  );
  await writeFile(path.join(outputDir, "post.html"), exportHtml(post));
  await writeFile(
    path.join(outputDir, "post.json"),
    JSON.stringify(
      {
        title: post.title,
        subtitle: post.subtitle,
        sourceUrl: post.sourceUrl,
        body: post.document,
      },
      null,
      2,
    ) + "\n",
  );
  console.log("Formatted copy-and-paste export: .substack-export/post.html");
  if (values.mode !== "export") {
    const result = await syncPost(post, {
      client: createClient(),
      mode: values.mode,
      sendEmail,
      existingId: values["post-id"] || process.env.SUBSTACK_POST_ID,
      userId: process.env.SUBSTACK_USER_ID,
      onTarget: async (id) => {
        console.log(
          `Substack post ID: ${id}. Add substack_id: ${id} to this post's frontmatter to pin future updates.`,
        );
        await writeFile(
          path.join(outputDir, "target.json"),
          JSON.stringify({ id }, null, 2) + "\n",
        );
      },
    });
    await writeFile(
      path.join(outputDir, "result.json"),
      JSON.stringify(result, null, 2) + "\n",
    );
    console.log(
      `${result.mode === "publish" ? "Published" : "Saved draft changes"}: ${result.editorUrl}`,
    );
    if (process.env.GITHUB_STEP_SUMMARY)
      await appendFile(
        process.env.GITHUB_STEP_SUMMARY,
        `Substack post **${result.id}**: [Open editor](${result.editorUrl}). Mode: **${result.mode}**. Email requested: **${sendEmail}**.\n`,
      );
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
