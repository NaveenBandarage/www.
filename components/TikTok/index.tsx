interface TikTokEmbedProps {
  url: string;
  caption?: string;
}

export function TikTokEmbed({ url, caption }: TikTokEmbedProps) {
  const videoId = url?.match(/\/video\/(\d+)/)?.[1];

  if (!url || !videoId) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-400 dark:text-neutral-600 text-sm"
        style={{ minHeight: "560px" }}
      >
        Add TikTok URL
      </div>
    );
  }

  return (
    <div>
      {/* @ts-expect-error tiktok blockquote embed */}
      <blockquote
        className="tiktok-embed"
        cite={url}
        data-video-id={videoId}
        style={{ maxWidth: "605px", minWidth: "325px" }}
      >
        <section />
      </blockquote>
      {caption && <p className="time px-1 pt-1">{caption}</p>}
    </div>
  );
}
