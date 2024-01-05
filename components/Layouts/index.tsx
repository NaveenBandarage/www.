import Footer from "../Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

export function Main({ children }) {
  return (
    <>
      <main className="m:px-0 flex justify-center px-6 pt-8 sm:pt-32">
        <article className="w-full max-w-main grow">{children}</article>
      </main>
      <Footer />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
