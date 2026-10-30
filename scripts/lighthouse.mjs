import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { setTimeout as delay } from "node:timers/promises";
import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";

const require = createRequire(import.meta.url);
const { ci } = require("../lighthouserc.js");
const baseUrl = process.env.LIGHTHOUSE_BASE_URL || "http://localhost:4173";
const outputDirectory = process.env.LIGHTHOUSE_OUTPUT_DIR || ".lighthouseci";
const runs = Number(process.env.LIGHTHOUSE_RUNS || ci.collect.numberOfRuns);
if (!Number.isInteger(runs) || runs < 1)
  throw new Error("Invalid Lighthouse run count");

let server;
let chrome;
try {
  if (!process.env.LIGHTHOUSE_BASE_URL) {
    server = spawn(
      process.execPath,
      [require.resolve("next/dist/bin/next"), "start", "--port", "4173"],
      { stdio: "inherit" },
    );
    server.on("error", (error) => {
      console.error(error);
      process.exitCode = 1;
    });
  }

  const deadline = Date.now() + 20_000;
  while (true) {
    if (server && server.exitCode !== null)
      throw new Error("Next.js exited before the audit");
    try {
      const response = await fetch(baseUrl, {
        signal: AbortSignal.timeout(1000),
      });
      if (response.ok) break;
    } catch {
      /* Wait for the production server to be ready. */
    }
    if (Date.now() >= deadline)
      throw new Error(`Server did not become ready: ${baseUrl}`);
    await delay(200);
  }

  await mkdir(outputDirectory, { recursive: true });
  chrome = await launch({ chromeFlags: ["--headless", "--no-sandbox"] });
  for (const configuredUrl of ci.collect.url) {
    const { pathname, search } = new URL(configuredUrl);
    const url = new URL(pathname + search, baseUrl).href;
    const name =
      pathname.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home";
    const scores = [];
    for (let run = 0; run < runs; run++) {
      const result = await lighthouse(url, {
        port: chrome.port,
        output: ["json", "html"],
        logLevel: "error",
        onlyCategories: [
          "performance",
          "accessibility",
          "best-practices",
          "seo",
        ],
      });
      if (!result || result.lhr.runtimeError) {
        throw new Error(
          result?.lhr.runtimeError?.message || "Lighthouse returned no report",
        );
      }
      await Promise.all(
        result.report.map((report, index) =>
          writeFile(
            `${outputDirectory}/${name}-${run + 1}.${index === 0 ? "json" : "html"}`,
            report,
          ),
        ),
      );
      scores.push(result.lhr.categories);
    }

    for (const [assertion, [level, { minScore }]] of Object.entries(
      ci.assert.assertions,
    )) {
      const category = assertion.replace("categories:", "");
      const values = scores
        .map((categories) => categories[category].score)
        .sort((a, b) => a - b);
      const median = values[Math.floor(values.length / 2)];
      console.log(`${url} ${category}: ${Math.round(median * 100)}/100`);
      if (median < minScore) {
        console.warn(
          `${level}: ${category} is below ${Math.round(minScore * 100)}/100`,
        );
        if (level === "error") process.exitCode = 1;
      }
    }
  }
} finally {
  if (chrome) await chrome.kill();
  server?.kill();
}
