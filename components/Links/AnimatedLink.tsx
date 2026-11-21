import type { ReactNode } from "react";
import { ExternalIcon } from "../Icons";

interface AnimatedLinkProps {
  href: string;
  children: ReactNode;
}

// Page previews are handled by the shared LinkPreview component.
export function AnimatedLink({ href, children }: AnimatedLinkProps) {
  return (
    <a
      className="link link-external"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ExternalIcon size={16} />
    </a>
  );
}
