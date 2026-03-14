import Footer from "../Footer";
import { ReactNode } from "react";

interface MainProps {
  children: ReactNode;
}

export function Main({ children }: MainProps) {
  return (
    <>
      <main className="m:px-0 flex justify-center px-6 pt-6 sm:pt-12">
        <article className="w-full max-w-main grow">{children}</article>
      </main>
      <Footer />
    </>
  );
}
