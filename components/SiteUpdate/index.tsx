import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./site-update.module.css";

const updateId = process.env.NEXT_PUBLIC_SITE_UPDATE_ID;
const configuredPath = process.env.NEXT_PUBLIC_SITE_UPDATE_PATH?.trim();
const updatePath = configuredPath && /^\/(?!\/)[^\\\s]*$/.test(configuredPath)
  ? configuredPath
  : null;
const updateMessage = process.env.NEXT_PUBLIC_SITE_UPDATE_MESSAGE;
// Peak amplitude in the decoded chime, measured from the start of playback.
const chimePeakSeconds = 0.029;
const storageKey = "site-update-dismissed";
const previewMessage =
  "Hey! I gave the photos page a little refresh. Hope you like it 🙂";

function soundsEnabled() {
  try {
    return window.localStorage.getItem("ui-sounds:v1") !== "off";
  } catch {
    return true;
  }
}

export default function SiteUpdate() {
  const [visible, setVisible] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    const isPreview =
      process.env.NODE_ENV === "development" &&
      new URLSearchParams(window.location.search).has("previewUpdate");
    if (!isPreview && (!updateId || !updateMessage || !updatePath)) return;
    if (!isPreview) {
      try {
        if (window.localStorage.getItem(storageKey) === updateId) return;
      } catch {
        // The notification is still usable without storage.
      }
    }
    const audio = new Audio("/site-update-chime.mp3");
    audio.preload = "auto";
    let disposed = false;
    let fallback: number | undefined;
    let peakFrame: number | undefined;

    function reveal() {
      if (disposed) return;
      window.clearTimeout(fallback);
      if (peakFrame !== undefined) window.cancelAnimationFrame(peakFrame);
      setPreview(isPreview);
      setVisible(true);
    }

    function removePreviewListeners() {
      window.removeEventListener("click", startPreview, true);
      window.removeEventListener("keydown", startPreview, true);
    }

    function startPreview(event: Event) {
      if (!event.isTrusted) return;
      removePreviewListeners();
      playAndReveal(false);
    }

    function revealAtPeak() {
      if (disposed) return;
      if (audio.currentTime >= chimePeakSeconds) {
        reveal();
        return;
      }
      peakFrame = window.requestAnimationFrame(revealAtPeak);
    }

    function playAndReveal(waitForPreviewGesture: boolean) {
      if (!soundsEnabled()) {
        reveal();
        return;
      }

      fallback = window.setTimeout(() => {
        audio.pause();
        reveal();
      }, 300);
      void audio.play().then(revealAtPeak, (error: unknown) => {
        if (disposed) return;
        window.clearTimeout(fallback);
        if (waitForPreviewGesture && error instanceof DOMException && error.name === "NotAllowedError") {
          window.addEventListener("click", startPreview, true);
          window.addEventListener("keydown", startPreview, true);
          return;
        }
        reveal();
      });
    }

    const frame = window.requestAnimationFrame(() => playAndReveal(isPreview));
    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      removePreviewListeners();
      if (peakFrame !== undefined) window.cancelAnimationFrame(peakFrame);
      window.clearTimeout(fallback);
      audio.pause();
    };
  }, []);

  if (!visible || (!preview && (!updateId || !updateMessage || !updatePath))) return null;

  const markRead = () => {
    if (preview || !updateId) return;
    try {
      window.localStorage.setItem(storageKey, updateId);
    } catch {
      // Navigation still works without storage.
    }
  };

  const href = preview ? "/photos" : updatePath;
  if (!href) return null;

  return (
    <div className={styles.viewport}>
      <Link className={styles.notification} href={href} onClick={markRead}>
        <div className={styles.header}>
          <span className={styles.icon} aria-hidden="true"><span /></span>
          <span className={styles.appName}>Messages</span>
          <span className={styles.action}>View Update →</span>
        </div>
        <div className={styles.body}>
          <div className={styles.summary}>
            <strong>Naveen</strong>
            <span>now</span>
          </div>
          <p>{preview ? previewMessage : updateMessage}</p>
        </div>
      </Link>
    </div>
  );
}
