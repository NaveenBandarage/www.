import assert from "node:assert/strict";
import { test } from "node:test";

const song = {
  name: "Test song",
  type: "track",
  artists: [{ name: "Test artist" }],
  external_urls: { spotify: "https://open.spotify.com/track/test" },
  album: { images: [{ url: "https://i.scdn.co/image/test", width: 300 }] },
};

async function withSpotify(t, responses, run) {
  t.mock.method(globalThis, "fetch", async (url) => {
    const response = responses.shift();
    assert.ok(response, `Unexpected request: ${url}`);
    assert.ok(String(url).endsWith(response.path), String(url));
    return new Response(
      response.status === 204 ? null : JSON.stringify(response.body),
      { status: response.status ?? 200 },
    );
  });
  const previous = { ...process.env };
  process.env.SPOTIFY_CLIENT_ID = "test-client";
  process.env.SPOTIFY_CLIENT_SECRET = "test-secret";
  process.env.SPOTIFY_REFRESH_TOKEN = "test-refresh";
  try {
    const music = await import(`../lib/music.ts?case=${t.name}`);
    await run(music);
    assert.equal(responses.length, 0);
  } finally {
    process.env = previous;
    t.mock.restoreAll();
  }
}

const authorization = () => ({
  path: "/api/token",
  body: { access_token: "test-access", expires_in: 3600 },
});

test("unconfigured Spotify makes no upstream requests", async (t) => {
  await withSpotify(t, [], async ({ getListeningTrack, musicConfigured }) => {
    delete process.env.SPOTIFY_REFRESH_TOKEN;
    assert.equal(musicConfigured(), false);
    assert.equal(await getListeningTrack(), null);
    assert.equal(globalThis.fetch.mock.callCount(), 0);
  });
});

test("current song shares in-flight requests and caches results", async (t) => {
  await withSpotify(
    t,
    [
      authorization(),
      {
        path: "/me/player/currently-playing",
        body: { is_playing: true, item: song },
      },
    ],
    async ({ getListeningTrack }) => {
      const [first, second] = await Promise.all([
        getListeningTrack(),
        getListeningTrack(),
      ]);
      assert.deepEqual(first, {
        title: song.name,
        artist: "Test artist",
        url: song.external_urls.spotify,
        isPlaying: true,
        playedAt: null,
      });
      assert.deepEqual(second, first);
      assert.deepEqual(await getListeningTrack(), first);
      assert.equal(globalThis.fetch.mock.callCount(), 2);
      assert.ok(!JSON.stringify(first).includes("test-access"));
    },
  );
});

test("inactive playback falls back to recent history without claiming it is playing", async (t) => {
  await withSpotify(
    t,
    [
      authorization(),
      {
        path: "/me/player/currently-playing",
        status: 204,
      },
      {
        path: "/me/player/recently-played?limit=1",
        body: {
          items: [{ track: song, played_at: "2026-10-30T03:00:00.000Z" }],
        },
      },
    ],
    async ({ getListeningTrack }) => {
      const lastTrack = await getListeningTrack();
      assert.equal(lastTrack.isPlaying, false);
      assert.equal(lastTrack.playedAt, "2026-10-30T03:00:00.000Z");
    },
  );
});

test("paused playback uses recent history", async (t) => {
  await withSpotify(
    t,
    [
      authorization(),
      {
        path: "/me/player/currently-playing",
        body: { is_playing: false, item: song },
      },
      {
        path: "/me/player/recently-played?limit=1",
        body: { items: [] },
      },
    ],
    async ({ getListeningTrack }) => {
      assert.equal(await getListeningTrack(), null);
    },
  );
});

test("upstream errors clear listening status and back off", async (t) => {
  await withSpotify(
    t,
    [
      authorization(),
      {
        path: "/me/player/currently-playing",
        status: 429,
        body: {},
      },
    ],
    async ({ getListeningTrack }) => {
      assert.equal(await getListeningTrack(), null);
      assert.equal(await getListeningTrack(), null);
      assert.equal(globalThis.fetch.mock.callCount(), 2);
    },
  );
});

test("rejects non-Spotify track links", async (t) => {
  await withSpotify(
    t,
    [
      authorization(),
      {
        path: "/me/player/currently-playing",
        body: {
          is_playing: true,
          item: { ...song, external_urls: { spotify: "https://example.com/" } },
        },
      },
    ],
    async ({ getListeningTrack }) => {
      assert.equal(await getListeningTrack(), null);
    },
  );
});
