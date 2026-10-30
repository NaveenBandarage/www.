export interface ListeningTrack {
  title: string;
  artist: string;
  url: string;
  isPlaying: boolean;
}

interface SpotifyTrack {
  name: string;
  artists: { name: string }[];
  external_urls: { spotify: string };
  type: string;
}

let cached: { track: ListeningTrack | null; expires: number } | undefined;
let pending: Promise<ListeningTrack | null> | undefined;
let token: { value: string; expires: number } | undefined;

export function musicConfigured() {
  return Boolean(
    process.env.SPOTIFY_CLIENT_ID &&
    process.env.SPOTIFY_CLIENT_SECRET &&
    process.env.SPOTIFY_REFRESH_TOKEN,
  );
}

async function spotifyFetch(path: string, accessToken: string) {
  const response = await fetch(`https://api.spotify.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(5000),
  });
  if (response.status === 204) return null;
  if (!response.ok) {
    if (response.status === 401) token = undefined;
    throw new Error(`Spotify request failed (${response.status})`);
  }
  return response.json();
}

async function loadTrack(): Promise<ListeningTrack | null> {
  if (!token || token.expires <= Date.now()) {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: process.env.SPOTIFY_REFRESH_TOKEN!,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error("Spotify authorization failed");
    const auth = await response.json();
    if (
      typeof auth.access_token !== "string" ||
      typeof auth.expires_in !== "number"
    )
      throw new Error("Invalid Spotify authorization response");
    token = {
      value: auth.access_token,
      expires: Date.now() + (auth.expires_in - 60) * 1000,
    };
  }
  const current = await spotifyFetch(
    "me/player/currently-playing",
    token.value,
  );
  let track: SpotifyTrack | undefined =
    current?.is_playing && current?.item?.type === "track"
      ? current.item
      : undefined;
  const isPlaying = Boolean(track);
  if (!track) {
    const recent = await spotifyFetch(
      "me/player/recently-played?limit=1",
      token.value,
    );
    track = recent?.items?.[0]?.track;
  }
  if (
    !track ||
    !track.name ||
    !track.external_urls?.spotify?.startsWith("https://open.spotify.com/")
  )
    return null;
  return {
    title: track.name,
    artist: track.artists.map((artist) => artist.name).join(", "),
    url: track.external_urls.spotify,
    isPlaying,
  };
}

export async function getListeningTrack() {
  if (!musicConfigured()) return null;
  if (cached && cached.expires > Date.now()) return cached.track;
  if (!pending) {
    pending = loadTrack()
      .then((track) => {
        cached = { track, expires: Date.now() + 30_000 };
        return track;
      })
      .catch(() => {
        // Back off on upstream errors without publishing stale "now playing" data.
        cached = { track: null, expires: Date.now() + 60_000 };
        return null;
      })
      .finally(() => {
        pending = undefined;
      });
  }
  return pending;
}
