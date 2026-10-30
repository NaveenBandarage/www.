import type { ReactNode } from "react";
import PhotoLink from "../PhotoLink";
import Footer from "../Footer";

export default function PhotoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="photo-space min-h-dvh bg-[#f0f0ef] text-neutral-800 dark:bg-neutral-950 dark:text-white">
      <header className="mx-auto max-w-5xl border-b border-neutral-300/70 px-6 py-5 dark:border-neutral-800 sm:px-8 lg:px-0">
        <PhotoLink
          href="/"
          className="link-fade inline-flex items-center gap-2 text-sm"
        >
          <span aria-hidden="true">◒</span> Naveen
        </PhotoLink>
      </header>
      <main className="mx-auto max-w-5xl px-6 pt-8 pb-12 sm:px-8 lg:px-0">
        {children}
      </main>
      <Footer />
    </div>
  );
}
