const newYorkTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "America/New_York",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  day: "2-digit",
  year: "numeric",
});

const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "long",
  day: "numeric",
  year: "numeric",
});

/** Reuse the native formatter instead of loading a date library on every page. */
export function formatNewYorkTime(date: Date = new Date()): string {
  return newYorkTimeFormatter.format(date);
}

export function getCurrentNewYorkTime(): string {
  return formatNewYorkTime();
}

/** Use UTC so date-only post metadata stays consistent across time zones. */
export function formatAppDate(date: string | Date, short = false): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (short) return shortDateFormatter.format(dateObj);

  return longDateFormatter
    .formatToParts(dateObj)
    .map((part) => {
      if (part.type !== "day") return part.value;
      const day = Number(part.value);
      const suffix =
        day >= 11 && day <= 13
          ? "th"
          : ({ 1: "st", 2: "nd", 3: "rd" }[day % 10] ?? "th");
      return `${day}${suffix}`;
    })
    .join("");
}
