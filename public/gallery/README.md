# Photographs

Copy your own photographs into this directory and add them to `data/gallery.ts`.
Both `/photos` (prints and paper details) and `/gallery` (fullscreen slideshow)
use the same collection. No reference-site photographs are included.

```ts
{
  src: "/gallery/your-photo.jpg",
  alt: "Describe what is visible for screen reader users",
  title: "A moment worth keeping",
  width: 3024,
  height: 4032,
  location: "New York",
  date: "2026-10-01",
  camera: "Your camera",
  exposure: "ƒ/2.8 · 1/125s · ISO 400",
  palette: ["#25221e", "#c8b5a3", "#826855"],
}
```

Only publish location details you want visible. Optional metadata is omitted
when absent. Image dimensions should match the original file.

## Photo pages and stacks

Each photo has its own `/photo/<slug>` page. Supply an optional unique `slug`;
otherwise the image filename is used. Use URL-safe slugs and distinct filenames.
Photos appear in the order listed. Group related photos by adding the same
stack to each entry:

```ts
slug: "evening-on-broadway",
stack: { slug: "new-york-walk", title: "New York walk" },
iso: "ISO 400 · 0 EV",
coordinates: "Only include coordinates you want public",
```

A stack appears as one layered print on `/photos` and opens a vertical sequence
at `/photos/stack/new-york-walk`. Each print in that sequence links to its own
photo page. The index progressively reveals 24 entries at a time, retaining the
page count in the URL. Supported browsers animate prints between pages; reduced
motion preferences disable that animation.
