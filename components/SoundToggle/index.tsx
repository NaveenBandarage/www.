import { useInteractionSounds } from "../InteractionSounds";

export default function SoundToggle() {
  const { enabled, toggleSounds } = useInteractionSounds();

  return (
    <button
      type="button"
      aria-label="Click sounds"
      aria-pressed={enabled}
      title={enabled ? "Turn click sounds off" : "Turn click sounds on"}
      data-ui-sound="off"
      onClick={toggleSounds}
      className="link-fade mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-sm text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-500"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11 5 6 9H3v6h3l5 4V5Z" />
        {enabled ? (
          <>
            <path d="M15 8a6 6 0 0 1 0 8" />
            <path d="M18 5a10 10 0 0 1 0 14" />
          </>
        ) : (
          <path d="m16 9 6 6m0-6-6 6" />
        )}
      </svg>
      Sound {enabled ? "on" : "off"}
    </button>
  );
}
