import Link from "next/link";

import { useEffect, useState, useCallback } from "react";
import { getCurrentNewYorkTime } from "../../lib/timeUtils";
import LastVisitor from "../Home/LastVisitor";

export default function Footer() {
  const [currentTime, setCurrentTime] = useState("");

  // Memoize the time update function
  const updateTime = useCallback(() => {
    const formattedTime = getCurrentNewYorkTime();
    setCurrentTime(formattedTime);
  }, []);

  useEffect(() => {
    // Set initial time
    updateTime();

    // Set up interval to update time every second
    const interval = setInterval(updateTime, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [updateTime]);

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
                  <Link href="/blog" className="link-fade">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/fun" className="link-fade">
                    Fun
                  </Link>
                </li>
              </ul>
            </nav>
            <div
              className="flex flex-col"
              role="region"
              aria-label="Current time"
            >
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
            </div>
          </div>
          <div className="flex items-start pt-6">
            <LastVisitor variant="footer" />
          </div>
        </div>
      </div>
    </footer>
  );
}
