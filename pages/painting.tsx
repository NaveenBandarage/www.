import Link from "next/link";
import Painting from "../components/Painting";
import { Main } from "../components/Layouts";
import { SEO } from "../components/SEO";

export default function PaintingPage() {
  return (
    <>
      <SEO
        seo={{
          title: "Painting - Naveen Bandarage",
          description: "Turn a photo into a palette knife painting.",
          path: "/painting",
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
          Painting
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-silver-dark">
          A little experiment in paint, texture, and happy accidents.
        </p>
        <Painting />
      </Main>
    </>
  );
}
