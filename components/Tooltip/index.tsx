import { TransitionGroup, CSSTransition } from "react-transition-group";

export function Tooltip({ open, children }) {
  return (
    <TransitionGroup className="absolute bottom-auto left-1/2 top-0 -translate-x-1/2 translate-y-[calc(-100%-10px)] select-none pointer-coarse:hidden sm:bottom-0 sm:top-auto sm:-translate-y-[calc(-100%-10px)]">
      {open ? (
        <CSSTransition key="tooltip" classNames="tooltip" timeout={200}>
          <div
            role="tooltip"
            className="whitespace-nowrap rounded border border-transparent bg-neutral-900 px-1.5 py-0.5 text-center text-xs font-medium text-silver [font-variation-settings:'opsz'_12] dark:border-white/[.08] dark:bg-black/[.96] dark:text-silver-dark"
          >
            {children}
          </div>
        </CSSTransition>
      ) : null}
    </TransitionGroup>
  );
}
