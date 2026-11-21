export interface Preview {
  url: string;
  host: string;
  title: string;
  summary: string;
  screenshot?: string;
}

const pageTitles: Record<string, string> = {
  "/": "Naveen Bandarage",
  "/about": "About me",
  "/blog": "Writing",
  "/books": "My bookshelf",
  "/uses": "What I use",
  "/links": "Find me online",
  "/notes": "Notes",
  "/photos": "Photos",
  "/fun": "Experiments & side projects",
  "/memory": "Memory",
};

export function getLinkPreview(
  link: HTMLAnchorElement,
  currentUrl: string,
): Preview | null {
  const current = new URL(currentUrl);
  const href = link.getAttribute("href");
  if (
    !href ||
    href.startsWith("#") ||
    link.hasAttribute("download") ||
    link.closest('[data-link-preview="off"], [aria-disabled="true"]')
  ) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(link.href);
  } catch {
    return null;
  }
  if (url.username || url.password) return null;
  const label = (link.getAttribute("aria-label") || link.textContent || "")
    .replace(/\s+/g, " ")
    .trim();
  if (url.protocol === "mailto:") {
    return {
      url: url.href,
      host: "Email",
      title: label || "Get in touch",
      summary: safeDecode(url.pathname),
    };
  }
  if (!["http:", "https:"].includes(url.protocol)) return null;
  if (url.origin === current.origin && url.pathname === current.pathname) {
    return null;
  }

  const internal = url.origin === current.origin;
  const host = internal
    ? "naveenbandarage.com"
    : url.hostname.replace(/^www\./, "");
  // Preview the published page during local development too. Never forward
  // query strings, credentials, or fragments to the screenshot service.
  const screenshotUrl = new URL(
    url.pathname,
    internal ? "https://naveenbandarage.com" : url.origin,
  );
  const publicHost =
    !/^(localhost|.*\.localhost|.*\.local|.*\.internal)$/.test(url.hostname) &&
    !/^[\d.]+$/.test(url.hostname) &&
    !url.hostname.includes(":") &&
    url.hostname.includes(".") &&
    !url.username &&
    !url.password;

  // Removing tracking is harmless; removing an article ID, search, or token
  // would capture a different page. Keep those links as text-only previews.
  const trackingOnly = [...url.searchParams.keys()].every((key) =>
    /^(utm_.+|si|fbclid|gclid|msclkid)$/i.test(key),
  );

  return {
    url: url.href,
    host,
    title: (internal && pageTitles[url.pathname]) || label || host,
    summary:
      link.getAttribute("title") ||
      (internal
        ? "From my corner of the internet."
        : `${host}${url.pathname === "/" ? "" : url.pathname}`),
    screenshot:
      trackingOnly && (internal || publicHost)
        ? `https://image.thum.io/get/width/660/crop/760/noanimate/?url=${encodeURIComponent(screenshotUrl.href)}`
        : undefined,
  };
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
