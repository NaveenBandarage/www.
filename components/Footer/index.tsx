import { useEffect, useRef, useState } from "react";
import { getCurrentNewYorkTime } from "../../lib/timeUtils";
import LastVisitor from "../Home/LastVisitor";
import SoundToggle from "../SoundToggle";
import NavigationLinks from "../NavigationLinks";

const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/links", label: "Links" },
  { href: "/uses", label: "Uses" },
  { href: "/fun", label: "Fun" },
  { href: "/photos", label: "Photos" },
  { href: "/blog", label: "Blog" },
  { href: "/books", label: "Books" },
];

function NewYorkClock({ enabled }: { enabled: boolean }) {
  const [currentTime, setCurrentTime] = useState({ label: "", iso: "" });

  useEffect(() => {
    if (!enabled) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    const updateTime = () => {
      setCurrentTime({
        label: getCurrentNewYorkTime(),
        iso: new Date().toISOString(),
      });
    };
    const syncVisibility = () => {
      clearInterval(interval);
      if (document.hidden) return;
      updateTime();
      interval = setInterval(updateTime, 1000);
    };
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, [enabled]);

  return (
    <div className="link-fade">
      <p>New York, NY</p>
      <time
        dateTime={currentTime.iso || undefined}
        aria-label={`Current time in New York: ${currentTime.label || "loading"}`}
        className="inline-block min-h-[1.5em] min-w-[8ch] tabular-nums"
      >
        {currentTime.label || "\u00a0"}
      </time>
    </div>
  );
}

export default function Footer() {
  const [lastVisitorEnabled, setLastVisitorEnabled] = useState(false);
  const lastVisitorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (lastVisitorEnabled) return;

    const element = lastVisitorRef.current;
    if (!element) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setLastVisitorEnabled(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setLastVisitorEnabled(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [lastVisitorEnabled]);

  return (
    <footer className="m:px-0 flex justify-center px-6 pb-28 pt-6 sm:pt-32">
      <div className="max-w-main flex-1">
        <div className="flex h-full w-full flex-col items-start justify-between gap-6 border-t border-solid border-neutral-500/10 pt-8 pb-8 dark:border-neutral-900 sm:flex-row">
          <div className="min-w-0">
            <nav aria-label="Footer navigation">
              <NavigationLinks
                items={navigationItems}
                className="gap-y-2 pb-6"
              />
            </nav>
            <div
              className="flex flex-col"
              role="region"
              aria-label="Current time"
            >
              <NewYorkClock enabled={lastVisitorEnabled} />
            </div>
            <SoundToggle />
          </div>
          <div className="flex items-start sm:pt-6" ref={lastVisitorRef}>
            <LastVisitor variant="footer" enabled={lastVisitorEnabled} />
          </div>
        </div>
      </div>
    </footer>
  );
}
