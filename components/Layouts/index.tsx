import Footer from "../Footer";
import { ReactNode } from "react";

interface MainProps {
  children: ReactNode;
  centered?: boolean;
}

export function Main({ children, centered = false }: MainProps) {
  return (
    <div
      className={
        centered
          ? "sm:flex sm:min-h-svh sm:flex-col sm:justify-center"
          : undefined
      }
    >
      <main className="m:px-0 flex justify-center px-6 pt-24 lg:pt-12">
        <article className="w-full max-w-main grow">{children}</article>
      </main>
      <Footer />
    </div>
  );
}
