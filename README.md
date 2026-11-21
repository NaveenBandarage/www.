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

## Cross-posting to Substack

Write and deploy the MDX post as usual. Cross-posting is a separate, manual step;
pushes never publish to Substack or send subscriber email.

### Copy and paste (no credentials)

```sh
bun run substack everything-is-a-lot
open .substack-export/post.html
```

Click **Copy formatted body**, then paste into a Substack draft. The export shows
the title and subtitle to enter separately. It preserves headings, emphasis,
links, lists, quotes, code, Markdown images, and static `BlogImage` components.
Image and relative link URLs become absolute. A source link is appended to the
body. The website deployment must be live for images in this export to load.
Unsupported MDX components, expressions, and imports stop the export with an
error instead of silently dropping content. Dynamic image props are unsupported.

### Manual GitHub Action

Once this workflow is on the default branch, open **Actions → Substack → Run
workflow**. Select the default branch and enter the post filename, with or without
`.mdx` (for example `everything-is-a-lot`). Choose:

- **export**: download `substack-export` from the run, unzip it, and open
  `post.html` to copy the formatted content. No Substack setup is needed.
- **draft**: create or replace the Substack draft content for review.
- **publish**: sync the content and publish it on Substack, or publish edits to an
  existing post. Subscriber email defaults to off. Check **send_email** only when
  you want the first publication to email subscribers. Already-published posts
  reject that option to prevent sending the same post twice.

Configure these under **GitHub repository Settings → Secrets and variables →
Actions** before using draft or publish:

| Kind | Name | Value |
| --- | --- | --- |
| Variable | `SUBSTACK_PUBLICATION_URL` | `https://your-publication.substack.com` (use the Substack domain, without a path) |
| Variable | `SUBSTACK_USER_ID` | Your numeric author user ID |
| Secret | `SUBSTACK_SESSION_TOKEN` | The value of your `substack.sid` session cookie |
| Variable (optional) | `SUBSTACK_COOKIE_NAME` | `connect.sid` if that is the cookie your session uses; defaults to `substack.sid` |

To find these, sign in to your publication, open browser developer tools →
Network, and reload the dashboard. On a successful authenticated request, copy
only the session cookie's **value** from the request's Cookie header. Find the
`publication_user` response and use `user.id` for the author ID. The session token
grants account access: keep it in Actions secrets and never paste it into a post,
workflow input, issue, or log. It can expire; replace the secret when it does.

The sync assigns a stable Substack slug to new posts and checks drafts, published
posts, and scheduled posts before creating one. Reruns update that same post,
including after title changes. Keep the MDX filename stable. Each run prints and
uploads the numeric post ID; pin it in frontmatter for reliable matching even if
you rename the file or change the Substack slug:

```yaml
substack_id: 123456789
```

For an existing Substack article created by hand, supply its numeric ID in the
workflow's `post_id` input, or add `substack_id` to frontmatter before the first
sync. Find the ID in its editor URL (`/publish/post/123456789`). Without an ID,
an older hand-created article cannot be matched automatically. Conflicting IDs
fail. Sync replaces the **entire title, subtitle, and body**, so make future edits
in MDX. Draft mode stages edits to an already-published post; use publish mode to
make those edits live. Scheduled posts must be unscheduled in Substack first.

Local images are uploaded from `public/` to Substack (JPEG, PNG, WebP, or GIF,
up to 10 MB each). External images must already be on Substack, or be saved to
`public/blog/` first. Exports retain external image URLs for manual pasting.
The workflow verifies saved content before publishing and does not automatically
retry writes. If a request fails, inspect the dashboard and the artifact's
`target.json` before retrying: a write may have succeeded before the connection
failed. `result.json` and the run summary appear after verified success.

For local API use, put the same `SUBSTACK_` variables in the ignored `.env.local`:

```sh
bun run substack everything-is-a-lot --mode=draft
bun run substack everything-is-a-lot --mode=publish --post-id=123456789
# Add --send-email only for a first publication that should email subscribers.
bun run test:substack
```

Substack has no supported public publishing API. This adapter uses the
[authenticated web endpoints](https://github.com/marcomoauro/substack-mcp/tree/main/src/api/substack),
which may change or block GitHub runners. API behavior needs a live check with
your publication; automated tests use mocked responses. The HTML export remains
available if authentication or those endpoints stop working.

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
