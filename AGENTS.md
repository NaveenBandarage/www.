# Agent Instructions for Naveen Bandarage's Personal Website

This document provides context and instructions for AI coding assistants working on this codebase.

## Project Overview

This is a personal portfolio website for Naveen Bandarage, a Software Engineer at Xero. The site features:

- Personal blog with MDX posts
- Professional experience showcase
- Reading list and consumption tracking
- Custom analytics implementation
- Smooth animations and transitions

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Content**: MDX for blog posts with gray-matter frontmatter
- **Analytics**: Custom implementation with Vercel Blob storage
- **Animations**: Custom React components with Framer Motion
- **Runtime**: Bun (package management and scripts)
- **Deployment**: Vercel

## Code Style & Patterns

### Component Structure

- Use functional components with TypeScript interfaces
- Export components as default exports
- Keep component files in dedicated directories with `index.tsx`
- Use descriptive prop interfaces with JSDoc when needed

```typescript
interface ComponentProps {
  title: string;
  optional?: boolean;
}

export default function Component({ title, optional }: ComponentProps) {
  return <div>{title}</div>;
}
```

### Animation Components

The site uses custom text animation components located in `/components/TextAnimation/`:

- `TypewriterText`: Progressive character reveal with cursor
- `FadeInText`: Smooth opacity transitions with delays
- `SlideUpText`: Upward motion with stagger support
- `BouncyText`: Playful bounce animations

When adding animations:

- Use consistent delay patterns (increments of 300-500ms)
- Support `delay` and `duration` props
- Include accessibility considerations
- Follow existing stagger patterns for text reveals

### Styling Guidelines

- Use Tailwind utility classes
- Follow the existing color scheme:
  - Light mode: `text-neutral-800`, `text-neutral-500`
  - Dark mode: `dark:text-white`, `dark:text-silver-dark`
- Use consistent spacing with the `list-container` and `list-content` classes
- Maintain responsive design with `sm:` breakpoints

### File Organization

```
/components/
  ComponentName/
    index.tsx
/pages/
  page.tsx
  api/
    endpoint.ts
/posts/
  post-name.mdx
/lib/
  utility.ts
```

## Key Components & Utilities

### SEO Component (`/components/SEO/`)

- Handles meta tags, OpenGraph, Twitter cards
- Includes structured data for person/website schema
- Supports canonical URLs and custom titles/descriptions
- Always include when creating new pages

### Analytics (`/pages/api/analytics-ingest.ts`)

- Custom analytics implementation using Vercel Blob
- Tracks pageviews, referrers, user agents, geo data in single JSON file
- Privacy-focused with no personal identification
- Automatically triggered on route changes
- Stores events in `analytics/events.json` with date field in each event
- Maintains last 10,000 events to prevent excessive file growth

### Reading Time (`/lib/readingTime.ts`)

- Calculates estimated reading time for blog posts
- Sanitizes HTML/markdown before word counting
- Returns formatted strings ("1 minute", "5 minutes", etc.)
- Used in blog post metadata

### MDX Blog System

- Posts stored in `/posts/` directory as `.mdx` files
- Frontmatter required: `title`, `description`, `date`, `tldr`, `meta`
- Auto-generated reading times
- Supports rich content with React components

## Development Guidelines

### Adding New Blog Posts

1. Create `.mdx` file in `/posts/` directory
2. Include proper frontmatter:
   ```yaml
   ---
   title: "Post Title"
   description: "SEO description"
   date: "YYYY-MM-DD"
   tldr: "Brief summary"
   meta: "Optional meta text"
   ---
   ```
3. Reading time is automatically calculated
4. Posts appear on blog index and homepage

### Creating New Components

1. Create directory in `/components/`
2. Include TypeScript interfaces
3. Follow existing naming conventions
4. Add to appropriate index files if needed
5. Consider responsive design and dark mode

### API Endpoints

- Keep endpoints simple and focused
- Use TypeScript for request/response types
- Follow existing error handling patterns
- Consider rate limiting for public endpoints

## Content Guidelines

### Writing Style

- Personal, conversational tone
- Technical but accessible
- Include real experiences and learnings
- Reference specific tools, technologies, and places

### Animation Timing

- Homepage intro sequence: 1500ms → 2200ms → 3500ms → 4000ms → 4500ms → 5200ms
- Use consistent delay increments
- Allow time for users to read before next element appears
- Consider reduced motion preferences

### Goals & Personal Content

- Track personal and professional goals publicly
- Include location context (Wellington → Melbourne → NYC journey)
- Reference current work at Xero and career progression
- Maintain authenticity in personal reflections

## Testing & Quality

### Before Committing

- Test all animations and transitions
- Verify responsive design on mobile
- Check dark mode compatibility
- Ensure reading times calculate correctly
- Validate MDX frontmatter format

### Performance Considerations

- Optimize images and fonts
- Use dynamic imports for heavy components
- Minimize bundle size
- Consider animation performance on lower-end devices

## Common Tasks

### Adding a new page

1. Create page in `/pages/`
2. Add SEO component with appropriate metadata
3. Use Main layout component
4. Add to navigation if needed
5. Update sitemap if necessary

### Modifying animations

1. Check existing animation components first
2. Maintain consistent timing patterns
3. Test on various devices and connection speeds
4. Consider accessibility (prefers-reduced-motion)

### Working with analytics

- Data stored in single Vercel Blob file at `analytics/events.json`
- Event structure: `{ ts, date, type, path, referrer, userAgent, geo }`
- Keep analytics privacy-focused
- Maintains rolling window of last 10,000 events
- Each event includes both timestamp and date fields for easy filtering

## Contact & Deployment

- **Owner**: Naveen Bandarage
- **Email**: bandaragenaveen@gmail.com
- **Twitter**: @naveenbandarage
- **Deployment**: Vercel (automatic on push to main)
- **Analytics**: Custom implementation with Vercel Blob

## Notes for AI Assistants

- This is a personal website, so maintain the personal, authentic voice
- Reference real experiences and specific details when creating content
- Consider the journey from Wellington → Melbourne → NYC in content
- Respect the existing animation timing and visual hierarchy
- Always test changes thoroughly before suggesting implementation
- Keep performance and accessibility in mind for all modifications
