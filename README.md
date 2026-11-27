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

## Blog reactions and views

Each published blog post has four reactions and a shared view counter at the
bottom. Readers can select several reactions and tap again to remove them.
Counts refresh every minute while the tab is visible and when it regains focus.
Reaction sounds use the site's existing sound setting, including the mute
control beside the reactions. Press feedback respects reduced motion.

For production, create a **private Vercel Blob store**, copy its read/write token,
and set `BLOG_ENGAGEMENT_BLOB_READ_WRITE_TOKEN` in the Vercel project environment
(and optionally `.env.local`), then redeploy. Keep the existing analytics
`BLOB_READ_WRITE_TOKEN` unchanged: it uses a separate public store. Never use a
`NEXT_PUBLIC_` prefix for either token. See [Vercel private storage](https://vercel.com/docs/vercel-blob/private-storage).

The server stores one private document per post, with atomic conditional writes
and conflict retries. Only totals and the current reader's selected reactions
are returned to the browser. A random HttpOnly, SameSite cookie remembers a
browser for one year; only a post-scoped hash is stored. No IP addresses or
user agents are stored in engagement documents. Views count once per browser
per post per UTC day, starting when this feature is enabled; historical
analytics are not imported. Old daily deduplication hashes are replaced on the
next day's first view. Clearing cookies or using another browser creates a new
reader. These are browser counts, not verified unique people. The existing API
rate limiter provides best-effort per-instance abuse protection.

Without the token, `bun run dev` persists preview data in the ignored
`.cache/blog-engagement/` directory. Production returns an unavailable state
until storage is configured. Run `bun run test:engagement` for API, persistence,
deduplication and concurrent-update checks. This storage design is intended for
this personal blog: each write reads and replaces the post's document, whose
size grows with reacting browsers. A high-traffic site should move the same
API to a transactional database.

## Images in blog posts

Put images in `public/blog/` (a folder per post keeps them organized), then use
the built-in `BlogImage` component in the MDX post:

```mdx
<BlogImage
  src="/blog/everything-is-a-lot/photo.jpg"
  alt="A description of the photo"
  width="1600"
  height="1200"
/>
```

Use the image's actual pixel dimensions and a meaningful description. Next.js
resizes the image for the reader's screen and loads it lazily by default. For
an image immediately visible at the top of a post, add `priority` to load it
early. Images should be local, or hosted on a domain allowed in `next.config.js`.
Regular Markdown images still work but do not receive these optimizations.

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

## Japanese movie posters

Set `TMDB_API_KEY` to a TMDB API key in `.env.local` and in the Vercel project environment, then restart or redeploy. The key stays on the server. Search results show Japanese-language posters when they are available in TMDB.

### Homepage update message

Set `SITE_UPDATE_PATH` to the changed page’s path (for example, `/photos`) and
`SITE_UPDATE_MESSAGE` to the announcement text before a production deployment
from `main`. The homepage banner links to that path and is hidden when no valid
site path is configured. Use `/?previewUpdate` in development to try it.
