import Link from "next/link";
import { LinkExternal } from "../Links";
import { GithubIcon } from "../Icons";

import { useEffect, useState } from "react";
import moment from "moment-timezone";

export default function Footer() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Get the current local time in Melbourne, Australia
    const melbourneTime = moment().tz("Australia/Melbourne").format("HH:mm:ss");

    // Set the current local time
    setCurrentTime(melbourneTime);
  }, []); // Run this effect only once on component mount

  return (
    <footer className="m:px-0 flex justify-center px-6 pt-6 sm:pt-32">
      <div className="max-w-main flex-1">
        <div className="flex h-full w-full items-end justify-between border-t border-solid border-neutral-500/10 pt-8 pb-8 dark:border-neutral-900">
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
                <p>Melbourne, AU</p>
                <p>{currentTime}</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
