import GtaLoading from "../components/GtaLoading";
import { SEO } from "../components/SEO";

export default function Gta6() {
  return (
    <>
      <SEO
        seo={{
          title: "GTA 6",
          description:
            "An experiment in motion. A recreation of the GTA 6 loading intro.",
          path: "/gta-6",
        }}
      />
      <GtaLoading />
    </>
  );
}
