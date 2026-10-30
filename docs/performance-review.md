# Performance and dependency review

Reviewed October 29, 2026. Changes are local and have not been deployed.

## Measured results

| Measure | Before | After |
| --- | ---: | ---: |
| Initial homepage JavaScript, gzip | 156 KB | 124 KB |
| Homepage JSON page data | 8,184 bytes | 219 bytes |
| Dependency audit findings | 14 | 0 |

Initial JavaScript is about 20% smaller. Page data is 97% smaller. Deferred
animation code still downloads separately when needed; the JavaScript figure
measures the initial bundle rather than all subsequent requests.

The final Lighthouse 13.6 mobile audits scored **100/100 for performance on
both `/` and `/blog` in all three runs**. Median largest contentful paint was
0.62 seconds for each. The initial Lighthouse 12 baseline scored 79 on the
homepage, but scores across Lighthouse versions should not be compared directly.
The bundle and page-data comparisons above use the same measurement method.

Local HTML reports are in
`.lighthouseci/performance-review-2026-10-29/`; these generated artifacts are
ignored by Git. Remaining audit findings include existing contrast and blog
tab semantics issues; the performance work does not constitute a full
accessibility audit.

## Changes

- Homepage text is visible in server-rendered HTML, with brief movement instead
  of the previous 1.5–5.5-second text delays. This timing change was requested
  during the review.
- The initial blog list is also visible immediately; tab-switch animations
  remain brief and use opacity and transforms.
- Animation features load in a separate chunk. Components use Motion's smaller
  `m` API, and page transitions avoid full-page blur and permanent `will-change`.
- Native, cached `Intl` formatters replace both date libraries. Dates use UTC
  to keep post metadata consistent between server and browser; the clock
  continues to use New York time, including daylight saving changes.
- The footer clock starts near the viewport and pauses in background tabs.
  Touch devices and reduced-motion users keep native scrolling.
- Visitor recording skips external geolocation without a public client IP,
  instead of looking up the server's own location and waiting up to five
  seconds. Optional lookups time out after 1.5 seconds and failures no longer
  discard the visit. Pending widget requests abort when it unmounts.
- Homepage props contain post metadata instead of full MDX bodies. The MDX
  filesystem helper lives in `lib/posts.ts` rather than an invalid API route.
- The email mini-game loads on first use. Book covers use quality 85 instead
  of 95. Reduced-motion rendering matches server HTML during hydration.
- The document declares its language, and homepage section headings use a
  sequential hierarchy.

## Dependencies and tooling

Next.js and its companion packages are updated to 15.5.28, Sharp to 0.35.5,
sanitize-html to 2.18.1, Vercel Blob to 2.8.2, and Lenis to 1.3.27. These include
the patches described in the [Next.js October security update](https://nextjs.org/blog/nextjs-security-update-october-14-2026).

Unused direct dependencies and incompatible blanket overrides were removed.
Security overrides now preserve the major versions required by consumers.
Both Bun and npm audits report zero vulnerabilities, including development
dependencies. The baseline npm lockfile reported 14 findings.

The older Lighthouse CI dependency was replaced with Lighthouse 13.6 and a
small runner that retains median score checks and HTML/JSON reports. GitHub
Actions uses Bun 1.4.4 and Node.js 24. Bun 1.4.4 is required for the version-scoped
overrides and version 3 lockfile; installation commands are in `README.md`.

The previous Bun cache setting treated `~` as a literal repository directory.
The default system cache is now used, and existing cache files are excluded
from formatting and version control.

## Validation

Production builds, ESLint, TypeScript, frozen-lockfile installation, and both
dependency audits pass. Date-format checks cover ordinal dates and both New
York daylight saving transitions. All 10 MDX posts load with valid dates and
reading times.

Visitor API checks confirm that local requests make no external lookup and
public-IP requests still record visits when the geolocation provider fails.

Browser checks cover mobile layouts at 375px, desktop dark mode at 1280px,
client navigation, blog year tabs, book selection, on-demand mini-game loading,
photo pages, gallery rendering, and reduced motion. Footer APIs are stubbed in
interaction checks; Lighthouse uses the local API fallback without production
credentials.

Final validation runs from a temporary source copy because another development
session was writing to the shared `.next` directory. Existing gallery, music,
and memory-explorer work was preserved.

Lab scores measure a local production build with mobile emulation. They do not
establish deployed Core Web Vitals, which need production measurements after
deployment.

## Screenshots

[Mobile homepage](images/performance-home-mobile.png) · [Desktop dark mode](images/performance-home-dark-desktop.png)
