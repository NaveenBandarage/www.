import Link from "next/link";
import { LinkExternal } from "../Links";
import { GithubIcon } from "../Icons";

import { useEffect, useState } from "react";
import moment from "moment-timezone";

export default function Footer() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Get the current local time in Wellington, New Zealand
    const wellingtonTime = moment().tz("Pacific/Auckland").format("HH:mm:ss");

    // Set the current local time
    setCurrentTime(wellingtonTime);
  }, []); // Run this effect only once on component mount

  return (
    <footer className="m:px-0 flex w-full justify-center pt-10 sm:pt-20">
      <div className="max-w-main flex-1">
        <div className="flex h-full w-full items-end justify-between border-t border-solid border-neutral-500/10 pt-8 dark:border-neutral-900">
          <div className="flex-1">
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
            </ul>
          </div>
          <div className="flex-2 flex items-start">
            {/* {" "} */}
            {/* Added align-items */}
            <ul className="flex flex-col gap-2">
              <li className="link-fade">
                <p>Wellington, NZ</p>
              </li>
              <li className="link-fade">
                <p>{currentTime}</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
