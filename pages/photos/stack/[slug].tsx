import type { GetStaticPaths, GetStaticProps } from "next";
import { SEO } from "../../../components/SEO";
import PhotoLayout from "../../../components/PhotoLayout";
import PhotoDetail from "../../../components/PhotoDetail";
import PhotoLink from "../../../components/PhotoLink";
import { galleryPhotos, type GalleryPhoto } from "../../../data/gallery";

export default function StackPage({
  photos,
  title,
  slug,
}: {
  photos: GalleryPhoto[];
  title: string;
  slug: string;
}) {
  return (
    <>
      <SEO
        seo={{
          title: `${title} - Photos - Naveen Bandarage`,
          description: `Photographs from ${title}.`,
          path: `/photos/stack/${slug}`,
        }}
      />
      <PhotoLayout>
        <PhotoLink
          href="/photos"
          className="link-fade mb-12 inline-block text-sm"
        >
          ← All photos
        </PhotoLink>
        <h1 className="sr-only">{title}</h1>
        <div className="space-y-20 sm:space-y-28">
          {photos.map((photo, index) => (
            <PhotoDetail key={photo.src} photo={photo} index={index} linked />
          ))}
        </div>
      </PhotoLayout>
    </>
  );
}
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [
    ...new Set(
      galleryPhotos.flatMap((photo) => (photo.stack ? [photo.stack.slug] : [])),
    ),
  ].map((slug) => ({ params: { slug } })),
  fallback: false,
});
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = String(params?.slug);
  const photos = galleryPhotos.filter((photo) => photo.stack?.slug === slug);
  return photos.length
    ? { props: { photos, title: photos[0].stack!.title, slug } }
    : { notFound: true };
};
