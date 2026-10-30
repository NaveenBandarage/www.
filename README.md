# WWW.

This is the website of a person called Naveen.

Use Node.js 22.19 or newer (CI uses Node.js 24) and Bun 1.4.4. The Bun
lockfile uses version-scoped security overrides that older Bun releases cannot
read. Run `bun upgrade` if your installed version is older.

```sh
bun install --frozen-lockfile
bun run dev
```

Before shipping changes, run `bun run lint`, `bun run typecheck`,
`bun run build`, and `bun run audit`. To refresh dependencies, use `bun update`,
then run `npm install --package-lock-only --ignore-scripts` to synchronize the
npm audit lockfile and repeat the checks.

`bun run lighthouse` audits the production build with installed Chrome and
writes HTML and JSON reports to `.lighthouseci/`. It starts and stops its own
server on port 4173, runs three mobile audits per route, and reports median
scores against `lighthouserc.js`. CI uploads these reports as workflow artifacts.
Use `LIGHTHOUSE_BASE_URL` to audit an already-running server or
`LIGHTHOUSE_RUNS=1` for a quick local check.

## Spotify now playing

The bottom-right text shows “Naveen is vibing to [song]” during playback, or
“Naveen last vibed to [song] 5 minutes ago” using Spotify's last-played timestamp.
Phrases change randomly when the song or playback status changes, with an
occasional shimmer that respects reduced motion. The text stays hidden until
Spotify is configured and returns a track. Visitors never need to sign in.

1. Create an app in the [Spotify developer dashboard](https://developer.spotify.com/dashboard).
   Enable Web API and register `http://127.0.0.1:4387/callback` as the redirect URI.
   Spotify currently requires the owner of a development-mode app to have Premium.
2. Run `bun run spotify:connect` in your terminal. Paste the app's Client ID and
   Client Secret when prompted (secret input is hidden). If credentials are
   already loaded from `.env.local`, press Enter to reuse them.
3. Open the printed URL and authorize your own Spotify account. The helper
   generates your refresh token and saves all three credentials to `.env.local`
   automatically, preserving other environment variables. It requests
   `user-read-currently-playing` and `user-read-recently-played` access.
4. Restart the development server. For production, add all three `SPOTIFY_`
   variables to your Vercel project's environment variables and redeploy.

Keep these variables server-side (no `NEXT_PUBLIC_` prefix). The API caches
Spotify responses and the card polls every 20 seconds in visible tabs. Private
sessions, ads, or unavailable Spotify responses may leave the card hidden.
Run `bun run test:spotify` for the mocked Spotify API checks.

**Never commit `.env.local`.** It contains your Spotify secrets and is already
listed in `.gitignore`. Commit the setup script; configure production secrets
in Vercel separately.

See Spotify's [authorization flow](https://developer.spotify.com/documentation/web-api/tutorials/code-flow),
[redirect URI requirements](https://developer.spotify.com/documentation/web-api/concepts/redirect_uri),
and [development-mode requirements](https://developer.spotify.com/documentation/web-api/concepts/quota-modes).
