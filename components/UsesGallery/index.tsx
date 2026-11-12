import { AnimatePresence, m } from "framer-motion";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import useReducedMotion from "../../lib/useReducedMotion";
import { usesItems } from "../../lib/uses";
import type { UsesCategory, UsesItem } from "../../lib/uses";
import styles from "./gallery.module.css";

const categories = [
  "All",
  "Desk",
  "Audio",
  "Photography",
  "Stationery",
  "Wardrobe",
  "Software",
] as const;

export default function UsesGallery() {
  const [category, setCategory] = useState<UsesCategory | "All">("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<UsesItem | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const filterId = useId();
  const titleId = useId();
  const noteId = useId();
  const reducedMotion = useReducedMotion();
  const normalizedQuery = query.trim().toLowerCase();
  const visibleItems = usesItems.filter(
    (item) =>
      (category === "All" || item.category === category) &&
      `${item.name} ${item.brand} ${item.category}`
        .toLowerCase()
        .includes(normalizedQuery),
  );
  const isOpen = selected !== null;
  const selectedIndex = selected
    ? visibleItems.findIndex((item) => item.id === selected.id)
    : -1;

  function navigateItem(direction: number) {
    if (selectedIndex < 0 || visibleItems.length < 2) return;
    setSelected(
      visibleItems[
        (selectedIndex + direction + visibleItems.length) % visibleItems.length
      ],
    );
  }

  useEffect(() => {
    if (!isOpen || !dialog.current) return;
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <section aria-label="My everyday things" className={styles.collection}>
      <div className={styles.toolbar}>
        <fieldset className={styles.filters}>
          <legend className="sr-only">Filter things by category</legend>
          {categories.map((label) => (
            <label key={label} className={styles.filter}>
              <input
                type="radio"
                name={filterId}
                value={label}
                checked={category === label}
                onChange={() => setCategory(label)}
                className="sr-only"
                aria-controls={`${filterId}-items`}
              />
              <span>
                {label}
                <small>
                  {label === "All"
                    ? usesItems.length
                    : usesItems.filter((item) => item.category === label)
                        .length}
                </small>
              </span>
            </label>
          ))}
        </fieldset>
        <label className={styles.search}>
          <span aria-hidden="true">⌕</span>
          <span className="sr-only">Search my things</span>
          <input
            type="search"
            placeholder="Search things"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>
      <p className="sr-only" role="status">
        Showing {visibleItems.length}{" "}
        {category === "All" ? "" : category.toLowerCase()} items
      </p>
      {visibleItems.length === 0 && (
        <p className={styles.empty}>No things found. Try another search.</p>
      )}
      <ul className={styles.grid} id={`${filterId}-items`}>
        <AnimatePresence initial={false}>
          {visibleItems.map((item) => (
            <m.li
              key={item.id}
              layout={!reducedMotion}
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, scale: 0.97 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
            >
              <button
                type="button"
                className={styles.item}
                onClick={() => setSelected(item)}
                aria-haspopup="dialog"
                aria-label={`About ${item.name} by ${item.brand}`}
              >
                <span className={styles.thumbnail}>
                  <Image
                    src={`/uses/things/${item.image}`}
                    alt=""
                    width={240}
                    height={240}
                    sizes="(min-width: 640px) 112px, 96px"
                    className={item.software ? styles.appIcon : styles.product}
                  />
                </span>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.brand}>{item.brand}</span>
              </button>
            </m.li>
          ))}
        </AnimatePresence>
      </ul>
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby={titleId}
        aria-describedby={noteId}
        data-lenis-prevent
        onClose={() => {
          if (!dialog.current?.open) setSelected(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            navigateItem(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            setSelected(null);
        }}
      >
        {selected && (
          <>
            <button
              className={styles.close}
              type="button"
              aria-label="Close item details"
              onClick={() => setSelected(null)}
            >
              <span aria-hidden="true">×</span>
            </button>
            <div
              className={styles.detailContent}
              key={selected.id}
              aria-live="polite"
            >
              <div className={styles.detailImage}>
                <Image
                  src={`/uses/things/${selected.image}`}
                  alt={selected.name}
                  width={480}
                  height={480}
                  sizes="(min-width: 640px) 320px, 240px"
                  className={
                    selected.software ? styles.appIcon : styles.product
                  }
                />
              </div>
              <div className={styles.detailCopy}>
                <p className={styles.detailBrand}>
                  {selected.brand} / {selected.category}
                </p>
                <h2 id={titleId}>{selected.name}</h2>
                <p className={styles.note} id={noteId}>
                  {selected.note}
                </p>
                <a
                  href={selected.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.visit}
                >
                  Visit {selected.brand} <span aria-hidden="true">↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            </div>
            <div className={styles.detailNavigation}>
              <span>
                {String(selectedIndex + 1).padStart(2, "0")} /{" "}
                {String(visibleItems.length).padStart(2, "0")}
              </span>
              <div>
                <button
                  type="button"
                  onClick={() => navigateItem(-1)}
                  disabled={visibleItems.length < 2}
                  aria-label="Previous item"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => navigateItem(1)}
                  disabled={visibleItems.length < 2}
                  aria-label="Next item"
                >
                  →
                </button>
              </div>
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}
