import assert from "node:assert/strict";
import { once } from "node:events";
import {
  mkdtemp,
  mkdir,
  copyFile,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { test } from "node:test";

test(
  "interactive Spotify setup saves credentials only after a valid callback",
  { timeout: 15_000 },
  async () => {
    const directory = await mkdtemp(join(tmpdir(), "spotify-setup-test-"));
    let child;
    try {
      await mkdir(join(directory, "scripts"));
      await copyFile(
        new URL("../scripts/connect-spotify.mjs", import.meta.url),
        join(directory, "scripts/connect-spotify.mjs"),
      );
      await writeFile(
        join(directory, ".env.local"),
        "OTHER_SETTING=keep-me\nSPOTIFY_CLIENT_ID=old-id\nSPOTIFY_CLIENT_SECRET=old-secret\nSPOTIFY_REFRESH_TOKEN=old-token\n",
      );
      await writeFile(
        join(directory, "mock-spotify.mjs"),
        `globalThis.fetch = async () => new Response(JSON.stringify({ refresh_token: "fake-refresh-token" }));`,
      );
      const env = { ...process.env };
      delete env.SPOTIFY_CLIENT_ID;
      delete env.SPOTIFY_CLIENT_SECRET;
      delete env.SPOTIFY_REFRESH_TOKEN;
      child = spawn(
        process.execPath,
        [
          "--import",
          join(directory, "mock-spotify.mjs"),
          join(directory, "scripts/connect-spotify.mjs"),
        ],
        { env, stdio: ["pipe", "pipe", "pipe"] },
      );
      let output = "";
      let errors = "";
      let sentId = false;
      let sentSecret = false;
      let resolveUrl;
      const authorizationUrl = new Promise((resolve) => {
        resolveUrl = resolve;
      });
      child.stdout.on("data", (data) => {
        output += data;
        if (!sentId && output.includes("Spotify Client ID:")) {
          sentId = true;
          child.stdin.write("fake-client-id\n");
        }
        if (
          !sentSecret &&
          output.includes("Spotify Client Secret (input hidden):")
        ) {
          sentSecret = true;
          child.stdin.write("fake-client-secret\n");
        }
        const match = output.match(
          /https:\/\/accounts\.spotify\.com\/authorize\?[^\s]+/,
        );
        if (match) resolveUrl(new URL(match[0]));
      });
      child.stderr.on("data", (data) => {
        errors += data;
      });
      const exited = once(child, "exit");
      const url = await Promise.race([
        authorizationUrl,
        exited.then(([code]) => {
          throw new Error(`Setup exited early (${code}): ${errors}`);
        }),
      ]);
      assert.equal(url.searchParams.get("client_id"), "fake-client-id");
      const callback = new URL(url.searchParams.get("redirect_uri"));
      callback.search = new URLSearchParams({
        code: "fake-code",
        state: "wrong-state",
      });
      assert.equal((await fetch(callback)).status, 400);
      assert.ok(
        (await readFile(join(directory, ".env.local"), "utf8")).includes(
          "old-token",
        ),
      );
      callback.searchParams.set("state", url.searchParams.get("state"));
      assert.equal((await fetch(callback)).status, 200);
      const [exitCode] = await exited;
      assert.equal(exitCode, 0, errors);
      const saved = await readFile(join(directory, ".env.local"), "utf8");
      assert.ok(saved.includes("OTHER_SETTING=keep-me"));
      assert.ok(saved.includes('SPOTIFY_CLIENT_ID="fake-client-id"'));
      assert.ok(saved.includes('SPOTIFY_CLIENT_SECRET="fake-client-secret"'));
      assert.ok(saved.includes('SPOTIFY_REFRESH_TOKEN="fake-refresh-token"'));
      assert.ok(!saved.includes("old-token"));
      assert.ok(!output.includes("fake-client-secret"));
      assert.ok(!output.includes("fake-refresh-token"));
    } finally {
      child?.kill();
      await rm(directory, { recursive: true, force: true });
    }
  },
);
