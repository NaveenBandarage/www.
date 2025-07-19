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

        // Wait for audio to be ready
        audio.addEventListener("canplaythrough", () => {
          setIsLoaded(true);
        });

        audio.addEventListener("error", (e) => {
          console.error("Audio loading error:", e);
        });

        audioRef.current = audio;
      } catch (error) {
        console.error("Failed to load sound configuration:", error);
      }
    };

    loadSoundConfig();

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("canplaythrough", () => {});
        audioRef.current.removeEventListener("error", () => {});
      }
    };
  }, []);

  // Enable audio on first user interaction
  useEffect(() => {
    const enableAudio = async () => {
      if (!audioRef.current || isAudioEnabled) return;

      try {
        // Try to play and immediately pause to unlock audio context
        await audioRef.current.play();
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
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
        // Clone the audio to allow multiple concurrent sounds
        const audioClone = audioRef.current.cloneNode() as HTMLAudioElement;
        audioClone.currentTime = startTimeSeconds;
        audioClone.volume = 0.3; // Keep it subtle

        // Stop the sound after the specified duration
        const stopTimeout = setTimeout(() => {
          audioClone.pause();
          audioClone.currentTime = 0;
        }, duration);

        audioClone.play().catch((error) => {
          console.error("Failed to play sound:", error);
          clearTimeout(stopTimeout);
        });

        // Clean up timeout if audio ends naturally
        audioClone.addEventListener("ended", () => {
          clearTimeout(stopTimeout);
        });
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
