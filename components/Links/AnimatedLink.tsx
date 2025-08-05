import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const IconComponent = getIconForUrl(href);

  return (
    <div className="relative inline-block">
      <a
        className="link link-external"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
        <ExternalIcon size={16} />
      </a>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0,
              y: 10,
              x: -20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: -40,
              x: -20,
            }}
            exit={{
              opacity: 0,
              scale: 0,
              y: 10,
              x: -20,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              duration: 0.15,
            }}
            className="absolute pointer-events-none z-10"
            style={{
              top: "50%",
              left: "0%",
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
