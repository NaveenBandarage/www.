/**
 * Add gallery images here after copying them into `public/gallery`.
 *
 * `src` starts at `public`, so `public/gallery/nyc.jpg` becomes
 * `/gallery/nyc.jpg`. Keep the width and height equal to the original image
 * dimensions so the empty state preserves the same shape while it loads.
 */
export interface GalleryPhoto {
  src: string;
  alt: string;
  width: number;
  height: number;
  title?: string;
  slug?: string;
  stack?: { slug: string; title: string };
  coordinates?: string;
  iso?: string;
  location?: string;
  date?: string;
  camera?: string;
  exposure?: string;
  palette?: string[];
}

export const galleryPhotos: GalleryPhoto[] = [
  // {
  //   src: "/gallery/nyc.jpg",
  //   alt: "A descriptive caption for the photograph",
  //   width: 3024,
  //   height: 4032,
  // },
];
