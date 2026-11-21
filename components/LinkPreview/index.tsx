import { AnimatePresence, m } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useReducedMotion from "../../lib/useReducedMotion";
import { getLinkPreview, type Preview } from "../../lib/linkPreview";

function PreviewMedia({ preview }: { preview: Preview }) {
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">(
    preview.screenshot ? "loading" : "unavailable",
  );

  useEffect(() => {
    if (status !== "loading") return;
    const timeout = window.setTimeout(() => setStatus("unavailable"), 12_000);
    return () => window.clearTimeout(timeout);
  }, [status]);

  return (
    <div
      className={`site-preview-media ${status === "unavailable" ? "site-preview-unavailable" : ""}`}
    >
      <span className="site-preview-placeholder" aria-hidden="true">
        {status === "loading"
          ? "Loading page preview…"
          : preview.host === "Email"
            ? "Say hello ↗"
            : "Visit page ↗"}
      </span>
      {preview.screenshot ? (
        // A direct image keeps captures on demand and out of Next's image cache.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview.screenshot}
          alt=""
          draggable={false}
          referrerPolicy="no-referrer"
          className={status === "ready" ? "is-ready" : ""}
          onLoad={() => setStatus("ready")}
          onError={() => setStatus("unavailable")}
        />
      ) : null}
    </div>
  );
}

/** One delegated preview for every link, including links added by navigation. */
export default function LinkPreview() {
  const [mounted, setMounted] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const tooltipId = useId();
  const reducedMotion = useReducedMotion();
  const container = useRef<HTMLDivElement>(null);
  const reposition = useRef<() => void>(() => {});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    let active: HTMLAnchorElement | null = null;
    let keyboard = false;
    let overCard = false;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;
    let pointerX = 0;
    let pointerY = 0;

    const paint = () => {
      if (container.current) {
        container.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    };
    const move = () => {
      x += (targetX - x) * 0.18;
      y += (targetY - y) * 0.18;
      paint();
      frame =
        Math.abs(targetX - x) + Math.abs(targetY - y) > 0.4
          ? requestAnimationFrame(move)
          : 0;
    };
    const position = (snap = false) => {
      if (!active || !container.current) return;
      const width = container.current.offsetWidth;
      const height = container.current.offsetHeight || 320;
      const box = active.getBoundingClientRect();
      const desiredX = keyboard
        ? box.left
        : box.left > width + 36
          ? box.left -
            width -
            20 +
            Math.min(12, Math.max(0, (pointerX - box.left) * 0.025))
          : pointerX > width + 44
            ? pointerX - width - 24
            : pointerX + 24;
      targetX = Math.max(16, Math.min(innerWidth - width - 16, desiredX));
      targetY = Math.max(
        16,
        Math.min(
          innerHeight - height - 16,
          keyboard ? box.bottom + 12 : pointerY - 80,
        ),
      );
      if (snap || reducedMotion || keyboard) {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        x = targetX;
        y = targetY;
        paint();
      } else if (!frame) frame = requestAnimationFrame(move);
    };
    reposition.current = () => position(true);

    const removeDescription = () => {
      if (!active) return;
      const ids = (active.getAttribute("aria-describedby") || "")
        .split(/\s+/)
        .filter((id) => id && id !== tooltipId);
      if (ids.length) active.setAttribute("aria-describedby", ids.join(" "));
      else active.removeAttribute("aria-describedby");
    };
    const hide = () => {
      clearTimeout(hideTimer);
      removeDescription();
      active = null;
      overCard = false;
      setPreview(null);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };
    const show = (link: HTMLAnchorElement, fromKeyboard = false) => {
      clearTimeout(hideTimer);
      if (link === active && keyboard === fromKeyboard) return;
      const next = getLinkPreview(link, location.href);
      if (!next) {
        hide();
        return;
      }
      const snap = !active;
      removeDescription();
      active = link;
      keyboard = fromKeyboard;
      overCard = false;
      // A body portal sits behind native modal dialogs in the browser's top layer.
      setPortalTarget(
        link.closest<HTMLDialogElement>("dialog[open]") ?? document.body,
      );
      const ids = link.getAttribute("aria-describedby");
      link.setAttribute(
        "aria-describedby",
        [ids, tooltipId].filter(Boolean).join(" "),
      );
      setPreview(next);
      position(snap);
    };
    const linkFor = (target: EventTarget | null) =>
      target instanceof Element
        ? target.closest<HTMLAnchorElement>("a[href]")
        : null;
    const pointerOver = (event: PointerEvent) => {
      if (!finePointer.matches || event.pointerType === "touch") return;
      if (
        event.target instanceof Node &&
        container.current?.contains(event.target)
      ) {
        clearTimeout(hideTimer);
        overCard = true;
        return;
      }
      overCard = false;
      const link = linkFor(event.target);
      if (
        !link ||
        (event.relatedTarget instanceof Node &&
          link.contains(event.relatedTarget))
      )
        return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      show(link);
    };
    const pointerOut = (event: PointerEvent) => {
      if (keyboard || !active) return;
      if (
        event.relatedTarget instanceof Node &&
        (active.contains(event.relatedTarget) ||
          container.current?.contains(event.relatedTarget))
      )
        return;
      if (
        linkFor(event.target) === active ||
        (event.target instanceof Node &&
          container.current?.contains(event.target))
      ) {
        // Allow crossing the small gap to read the card without it disappearing.
        clearTimeout(hideTimer);
        hideTimer = setTimeout(hide, 200);
      }
    };
    const pointerMove = (event: PointerEvent) => {
      if (!active || keyboard || reducedMotion || overCard) return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      position();
    };
    const focusIn = (event: FocusEvent) => {
      const link = linkFor(event.target);
      if (link?.matches(":focus-visible")) show(link, true);
    };
    const focusOut = (event: FocusEvent) => {
      if (event.target === active) hide();
    };
    const keyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };
    const visibilityChange = () => {
      if (document.hidden) hide();
    };
    // Route changes remove the active anchor; don't retain a stale tooltip.
    const observer = new MutationObserver(() => {
      if (
        active &&
        (!active.isConnected || active.closest("dialog:not([open])"))
      )
        hide();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["open"],
    });

    document.addEventListener("pointerover", pointerOver);
    document.addEventListener("pointerout", pointerOut);
    document.addEventListener("pointermove", pointerMove, { passive: true });
    document.addEventListener("focusin", focusIn);
    document.addEventListener("focusout", focusOut);
    document.addEventListener("keydown", keyDown);
    document.addEventListener("click", hide, true);
    document.addEventListener("scroll", hide, true);
    document.addEventListener("visibilitychange", visibilityChange);
    window.addEventListener("blur", hide);
    window.addEventListener("resize", hide);
    return () => {
      hide();
      observer.disconnect();
      reposition.current = () => {};
      document.removeEventListener("pointerover", pointerOver);
      document.removeEventListener("pointerout", pointerOut);
      document.removeEventListener("pointermove", pointerMove);
      document.removeEventListener("focusin", focusIn);
      document.removeEventListener("focusout", focusOut);
      document.removeEventListener("keydown", keyDown);
      document.removeEventListener("click", hide, true);
      document.removeEventListener("scroll", hide, true);
      document.removeEventListener("visibilitychange", visibilityChange);
      window.removeEventListener("blur", hide);
      window.removeEventListener("resize", hide);
    };
  }, [reducedMotion, tooltipId, mounted]);

  useEffect(() => {
    if (!mounted || !container.current) return;
    const observer = new ResizeObserver(() => reposition.current());
    observer.observe(container.current);
    return () => observer.disconnect();
  }, [mounted, portalTarget]);

  useEffect(() => {
    reposition.current();
  }, [preview]);

  if (!mounted) return null;
  return createPortal(
    <div
      ref={container}
      className="site-link-preview"
      data-active={Boolean(preview)}
      aria-hidden={!preview}
    >
      <AnimatePresence>
        {preview ? (
          <m.div
            id={tooltipId}
            role="tooltip"
            className="site-preview-card"
            initial={{
              opacity: 0,
              y: reducedMotion ? 0 : 7,
              scale: reducedMotion ? 1 : 0.97,
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: reducedMotion ? 0 : 7,
              scale: reducedMotion ? 1 : 0.97,
            }}
            transition={{
              duration: reducedMotion ? 0 : 0.18,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <PreviewMedia key={preview.url} preview={preview} />
            <div className="site-preview-details">
              <div className="site-preview-host">{preview.host}</div>
              <div className="site-preview-title">{preview.title}</div>
              <div className="site-preview-summary">{preview.summary}</div>
              <div className="site-preview-hint">
                {preview.host === "Email" ? "Open email" : "Open page"} ↗
              </div>
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>,
    portalTarget ?? document.body,
  );
}
