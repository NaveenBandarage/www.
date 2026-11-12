import { SEO } from "../components/SEO";
import PhotoCollection from "../components/PhotoCollection";
import PhotoLayout from "../components/PhotoLayout";
import { galleryPhotos } from "../data/gallery";
import ScrollReveal from "../components/ScrollReveal";

export default function PhotosPage() {
  return (
    <>
      <SEO
        seo={{
          title: "Naveen Bandarage - Photos",
          description: "Small moments and photographs by Naveen Bandarage.",
          path: "/photos",
        }}
      />
      <PhotoLayout>
        <ScrollReveal initiallyVisible duration={0.3} distance={8}>
          <header>
            <h1 className="text-xl text-neutral-800 [font-variation-settings:'opsz'_32,_'wght'_500] dark:text-white sm:pb-6">
              Photos
            </h1>
          </header>
        </ScrollReveal>
        <ScrollReveal initiallyVisible delay={0.05} duration={0.3} distance={8}>
          <div className="mt-12 sm:mt-16">
            <PhotoCollection photos={galleryPhotos} />
          </div>
        </ScrollReveal>
      </PhotoLayout>
    </>
  );
}
