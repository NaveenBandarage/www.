import Image from "next/image";
import Link from "next/link";
import { Main } from "../components/Layouts";
import { SEO } from "../components/SEO";
import { outfits } from "../data/outfits";
import { usesItems } from "../lib/uses";

const wardrobe = usesItems.filter((item) => item.category === "Wardrobe");

export default function Outfits() {
  return (
    <>
      <SEO
        seo={{
          title: "Naveen Bandarage - Outfits",
          description: "Outfits and pieces from my wardrobe.",
          path: "/outfits",
        }}
      />
      <Main>
        <header className="max-w-lg">
          <h1 className="text-xl text-neutral-800 [font-variation-settings:'opsz'_32,_'wght'_500] dark:text-white">
            Outfits
          </h1>
          <p className="mt-4 text-neutral-500 dark:text-silver-dark">
            A little corner for what I wear.
          </p>
        </header>

        <section className="mt-16" aria-labelledby="looks-heading">
          <div className="flex items-baseline justify-between border-b border-neutral-500/15 pb-3 dark:border-white/10">
            <h2 id="looks-heading" className="text-neutral-800 dark:text-white">
              Looks
            </h2>
            <span className="text-sm tabular-nums text-neutral-500 dark:text-silver-dark">
              {String(outfits.length).padStart(2, "0")}
            </span>
          </div>
          {outfits.length ? (
            <ul className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2">
              {outfits.map((outfit) => (
                <li key={outfit.id}>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-neutral-100 dark:bg-neutral-900">
                    <Image
                      src={outfit.image}
                      alt={outfit.alt}
                      fill
                      sizes="(min-width: 640px) 320px, 90vw"
                      className="object-cover"
                    />
                  </div>
                  <h3 className="mt-4 text-neutral-800 dark:text-white">
                    {outfit.title}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-silver-dark">
                    {outfit.note}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-10 text-sm text-neutral-500 dark:text-silver-dark">
              Outfit photos coming soon. For now, a few pieces from my wardrobe
              are below.
            </p>
          )}
        </section>

        <section className="mt-12" aria-labelledby="pieces-heading">
          <div className="flex items-baseline justify-between border-b border-neutral-500/15 pb-3 dark:border-white/10">
            <h2
              id="pieces-heading"
              className="text-neutral-800 dark:text-white"
            >
              A few pieces
            </h2>
            <Link href="/uses" className="link-fade text-sm">
              More things I use ↗
            </Link>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3">
            {wardrobe.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-400"
                >
                  <div className="relative aspect-square bg-neutral-100/80 dark:bg-neutral-900">
                    <Image
                      src={`/uses/things/${item.image}`}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 200px, 45vw"
                      className="object-contain p-4"
                    />
                  </div>
                  <h3 className="mt-3 text-sm text-neutral-800 group-hover:underline dark:text-white">
                    {item.name}{" "}
                    <span className="sr-only">(opens in a new tab)</span>
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-silver-dark">
                    {item.brand}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </Main>
    </>
  );
}
