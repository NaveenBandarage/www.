export default function MemoryExplorer() {
  return (
    <div className="h-full w-full" data-lenis-prevent>
      <iframe
        src="/memory-explorer/index.html"
        title="Interactive agent memory tree"
        className="block h-full w-full border-0 bg-[#fafbf9]"
      />
    </div>
  );
}
