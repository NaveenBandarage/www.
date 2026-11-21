import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ReadingSection {
  title: string;
  start: number;
}

interface ReadingBarProps {
  title: string;
  readingTime: string;
}

export default function ReadingBar({ title, readingTime }: ReadingBarProps) {
  const [mounted, setMounted] = useState(false);
  const [supported, setSupported] = useState(false);
  const [playback, setPlayback] = useState<"idle" | "playing" | "paused">(
    "idle",
  );
  const [progress, setProgress] = useState(0);
  const [sections, setSections] = useState<ReadingSection[]>([
    { title: "Introduction", start: 0 },
  ]);
  const ownsSpeech = useRef(false);
  const generation = useRef(0);

  useEffect(() => {
    const narrationGeneration = generation;
    setMounted(true);
    setSupported(
      "speechSynthesis" in window && "SpeechSynthesisUtterance" in window,
    );
    const measureSections = () => {
      const content = document.getElementById("blog-reading-content");
      if (!content) return;
      const start = content.getBoundingClientRect().top + window.scrollY;
      const distance = Math.max(1, content.offsetHeight - window.innerHeight);
      const next: ReadingSection[] = [{ title: "Introduction", start: 0 }];
      content.querySelectorAll("h2").forEach((heading) => {
        const title = heading.textContent?.trim();
        const position = Math.round(
          Math.max(
            0,
            Math.min(
              99,
              ((heading.getBoundingClientRect().top +
                window.scrollY -
                start -
                window.innerHeight * 0.2) /
                distance) *
                100,
            ),
          ),
        );
        if (!title) return;
        if (position <= next[next.length - 1].start + 1) {
          if (next.length === 1 && position === 0) next[0].title = title;
          return;
        }
        next.push({ title, start: position });
      });
      setSections(next);
    };
    const update = () => {
      const content = document.getElementById("blog-reading-content");
      if (!content) return;
      const start = content.getBoundingClientRect().top + window.scrollY;
      const distance = Math.max(1, content.offsetHeight - window.innerHeight);
      setProgress(
        Math.round(
          Math.max(0, Math.min(1, (window.scrollY - start) / distance)) * 100,
        ),
      );
    };
    measureSections();
    update();
    const resize = () => {
      measureSections();
      update();
    };
    const observer = new ResizeObserver(resize);
    const content = document.getElementById("blog-reading-content");
    if (content) observer.observe(content);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", resize);
      observer.disconnect();
      narrationGeneration.current++;
      if (ownsSpeech.current) window.speechSynthesis.cancel();
    };
  }, []);

  const toggleNarration = () => {
    const speech = window.speechSynthesis;
    if (playback === "playing") {
      speech.pause();
      setPlayback("paused");
      return;
    }
    if (playback === "paused") {
      speech.resume();
      setPlayback("playing");
      return;
    }
    const content = document.getElementById("blog-reading-content");
    if (!content) return;
    const chunks = Array.from(
      content.querySelectorAll("h1, h2, h3, h4, p, li, blockquote"),
    )
      .filter((element) => !element.parentElement?.closest("li, blockquote"))
      .map((element) => element.textContent?.trim())
      .filter(Boolean) as string[];
    if (!chunks.length) return;
    const currentGeneration = ++generation.current;
    ownsSpeech.current = true;
    setPlayback("playing");
    const speak = (index: number) => {
      if (generation.current !== currentGeneration) return;
      if (index >= chunks.length) {
        ownsSpeech.current = false;
        setPlayback("idle");
        return;
      }
      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.onend = () => speak(index + 1);
      utterance.onerror = () => {
        if (generation.current !== currentGeneration) return;
        ownsSpeech.current = false;
        setPlayback("idle");
      };
      speech.speak(utterance);
    };
    speak(0);
  };

  const seek = (value: number, smooth = false) => {
    const content = document.getElementById("blog-reading-content");
    if (!content) return;
    const start = content.getBoundingClientRect().top + window.scrollY;
    const distance = Math.max(0, content.offsetHeight - window.innerHeight);
    window.scrollTo({
      top: start + (distance * value) / 100,
      behavior:
        smooth && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "smooth"
          : "instant",
    });
    if (!smooth) setProgress(value);
  };

  const currentSection = sections.reduce(
    (current, section, index) => (progress >= section.start ? index : current),
    0,
  );

  if (!mounted) return null;
  return createPortal(
    <aside aria-label="Reading controls" className="reading-bar">
      {supported ? (
        <button
          type="button"
          className="reading-bar__play"
          onClick={toggleNarration}
          aria-label={
            playback === "playing"
              ? "Pause narration"
              : playback === "paused"
                ? "Resume narration"
                : "Read article aloud"
          }
          title={
            playback === "playing" ? "Pause narration" : "Read article aloud"
          }
        >
          {playback === "playing" ? (
            <span aria-hidden="true">Ⅱ</span>
          ) : (
            <span aria-hidden="true">▶</span>
          )}
        </button>
      ) : null}
      <div className="reading-bar__content">
        <div className="reading-bar__title">{title}</div>
        <div
          className="reading-bar__subtitle"
          title={sections[currentSection].title}
        >
          {sections.length > 1 ? `${currentSection + 1} · ` : ""}
          {sections[currentSection].title}
        </div>
        <div className="reading-bar__track">
          <div className="reading-bar__segments" aria-hidden="true">
            {sections.map((section, index) => {
              const end = sections[index + 1]?.start ?? 100;
              const size = end - section.start;
              const fill = Math.max(
                0,
                Math.min(100, ((progress - section.start) / size) * 100),
              );
              return (
                <span
                  className="reading-bar__segment"
                  key={`${section.title}-${index}`}
                  style={{ flexGrow: size }}
                >
                  <span style={{ transform: `scaleX(${fill / 100})` }} />
                </span>
              );
            })}
          </div>
          <input
            className="reading-bar__progress"
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(event) => seek(Number(event.target.value))}
            aria-label="Reading progress"
            aria-valuetext={`${progress}% through the article, ${sections[currentSection].title}`}
          />
        </div>
      </div>
      <div className="reading-bar__actions">
        <button
          type="button"
          className="reading-bar__skip"
          aria-label="Previous section"
          title="Previous section"
          disabled={currentSection === 0}
          onClick={() => seek(sections[currentSection - 1].start, true)}
        >
          <span aria-hidden="true">|◀</span>
        </button>
        <button
          type="button"
          className="reading-bar__skip"
          aria-label="Next section"
          title="Next section"
          disabled={currentSection === sections.length - 1}
          onClick={() => seek(sections[currentSection + 1].start, true)}
        >
          <span aria-hidden="true">▶|</span>
        </button>
        <span
          className="reading-bar__percent"
          title={`${readingTime} estimated reading time`}
          aria-label={`${progress}% read, ${readingTime} estimated reading time`}
        >
          {progress}%
        </span>
      </div>
    </aside>,
    document.body,
  );
}
