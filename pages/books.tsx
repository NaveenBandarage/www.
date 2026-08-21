import Bookshelf from "../components/Bookshelf";
import { Main } from "../components/Layouts";
import { SEO } from "../components/SEO";
import { booksData } from "../data/books";

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
      </Main>
    </>
  );
}
