import Link from "next/link";
import { Main } from "../components/Layouts";
import { SEO } from "../components/SEO";
import UsesGallery from "../components/UsesGallery";
import UsesScene from "../components/UsesScene";
import styles from "../components/UsesGallery/gallery.module.css";

export default function Uses() {
  return (
    <div className={styles.page} data-uses-page>
      <SEO
        seo={{
          title: "Naveen Bandarage - Uses",
          description: "The hardware, software, and everyday things I use.",
          path: "/uses",
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
          <span className={styles.pageLabel}>Uses</span>
        </header>
        <div className={styles.introduction}>
          <h1>Things I use</h1>
          <p>The things I reach for every day, on and off my desk.</p>
        </div>
        <UsesScene />
        <UsesGallery />
      </Main>
    </div>
  );
}
