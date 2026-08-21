import { danger, message, warn } from "danger";

const changedFiles = [
  ...danger.git.modified_files,
  ...danger.git.created_files,
  ...danger.git.deleted_files,
];

const pullRequestBody = danger.github.pr.body ?? "";
const pullRequestTitle = danger.github.pr.title.trim();
const isUiChange = changedFiles.some(
  (file) =>
    file.startsWith("components/") ||
    file.startsWith("styles/") ||
    (file.startsWith("pages/") && !file.startsWith("pages/api/")),
);
const isContentChange = changedFiles.some((file) =>
  /^posts\/.*\.mdx$/.test(file),
);
const hasVisualEvidence = /screenshot|screen recording|video|gif/i.test(
  pullRequestBody,
);

if (pullRequestTitle.length < 10) {
  warn("Please make the PR title a little more descriptive.");
}

if (pullRequestBody.trim().length < 40) {
  warn("Please add a short description explaining what changed and why.");
}

if (isUiChange && !hasVisualEvidence) {
  warn(
    "This looks like a UI change. Please include a screenshot, recording, or a note explaining why visual evidence is not applicable.",
  );
}

if (isContentChange) {
  message(
    "Blog content changed. Please check frontmatter, reading time, links, and the rendered mobile layout.",
  );
}

if (danger.github.pr.additions + danger.github.pr.deletions > 500) {
  warn(
    "This PR is larger than 500 lines. Consider splitting it into smaller, easier-to-review changes.",
  );
}
