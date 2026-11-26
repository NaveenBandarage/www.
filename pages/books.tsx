import Bookshelf from "../components/Bookshelf";
import { Main } from "../components/Layouts";
import { SEO } from "../components/SEO";
import { booksData } from "../data/books";
import { AMAZON_DISCLOSURE } from "../lib/affiliate";

export default function Books() {
  return (
    <>
      <SEO
        seo={{
          title: "Naveen Bandarage - Books",
          path: "/books",
        }}
      />
      <Main>
        <Bookshelf books={booksData} />
        <p className="mt-12 text-right text-xs leading-relaxed text-neutral-500 dark:text-silver-dark">
          {AMAZON_DISCLOSURE}
        </p>
      </Main>
    </>
  );
}
