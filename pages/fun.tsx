import { Main } from "../components/Layouts";
import { SEO } from "../components/SEO";

export default function Fun() {
  return (
    <>
      <SEO
        seo={{
          title: "Fun",
          path: "/fun",
        }}
      />
      <Main>
        <header>
          <h1 className="text-xl text-neutral-800 [font-variation-settings:'opsz'_32,_'wght'_500] dark:text-white sm:pb-6 sm:text-xl">
            Fun
          </h1>
        </header>
      </Main>
    </>
  );
}
