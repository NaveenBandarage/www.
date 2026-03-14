# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Naveen Bandarage, built with Next.js 14, TypeScript, and Tailwind CSS. Deployed on Vercel at https://naveenbandarage.com.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production (runs next-sitemap as postbuild)
npm run lint         # Run ESLint
npm run format       # Format with Prettier (includes Tailwind class sorting)
npm run generate     # Generate GraphQL types from schema/queries
```

No test suite exists in this project.

## Architecture

**Framework:** Next.js 14 using the `pages/` router (not App Router).

**Content:** Contentful CMS is the primary data source. Images use a custom loader (`lib/contentfulLoader.ts`) that builds Contentful image URLs with transformation parameters.

**GraphQL:** Apollo Client + Server infrastructure exists (`codegen.yml`, `graphql/` directory) with auto-generated types. Run `npm run generate` after modifying GraphQL queries in `graphql/queries/`.

**Styling:** Tailwind CSS with custom config (fonts: Inter/Literata, custom colors/animations/shadows). Semantic CSS layers are defined in `styles/globals.css` — component-level classes like `.link`, `.island`, `.prose-custom` live there rather than in component files. Prettier auto-sorts Tailwind classes.

**TypeScript:** Strict mode is disabled (`strict: false` in tsconfig).

**Key integrations:**
- Mapbox GL for interactive maps (custom pin styles in `globals.css`)
- next-seo / next-sitemap for SEO (sitemap auto-generated on build)
- next-mdx-remote / Markdoc for markdown content rendering
- External images allowed from: `images.ctfassets.net`, `i.scdn.co`, `digitaloceanspaces.com`, `books.google.com`, `assets.literal.club`, `spotifycdn.com`

**Redirects:** `/projects/:path*` redirects to `https://fabe.github.io/projects/:path*` (defined in `next.config.js`).
