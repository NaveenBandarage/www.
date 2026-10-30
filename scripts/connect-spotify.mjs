import { randomBytes } from "node:crypto";
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";

let { SPOTIFY_CLIENT_ID: clientId, SPOTIFY_CLIENT_SECRET: clientSecret } =
  process.env;
console.log(
  `Spotify setup\nCreate an app at https://developer.spotify.com/dashboard and register this redirect URI:\nhttp://127.0.0.1:4387/callback\n`,
);

let hideInput = false;
const output = new Writable({
  write(chunk, encoding, callback) {
    if (!hideInput) process.stdout.write(chunk, encoding);
    callback();
  },
});
const prompts = createInterface({
  input: process.stdin,
  output,
  terminal: Boolean(process.stdin.isTTY && process.stdout.isTTY),
});
prompts.on("SIGINT", () => {
  console.log("\nSetup cancelled. No credentials were saved.");
  prompts.close();
  process.exit(0);
});

async function ask(label, existing, secret = false) {
  while (true) {
    const prompt = `${label}${existing ? " (Enter to reuse saved value)" : ""}: `;
    let answer;
    try {
      // Let readline own the prompt so its terminal redraws preserve the label.
      const input = prompts.question(prompt);
      hideInput = secret;
      answer = (await input).trim();
    } finally {
      hideInput = false;
      if (secret) process.stdout.write("\n");
    }
    if (answer || existing) return answer || existing;
    console.log(`${label} is required.`);
  }
}

try {
  clientId = await ask("Spotify Client ID", clientId);
  clientSecret = await ask(
    "Spotify Client Secret (input hidden)",
    clientSecret,
    true,
  );
} catch {
  console.error(
    "\nInput closed. Run bun run spotify:connect in your terminal to try again.",
  );
  process.exit(1);
} finally {
  prompts.close();
}

const redirectUri = "http://127.0.0.1:4387/callback";
const state = randomBytes(32).toString("hex");
let exchanging = false;
const server = createServer(async (request, response) => {
  response.setHeader("Content-Type", "text/plain; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  const url = new URL(request.url, redirectUri);
  if (url.pathname !== "/callback") {
    response.writeHead(404).end("Not found");
    return;
  }
  if (url.searchParams.get("state") !== state) {
    response
      .writeHead(400)
      .end("Invalid authorization state. Try the original link again.");
    return;
  }
  if (url.searchParams.has("error")) {
    response
      .writeHead(400)
      .end(
        "Spotify access was not granted. Run the connection command to try again.",
      );
    server.close();
    return;
  }
  const code = url.searchParams.get("code");
  if (!code || exchanging) {
    response.writeHead(400).end("Missing or already used authorization code.");
    return;
  }
  exchanging = true;
  try {
    const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!result.ok)
      throw new Error(
        `Spotify authorization failed (${result.status}). Check your app credentials and redirect URI.`,
      );
    const auth = await result.json();
    if (typeof auth.refresh_token !== "string")
      throw new Error(
        "Spotify did not return a refresh token. Run the command again.",
      );
    const envPath = new URL("../.env.local", import.meta.url);
    const existing = await readFile(envPath, "utf8").catch((error) => {
      if (error.code !== "ENOENT") throw error;
      return "";
    });
    let updated = existing;
    for (const [name, value] of Object.entries({
      SPOTIFY_CLIENT_ID: clientId,
      SPOTIFY_CLIENT_SECRET: clientSecret,
      SPOTIFY_REFRESH_TOKEN: auth.refresh_token,
    })) {
      const assignment = `${name}=${JSON.stringify(value)}`;
      const pattern = new RegExp(
        `^[ \\t]*(?:export[ \\t]+)?${name}[ \\t]*=.*$`,
        "gm",
      );
      updated = pattern.test(updated)
        ? updated.replace(pattern, () => assignment)
        : `${updated.trimEnd()}\n${assignment}\n`;
    }
    await writeFile(envPath, updated, { mode: 0o600 });
    response.end(
      "Spotify connected. You can close this tab and restart the website. Add the three SPOTIFY variables from .env.local to Vercel for production.",
    );
    console.log(
      "Spotify connected. All three credentials were saved to .env.local.\nDo not commit .env.local; it is ignored by Git.\nRestart the website for local development. For production, copy SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and SPOTIFY_REFRESH_TOKEN from .env.local into Vercel → Project → Settings → Environment Variables, then redeploy.",
    );
  } catch (error) {
    console.error(error.message);
    response
      .writeHead(500)
      .end(
        "Connection failed. Check the terminal for details and run the command again.",
      );
    process.exitCode = 1;
  } finally {
    server.close();
  }
});

server.on("error", (error) => {
  console.error(`Could not start Spotify connection helper: ${error.message}`);
  process.exitCode = 1;
});
server.listen(4387, "127.0.0.1", () => {
  const authorize = new URL("https://accounts.spotify.com/authorize");
  authorize.search = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "user-read-currently-playing user-read-recently-played",
    state,
  }).toString();
  console.log(
    `Open this URL and authorize your Spotify account:\n${authorize}\n\nWaiting for Spotify. Press Ctrl+C to cancel.`,
  );
});
