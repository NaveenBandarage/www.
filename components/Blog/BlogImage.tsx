import Image from "next/image";

interface BlogImageProps {
  src: string;
  alt: string;
  width: number | `${number}`;
  height: number | `${number}`;
  priority?: boolean;
}

export default function BlogImage({
  src,
  alt,
  width,
  height,
  priority = false,
}: BlogImageProps) {
  return (
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
}
