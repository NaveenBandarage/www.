import Link from "next/link";

import { useEffect, useRef, useState } from "react";
import { getCurrentNewYorkTime } from "../../lib/timeUtils";
import LastVisitor from "../Home/LastVisitor";

function NewYorkClock() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(getCurrentNewYorkTime());
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="link-fade">
      <p>New York, NY</p>
      <time
        dateTime={new Date().toISOString()}
        aria-label={`Current time in New York: ${currentTime}`}
        className="tabindex-0"
      >
        {currentTime}
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
    <footer className="m:px-0 flex justify-center px-6 pt-6 sm:pt-32">
      <div className="max-w-main flex-1">
        <div className="flex h-full w-full items-start justify-between border-t border-solid border-neutral-500/10 pt-8 pb-8 dark:border-neutral-900">
          <div className="flex-2">
            <nav aria-label="Footer navigation">
              <ul className="flex gap-4 pb-6">
                <li>
                  <Link href="/" className="link-fade">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="link-fade">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/links" className="link-fade">
                    Links
                  </Link>
                </li>
                <li>
                  <Link href="/uses" className="link-fade">
                    Uses
                  </Link>
                </li>
                <li>
                  <Link href="/fun" className="link-fade">
                    Fun
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="link-fade">
                    Blog
                  </Link>
                </li>
              </ul>
            </nav>
            <div
              className="flex flex-col"
              role="region"
              aria-label="Current time"
            >
              <NewYorkClock />
            </div>
          </div>
          <div className="flex items-start pt-6" ref={lastVisitorRef}>
            <LastVisitor variant="footer" enabled={lastVisitorEnabled} />
          </div>
        </div>
      </div>
    </footer>
  );
}
