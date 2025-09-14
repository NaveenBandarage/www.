import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

/**
 * Format time in New York timezone
 */
export function formatNewYorkTime(
  date: Date = new Date(),
  timeFormat: string = "HH:mm:ss",
): string {
  try {
    return formatInTimeZone(date, "America/New_York", timeFormat);
  } catch (error) {
    console.error("Error formatting New York time:", error);
    // Fallback to local time if timezone formatting fails
    return format(date, timeFormat);
  }
}

/**
 * Get current time in New York timezone
 */
export function getCurrentNewYorkTime(): string {
  return formatNewYorkTime();
}

/**
 * Format date consistently across the app
 */
export function formatAppDate(
  date: string | Date,
  short: boolean = false,
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, short ? "MMM dd, yyyy" : "MMMM do, yyyy");
}
