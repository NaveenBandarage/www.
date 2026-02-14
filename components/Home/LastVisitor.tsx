import { useEffect, useState } from "react";
import formatDate from "../../lib/formatDate";

type LastVisitor = {
  city: string | null;
  region: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
} | null;

type Props = {
  variant?: "card" | "footer";
  enabled?: boolean;
};

export default function LastVisitor({ variant = "card", enabled = true }: Props) {
  const [lastVisitor, setLastVisitor] = useState<LastVisitor>(null);
  const [loading, setLoading] = useState<boolean>(enabled);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const headers = {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    };

    const loadLastVisitor = async () => {
      setLoading(true);

      try {
        // Record this visit and get the previous visitor in one request
        const response = await fetch("/api/last-visitor", {
          method: "POST",
          headers,
        });
        const data = await response.json();

        if (!cancelled) {
          setLastVisitor(data?.previousVisitor ?? null);
          setLoading(false);
        }
        return;
      } catch {
        // Fallback: fetch the current data if POST fails
      }

      try {
        const response = await fetch("/api/last-visitor", {
          headers,
        });
        const data = await response.json();

        if (!cancelled) {
          setLastVisitor(data?.lastVisitor ?? null);
        }
      } catch {
        if (!cancelled) {
          setLastVisitor(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadLastVisitor();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const renderLocation = () => {
    if (!lastVisitor) return "No previous visitor recorded yet.";
    const parts = [lastVisitor.city, lastVisitor.region, lastVisitor.country]
      .filter(Boolean)
      .join(", ");
    return parts || "Unknown";
  };
  const locationText = !enabled
    ? "Scroll near the footer to load."
    : loading
      ? "Loading..."
      : renderLocation();

  if (variant === "footer") {
    return (
      <div className="flex flex-col items-end text-right leading-none">
        <div className="text-neutral-800 dark:text-white">Last visitor</div>
        <div className="text-neutral-600 dark:text-neutral-300 mt-1">
          {locationText}
        </div>
        {enabled && !loading && lastVisitor?.timestamp && (
          <div className="text-neutral-600 dark:text-neutral-300 mt-1">
            Seen {formatDate(lastVisitor.timestamp, true)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-md border border-neutral-200 p-3 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-300">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-medium text-neutral-800 dark:text-white">
            Last visitor location
          </div>
          <div className="text-neutral-600 dark:text-neutral-300">
            {locationText}
          </div>
          {enabled && !loading && lastVisitor?.timestamp && (
            <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Seen {formatDate(lastVisitor.timestamp, true)}
            </div>
          )}
        </div>
        {lastVisitor?.latitude != null && lastVisitor?.longitude != null && (
          <a
            className="link whitespace-nowrap"
            href={`https://www.google.com/maps?q=${encodeURIComponent(
              `${lastVisitor.latitude},${lastVisitor.longitude}`,
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            View map →
          </a>
        )}
      </div>
    </div>
  );
}
