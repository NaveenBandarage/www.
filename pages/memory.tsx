import MemoryExplorer from "../components/MemoryExplorer";
import { SEO } from "../components/SEO";

export default function Memory() {
  return (
    <>
      <SEO
        seo={{
          title: "Memory - Naveen Bandarage",
          description:
            "An experiment in agent memory. Explore a living tree of memories, follow their sources, and see what gets recalled.",
          path: "/memory",
        }}
      />
      <main
        className="fixed inset-0 bg-[#fafbf9]"
        aria-label="Naveen’s memory tree"
      >
        <MemoryExplorer />
      </main>
    </>
  );
}
