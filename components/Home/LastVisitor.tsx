import React, { useEffect, useState } from "react";
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
};

export default function LastVisitor({ variant = "card" }: Props) {
  const [lastVisitor, setLastVisitor] = useState<LastVisitor>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Record this visit and get the previous visitor in one request
    fetch("/api/last-visitor", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        // Use the previous visitor data returned from the POST
        setLastVisitor(data?.previousVisitor ?? null);
      })
      .catch(() => {
        // Fallback: fetch the current data if POST fails
        fetch("/api/last-visitor")
          .then((r) => r.json())
          .then((data) => setLastVisitor(data?.lastVisitor ?? null))
          .catch(() => setLastVisitor(null));
      })
      .finally(() => setLoading(false));
  }, []);

  const renderLocation = () => {
    if (!lastVisitor) return "No previous visitor recorded yet.";
    const parts = [lastVisitor.city, lastVisitor.region, lastVisitor.country]
      .filter(Boolean)
      .join(", ");
    return parts || "Unknown";
  };

  if (variant === "footer") {
    return (
      <div className="flex flex-col items-end text-right leading-none">
        <div className="text-neutral-800 dark:text-white">Last visitor</div>
        <div className="text-neutral-600 dark:text-neutral-300 mt-1">
          {loading ? "Loading..." : renderLocation()}
        </div>
        {!loading && lastVisitor?.timestamp && (
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
            {loading ? "Loading..." : renderLocation()}
          </div>
          {!loading && lastVisitor?.timestamp && (
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
