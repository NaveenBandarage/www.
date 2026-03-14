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
```

No test suite exists in this project.

## Architecture

**Framework:** Next.js 14 using the `pages/` router (not App Router).

**Content:** Blog content lives in `posts/*.mdx` with frontmatter parsed by `gray-matter` and rendered with `next-mdx-remote`. There is no CMS in the current codebase.

**Styling:** Tailwind CSS with custom config (fonts: Inter/Literata, custom colors/animations/shadows). Semantic CSS layers are defined in `styles/globals.css` — component-level classes like `.link`, `.island`, `.prose-custom` live there rather than in component files. Prettier auto-sorts Tailwind classes.

**TypeScript:** Strict mode is disabled (`strict: false` in tsconfig).

**Key integrations:**
- Vercel Blob-backed analytics and last-visitor APIs in `pages/api/`
- next-seo / next-sitemap for SEO (sitemap auto-generated on build)
- next-mdx-remote + gray-matter for MDX content loading
- External images allowed from: `digitaloceanspaces.com`, `books.google.com`, `assets.literal.club`, `covers.openlibrary.org`, `spotifycdn.com`
