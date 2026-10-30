# Spotify footer

The footer displays the current song, or the most recently played song when
nothing is playing. Clicking it opens that song in Spotify. It does not play
audio automatically. It stays hidden until configured or when Spotify is unavailable.

Set these **server-only** environment variables in `.env.local` and Vercel:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REFRESH_TOKEN`

Create an app in the Spotify developer dashboard and authorize your own account
using the authorization code flow with `user-read-currently-playing` and
`user-read-recently-played` scopes. Exchange the authorization code for a refresh
token. Never put credentials into `NEXT_PUBLIC_` variables or commit `.env.local`.
Restart the development server after setting them.

Official setup instructions:

- https://developer.spotify.com/documentation/web-api/tutorials/code-flow
- https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens

`/api/now-playing` only returns public song metadata. Requests are cached for
30 seconds, concurrent upstream requests are deduplicated, and errors back off
for a minute. The footer starts fetching when it approaches the viewport and
refreshes once a minute while the page is visible.
