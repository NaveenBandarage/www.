import Link from "next/link";
import { Main } from "../components/Layouts";
import { SEO } from "../components/SEO";
import MovieCollection from "../components/Movies";
import styles from "../components/Movies/movies.module.css";

export default function Movies() {
  return (
    <div className={styles.page}>
      <SEO
        seo={{
          title: "Naveen Bandarage - Things I’ve seen",
          description: "A collection of things I’ve seen, year by year.",
          path: "/movies",
        }}
      />
      <Main>
        <header className={styles.header}>
          <Link href="/" className={styles.home}>
            <span aria-hidden="true">↖</span> Home
          </Link>
          <Link href="/" className={styles.name}>
            Naveen Bandarage
          </Link>
          <span className={styles.pageLabel}>Seen</span>
        </header>
        <div className={styles.introduction}>
          <h1>Things I&apos;ve seen</h1>
          <p>Films I’ve watched, one year at a time.</p>
        </div>
        <MovieCollection />
      </Main>
    </div>
  );
}
