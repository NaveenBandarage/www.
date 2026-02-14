import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ExternalIcon,
  EmailIcon,
  XIcon,
  LinkedInIcon,
  InstagramIcon,
  SpotifyIcon,
  BookIcon,
  GoodreadsIcon,
  NewsletterIcon,
  YoutubeIcon,
  GlobeIcon,
  CosmosIcon,
} from "../Icons";

interface AnimatedLinkProps {
  href: string;
  children: React.ReactNode;
}

// Map URLs to their corresponding icons
const getIconForUrl = (href: string) => {
  // Handle mailto: links
  if (href.toLowerCase().startsWith("mailto:")) return EmailIcon;

  let host = "";
  try {
    // Handle protocol-relative URLs (starting with //)
    let urlToParse = href;
    if (href.startsWith("//")) {
      urlToParse = "https:" + href;
    }

    // Parse the URL, fallback to empty host if invalid
    host = new URL(urlToParse).host.toLowerCase();
  } catch (e) {
    // If parsing fails, fallback to default icon
    return GlobeIcon;
  }

  // Helper to match exact domain or subdomain
  const matchesDomain = (domain: string) =>
    host === domain || host.endsWith("." + domain);

  if (matchesDomain("twitter.com") || matchesDomain("x.com")) return XIcon;
  if (matchesDomain("linkedin.com")) return LinkedInIcon;
  if (matchesDomain("instagram.com")) return InstagramIcon;
  if (matchesDomain("spotify.com")) return SpotifyIcon;
  if (matchesDomain("literal.club")) return BookIcon;
  if (matchesDomain("goodreads.com")) return GoodreadsIcon;
  if (matchesDomain("substack.com")) return NewsletterIcon;
  if (matchesDomain("youtube.com")) return YoutubeIcon;
  if (matchesDomain("cosmos.so")) return CosmosIcon;

  // Default icon for any other external links
  return GlobeIcon;
};

export function AnimatedLink({ href, children }: AnimatedLinkProps) {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const IconComponent = getIconForUrl(href);

  return (
    <div className="relative inline-block">
      <motion.a
        className="link link-external"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        transition={{ type: "spring", stiffness: 420, damping: 26 }}
      >
        {children}
        <ExternalIcon size={16} />
      </motion.a>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{
              opacity: 0,
              scale: shouldReduceMotion ? 1 : 0.85,
              y: shouldReduceMotion ? -36 : -20,
              x: -20,
              rotate: shouldReduceMotion ? 0 : -8,
              filter: shouldReduceMotion ? "blur(0px)" : "blur(8px)",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: -40,
              x: -20,
              rotate: 0,
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              scale: shouldReduceMotion ? 1 : 0.9,
              y: shouldReduceMotion ? -36 : -20,
              x: -20,
              rotate: shouldReduceMotion ? 0 : -4,
              filter: shouldReduceMotion ? "blur(0px)" : "blur(6px)",
            }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute pointer-events-none z-10"
            style={{
              top: "50%",
              left: "0%",
              willChange: "opacity, transform, filter",
            }}
          >
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 shadow-lg">
              <IconComponent size={20} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
