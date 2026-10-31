export const NAVIGATION_HOVER_SOUND_EVENT = "navigation-hover-sound";

/** Reuse the global sound player without loading another copy of the audio. */
export function playNavigationHoverSound() {
  document.dispatchEvent(new Event(NAVIGATION_HOVER_SOUND_EVENT));
}
