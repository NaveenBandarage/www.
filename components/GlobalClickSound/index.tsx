"use client";

import { useEffect, useRef, useState } from "react";

interface SoundDefinition {
  [key: string]: [number, number]; // [start_time_ms, duration_ms]
}

interface SoundConfig {
  id: string;
  name: string;
  sound: string;
  defines: SoundDefinition;
}

export default function GlobalClickSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [soundConfig, setSoundConfig] = useState<SoundConfig | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  useEffect(() => {
    // Load the sound configuration
    const loadSoundConfig = async () => {
      try {
        const response = await fetch("/config.json");

        if (!response.ok) {
          throw new Error(`Failed to fetch config: ${response.status}`);
        }

        const config: SoundConfig = await response.json();
        setSoundConfig(config);

        // Pre-load the audio file
        const audio = new Audio(`/${config.sound}`);
        audio.preload = "auto";
        audio.volume = 0.3; // Set default volume

        // Store references to event handlers for proper cleanup
        const handleCanPlayThrough = () => {
          setIsLoaded(true);
        };

        const handleError = (e: Event) => {
          console.error("Audio loading error:", e);
        };

        // Wait for audio to be ready
        audio.addEventListener("canplaythrough", handleCanPlayThrough);
        audio.addEventListener("error", handleError);

        audioRef.current = audio;

        // Store cleanup function that uses the same function references
        const cleanup = () => {
          if (audioRef.current) {
            audioRef.current.removeEventListener(
              "canplaythrough",
              handleCanPlayThrough,
            );
            audioRef.current.removeEventListener("error", handleError);
          }
        };

        // Store cleanup function on the audio element for access in useEffect cleanup
        (audio as any)._cleanup = cleanup;
      } catch (error) {
        console.error("Failed to load sound configuration:", error);
      }
    };

    loadSoundConfig();

    return () => {
      if (audioRef.current && (audioRef.current as any)._cleanup) {
        (audioRef.current as any)._cleanup();
      }
    };
  }, []);

  // Enable audio on first user interaction - Safari-compatible
  useEffect(() => {
    const enableAudio = async () => {
      if (!audioRef.current || isAudioEnabled) return;

      try {
        // Safari-specific audio context unlock
        const audio = audioRef.current;

        // Check if we're on Safari
        const isSafari = /^((?!chrome|android).)*safari/i.test(
          navigator.userAgent,
        );

        if (isSafari) {
          // Safari requires more explicit user interaction
          audio.muted = true;
          await audio.play();
          audio.pause();
          audio.muted = false;
          audio.currentTime = 0;
        } else {
          // Standard unlock for other browsers
          await audio.play();
          audio.pause();
          audio.currentTime = 0;
        }

        setIsAudioEnabled(true);
      } catch (error) {
        console.log(
          "Audio context not yet enabled, will try on next interaction",
        );
      }
    };

    const handleFirstInteraction = () => {
      enableAudio();
    };

    // Listen for first user interaction
    document.addEventListener("click", handleFirstInteraction, { once: true });
    document.addEventListener("keydown", handleFirstInteraction, {
      once: true,
    });

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [isLoaded, isAudioEnabled]);

  useEffect(() => {
    if (!isLoaded || !soundConfig || !audioRef.current || !isAudioEnabled)
      return;

    const playRandomSound = () => {
      if (!audioRef.current || !soundConfig) return;

      // Get all available sound definitions
      const soundKeys = Object.keys(soundConfig.defines);

      if (soundKeys.length === 0) return;

      // Pick a random sound
      const randomKey = soundKeys[Math.floor(Math.random() * soundKeys.length)];
      const [startTime, duration] = soundConfig.defines[randomKey];

      // Convert milliseconds to seconds for HTML Audio API
      const startTimeSeconds = startTime / 1000;
      const durationSeconds = duration / 1000;

      try {
        // Safari-compatible audio playback
        const isSafari = /^((?!chrome|android).)*safari/i.test(
          navigator.userAgent,
        );

        if (isSafari) {
          // Use the original audio element for Safari for better compatibility
          const audio = audioRef.current;
          audio.currentTime = startTimeSeconds;
          audio.volume = 0.3;

          const stopTimeout = setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
          }, duration);

          audio.play().catch((error) => {
            console.log("Safari audio play failed:", error);
            clearTimeout(stopTimeout);
          });

          audio.addEventListener(
            "ended",
            () => {
              clearTimeout(stopTimeout);
            },
            { once: true },
          );
        } else {
          // Clone the audio for other browsers to allow concurrent sounds
          const audioClone = audioRef.current.cloneNode() as HTMLAudioElement;
          audioClone.currentTime = startTimeSeconds;
          audioClone.volume = 0.3;

          const stopTimeout = setTimeout(() => {
            audioClone.pause();
            audioClone.currentTime = 0;
          }, duration);

          audioClone.play().catch((error) => {
            console.error("Failed to play sound:", error);
            clearTimeout(stopTimeout);
          });

          audioClone.addEventListener("ended", () => {
            clearTimeout(stopTimeout);
          });
        }
      } catch (error) {
        console.error("Error playing sound:", error);
      }
    };

    // Add click event listener to the document
    const handleClick = (event: MouseEvent) => {
      // Don't interfere with form inputs, buttons, but allow links
      const target = event.target as HTMLElement;
      const isInteractiveElement = target.closest(
        "input, textarea, button, select, [role=button], [contenteditable]",
      );

      if (!isInteractiveElement) {
        playRandomSound();
      }
    };

    // Use capture phase to catch clicks before they might be stopped by other handlers
    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, [isLoaded, soundConfig, isAudioEnabled]);

  // This component doesn't render anything visible
  return null;
}
