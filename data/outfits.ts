/** Add outfit photographs here when they are ready to share. Image paths start at /public. */
export interface Outfit {
  id: string;
  title: string;
  image: string;
  alt: string;
  note: string;
}

export const outfits: Outfit[] = [];
