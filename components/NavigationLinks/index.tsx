import { AnimatePresence, m } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useId, useState } from "react";
import useReducedMotion from "../../lib/useReducedMotion";
import { playNavigationHoverSound } from "../../lib/navigationSound";

interface NavigationItem {
  href: string;
  label: string;
}

interface NavigationLinksProps {
  items: NavigationItem[];
  className?: string;
  linkClassName?: string;
}

export default function NavigationLinks({
  items,
  className = "",
  linkClassName = "text-sm",
}: NavigationLinksProps) {
  const { pathname } = useRouter();
  const reducedMotion = useReducedMotion();
  const id = useId();
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const current = items.find(({ href }) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`),
  )?.href;
  const highlighted = hovered ?? focused ?? current;

  return (
    <ul
      className={`flex flex-wrap gap-4 ${className}`}
      onPointerLeave={() => setHovered(null)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocused(null);
        }
      }}
    >
      {items.map(({ href, label }) => (
        <li key={href}>
          <Link
            href={href}
            aria-current={current === href ? "page" : undefined}
            className={`relative isolate inline-block rounded-full outline-offset-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-400 motion-safe:transition-colors motion-safe:duration-150 before:absolute before:-inset-x-2 before:-inset-y-2 ${
              highlighted === href
                ? "text-neutral-800 dark:text-white"
                : "text-neutral-500 dark:text-silver-dark"
            } ${linkClassName}`}
            onPointerEnter={(event) => {
              if (event.pointerType === "touch") return;
              if (highlighted !== href) playNavigationHoverSound();
              setHovered(href);
            }}
            onPointerCancel={() => setHovered(null)}
            onFocus={() => {
              if (!hovered && highlighted !== href) playNavigationHoverSound();
              setFocused(href);
            }}
          >
            <AnimatePresence initial={false}>
              {highlighted === href ? (
                <m.span
                  key="bubble"
                  aria-hidden="true"
                  layoutId={`navigation-bubble-${id}`}
                  className="pointer-events-none absolute -inset-x-2 -inset-y-1 -z-10 rounded-full bg-neutral-200/70 dark:bg-white/[0.09]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : {
                          layout: {
                            type: "spring",
                            stiffness: 450,
                            damping: 38,
                            mass: 0.65,
                          },
                          opacity: { duration: 0.12 },
                        }
                  }
                />
              ) : null}
            </AnimatePresence>
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
