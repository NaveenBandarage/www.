import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  play,
  setEnabled,
  setTheme,
  setVolume,
  sounds,
  unlock,
  type SoundName,
} from "cuelume";
import { NAVIGATION_HOVER_SOUND_EVENT } from "../../lib/navigationSound";

const STORAGE_KEY = "ui-sounds:v1";
const CONTROL_SELECTOR =
  'a[href], button, summary, input[type="checkbox"], input[type="radio"], [role="button"], [role="tab"], [role="switch"]';

interface InteractionSoundsContextValue {
  enabled: boolean;
  toggleSounds: () => void;
}

interface InteractionSoundsProps {
  children: ReactNode;
}

const InteractionSoundsContext =
  createContext<InteractionSoundsContextValue | null>(null);

export function useInteractionSounds() {
  const context = useContext(InteractionSoundsContext);
  if (!context) {
    throw new Error("useInteractionSounds requires InteractionSounds");
  }
  return context;
}

export default function InteractionSounds({
  children,
}: InteractionSoundsProps) {
  const [enabled, setSoundsEnabled] = useState(true);

  useEffect(() => {
    setTheme("mech");
    setVolume(0.3);

    let savedEnabled = true;
    try {
      savedEnabled = localStorage.getItem(STORAGE_KEY) !== "off";
    } catch {
      // Sound still works when browser storage is unavailable.
    }
    setEnabled(savedEnabled);
    setSoundsEnabled(savedEnabled);

    const assignedSounds = new WeakMap<Element, SoundName>();
    let availableSounds: SoundName[] = [];
    const soundFor = (control: Element): SoundName => {
      const assigned = assignedSounds.get(control);
      if (assigned) return assigned;

      // Deal every cue once before repeating, and keep each control's cue stable.
      if (!availableSounds.length) availableSounds = [...sounds];
      const index = Math.floor(Math.random() * availableSounds.length);
      const [cue] = availableSounds.splice(index, 1);
      assignedSounds.set(control, cue);
      return cue;
    };

    // Delegate once so links and controls added after navigation work too.
    // Native click activation also covers keyboard and touch, without sounding on scroll.
    const handleClick = (event: MouseEvent) => {
      if (event.button !== 0 || !(event.target instanceof Element)) return;

      const control = event.target.closest<HTMLElement>(CONTROL_SELECTOR);
      if (
        !control ||
        control.matches(":disabled") ||
        control.closest('[aria-disabled="true"], [data-ui-sound="off"]') ||
        (control instanceof HTMLAnchorElement && !control.getAttribute("href"))
      ) {
        return;
      }

      play(soundFor(control), { emphasis: "subtle" });
    };

    const handleChange = (event: Event) => {
      if (
        event.target instanceof HTMLSelectElement &&
        !event.target.matches(":disabled") &&
        !event.target.closest('[aria-disabled="true"], [data-ui-sound="off"]')
      ) {
        play(soundFor(event.target), { emphasis: "subtle" });
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return;
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      const nextEnabled = event.newValue !== "off";
      setEnabled(nextEnabled);
      setSoundsEnabled(nextEnabled);
    };

    let lastHoverSound = -Infinity;
    const handleNavigationHover = () => {
      const now = performance.now();
      if (now - lastHoverSound < 70) return;
      lastHoverSound = now;
      play("select", { emphasis: "subtle", volume: 0.4 });
    };

    document.addEventListener("click", handleClick, true);
    document.addEventListener("change", handleChange, true);
    document.addEventListener(
      NAVIGATION_HOVER_SOUND_EVENT,
      handleNavigationHover,
    );
    window.addEventListener("storage", handleStorage);
    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("change", handleChange, true);
      document.removeEventListener(
        NAVIGATION_HOVER_SOUND_EVENT,
        handleNavigationHover,
      );
      window.removeEventListener("storage", handleStorage);
      setEnabled(false);
    };
  }, []);

  const toggleSounds = useCallback(() => {
    const nextEnabled = !enabled;
    setEnabled(nextEnabled);
    setSoundsEnabled(nextEnabled);
    try {
      localStorage.setItem(STORAGE_KEY, nextEnabled ? "on" : "off");
    } catch {
      // Keep the setting for this visit even if it cannot be persisted.
    }
    if (nextEnabled) {
      void unlock();
      play("toggle", { emphasis: "subtle" });
    }
  }, [enabled]);

  const value = useMemo(
    () => ({ enabled, toggleSounds }),
    [enabled, toggleSounds],
  );

  return (
    <InteractionSoundsContext.Provider value={value}>
      {children}
    </InteractionSoundsContext.Provider>
  );
}
