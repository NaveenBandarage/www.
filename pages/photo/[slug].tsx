import type { GetStaticPaths, GetStaticProps } from "next";
import { SEO } from "../../components/SEO";
import PhotoLayout from "../../components/PhotoLayout";
import PhotoDetail from "../../components/PhotoDetail";
import PhotoLink from "../../components/PhotoLink";
import { galleryPhotos, type GalleryPhoto } from "../../data/gallery";
import { getPhoto, photoSlug } from "../../lib/photos";

export default function PhotoPage({ photo }: { photo: GalleryPhoto }) {
  return (
    <>
      <SEO
        seo={{
          title: `${photo.title || photo.alt} - Naveen Bandarage`,
          description: photo.alt,
          path: `/photo/${photoSlug(photo)}`,
        }}
      />
      <PhotoLayout>
        <PhotoLink
          href="/photos"
          className="link-fade mb-12 inline-block text-sm"
        >
          ← All photos
        </PhotoLink>
        <h1 className="sr-only">{photo.title || photo.alt}</h1>
        <PhotoDetail photo={photo} index={0} />
      </PhotoLayout>
    </>
  );
}
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: galleryPhotos.map((photo) => ({ params: { slug: photoSlug(photo) } })),
  fallback: false,
});
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const photo = getPhoto(String(params?.slug));
  return photo ? { props: { photo } } : { notFound: true };
};
