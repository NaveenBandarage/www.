# GTA 6 — motion experiment

Standalone at `/gta-6`, linked from `/fun`. The experiment bypasses the portfolio
layout, page transition, Now Playing widget, smooth scrolling, and UI sounds.

Reference: [GuideZone's GTA 6 loading intro](https://youtu.be/j9fLxdVv9yU?t=7),
00:07–00:21, supplied by the owner.

## Camera and choreography

This occasional experiment uses motion for delight. The camera is the lead;
illustrations support it through depth and parallax. Controls remain still.

`components/GtaLoading/motion.ts` describes one continuous dolly and its aim,
using shape-preserving cubic interpolation through measured reference beats.
Velocity is continuous across anchors; the camera does not stop at every scene.
The five compositions occupy fixed depth planes. Projection carries foreground
pieces past the camera, then the same scenery reappears on the backward flight.
The retreating lens keeps the artwork full-screen until an aspect-correct star
aperture closes it out; the composition does not recede into a small island.

| Reference time | Beat                                          | Relationship                                                 |
| -------------- | --------------------------------------------- | ------------------------------------------------------------ |
| 0–1.9s         | Six colored stars whiten and collapse         | Leads into the emblem                                        |
| 1.9–3.6s       | Eagle emblem, then a push toward the oranges  | Camera carries the assembled illustration                    |
| 3.6–5.5s       | Botanical tunnel                              | Foreground fronds pass faster than printed animals and signs |
| 5.5–6.8s       | Classical arches                              | Columns frame the upcoming flamingos                         |
| 6.8–8.3s       | Flamingo medallion                            | Backing clears as the camera approaches its center           |
| 8.3–10.25s     | Freedom tableau                               | Camera slows; figures stay coherent, flames move subtly      |
| 10.25–11.2s    | Fast reverse through the earlier compositions | One continuous backward flight and collapsing neon star      |
| 11.2–14s       | Star and glowing Rockstar-style mark          | Glow settles to the final still                              |

`sequence.ts` projects every object from that shared camera and its own depth.
Foliage has a small breeze; coins, wings, and flames have restrained local motion.
Figures and signage stay assembled. A single playhead drives numeric object poses
on each animation frame, outside React's render cycle. The small interface effects
use the Web Animations API. Playback and frame study draw the same poses; all
artwork is prepared before the playhead starts.

The reconstruction approximates the reference's composition and motion. The
illustrations are vector interpretations, not the original 3D artwork.

## Artwork and rendering

Illustration silhouettes were individually masked from the reference
and traced to colored SVG paths. Ornaments, complete fronds and snakes, and the medallion backing are authored
in `Artwork.tsx`. Each SVG is decoded and rasterized once into a shared transparent
sprite cache, capped at 1024 pixels on its longest side. One viewport-sized Canvas
2D surface draws the individual objects with their own transforms and depth order.
The drawing buffer is capped at 5 million pixels and 2× display density. This
avoids the nested animated DOM layers that caused missing and sliced artwork
during live playback. The closing star clips the drawing inside Canvas, without
an animated CSS clipping ancestor. SVG sources contain no embedded bitmap images.
Traced SVGs have explicit view boxes and transparent edge padding. Opening figures
come from an uncropped frame, preserving the hat, crown and central woman. The
opening composition uses the full 16:9 frame instead of its earlier cropped plate.
The runtime uses separate transparent objects, with no full-scene image plates
or video playback.

Frame study pauses playback and exposes a one-frame slider with previous/next
buttons. `/gta-6?frame=435` opens a deterministic paused frame. Pause, resume,
replay, seeking, and audio share one timeline. Reduced motion starts on a still
mark and uses stationary compositions with gentle fades when explicitly played.
Navigation cancels all animations and pauses audio.

`intro.m4a` is the requested cut's audio, loaded only when sound is enabled.
Illustration and audio rights remain with their respective owners.

## Rebuilding and verification

The cropped and full reference stills in `scripts/gta/reference/` are build inputs;
they are not served or used by the runtime. Run `scripts/gta/vectorize.py` in a
Python environment with Pillow and vtracer to rebuild traced paths. Run
`bun scripts/gta/draw-ornaments.tsx` to export the code-authored ornaments.

Run `bun test tests/gta-motion.test.mjs tests/gta-artwork.test.mjs` for interpolation, velocity continuity,
forward/reverse camera travel, bounded projection, and finite object poses in both
motion modes, complete opening silhouettes, scalable SVG bounds and unclipped
foliage edges. Compare the 3.6s foliage handoff, 7.25s medallion, 9s hold, and
10.5–11.2s reverse in frame study. Check replay during a transition, seeking while
paused, and uninterrupted live playback to the completed logo. Paused frames alone
do not expose browser compositing failures. Real-device performance needs
checking on representative phones; mathematical continuity is not an FPS claim.
