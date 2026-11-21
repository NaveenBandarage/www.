import Link from "next/link";
import ArtRecreation from "../components/ArtRecreation";
import { Main } from "../components/Layouts";
import { SEO } from "../components/SEO";

export default function ArtRecreationPage() {
  return (
    <>
      <SEO
        seo={{
          title: "Art recreation - Naveen Bandarage",
          description:
            "An old engraving recreated in SVG, with a candle flame that flickers and comes alive.",
          path: "/art-recreation",
        }}
      />
      <Main>
        <Link
          href="/fun"
          className="link-fade text-sm text-neutral-500 dark:text-silver-dark"
        >
          ← Fun
        </Link>
        <h1 className="mt-6 text-xl text-neutral-800 dark:text-white">
          Art recreation
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-silver-dark">
          An old engraving, a living flame.
        </p>
        <ArtRecreation />
      </Main>
    </>
  );
}
