import Link from "next/link";

import { useEffect, useState } from "react";
import moment from "moment-timezone";
import LastVisitor from "../Home/LastVisitor";

export default function Footer() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Function to update the time
    const updateTime = () => {
      const newYorkTime = moment().tz("America/New_York").format("HH:mm:ss");
      setCurrentTime(newYorkTime);
    };

    // Set initial time
    updateTime();

    // Set up interval to update time every second
    const interval = setInterval(updateTime, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []); // Run this effect only once on component mount

  return (
    <footer className="m:px-0 flex justify-center px-6 pt-6 sm:pt-32">
      <div className="max-w-main flex-1">
        <div className="flex h-full w-full items-start justify-between border-t border-solid border-neutral-500/10 pt-8 pb-8 dark:border-neutral-900">
          <div className="flex-2">
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
            </ul>
            <ul className="flex flex-col">
              <li className="link-fade">
                <p>New York, NY</p>
                <p>{currentTime}</p>
              </li>
            </ul>
          </div>
          <div className="flex items-start pt-6">
            <LastVisitor variant="footer" />
          </div>
        </div>
      </div>
    </footer>
  );
}
