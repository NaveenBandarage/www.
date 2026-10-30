import { galleryPhotos, type GalleryPhoto } from "../data/gallery";

export function photoSlug(photo: GalleryPhoto) {
  return photo.slug || photo.src.replace(/^.*\//, "").replace(/\.[^.]+$/, "");
}

export function photoTransitionName(photo: GalleryPhoto) {
  return `print-${photoSlug(photo).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

export function photoGroups(photos: GalleryPhoto[]) {
  const groups: {
    key: string;
    title: string;
    href: string;
    photos: GalleryPhoto[];
  }[] = [];
  const stacks = new Map<string, (typeof groups)[number]>();
  for (const photo of photos) {
    if (photo.stack) {
      const existing = stacks.get(photo.stack.slug);
      if (existing) {
        existing.photos.push(photo);
        continue;
      }
      const group = {
        key: `stack-${photo.stack.slug}`,
        title: photo.stack.title,
        href: `/photos/stack/${photo.stack.slug}`,
        photos: [photo],
      };
      stacks.set(photo.stack.slug, group);
      groups.push(group);
    } else {
      groups.push({
        key: photoSlug(photo),
        title: photo.title || photo.alt,
        href: `/photo/${photoSlug(photo)}`,
        photos: [photo],
      });
    }
  }
  return groups;
}

export function getPhoto(slug: string) {
  return galleryPhotos.find((photo) => photoSlug(photo) === slug);
}
