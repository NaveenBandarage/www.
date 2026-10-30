import type { GetServerSideProps } from "next";
import { SEO } from "../components/SEO";
import PhotoCollection from "../components/PhotoCollection";
import PhotoLayout from "../components/PhotoLayout";
import { galleryPhotos } from "../data/gallery";

export default function PhotosPage({ initialPage }: { initialPage: number }) {
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
        <h1 className="mt-6 text-xl">Things I notice</h1>
        <PhotoCollection photos={galleryPhotos} initialPage={initialPage} />
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
