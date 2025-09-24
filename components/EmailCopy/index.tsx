import React, { useState } from "react";
import { ClipboardIcon } from "../Icons";
import { Tooltip } from "../Tooltip";
import useCopy from "@react-hook/copy";

interface EmailCopyProps {
  email: string;
  children?: React.ReactNode;
}

export function EmailCopy({ email, children }: EmailCopyProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const { copy } = useCopy(email);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await copy();
      setTooltipOpen(true);

      setTimeout(() => {
        setTooltipOpen(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to copy email:", error);
    }
  };

  return (
    <div className="relative inline-flex items-center gap-2">
      <span className="blur-sm hover:blur-none transition-all duration-300 select-none">
        {children || email}
      </span>
      <div className="relative">
        <Tooltip open={tooltipOpen}>Email copied!</Tooltip>
        <button
          onClick={handleCopy}
          className="inline-flex items-center justify-center w-5 h-5 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200 opacity-60 hover:opacity-100"
          aria-label="Copy email to clipboard"
          title="Copy email to clipboard"
        >
          <ClipboardIcon size={14} />
        </button>
      </div>
    </div>
  );
}
