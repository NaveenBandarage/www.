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
  const url = href.toLowerCase();

  if (url.includes("mailto:")) return EmailIcon;
  if (url.includes("twitter.com") || url.includes("x.com")) return XIcon;
  if (url.includes("linkedin.com")) return LinkedInIcon;
  if (url.includes("instagram.com")) return InstagramIcon;
  if (url.includes("spotify.com")) return SpotifyIcon;
  if (url.includes("literal.club")) return BookIcon;
  if (url.includes("substack.com")) return NewsletterIcon;
  if (url.includes("youtube.com")) return YoutubeIcon;
  if (url.includes("cosmos.so")) return CosmosIcon;

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
