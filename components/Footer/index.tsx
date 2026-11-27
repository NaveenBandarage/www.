import { useEffect, useRef, useState } from "react";
import { getCurrentNewYorkTime } from "../../lib/timeUtils";
import LastVisitor from "../Home/LastVisitor";
import SoundToggle from "../SoundToggle";
import NavigationLinks from "../NavigationLinks";

const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/photos", label: "Photos" },
];

const moreNavigationItems = [
  { href: "/books", label: "Books" },
  { href: "/movies", label: "Seen" },
  { href: "/outfits", label: "Outfits" },
  { href: "/uses", label: "Uses" },
  { href: "/fun", label: "Fun" },
  { href: "/links", label: "Links" },
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
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-3">
                <NavigationLinks items={navigationItems} className="gap-y-3" />
                <details className="footer-more group shrink-0 text-sm leading-5">
                  <summary className="flex min-h-5 cursor-pointer list-none items-center gap-1.5 rounded-full leading-5 text-neutral-500 outline-offset-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-400 dark:text-silver-dark [&::-webkit-details-marker]:hidden">
                    More{" "}
                    <span aria-hidden="true" className="text-xs">
                      +{moreNavigationItems.length}
                    </span>
                    <span
                      aria-hidden="true"
                      className="inline-block transition-transform group-open:rotate-180 motion-reduce:transition-none"
                    >
                      ⌄
                    </span>
                  </summary>
                  <NavigationLinks
                    items={moreNavigationItems}
                    className="mt-4 gap-y-3"
                  />
                </details>
              </div>
            </nav>
            <div
              className="flex flex-col pt-6"
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
