import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface TooltipProps {
  open: boolean;
  children: ReactNode;
}

export function Tooltip({ open, children }: TooltipProps) {
  return (
    <div className="absolute bottom-auto left-1/2 top-0 -translate-x-1/2 translate-y-[calc(-100%-10px)] select-none pointer-coarse:hidden sm:bottom-0 sm:top-auto sm:-translate-y-[calc(-100%-10px)]">
      <AnimatePresence>
        {open ? (
          <motion.div
            key="tooltip"
            role="tooltip"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="whitespace-nowrap rounded border border-transparent bg-neutral-900 px-1.5 py-0.5 text-center text-xs font-medium text-silver [font-variation-settings:'opsz'_12] dark:border-white/[.08] dark:bg-black/[.96] dark:text-silver-dark"
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
