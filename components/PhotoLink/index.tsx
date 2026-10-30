import Link from "next/link";
import { useRouter } from "next/router";
import type { ComponentProps, MouseEvent } from "react";

type PhotoLinkProps = ComponentProps<typeof Link>;

export default function PhotoLink({ onClick, ...props }: PhotoLinkProps) {
  const router = useRouter();
  const navigate = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      props.target === "_blank"
    )
      return;
    const start = (
      document as Document & {
        startViewTransition?: (update: () => Promise<void>) => unknown;
      }
    ).startViewTransition;
    if (!start || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    event.preventDefault();
    start.call(document, async () => {
      await router.push(props.href, props.as, { scroll: props.scroll });
    });
  };
  return <Link {...props} onClick={navigate} />;
}
