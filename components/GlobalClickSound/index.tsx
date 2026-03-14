"use client";

import { useEffect, useRef } from "react";

interface SoundDefinition {
  [key: string]: [number, number];
}

interface SoundConfig {
  id: string;
  name: string;
  sound: string;
  defines: SoundDefinition;
}

const INTERACTIVE_SELECTOR =
  "input, textarea, button, select, [role=button], [contenteditable]";

const isSafariBrowser = () =>
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

export default function GlobalClickSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundConfigRef = useRef<SoundConfig | null>(null);
  const audioEnabledRef = useRef(false);
  const loadPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    let disposed = false;
    const abortController = new AbortController();

    const unloadAudio = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }

      audioRef.current = null;
      soundConfigRef.current = null;
      audioEnabledRef.current = false;
    };

    const ensureAudioLoaded = async () => {
      if (soundConfigRef.current && audioRef.current) {
        return;
      }

      if (loadPromiseRef.current) {
        await loadPromiseRef.current;
        return;
      }

      loadPromiseRef.current = (async () => {
        const response = await fetch("/config.json", {
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch config: ${response.status}`);
        }

        const config: SoundConfig = await response.json();
        const audio = new Audio(`/${config.sound}`);
        audio.preload = "auto";
        audio.volume = 0.3;

        await new Promise<void>((resolve, reject) => {
          const onCanPlayThrough = () => {
            cleanup();
            resolve();
          };

          const onError = () => {
            cleanup();
            reject(new Error("Audio failed to load"));
          };

          const cleanup = () => {
            audio.removeEventListener("canplaythrough", onCanPlayThrough);
            audio.removeEventListener("error", onError);
          };

          audio.addEventListener("canplaythrough", onCanPlayThrough);
          audio.addEventListener("error", onError);
        });

        if (disposed) {
          audio.pause();
          audio.src = "";
          return;
        }

        soundConfigRef.current = config;
        audioRef.current = audio;
      })();

      try {
        await loadPromiseRef.current;
      } finally {
        loadPromiseRef.current = null;
      }
    };

    const unlockAudio = async () => {
      const audio = audioRef.current;

      if (!audio || audioEnabledRef.current) {
        return;
      }

      try {
        if (isSafariBrowser()) {
          audio.muted = true;
          await audio.play();
          audio.pause();
          audio.muted = false;
          audio.currentTime = 0;
        } else {
          await audio.play();
          audio.pause();
          audio.currentTime = 0;
        }

        audioEnabledRef.current = true;
      } catch {
        // Keep disabled and retry on the next interaction.
      }
    };

    const ensureAudioEnabled = async () => {
      try {
        await ensureAudioLoaded();
        await unlockAudio();
      } catch (error) {
        if (!disposed) {
          console.error("Failed to initialize click sound:", error);
        }
      }
    };

    const playRandomSound = () => {
      if (
        !audioEnabledRef.current ||
        !audioRef.current ||
        !soundConfigRef.current
      ) {
        return;
      }

      const soundKeys = Object.keys(soundConfigRef.current.defines);
      if (soundKeys.length === 0) return;

      const randomKey = soundKeys[Math.floor(Math.random() * soundKeys.length)];
      const [startTime, duration] = soundConfigRef.current.defines[randomKey];
      const startTimeSeconds = startTime / 1000;

      try {
        if (isSafariBrowser()) {
          const audio = audioRef.current;
          audio.currentTime = startTimeSeconds;
          audio.volume = 0.3;

          const stopTimeout = setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
          }, duration);

          audio.play().catch(() => {
            clearTimeout(stopTimeout);
          });

          audio.addEventListener(
            "ended",
            () => {
              clearTimeout(stopTimeout);
            },
            { once: true },
          );
          return;
        }

        const audioClone = audioRef.current.cloneNode() as HTMLAudioElement;
        audioClone.currentTime = startTimeSeconds;
        audioClone.volume = 0.3;

        const stopTimeout = setTimeout(() => {
          audioClone.pause();
          audioClone.currentTime = 0;
        }, duration);

        audioClone.play().catch(() => {
          clearTimeout(stopTimeout);
        });

        audioClone.addEventListener(
          "ended",
          () => {
            clearTimeout(stopTimeout);
          },
          { once: true },
        );
      } catch {
        // Ignore transient playback errors.
      }
    };

    const handlePlayableClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(INTERACTIVE_SELECTOR)) return;

      if (!audioEnabledRef.current) {
        void ensureAudioEnabled();
        return;
      }

      playRandomSound();
    };

    const attachPlaybackListener = () => {
      document.addEventListener("click", handlePlayableClick, { capture: true });
    };

    const detachPlaybackListener = () => {
      document.removeEventListener("click", handlePlayableClick, {
        capture: true,
      });
    };

    const activateSoundSystem = () => {
      document.removeEventListener("click", activateSoundSystem, {
        capture: true,
      });
      document.removeEventListener("keydown", activateSoundSystem);

      void ensureAudioEnabled();
      attachPlaybackListener();
    };

    document.addEventListener("click", activateSoundSystem, {
      once: true,
      capture: true,
    });
    document.addEventListener("keydown", activateSoundSystem, {
      once: true,
    });

    return () => {
      disposed = true;
      abortController.abort();

      document.removeEventListener("click", activateSoundSystem, {
        capture: true,
      });
      document.removeEventListener("keydown", activateSoundSystem);
      detachPlaybackListener();
      unloadAudio();
    };
  }, []);

  return null;
}
