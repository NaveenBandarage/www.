import Link from "next/link";
import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();

  const isActive = (path) => {
    return router.pathname === path;
  };

  return (
    <nav className="m:px-0 flex justify-center px-6 pt-6">
      <div className="max-w-main flex w-full items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className={`text-base ${isActive("/") ? "text-neutral-800 dark:text-white [font-variation-settings:'wght'_500]" : "text-neutral-500 dark:text-silver-dark"}`}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`text-base ${isActive("/about") ? "text-neutral-800 dark:text-white [font-variation-settings:'wght'_500]" : "text-neutral-500 dark:text-silver-dark"}`}
          >
            About
          </Link>
          <Link
            href="/links"
            className={`text-base ${isActive("/links") ? "text-neutral-800 dark:text-white [font-variation-settings:'wght'_500]" : "text-neutral-500 dark:text-silver-dark"}`}
          >
            Links
          </Link>
          <Link
            href="/blog"
            className={`text-base ${isActive("/blog") ? "text-neutral-800 dark:text-white [font-variation-settings:'wght'_500]" : "text-neutral-500 dark:text-silver-dark"}`}
          >
            Blog
          </Link>
          <Link
            href="/swag"
            className={`text-base ${isActive("/swag") ? "text-neutral-800 dark:text-white [font-variation-settings:'wght'_500]" : "text-neutral-500 dark:text-silver-dark"}`}
          >
            Swag
          </Link>
          <Link
            href="/uses"
            className={`text-base ${isActive("/uses") ? "text-neutral-800 dark:text-white [font-variation-settings:'wght'_500]" : "text-neutral-500 dark:text-silver-dark"}`}
          >
            Uses
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              document.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", metaKey: true }),
              )
            }
            className="link-fade flex items-center gap-1 rounded-lg px-2 py-1 text-sm"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 256 256"
              fill="currentColor"
            >
              <path d="M229.66 218.34l-50.07-50.06a88.11 88.11 0 10-11.31 11.31l50.06 50.07a8 8 0 0011.32-11.32zM40 112a72 72 0 1172 72 72.08 72.08 0 01-72-72z" />
            </svg>
            <span className="hidden sm:inline">Search</span>
            <kbd className="ml-1 hidden rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-xs font-medium dark:border-neutral-800 dark:bg-neutral-900 sm:inline">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>
    </nav>
  );
}
