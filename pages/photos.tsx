import type { GetServerSideProps } from "next";
import { SEO } from "../components/SEO";
import PhotoCollection from "../components/PhotoCollection";
import PhotoLayout from "../components/PhotoLayout";
import { galleryPhotos } from "../data/gallery";
import ScrollReveal from "../components/ScrollReveal";

interface PhotosPageProps {
  initialPage: number;
}

export default function PhotosPage({ initialPage }: PhotosPageProps) {
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
          <dl className="list-container">
            <dt className="list-title">
              <h2 className="text-neutral-500 dark:text-silver-dark">
                Things I notice
              </h2>
            </dt>
            <dd className="list-content">
              Small moments, places and things that catch my eye.
            </dd>
          </dl>
          <div className="mt-12 sm:mt-16">
            <PhotoCollection photos={galleryPhotos} initialPage={initialPage} />
          </div>
        </ScrollReveal>
      </PhotoLayout>
    </>
  );
}
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const page = Number(query.page || 1);
  return {
    props: { initialPage: Number.isInteger(page) && page > 0 ? page : 1 },
  };
};
