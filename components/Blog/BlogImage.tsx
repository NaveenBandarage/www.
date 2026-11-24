import Image from "next/image";

interface BlogImageProps {
  src: string;
  alt: string;
  width: number | `${number}`;
  height: number | `${number}`;
  priority?: boolean;
  caption?: string;
}

export default function BlogImage({
  src,
  alt,
  width,
  height,
  priority = false,
  caption,
}: BlogImageProps) {
  const image = (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes="(min-width: 640px) 470px, 100vw"
      style={{ width: "100%", height: "auto" }}
      priority={priority}
    />
  );

  return caption ? (
    <figure>
      {image}
      <figcaption>{caption}</figcaption>
    </figure>
  ) : (
    image
  );
}
