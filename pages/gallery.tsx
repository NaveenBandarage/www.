import Gallery from "../components/Gallery";
import { SEO } from "../components/SEO";
import { galleryPhotos } from "../data/gallery";

export default function GalleryPage() {
  return (
    <>
      <SEO
        seo={{
          title: "Naveen Bandarage - Gallery",
          description: "A collection of photographs by Naveen Bandarage.",
          path: "/gallery",
        }}
      />
      <Gallery photos={galleryPhotos} />
    </>
  );
}
