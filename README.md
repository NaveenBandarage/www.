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
