import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import formatDate from "../../lib/formatDate";
import { ClockIcon } from "../Icons";

export interface YearTabPost {
  slug: string;
  title: string;
  date: string;
  readingTime?: string;
}

interface YearTabsProps {
  posts: YearTabPost[];
}

interface YearGroup {
  year: string;
  posts: YearTabPost[];
}

type Direction = "left" | "right" | null;

const getPostYear = (date: string) => {
  const yearMatch = date.match(/^(\d{4})/);
  return yearMatch?.[1] || "Unknown";
};

export default function YearTabs({ posts }: YearTabsProps) {
  const shouldReduceMotion = useReducedMotion();

  const yearGroups = useMemo<YearGroup[]>(() => {
    const grouped = new Map<string, YearTabPost[]>();

    posts.forEach((post) => {
      const year = getPostYear(post.date);
      const existing = grouped.get(year);

      if (existing) {
        existing.push(post);
        return;
      }

      grouped.set(year, [post]);
    });

    return Array.from(grouped.entries()).map(([year, groupedPosts]) => ({
      year,
      posts: groupedPosts,
    }));
  }, [posts]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<Direction>(null);

  useEffect(() => {
    if (activeIndex <= yearGroups.length - 1) return;
    setActiveIndex(0);
    setDirection(null);
  }, [activeIndex, yearGroups.length]);

  if (!yearGroups.length) {
    return <p className="time pt-4">No posts yet.</p>;
  }

  const handleChangeActive = (nextIndex: number) => {
    if (nextIndex === activeIndex) return;
    setDirection(nextIndex > activeIndex ? "right" : "left");
    setActiveIndex(nextIndex);
  };

  const activeYear = yearGroups[activeIndex];
  const shouldRoundTopLeft = yearGroups.length === 1 || activeIndex !== 0;
  const shouldRoundTopRight =
    yearGroups.length === 1 || activeIndex !== yearGroups.length - 1;

  const containerVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: (currentDirection: Direction) => ({
      opacity: 0,
      filter: shouldReduceMotion ? "blur(0px)" : "blur(8px)",
      y: shouldReduceMotion ? 0 : currentDirection === "right" ? -10 : 10,
    }),
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.25,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="overflow-x-hidden pt-4">
      <ul
        role="tablist"
        className="flex w-full items-end gap-2 overflow-x-hidden pb-1"
      >
        {yearGroups.map((group, index) => {
          const isActive = index === activeIndex;
          const hasLeftTab = index > 0;
          const hasRightTab = index < yearGroups.length - 1;
          const tabId = `year-tab-${group.year}`;

          return (
            <li key={group.year} className="relative isolate min-w-[84px] flex-1">
              {isActive && (
                <motion.div
                  layoutId="active-year-tab-indicator"
                  className="absolute inset-0 -z-10 rounded-t-3xl bg-neutral-100 dark:bg-neutral-900"
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 32,
                  }}
                >
                  {hasLeftTab && (
                    <span className="pointer-events-none absolute bottom-0 -left-4 h-4 w-4 bg-neutral-100 before:absolute before:inset-0 before:rounded-br-full before:bg-gray-50 dark:bg-neutral-900 dark:before:bg-black" />
                  )}
                  {hasRightTab && (
                    <span className="pointer-events-none absolute bottom-0 -right-4 h-4 w-4 bg-neutral-100 before:absolute before:inset-0 before:rounded-bl-full before:bg-gray-50 dark:bg-neutral-900 dark:before:bg-black" />
                  )}
                </motion.div>
              )}

              <button
                type="button"
                id={tabId}
                role="tab"
                aria-controls={`year-panel-${group.year}`}
                aria-selected={isActive}
                onClick={() => handleChangeActive(index)}
                className={`w-full px-3 py-3 text-center text-sm transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400 dark:focus-visible:outline-neutral-500 sm:px-6 ${
                  isActive
                    ? "text-neutral-800 [font-variation-settings:'wght'_500] dark:text-white"
                    : "text-neutral-500 dark:text-silver-dark"
                }`}
              >
                {group.year}
              </button>
            </li>
          );
        })}
      </ul>

      <div
        id={`year-panel-${activeYear.year}`}
        role="tabpanel"
        aria-labelledby={`year-tab-${activeYear.year}`}
        className={`border border-neutral-500/10 bg-neutral-100 p-5 transition-all duration-300 dark:border-neutral-900 dark:bg-neutral-900 sm:p-10 ${
          shouldRoundTopLeft ? "rounded-tl-3xl" : ""
        } ${shouldRoundTopRight ? "rounded-tr-3xl" : ""} rounded-b-3xl`}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.ul
            key={activeYear.year}
            variants={containerVariants}
            custom={direction}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="divide-y divide-neutral-500/10 dark:divide-neutral-800"
          >
            {activeYear.posts.map((post) => (
              <motion.li
                key={post.slug}
                variants={itemVariants}
                custom={direction}
                className="first:pt-0 last:pb-0"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex items-start justify-between gap-3 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400 dark:focus-visible:outline-neutral-500"
                >
                  <span className="min-w-0">
                    <span className="block text-neutral-800 transition-colors group-hover:text-neutral-500 dark:text-silver dark:group-hover:text-silver-dark">
                      {post.title}
                    </span>
                    {post.readingTime && (
                      <span className="time mt-1 inline-flex items-center gap-1">
                        <ClockIcon size={14} />
                        {post.readingTime}
                      </span>
                    )}
                  </span>
                  <time className="time whitespace-nowrap" dateTime={post.date}>
                    {formatDate(post.date, true)}
                  </time>
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </div>
    </div>
  );
}
